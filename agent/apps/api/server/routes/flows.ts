import { Router } from "express";

const router = Router();

// CRUD de flows (state machines). El operador puede personalizar el flujo
// "reserva_nueva" para que pregunte ocasion (cumpleanos / negocio / etc).
//
// TODO: GET    /api/flows
// TODO: GET    /api/flows/:kind                 — flow activo por tenant
// TODO: PUT    /api/flows/:kind                 — actualiza definicion (DSL)
// TODO: POST   /api/flows/:kind/test            — corre un flow contra input simulado

router.get("/__stub", (_req, res) => {
  res.json({ module: "flows", status: "scaffold" });
});

export default router;
