# RULES-STORAGE — Almacenamiento de archivos (uploads + thumbnails IA)

Patrón canónico para todo endpoint que reciba archivos del usuario o genere
contenido binario (imágenes IA, exports PDF, snapshots) en cualquiera de los
backends de Copiloto.

> **Estado en Copiloto (2026-06-13):** todavía NO existe `server/lib/storage.ts`
> ni endpoints de upload o `/api/ai/generate-image` en el repo. Esta regla es
> **prospectiva**: define el patrón que se debe seguir **cuando se implemente**
> el primer endpoint que reciba o genere archivos. El bloque de código de
> `storage.ts` de más abajo es la **implementación de referencia a copiar**, no
> un archivo que ya exista.

**TL;DR**: nunca escribir al filesystem local del container. Usar Supabase
Storage con URLs absolutas del CDN. Cumple en cualquier infra (Railway,
Lambda, ECS, local).

---

## OBJETIVO

Garantizar que los archivos:
1. **Persistan entre redeploys** del container (Lambda/Railway recicla el FS).
2. **Sean accesibles entre instancias** (no se quedan locales si la app escala).
3. **Se sirvan vía URL absoluta** (no path relativo que requiere proxy a un BE específico).
4. **No dependan del filesystem del runtime** (read-only en Lambda, EACCES en algunos containers).

---

## ANTI-PATTERNS PROHIBIDOS

❌ `writeFileSync(localPath, buffer)` para guardar uploads o thumbnails IA
❌ `mkdirSync("/uploads", { recursive: true })` al boot — falla con EACCES en Lambda/Railway
❌ `multer.diskStorage({ destination: "..." })` — escribe al filesystem del runtime
❌ `app.use("/uploads", express.static(...))` — sirve desde filesystem del BE, se pierde entre redeploys
❌ Endpoints que devuelven `{ url: "/uploads/foo.png" }` con paths relativos al BE
❌ Asumir que el filesystem del container es writable o persistente
❌ `path.join(import.meta.dirname, "../../uploads")` o cualquier path absoluto root del FS
❌ **Persistir `data:image/...;base64,...` directo en columnas DB** (`avatarUrl`, `imageUrl`, `logoUrl`, etc.) — usar `uploadIfDataUrl()` para normalizar a URL CDN antes de `prisma.<x>.create({...})`. Riesgo conocido: persistir 100kb–5MB de base64 inline por fila infla la DB y mata las queries.

---

## PATRÓN CANÓNICO

### 1. Helper `server/lib/storage.ts` por backend

Cada backend que reciba archivos debe tener este helper. En Copiloto vive en:

- `apps/api/server/lib/storage.ts` (backend principal, `@copiloto/api`)
- `agent/apps/api/server/lib/storage.ts` (sub-monorepo agent, `@copiloto/agent-api`)

Todavía no existe ninguno de los dos; este es el archivo de referencia a crear
(idéntico en ambos backends, solo cambia el default bucket):

```typescript
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { extname } from "path";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "copiloto-uploads";

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos para almacenamiento.",
    );
  }
  client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export interface StoredFile {
  url: string;   // URL absoluta pública (Supabase CDN)
  path: string;  // Path interno (guardar si se necesita borrar luego)
  size: number;
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "application/pdf": ".pdf",
};

export async function uploadBuffer(
  buffer: Buffer,
  mime: string,
  options?: { folder?: string; originalName?: string },
): Promise<StoredFile> {
  const folder = (options?.folder || "files").replace(/^\/+|\/+$/g, "");
  const ext =
    EXT_BY_MIME[mime] ||
    (options?.originalName ? extname(options.originalName) : "") ||
    ".bin";
  const filename = `${randomUUID()}${ext}`;
  const path = `${folder}/${filename}`;

  const supabase = getClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Supabase Storage upload falló: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, size: buffer.length };
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = getClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

export function isStorageConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
}
```

### 2. Endpoint upload manual (`POST /api/uploads`)

Vive en `apps/api/server/routes/uploads.ts` (o `agent/apps/api/server/routes/uploads.ts`):

```typescript
import multer from "multer";
import { uploadBuffer } from "../lib/storage";

const upload = multer({
  storage: multer.memoryStorage(), // ← memoria, NO disco
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "video/mp4", "video/webm", "application/pdf",
      "image/jpeg", "image/png", "image/gif", "image/webp",
    ];
    cb(allowed.includes(file.mimetype) ? null : new Error(`Tipo no permitido: ${file.mimetype}`), allowed.includes(file.mimetype));
  },
});

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se envió archivo" });
  try {
    const stored = await uploadBuffer(req.file.buffer, req.file.mimetype, {
      folder: req.file.mimetype.startsWith("video/") ? "videos"
            : req.file.mimetype === "application/pdf" ? "pdfs"
            : "images",
      originalName: req.file.originalname,
    });
    res.json({
      url: stored.url,            // ← URL absoluta (https://REF.supabase.co/...)
      path: stored.path,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: stored.size,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err?.message ?? "Error al guardar archivo" });
  }
});
```

### 3. Endpoint con AI image generation

Cuando se implemente generación de imágenes con IA (ej. fotos de platillos del
menú, banners de campaña), el handler vive en
`apps/api/server/routes/ai.ts` (o el route que lo exponga) y debe subir el
output a Storage, nunca al disco:

```typescript
import { uploadBuffer } from "../lib/storage";

router.post("/generate-image", requireRole("ADMIN"), async (req, res) => {
  // ... validar prompt + count
  const results = await Promise.allSettled(
    Array.from({ length: count }, () => aiGenerateImage(prompt))
  );

  const uploads = await Promise.allSettled(
    results.map(async (r) => {
      if (r.status !== "fulfilled") throw new Error(r.reason?.message);
      const { mime, buffer } = r.value;
      const stored = await uploadBuffer(buffer, mime, { folder: "ai-thumbnails" });
      return { url: stored.url };
    })
  );

  const images = uploads.filter(u => u.status === "fulfilled").map(u => u.value);
  res.json({ images, prompt });
});
```

### 3b. Endpoints que reciben `data:image/...;base64,...` desde el FE

Muchos flujos en el FE convierten archivos a base64 con `FileReader.readAsDataURL` y los mandan en el body de PATCH/POST (avatar, logo de la sucursal, foto de un platillo del menú). El backend NO debe persistir ese data URL directo a una columna DB — debe pasarlo por `uploadIfDataUrl(input, folder)` que lo decodifica, sube al bucket, y devuelve la URL absoluta del CDN. Strings que ya son URLs absolutas pasan sin cambios.

```typescript
import { uploadIfDataUrl } from "../lib/storage";

// PATCH /api/profile — avatar puede llegar como data URL o URL absoluta.
router.patch("/", requireAuth, async (req, res) => {
  const { name, bio, avatarUrl } = req.body;
  const data: any = {};
  if (name !== undefined) data.name = name;
  if (bio !== undefined) data.bio = bio;
  if (avatarUrl !== undefined) {
    // Normaliza data URL → URL CDN. Si ya es URL absoluta, no toca.
    // Si Supabase no esta configurado, deja el input tal cual (fallback).
    data.avatarUrl = (await uploadIfDataUrl(avatarUrl, "avatars")) || null;
  }
  const updated = await prisma.user.update({ where: { id: req.user.id }, data });
  res.json(updated);
});
```

**Cuándo usar `uploadIfDataUrl` vs `uploadBuffer`:**

| Helper | Cuándo |
|---|---|
| `uploadBuffer(buf, mime, { folder })` | Tenés un Buffer (multer.memoryStorage, fetch de URL, output de IA, OCR que ya decodifica). |
| `uploadIfDataUrl(input, folder)` | Recibís un campo del body que **puede o no** ser data URL (avatar, logo, imagen de un form). Idempotente. |

**Convención de folders por tipo de contenido:**

| Folder | Contenido |
|---|---|
| `avatars/` | Avatares de usuarios (PATCH /api/profile) |
| `logos/` | Logos de empresa/sucursal |
| `receipts/` | Comprobantes de gastos (OCR + uploads manuales) |
| `proofs/` | Comprobantes de pago |
| `attachments/` | Adjuntos genéricos de facturas/CFDIs |

### 4. Convención de folders dentro del bucket

| Folder | Contenido |
|---|---|
| `images/` | Subidas manuales de imágenes (avatares, logos, fotos de platillos) |
| `videos/` | Subidas manuales de video |
| `pdfs/` | Subidas manuales de PDF (facturas, comprobantes, documentos) |
| `ai-thumbnails/` | Thumbnails generados con IA (fotos de platillos, banners de campaña, etc.) |
| `exports/` | PDFs generados (reportes, facturas exportadas) |
| `files/` | Fallback genérico — preferir uno específico arriba |

### 5. Variables de entorno requeridas

```bash
# .env de cada backend que use storage (apps/api, agent/apps/api)
SUPABASE_URL=https://REF.supabase.co              # mismo que DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...         # Dashboard → Settings → API → service_role
SUPABASE_STORAGE_BUCKET=copiloto-uploads          # Nombre del bucket
```

### 6. Setup del bucket (manual, una vez)

```
1. Supabase Dashboard → Storage → New bucket
2. Name: copiloto-uploads (o uno por backend, ej. copiloto-agent-uploads)
3. Toggle "Public bucket" → ON   ← crítico para que las URLs sean directas
4. File size limit: 100 MB (o el que aplique al caso)
5. Save
```

---

## VALIDACIÓN AUTOMÁTICA

Cuando se implemente un endpoint de upload, antes de declarar el módulo listo
conviene verificar manualmente (o con un tool propio si se agrega uno) que no
haya anti-patterns:

- `writeFileSync` con path al filesystem del runtime
- `mkdirSync("/uploads")` o `mkdir -p /uploads` en Dockerfile
- `multer.diskStorage(...)`
- `express.static("/uploads", ...)`
- Endpoints que retornan `{ url: "/uploads/..." }` (path relativo)

Y que si el backend tiene endpoints de upload:
- Existe `server/lib/storage.ts` con `uploadBuffer()`
- `package.json` incluye `@supabase/supabase-js`
- `.env.example` documenta las 3 vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`)

> Nota: Copiloto aún no tiene un script `check-storage.sh`. Si se agrega uno, debe
> vivir en `tools/check-storage.sh` y cubrir los chequeos de arriba.

---

## ESCENARIOS NO CUBIERTOS POR ESTE PATRÓN

Estos casos legítimamente NO usan Supabase Storage y están permitidos:

- **Archivos temporales en `/tmp/`** dentro del request handler (procesamiento intermedio que se descarta antes del response). Ej: `os.tmpdir()` para extraer un ZIP, leer, eliminar.
- **Archivos del build de Next.js** (`apps/web/.next/`) — no son uploads del usuario.
- **Backups de DB** — usar pg_dump + Supabase Storage o S3, no filesystem local.
- **Cache estático del FE** — el host del FE ya lo maneja.

---

## REGLAS ABSOLUTAS

1. **NUNCA `writeFileSync` o `mkdir` para uploads en producción.** El filesystem del container es ephemeral o read-only.
2. **NUNCA `multer.diskStorage()` en BE.** Siempre `multer.memoryStorage()` + helper.
3. **NUNCA devolver paths relativos** tipo `/uploads/foo.png`. Solo URLs absolutas.
4. **NUNCA hardcodear el bucket name** en código. Usar `process.env.SUPABASE_STORAGE_BUCKET`.
5. **SIEMPRE marcar bucket como Public** (a menos que justifiques signed URLs con vencimiento).
6. **SIEMPRE setear `cacheControl` largo** (`31536000` = 1 año) al subir — los archivos son inmutables (UUID en path).
7. **NUNCA usar `upsert: true`** — colisión de UUID es astronómica; si pasa, prefer fallar a sobrescribir.
8. **NUNCA usar `SUPABASE_ANON_KEY` en BE** para uploads — usar `SUPABASE_SERVICE_ROLE_KEY` (la anon está sujeta a RLS).
9. **NUNCA poner el `service_role` key en el FE** — es admin del proyecto entero.
10. **SIEMPRE limpiar tests/dev uploads** que dejes en buckets compartidos (filename con prefix `_local-test-` o `_dev-`).

---

## REFERENCIA DE IMPLEMENTACIÓN

Copiloto aún no tiene una implementación de `storage.ts` (ningún backend recibe
archivos todavía). El bloque de código en **§1** es la implementación de
referencia a copiar cuando se agregue el primer endpoint que reciba o genere
archivos.

Al implementarla, los archivos canónicos serán:
- `apps/api/server/lib/storage.ts` (helper, backend `@copiloto/api`)
- `apps/api/server/routes/uploads.ts` (upload manual)
- `apps/api/server/routes/ai.ts` `/generate-image` (IA)

Y, si el sub-monorepo agent también necesita storage:
- `agent/apps/api/server/lib/storage.ts` (helper, backend `@copiloto/agent-api`)
- `agent/apps/api/server/routes/*.ts` (los endpoints que correspondan)

Mono-repo `copiloto`, rama base `main`. Para implementar storage en un backend:
crear `storage.ts` desde la referencia de §1, ajustar default bucket name,
agregar el `routes/uploads.ts` (si aplica) y revisar cualquier endpoint con
`writeFileSync` o `multer.diskStorage`. Setup bucket en Supabase Dashboard.

---

*Regla derivada del crash de un deploy en Railway por `EACCES mkdir /uploads`.
Aplica a todos los backends del mono-repo Copiloto (`apps/api`,
`agent/apps/api`). Prospectiva: ningún backend recibe archivos al 2026-06-13.*
