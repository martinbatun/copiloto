import { Router } from "express";

const router = Router();

// Inventario: par levels sugeridos + conteos fisicos.
//
// TODO: GET   /api/inventory/par/:locationId?date=YYYY-MM-DD  — sugeridos por ingrediente
// TODO: POST  /api/inventory/par/:locationId/regenerate
// TODO: POST  /api/inventory/counts                          — submit conteo fisico
// TODO: GET   /api/inventory/counts/:locationId              — historial
// TODO: GET   /api/inventory/variance/:locationId            — sugerido vs conteo vs ventas (= merma estimada)

router.get("/__stub", (_req, res) => {
  res.json({ module: "inventory", status: "scaffold" });
});

export default router;
