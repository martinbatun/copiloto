// Copiloto AI — wrapper sobre OpenRouter para el agente conversacional
// y para tareas batch (resumen de turno, redaccion de campana, etc.).
//
// Arquitectura agentic: el co-piloto recibe una pregunta del manager
// ("por que bajo mi ticket promedio?") y opera un loop con tools
// expuestas (queryKpis, queryAnomalies, draftCampaign, adjustParLevel...)
// hasta llegar a una respuesta + accion propuesta.
//
// Guardrails: toda accion de alto impacto (cambiar precios, mandar
// campana a >100 huespedes, override de schedule en hora pico) cae en
// human-in-the-loop por defecto. El modo autopilot por categoria solo
// se desbloquea despues de 90 dias de track record.

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
}

export interface CopilotChatRequest {
  locationId: string;
  threadId?: string;
  messages: ChatMessage[];
  // Lista de tools disponibles. Vacio = solo conversacion, sin acciones.
  tools?: string[];
}

export async function copilotChat(_req: CopilotChatRequest): Promise<unknown> {
  // TODO: implementar agent loop con OpenRouter:
  //   1. POST /v1/chat/completions con tools serializados.
  //   2. Si el modelo invoca tool, ejecutarla contra Prisma.
  //   3. Re-llamar con tool_result hasta que el modelo de respuesta final.
  //   4. Persistir thread + tokens consumidos para billing y telemetria.
  //
  // OPENROUTER_API_KEY + OPENROUTER_MODEL vienen del env.
  throw new Error("copilotChat not implemented");
}

export async function summarizeShift(_locationId: string, _date: string): Promise<string> {
  // TODO: post-mortem del turno. Toma SalesEvent + Anomaly + ActionLog y
  // devuelve un resumen narrativo de 3–5 bullets. Util para reporte diario
  // por WhatsApp al duenio.
  throw new Error("summarizeShift not implemented");
}

export async function draftCampaignCopy(
  _segmentName: string,
  _channel: "WHATSAPP" | "EMAIL" | "SMS",
  _objective: string
): Promise<{ subject?: string; body: string }> {
  // TODO: genera copy con tono local (es-MX por defecto) y respeta limites
  // del canal (WhatsApp templates aprobados, longitud SMS, etc.).
  throw new Error("draftCampaignCopy not implemented");
}
