import { Router } from "express";

const router = Router();

// Proveedores. Catalogo simple — relacionado con Invoice y precios.
//
// TODO: GET    /api/suppliers
// TODO: POST   /api/suppliers
// TODO: PATCH  /api/suppliers/:id
// TODO: GET    /api/suppliers/:id/performance  — tiempo de entrega, drift de precio vs mercado

router.get("/__stub", (_req, res) => {
  res.json({ module: "suppliers", status: "scaffold" });
});

export default router;
