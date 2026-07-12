import { Router } from "express";
import { CopilotChatSchema } from "@copiloto/shared";
import type { CopilotChatResponse } from "@copiloto/shared";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { buildOpsContext } from "../lib/copilot-context.js";
import { copilotChat, CopilotNotConfiguredError, CopilotUpstreamError } from "../lib/ai.js";

const router = Router();
const prisma = new PrismaClient();

// Co-piloto conversacional para manager / dueño. v1 = chat de SOLO LECTURA:
// responde fundamentado en un snapshot de datos reales de la sucursal
// (KPIs, anomalías, forecast, inventario, menú-mix). Stateless: el cliente
// manda el historial en cada request.
//
// FUTURO (agentic + human-in-the-loop): exponer tools que ejecuten acciones
// (crear campaña, ajustar par level) con aprobación humana y Action Ledger,
// y persistir threads para telemetría/billing:
//   TODO: POST /api/copilot/chat con tool-calling
//   TODO: GET  /api/copilot/threads · GET /api/copilot/threads/:id

function systemPrompt(context: string): string {
  return [
    "Eres el Co-piloto de Copiloto Smart Ops, un asistente experto en operación de",
    "restaurantes. Hablas con el dueño o manager de la sucursal en español de México,",
    "de forma concisa, cálida y accionable.",
    "",
    "Reglas:",
    "- Responde ÚNICAMENTE con base en el snapshot de datos que se te da abajo.",
    "- Si te preguntan algo que el snapshot no cubre, dilo con claridad y sugiere qué",
    "  vista de la app revisar. No inventes cifras ni supongas datos que no ves.",
    "- Cuando cites números, usa los del snapshot (moneda MXN).",
    "- Eres de solo lectura: no puedes ejecutar cambios (crear campañas, ajustar",
    "  inventario, etc.). Si lo piden, explícalo y describe el paso que ellos darían.",
    "- Sé breve: 2–5 frases o bullets. Prioriza la causa probable y la acción sugerida.",
    "",
    "=== SNAPSHOT DE DATOS (solo lectura) ===",
    context,
  ].join("\n");
}

/**
 * POST /api/copilot/chat — un turno de conversación. Body: { locationId,
 * messages[] }. Inyecta el snapshot de la sucursal como system prompt y
 * devuelve la respuesta del modelo. Auth + tenant-scoped.
 */
router.post("/chat", requireAuth, async (req, res) => {
  const parsed = CopilotChatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Solicitud inválida", details: parsed.error.flatten() });
    return;
  }
  const { locationId, messages } = parsed.data;

  if (messages[messages.length - 1]?.role !== "user") {
    res.status(400).json({ error: "El último mensaje debe ser del usuario" });
    return;
  }

  const tenantId = req.user!.tenantId;
  const location = await prisma.location.findFirst({
    where: { id: locationId, tenantId },
    select: { id: true, name: true },
  });
  if (!location) {
    res.status(404).json({ error: "Sucursal no encontrada para este tenant" });
    return;
  }

  try {
    const context = await buildOpsContext(prisma, tenantId, location.id, location.name);
    const reply = await copilotChat(systemPrompt(context.text), messages);
    const payload: CopilotChatResponse = {
      message: reply.content,
      model: reply.model,
      contextAt: context.at.toISOString(),
    };
    res.json(payload);
  } catch (err) {
    if (err instanceof CopilotNotConfiguredError) {
      res.status(503).json({ error: err.message, code: "COPILOT_NOT_CONFIGURED" });
      return;
    }
    if (err instanceof CopilotUpstreamError) {
      res.status(502).json({ error: "El modelo no está disponible en este momento", detail: err.message });
      return;
    }
    throw err;
  }
});

export default router;
