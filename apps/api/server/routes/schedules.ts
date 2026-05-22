import { Router } from "express";

const router = Router();

// Staffing y schedules sugeridos. Output del motor de demanda — el
// "schedule" no es el producto, es un side-effect del forecast.
//
// TODO: GET   /api/schedules/:locationId?date=YYYY-MM-DD
// TODO: POST  /api/schedules/:locationId/regenerate    — recalcula para fecha (manager)
// TODO: PATCH /api/schedules/:id                       — manager override (queda en audit log)
// TODO: GET   /api/schedules/:locationId/diff          — sugerido vs actual (post-turno)

router.get("/__stub", (_req, res) => {
  res.json({ module: "schedules", status: "scaffold" });
});

export default router;
