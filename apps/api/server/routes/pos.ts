import { Router } from "express";

const router = Router();

// POS connectors. Aqui vive todo lo de ingestion, credenciales y webhooks.
//
// TODO: POST /api/pos/credentials             — registra/actualiza credenciales por location
// TODO: GET  /api/pos/credentials/:locationId — devuelve metadata (no secrets)
// TODO: POST /api/pos/sync/:locationId        — dispara sync inmediato (poll mode)
// TODO: POST /api/pos/webhook/:provider       — recibe webhook (idempotente via posExternalId)
// TODO: GET  /api/pos/health/:locationId      — last sync, errores recientes, drift de schema

router.get("/__stub", (_req, res) => {
  res.json({ module: "pos", status: "scaffold" });
});

export default router;
