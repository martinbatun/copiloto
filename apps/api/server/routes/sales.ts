import { Router } from "express";

const router = Router();

// SalesEvent — la tabla mas pesada del sistema. Todo lo demas se deriva de aqui.
//
// TODO: GET  /api/sales                       — lista paginada por location + rango
// TODO: GET  /api/sales/:id                   — detalle con lines + payments
// TODO: POST /api/sales/ingest                — bulk insert idempotente (uso interno desde el sync job)
// TODO: GET  /api/sales/aggregate             — ?by=daypart|channel|menuItem ?from=&to=
// TODO: GET  /api/sales/voids                 — ventas con voidedCents>0 (auditoria)

export default router;
