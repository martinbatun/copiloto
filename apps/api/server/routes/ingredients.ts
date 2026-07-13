import { Router } from "express";

const router = Router();

// Ingredientes / SKUs de almacen.
//
// TODO: GET    /api/ingredients                 — lista (tenant)
// TODO: POST   /api/ingredients                 — alta (sku, name, baseUnit, perishable, shelfLifeDays)
// TODO: PATCH  /api/ingredients/:id             — actualiza
// TODO: POST   /api/ingredients/match-invoice   — sugiere mapeo entre line de factura y ingredient existente
//                                                  (usa LLM + embeddings; "Coca-Cola 600ml" -> ingrediente refresco_600)
// TODO: GET    /api/ingredients/:id/price-history — historial de precio por unidad (de InvoiceLine)

export default router;
