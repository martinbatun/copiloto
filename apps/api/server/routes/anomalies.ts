import { Router } from "express";

const router = Router();

// Detector de anomalias. Corre como cron o trigger post-ingest de ventas.
// Reglas en v1, modelos no-supervisados en v2.
//
// TODO: GET   /api/anomalies                          — lista con filtros (kind, severity, location, date)
// TODO: GET   /api/anomalies/:id                      — detalle + recomendaciones asociadas
// TODO: POST  /api/anomalies/:id/resolve              — manager marca como atendido
// TODO: POST  /api/anomalies/scan                     — dispara scan manual (admin/debug)
//
// Las categorias estan en AnomalyKind:
//   VOID_SPIKE             — voids > 2 sigmas del baseline del daypart
//   DISCOUNT_SPIKE         — descuentos sin cupon promocional activo
//   FOOD_COST_DRIFT        — costo de una receta subio > X% en 7 dias
//   LABOR_OVERSHOOT        — staff actual > sugerido + Y horas
//   NO_SALE                — hora sin ventas en daypart historicamente activo
//   REFUND_BURST           — > N refunds en ventana de 30 min
//   INGREDIENT_PRICE_JUMP  — proveedor subio precio > Z% vs ultima factura

export default router;
