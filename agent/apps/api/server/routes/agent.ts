import { Router } from "express";

const router = Router();

// El loop del agente conversacional. Endpoint usado internamente por el
// worker que procesa mensajes inbound, y por el co-piloto del manager
// cuando interactua via WhatsApp.
//
// TODO: POST /api/agent/turn        — body: { conversationId, message } — corre un turn del agente
// TODO: GET  /api/agent/session/:conversationId   — estado del thread + tokens consumidos
// TODO: POST /api/agent/tool        — tool execution callback (puente al core)
//
// Tools expuestas al LLM:
//   - findReservationSlots(date, partySize)
//   - createReservation({...})
//   - lookupGuest(phone)
//   - fetchMenuItem(query)
//   - escalateToHuman(reason)
// Cada una hace HTTP al core con CORE_API_KEY.

router.get("/__stub", (_req, res) => {
  res.json({ module: "agent", status: "scaffold" });
});

export default router;
