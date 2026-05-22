import { Router } from "express";

const router = Router();

// Admin de Copiloto (rol ADMIN). NO confundir con OWNER del tenant.
//
// TODO: GET    /api/admin/tenants               — lista de cuentas
// TODO: POST   /api/admin/tenants               — alta + bootstrap (owner + 1 location)
// TODO: GET    /api/admin/usage/:tenantId       — tokens LLM, mensajes WhatsApp, llamadas POS sync
// TODO: GET    /api/admin/model-drift           — MAPE por tenant, alertas
// TODO: POST   /api/admin/impersonate/:userId   — auditado (para soporte)

router.get("/__stub", (_req, res) => {
  res.json({ module: "admin", status: "scaffold" });
});

export default router;
