import { Router } from "express";

const router = Router();

// Co-piloto conversacional para manager / duenio. Vive en /dashboard/copilot
// del frontend y tambien expone hook desde el agent (cuando un duenio
// pregunta por WhatsApp).
//
// TODO: POST /api/copilot/chat                 — body: CopilotChatSchema, devuelve respuesta + tool calls
// TODO: GET  /api/copilot/threads              — historial por usuario
// TODO: GET  /api/copilot/threads/:id          — mensajes de un thread

router.get("/__stub", (_req, res) => {
  res.json({ module: "copilot", status: "scaffold" });
});

export default router;
