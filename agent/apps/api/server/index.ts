import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { registerRoutes } from "./routes.js";

const app = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || "3500", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5500";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

// El webhook de Meta exige raw body para validar firma. Capturamos el raw
// solo en /api/webhook/*; en el resto, JSON parsing normal.
app.use("/api/webhook", express.json({
  verify: (req, _res, buf) => {
    (req as unknown as { rawBody?: Buffer }).rawBody = buf;
  },
  limit: "5mb",
}));
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "copiloto-agent-api",
    timestamp: new Date().toISOString(),
  });
});

registerRoutes(app);

server.listen(PORT, () => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] Copiloto Agent API running on port ${PORT}`);
  console.log(`[${ts}] CORS origin: ${CORS_ORIGIN}`);
});

export { app, server };
