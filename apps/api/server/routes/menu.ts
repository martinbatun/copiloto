import { Router } from "express";

const router = Router();

// Menu: categorias + items + recetas.
//
// TODO: GET    /api/menu                       — lista de categorias e items (tenant)
// TODO: GET    /api/menu/items/:id             — detalle con receta + food cost actual
// TODO: POST   /api/menu/items                 — alta de item (sku, precio, taxRate)
// TODO: PATCH  /api/menu/items/:id             — actualiza (precio dispara recalculo de margen)
// TODO: POST   /api/menu/items/:id/recipe      — set/update receta (lines: ingredientId + qty + unit)
// TODO: POST   /api/menu/import                — bulk CSV: catalogo completo desde el POS

router.get("/__stub", (_req, res) => {
  res.json({ module: "menu", status: "scaffold" });
});

export default router;
