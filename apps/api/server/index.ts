import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { registerRoutes } from "./routes.js";

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || "3400", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5400";

app.use(
  cors({
    origin: CORS_ORIGIN,
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
  console.log(`[${ts}] CORS origin: ${CORS_ORIGIN}`);
  console.log(`[${ts}] Environment: ${process.env.NODE_ENV || "development"}`);
});

export { app, server };
