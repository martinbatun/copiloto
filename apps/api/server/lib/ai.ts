// Copiloto AI — wrapper sobre OpenRouter para el agente conversacional
// y para tareas batch (resumen de turno, redacción de campaña, etc.).
//
// v1 (chat de solo lectura): el co-piloto recibe la conversación + un
// snapshot de datos reales de la sucursal (ver lib/copilot-context.ts) y
// responde fundamentado. No ejecuta acciones — el tool-calling agentic
// (crear campaña, ajustar par level con human-in-the-loop) es un paso
// futuro documentado en routes/copilot.ts.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "minimax/minimax-m2.7";

/** Se lanza cuando falta OPENROUTER_API_KEY — la ruta la mapea a 503. */
export class CopilotNotConfiguredError extends Error {
  constructor(message = "Co-piloto no configurado: falta OPENROUTER_API_KEY") {
    super(message);
    this.name = "CopilotNotConfiguredError";
  }
}

/** Error de la API de OpenRouter (status upstream + cuerpo). */
export class CopilotUpstreamError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "CopilotUpstreamError";
  }
}

export interface CopilotTurn {
  role: "user" | "assistant";
  content: string;
}

export interface CopilotReply {
  content: string;
  model: string;
}

/**
 * Ejecuta un turno de chat contra OpenRouter. `system` es el prompt de
 * sistema (rol + snapshot de datos); `turns` es el historial user/assistant.
 * Lanza CopilotNotConfiguredError si no hay API key.
 */
export async function copilotChat(system: string, turns: CopilotTurn[]): Promise<CopilotReply> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new CopilotNotConfiguredError();
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const resp = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // OpenRouter recomienda estos headers para atribución.
      "HTTP-Referer": process.env.APP_URL || "https://copiloto-web.vercel.app",
      "X-Title": "Copiloto Smart Ops",
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      temperature: 0.3,
      messages: [{ role: "system", content: system }, ...turns],
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new CopilotUpstreamError(resp.status, `OpenRouter ${resp.status}: ${body.slice(0, 500)}`);
  }

  const data = (await resp.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    model?: string;
  };
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) throw new CopilotUpstreamError(502, "OpenRouter devolvió una respuesta vacía");
  return { content, model: data.model ?? model };
}

export async function summarizeShift(_locationId: string, _date: string): Promise<string> {
  // TODO: post-mortem del turno. Toma SalesEvent + Anomaly + ActionLog y
  // devuelve un resumen narrativo de 3–5 bullets. Útil para reporte diario
  // por WhatsApp al dueño.
  throw new Error("summarizeShift not implemented");
}

export async function draftCampaignCopy(
  _segmentName: string,
  _channel: "WHATSAPP" | "EMAIL" | "SMS",
  _objective: string
): Promise<{ subject?: string; body: string }> {
  // TODO: genera copy con tono local (es-MX por defecto) y respeta límites
  // del canal (WhatsApp templates aprobados, longitud SMS, etc.).
  throw new Error("draftCampaignCopy not implemented");
}
