import { Router } from "express";

const router = Router();

// Segmentos. Algunos son "system" (VIP, CHURN_RISK, FIRST_VISIT) recalculados
// por un cron diario; otros son custom del operador (rules JSON).
//
// TODO: GET    /api/segments
// TODO: POST   /api/segments
// TODO: PATCH  /api/segments/:id
// TODO: DELETE /api/segments/:id
// TODO: POST   /api/segments/:id/recompute      — re-evalua rules contra Guest table
// TODO: GET    /api/segments/:id/guests         — paginado (preview para campana)

router.get("/__stub", (_req, res) => {
  res.json({ module: "segments", status: "scaffold" });
});

export default router;
