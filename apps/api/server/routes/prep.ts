import { Router } from "express";

const router = Router();

// Prep lists por turno. Cocina entra en la manana y ve la lista de mise
// en place generada con base en el forecast + recetas + par actual.
//
// TODO: GET  /api/prep/:locationId?date=YYYY-MM-DD
// TODO: POST /api/prep/:locationId/regenerate
// TODO: POST /api/prep/:id/check               — chef marca lineas hechas (para audit)

router.get("/__stub", (_req, res) => {
  res.json({ module: "prep", status: "scaffold" });
});

export default router;
