// Decisión de CORS aislada y testeable. Recibe la config (no lee process.env)
// para poder probar cada caso sin variables de entorno.

export interface CorsConfig {
  allowed: string[]; // orígenes exactos permitidos
  allowVercelPreviews: boolean; // permitir *.vercel.app del proyecto
  vercelPrefix: string; // prefijo del hostname de los previews (ej. "copiloto-web")
}

export function makeIsAllowedOrigin(config: CorsConfig) {
  return function isAllowedOrigin(origin: string): boolean {
    if (config.allowed.includes(origin)) return true;
    if (config.allowVercelPreviews) {
      try {
        const { hostname } = new URL(origin);
        if (hostname.endsWith(".vercel.app") && hostname.startsWith(config.vercelPrefix)) {
          return true;
        }
      } catch {
        /* origin no parseable → no permitido */
      }
    }
    return false;
  };
}
