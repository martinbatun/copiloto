---
name: storage-pattern
description: Asegura que todo endpoint BE que reciba archivos (uploads manuales, imágenes generadas con IA, exports, thumbnails) use Supabase Storage con URLs absolutas — nunca escribe al filesystem local del container. Auto-activar cuando se edita un archivo `apps/api/server/routes/*.ts` o `agent/apps/api/server/routes/*.ts` que importa `multer`, llama a `writeFileSync` / `mkdirSync`, define `/api/uploads` o `/api/ai/generate-image`, o cuando el usuario pregunta "cómo guardo este archivo", "dónde subo la imagen IA", "por qué falla EACCES /uploads". Regla canónica: `.claude/RULES-STORAGE.md`.
---

# storage-pattern

Hace cumplir `RULES-STORAGE.md`: nunca tocar el filesystem local del container
para uploads o thumbnails IA. Todo va a Supabase Storage, todas las URLs son
absolutas. Funciona en cualquier infra (Railway, Lambda, ECS, local).

> **Estado en Copiloto:** todavía no existe `server/lib/storage.ts` ni endpoints
> de upload / `/api/ai/generate-image`. Esta skill es **prospectiva**: define el
> patrón a seguir **cuando se implemente** el primer endpoint que reciba o genere
> archivos.

## Cuándo aplicar

**Auto-activar** cuando estás:
- Creando o editando un archivo BE que use `multer`
- Implementando un endpoint que reciba `multipart/form-data`
- Implementando `/api/ai/generate-image` o similar (thumbnails IA)
- Implementando export PDF que genere un archivo
- Investigando errores como `EACCES`, `EROFS`, `mkdir /uploads`
- Respondiendo a "dónde guardo este buffer", "cómo persisto la imagen", "URL del archivo"

Backends de Copiloto donde aplica:
- `apps/api` (`@copiloto/api`) → `apps/api/server/lib/`, `apps/api/server/routes/`
- `agent/apps/api` (`@copiloto/agent-api`) → `agent/apps/api/server/lib/`, `agent/apps/api/server/routes/`

## Patrón canónico

### 1. Helper `server/lib/storage.ts`

Si el backend **NO** tiene `storage.ts`, créalo primero. Hoy no existe en ningún
backend de Copiloto — usá el bloque de código de referencia de
`.claude/RULES-STORAGE.md §1` (idéntico en ambos backends). Vive en:

- `apps/api/server/lib/storage.ts`
- `agent/apps/api/server/lib/storage.ts`

Ajusta el bucket default:
```typescript
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "copiloto-uploads";
```

### 2. Agregar dependencia

```bash
# package.json del backend (apps/api o agent/apps/api):
"@supabase/supabase-js": "^2.100.1"
```

Luego `pnpm install` desde la raíz del mono-repo `copiloto`.

### 3. Endpoint upload manual

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
    cb(null, allowed.includes(file.mimetype));
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
      url: stored.url,            // ← URL absoluta https://REF.supabase.co/...
      path: stored.path,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: stored.size,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Error al guardar archivo" });
  }
});
```

### 4. Endpoint AI image generation

```typescript
import { uploadBuffer } from "../lib/storage";

router.post("/generate-image", requireRole("ADMIN"), async (req, res) => {
  // validar prompt + count, llamar aiGenerateImage en paralelo...
  const uploads = await Promise.allSettled(
    aiResults.map(async (r) => {
      if (r.status !== "fulfilled") throw new Error(r.reason?.message);
      const stored = await uploadBuffer(r.value.buffer, r.value.mime, {
        folder: "ai-thumbnails",
      });
      return { url: stored.url };
    })
  );
  const images = uploads.filter(u => u.status === "fulfilled").map(u => u.value);
  res.json({ images });
});
```

### 5. Variables de entorno (`.env.example`)

```bash
SUPABASE_URL=https://REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
SUPABASE_STORAGE_BUCKET=copiloto-uploads
```

### 6. Setup del bucket (una vez)

```
Supabase Dashboard → Storage → New bucket
  Name: copiloto-uploads
  Public bucket: ON
  Save
```

## Anti-patterns prohibidos

❌ `multer.diskStorage({ destination: "..." })` — siempre `memoryStorage()`
❌ `writeFileSync(localPath, buffer)` para uploads/thumbnails IA
❌ `mkdirSync("/uploads", { recursive: true })` al boot
❌ `app.use("/uploads", express.static(...))` — sirve desde filesystem del BE
❌ `res.json({ url: "/uploads/foo.png" })` — paths relativos al BE
❌ `RUN mkdir -p /uploads` en Dockerfile
❌ `path.join(import.meta.dirname, "../../uploads")` o paths root del FS
❌ Hardcodear el bucket name (siempre `process.env.SUPABASE_STORAGE_BUCKET`)
❌ Usar `SUPABASE_ANON_KEY` en BE para uploads (sin permisos suficientes)
❌ Poner `service_role` key en el FE (es admin del proyecto entero)

## Validación automática

Antes de declarar el módulo listo, verificá que no haya anti-patterns y que si el
backend tiene uploads:
- `server/lib/storage.ts` existe con `uploadBuffer()`
- `package.json` incluye `@supabase/supabase-js`
- `.env.example` documenta las 3 vars

> Copiloto aún no tiene un `tools/check-storage.sh`. Si se agrega uno, debe vivir
> en `tools/check-storage.sh` y cubrir los anti-patterns + el setup faltante.

## Implementación checklist (agregar storage a un backend)

Cuando un backend de Copiloto necesite recibir archivos por primera vez:

1. [ ] Crear `apps/api/server/lib/storage.ts` desde la referencia de `RULES-STORAGE.md §1` (o `agent/apps/api/server/lib/storage.ts` para el agent)
2. [ ] Ajustar bucket default name en `storage.ts` (`copiloto-uploads`)
3. [ ] Agregar `@supabase/supabase-js@^2.100.1` al `package.json` del backend
4. [ ] `pnpm install` desde la raíz del mono-repo
5. [ ] Crear `routes/uploads.ts`: usar `multer.memoryStorage` + `uploadBuffer()` (nunca `diskStorage`)
6. [ ] Para imágenes IA, en el route correspondiente usar `uploadBuffer()` — nunca `writeFileSync`
7. [ ] No registrar `app.use("/uploads", express.static(...))`
8. [ ] No agregar `RUN mkdir -p /uploads && chown` en el Dockerfile
9. [ ] Agregar SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_STORAGE_BUCKET al `.env.example`
10. [ ] Crear bucket `copiloto-uploads` en Supabase Dashboard (Public ON)
11. [ ] Agregar las 3 vars en Railway/staging
12. [ ] Test endpoint upload local: subir archivo → URL absoluta Supabase
13. [ ] Build: `pnpm --filter @copiloto/api build` (o `pnpm --filter @copiloto/agent-api build`)

> Al 2026-06-13 ningún backend de Copiloto recibe archivos todavía, así que aún no
> hay nada que migrar — este checklist aplica a la primera implementación.

## Reglas estrictas (no romper)

1. **Siempre `cacheControl: "31536000"`** (1 año) al subir — los archivos son inmutables (UUID en path)
2. **Nunca `upsert: true`** — fail-loud si hay colisión de UUID (astronómicamente improbable; si pasa = bug)
3. **Si haces test/dev uploads que dejas en el bucket, usa prefix `_local-test-` o `_dev-`** para identificar y limpiar después
4. **Si necesitas archivos privados** (no `public: true`), usa Supabase signed URLs con TTL — NO devuelvas el path interno como si fuera URL
5. **Nunca correr `pnpm dev`** sin las 3 env vars setteadas — el helper lanza Error claro pero el endpoint quedará retornando 500
6. **El `service_role` key nunca al FE, nunca a un repo público** — es admin del proyecto entero

## Referencias

- Regla completa: `.claude/RULES-STORAGE.md`
- Implementación de referencia: bloque de código en `.claude/RULES-STORAGE.md §1` (Copiloto aún no tiene un `storage.ts` real)
- Caso que motivó la regla: un deploy en Railway crasheó con `EACCES mkdir /uploads` por escribir uploads al filesystem local del container
