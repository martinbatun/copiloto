import { Router } from "express";

const router = Router();

// Inbox del agente. La admin web consume estas rutas para mostrar el
// listado tipo Intercom / Front.
//
// TODO: GET  /api/conversations                  — paginado + filtros (status, location, flow)
// TODO: GET  /api/conversations/:id              — detalle con messages
// TODO: POST /api/conversations/:id/handoff      — pasa a WAITING_HUMAN
// TODO: POST /api/conversations/:id/reply        — outbound manual (sale por WBA)
// TODO: POST /api/conversations/:id/resolve

router.get("/__stub", (_req, res) => {
  res.json({ module: "conversations", status: "scaffold" });
});

export default router;
