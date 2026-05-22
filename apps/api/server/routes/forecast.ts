import { Router } from "express";
import { predict } from "../lib/forecast.js";

const router = Router();

/**
 * GET /api/forecast/:locationId?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Devuelve forecast por daypart × channel para el rango. Si no hay buckets
 * guardados, calcula on-the-fly via predict() y cachea.
 */
router.get("/:locationId", async (_req, res) => {
  // TODO: validar params con ForecastQuerySchema, leer ForecastBucket cacheado,
  // y para fechas sin cache invocar predict() + persistir.
  res.json({ buckets: [], note: "stub" });
});

// TODO: POST /api/forecast/:locationId/regenerate  — fuerza recomputo (admin)
// TODO: GET  /api/forecast/:locationId/accuracy    — devuelve MAPE actual vs target

// Hint para que TS no llore del unused import en stub.
void predict;

router.get("/__stub", (_req, res) => {
  res.json({ module: "forecast", status: "scaffold" });
});

export default router;
