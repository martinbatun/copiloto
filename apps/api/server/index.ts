import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { registerRoutes } from "./routes.js";

const app = express();
const server = http.createServer(app);

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

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (ALLOW_VERCEL_PREVIEWS) {
    try {
      const { hostname } = new URL(origin);
      if (hostname.endsWith(".vercel.app") && hostname.startsWith(VERCEL_PREVIEW_PREFIX)) {
        return true;
      }
    } catch {
      /* origin no parseable → no permitido */
    }
  }
  return false;
}

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
