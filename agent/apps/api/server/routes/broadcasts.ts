import { Router } from "express";

const router = Router();

// Envios masivos. Coordinacion con Campaign del core: el core dispara, el agent
// se encarga del fan-out con rate limit segun lo permitido por Meta.
//
// TODO: POST /api/broadcasts                    — crea desde core (key interna)
// TODO: GET  /api/broadcasts/:id                — estado + counters
// TODO: POST /api/broadcasts/:id/pause
// TODO: POST /api/broadcasts/:id/resume

router.get("/__stub", (_req, res) => {
  res.json({ module: "broadcasts", status: "scaffold" });
});

export default router;
