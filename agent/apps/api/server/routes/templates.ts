import { Router } from "express";

const router = Router();

// CRUD de templates. Toda creacion/edicion dispara llamada a Meta Graph API
// para enviarla a revision.
//
// TODO: GET    /api/templates
// TODO: POST   /api/templates
// TODO: PATCH  /api/templates/:id
// TODO: POST   /api/templates/:id/sync-status     — pull status desde Meta

router.get("/__stub", (_req, res) => {
  res.json({ module: "templates", status: "scaffold" });
});

export default router;
