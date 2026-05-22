import { Router } from "express";

const router = Router();

// El corazon del producto. Una recommendation tiene { kind, payload, rationale,
// estimatedImpactCents } y vive en uno de los estados de RecommendationStatus.
//
// Toda recommendation pasa por approval flow:
//   PENDING -> APPROVED (manager dice "si") -> EXECUTED (sistema ejecuto la accion)
//   PENDING -> REJECTED | SNOOZED | EXPIRED
//
// TODO: GET   /api/recommendations                              — lista por status (default PENDING)
// TODO: GET   /api/recommendations/:id                          — detalle
// TODO: POST  /api/recommendations/:id/decide                   — body: RecommendationDecisionSchema
// TODO: POST  /api/recommendations/generate/:locationId         — corre el motor para una sucursal (cron-driven en prod)
// TODO: GET   /api/recommendations/feed/:locationId             — top N PENDING priorizadas por impacto
// TODO: GET   /api/recommendations/track-record/:locationId     — % de aceptacion + % de impacto realizado

router.get("/__stub", (_req, res) => {
  res.json({ module: "recommendations", status: "scaffold" });
});

export default router;
