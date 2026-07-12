import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import path from "path";
import { registerRoutes } from "./routes.js";
import { makeIsAllowedOrigin } from "./lib/cors.js";
import { initSentry, setupSentryErrorHandler } from "./lib/sentry.js";

// Fail-fast: valida secretos requeridos ANTES de levantar el server. Sin esto,
// un JWT_SECRET/DATABASE_URL ausente dejaría el server "arriba" (health 200)
// pero con auth o DB rotas — un outage silencioso enmascarado por el healthcheck.
function assertRequiredEnv(): void {
  const required = ["JWT_SECRET", "DATABASE_URL"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(
      `[boot] Faltan variables de entorno requeridas: ${missing.join(", ")}. Abortando.`
    );
    process.exit(1);
  }
  if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
    console.warn(
      "[boot] CORS_ORIGIN no está seteado en producción: el navegador bloqueará el frontend."
    );
  }
}
assertRequiredEnv();

// Lo antes posible: inicializa Sentry si hay SENTRY_DSN (no-op si no).
initSentry();

const app = express();
const server = http.createServer(app);

// Detrás de Render/Fly/Vercel hay 1 proxy: confiar en él para que req.ip y el
// rate-limit lean el IP real (X-Forwarded-For) sin ser demasiado permisivos.
app.set("trust proxy", 1);

const PORT = parseInt(process.env.PORT || "3400", 10);

// CORS por entorno:
//  - CORS_ORIGIN admite una LISTA separada por comas de orígenes exactos
//    (ej. "https://app.copiloto.mx,https://copiloto-web.vercel.app").
//  - Con CORS_ALLOW_VERCEL_PREVIEWS=true se permiten además los preview
//    deploys de Vercel del proyecto (hostname *.vercel.app que empieza con
//    CORS_VERCEL_PREFIX) — útil para QA en cada PR sin abrir CORS a todos.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5400")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOW_VERCEL_PREVIEWS = process.env.CORS_ALLOW_VERCEL_PREVIEWS === "true";
const VERCEL_PREVIEW_PREFIX = process.env.CORS_VERCEL_PREFIX || "copiloto-web";

const isAllowedOrigin = makeIsAllowedOrigin({
  allowed: ALLOWED_ORIGINS,
  allowVercelPreviews: ALLOW_VERCEL_PREVIEWS,
  vercelPrefix: VERCEL_PREVIEW_PREFIX,
});

// Headers de seguridad. Es una API JSON (no sirve HTML), así que dejamos CSP
// fuera; el resto de defaults de helmet aplican. CORS controla el acceso del
// navegador, así que relajamos CORP para no bloquear el fetch cross-origin.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));

app.use(
  cors({
    origin(origin, cb) {
      // Sin Origin = same-origin / curl / server-to-server → permitido.
      // Si no está en la allowlist devolvemos false (no error 500): el header
      // CORS no se agrega y el navegador bloquea, que es el comportamiento sano.
      cb(null, !origin || isAllowedOrigin(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" })); // facturas OCR'd vienen pesadas

// Rate limit como backstop anti-DoS. Ceiling generoso porque los comensales de
// un restaurante comparten un mismo IP (NAT del WiFi): un límite agresivo por
// IP bloquearía a clientes legítimos. Excluimos health y el webhook de MP (lo
// llama Mercado Pago, no un cliente). Ajustable por entorno.
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: Number(process.env.RATE_LIMIT_PER_MIN || "300"),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) =>
      req.path === "/api/health" || req.path === "/api/orders/webhook/mp",
  })
);

// Static uploads solo en local dev (Supabase Storage en prod).
if (!process.env.SUPABASE_URL) {
  app.use("/uploads", express.static(path.resolve("uploads")));
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "copiloto-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

registerRoutes(app);

// Sentry captura errores no manejados (debe ir después de las rutas)...
setupSentryErrorHandler(app);

// ...y un handler final devuelve 500 JSON en vez de HTML/stack al cliente.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[api] unhandled error", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Error interno" });
});

server.listen(PORT, () => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] Copiloto API running on port ${PORT}`);
  console.log(
    `[${ts}] CORS origins: ${ALLOWED_ORIGINS.join(", ")}${
      ALLOW_VERCEL_PREVIEWS ? ` (+ ${VERCEL_PREVIEW_PREFIX}*.vercel.app previews)` : ""
    }`
  );
  console.log(`[${ts}] Environment: ${process.env.NODE_ENV || "development"}`);
});

export { app, server };
