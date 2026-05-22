import { Router } from "express";

const router = Router();

/**
 * GET /api/webhook/whatsapp — verificacion del webhook (Meta).
 * Meta llama una vez para verificar; respondemos con hub.challenge.
 */
router.get("/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === process.env.WBA_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    return;
  }
  res.sendStatus(403);
});

/**
 * POST /api/webhook/whatsapp — recepción de mensajes inbound y status updates.
 *
 * Flujo:
 *   1. Validar firma (X-Hub-Signature-256) contra WBA_TOKEN.
 *   2. Por cada change.value.messages[] → encolar para procesamiento (BullMQ/SQS).
 *   3. Por cada change.value.statuses[] → actualizar Message.status.
 *
 * NOTA: el procesamiento real corre fuera del request handler para mantener
 * la respuesta <500ms (requisito de Meta — re-envian si tardamos).
 */
router.post("/whatsapp", async (_req, res) => {
  // TODO: validar firma, parsear, encolar.
  res.sendStatus(200);
});

export default router;
