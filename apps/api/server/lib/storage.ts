// Almacenamiento de archivos en Supabase Storage (patrón canónico de
// .claude/RULES-STORAGE.md). NUNCA se escribe al filesystem del contenedor:
// devolvemos URLs absolutas del CDN, persistentes entre redeploys.
//
// Nota de envs: la regla usa SUPABASE_SERVICE_ROLE_KEY / SUPABASE_STORAGE_BUCKET,
// pero el repo ya define SUPABASE_SERVICE_KEY / SUPABASE_BUCKET — aceptamos ambos.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

const BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET || "copiloto-uploads";

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL y una service key son requeridos para almacenamiento.");
  }
  client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY ||
        process.env.SUPABASE_ANON_KEY)
  );
}

export interface StoredFile {
  url: string; // URL absoluta pública (Supabase CDN)
  path: string; // path interno (para borrar luego si hace falta)
  size: number;
}

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function uploadBuffer(
  buffer: Buffer,
  mime: string,
  options?: { folder?: string; originalName?: string }
): Promise<StoredFile> {
  const folder = (options?.folder || "files").replace(/^\/+|\/+$/g, "");
  const ext =
    EXT_BY_MIME[mime] || (options?.originalName ? extname(options.originalName) : "") || ".bin";
  const path = `${folder}/${randomUUID()}${ext}`;

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
