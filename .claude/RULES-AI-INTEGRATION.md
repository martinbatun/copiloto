# RULES-AI-INTEGRATION — Protocolo de Integración de IA en Copiloto

Reglas para integrar IA en cualquier módulo de Copiloto.
Aplica al frontend principal (`apps/web`), el backend (`apps/api`) y el
sub-monorepo del agente (`agent/apps/web`, `agent/apps/api`), y a cualquier
módulo nuevo (dashboard, copilot, orders, menu, inventory, invoices, kpis,
forecast, reservations, guests, suppliers, recipes, campaigns, anomalies,
schedule, simulator, admin).

**Proveedor**: OpenRouter (https://openrouter.ai/)
**Modelo default**: `anthropic/claude-3.5-sonnet`
**API**: Compatible con OpenAI chat/completions

> **Estado del proyecto (2026-06-13)**: la integración IA de Copiloto está en
> etapa temprana. El co-piloto conversacional vive en la ruta FE
> [`apps/web/src/app/copilot/`](../apps/web/src/app/copilot/page.tsx) y en la
> ruta BE [`apps/api/server/routes/copilot.ts`](../apps/api/server/routes/copilot.ts),
> hoy un **STUB/scaffold**. El wrapper sobre OpenRouter
> ([`apps/api/server/lib/ai.ts`](../apps/api/server/lib/ai.ts)) también es un
> scaffold con `TODO`. **Aún NO hay rutas `/api/ai/*` reales, ni dependencia
> `@anthropic-ai/sdk` u `openai` instalada.** Por eso buena parte de este
> documento es **prospectivo**: describe el patrón objetivo que se aplicará
> *cuando se implemente la integración IA*, apuntando a las ubicaciones
> destino sin afirmar que ya existen los archivos.

---

## OBJETIVO

Cada módulo con IA debe funcionar con **OpenRouter cuando hay API key** y con
**fallback inteligente cuando no hay key**. El usuario nunca debe ver un error
por falta de API key — el módulo debe degradar graciosamente.

---

## FASE 1 — Auditoría de módulos IA

### 1.1 Buscar endpoints existentes
```bash
grep -rn "ai\|inteligencia\|generar\|suggest\|detect\|forecast\|summarize\|classify" \
  apps/api/server/routes/*.ts agent/apps/api/server/routes/*.ts
```

> Hoy el único punto de entrada conversacional es `apps/api/server/routes/copilot.ts`
> (stub). Cuando se implemente, las rutas IA destino viven en
> `apps/api/server/routes/` (y `agent/apps/api/server/routes/` para el agente).

### 1.2 Identificar oportunidades nuevas

| Tipo de módulo | Oportunidad IA | Ejemplo |
|----------------|---------------|---------|
| Dashboard | Resumen ejecutivo inteligente | "Tu turno tuvo 3 anomalías críticas" |
| Listados | Sugerencias de acciones | "Estos 5 ingredientes deberían reabastecerse" |
| Formularios | Auto-completado / sugerencias | Pre-llenar campos basado en contexto |
| Reportes | Análisis narrativo | Convertir KPIs en párrafos ejecutivos |
| Copilot / Chat | Respuestas + acciones ejecutables | Draft de respuesta basado en historial del turno |
| OCR | Extracción de datos de imágenes | Leer recibos, facturas, documentos |

---

## FASE 2 — Patrón de implementación (Backend)

### 2.1 Helper reutilizable — `askAI()`

El wrapper destino es [`apps/api/server/lib/ai.ts`](../apps/api/server/lib/ai.ts)
(y `agent/apps/api/server/lib/ai.ts` para el agente). Hoy contiene un scaffold
con `TODO`. Cuando se implemente la integración IA, debe exponer un helper
reutilizable con esta forma:

```typescript
// ─── OpenRouter AI Helper ────────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export async function askAI(
  system: string,
  userPrompt: string,
  options?: { model?: string; maxTokens?: number }
): Promise<{ text: string; model: string }> {
  if (!OPENROUTER_API_KEY) {
    return { text: "", model: "fallback" };
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://copiloto.app",
        "X-Title": "Copiloto",
      },
      body: JSON.stringify({
        model: options?.model ?? OPENROUTER_MODEL,
        max_tokens: options?.maxTokens ?? 1024,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return { text: text.trim(), model: options?.model ?? OPENROUTER_MODEL };
  } catch (err) {
    console.error("OpenRouter API error:", err);
    return { text: "", model: "fallback" };
  }
}

// Para endpoints con imágenes (OCR, análisis visual)
export async function askAIWithImage(
  imageBase64: string,
  prompt: string,
  options?: { model?: string; maxTokens?: number }
): Promise<{ text: string; model: string }> {
  if (!OPENROUTER_API_KEY) {
    return { text: "", model: "fallback" };
  }

  try {
    const mediaType = imageBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageUrl = `data:${mediaType};base64,${base64Data}`;

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://copiloto.app",
        "X-Title": "Copiloto",
      },
      body: JSON.stringify({
        model: options?.model ?? OPENROUTER_MODEL,
        max_tokens: options?.maxTokens ?? 1024,
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    return { text: text.trim(), model: options?.model ?? OPENROUTER_MODEL };
  } catch (err) {
    console.error("OpenRouter Vision error:", err);
    return { text: "", model: "fallback" };
  }
}
```

### 2.2 Patrón de cada endpoint

Las rutas viven en `apps/api/server/routes/` (y `agent/apps/api/server/routes/`).
Patrón objetivo para cada endpoint IA:

```typescript
import { askAI } from "../lib/ai";

router.post("/endpoint", async (req: AuthRequest, res) => {
  // 1. Validar input
  const { campo } = req.body;
  if (!campo) return res.status(400).json({ error: "Campo requerido" });

  // 2. Obtener datos de contexto del DB
  const data = await prisma.modelo.findUnique({ ... });

  // 3. Intentar IA
  const ai = await askAI(
    "Eres un experto en {área}. Responde en español.",
    "Analiza esto: " + JSON.stringify(data)
  );

  let resultado: any;
  let model = "fallback";

  // 4. Parsear respuesta o usar fallback
  if (ai.model !== "fallback" && ai.text) {
    try {
      resultado = JSON.parse(ai.text.replace(/```json?\n?|\n?```/g, ""));
      model = ai.model;
    } catch {
      resultado = fallbackLogic(data);
    }
  } else {
    resultado = fallbackLogic(data);
  }

  // 5. Siempre incluir campo `model` en response
  res.json({ ...resultado, model });
});
```

### 2.3 Reglas del fallback

El fallback DEBE ser funcional y útil, NO un placeholder vacío:

| Tipo | Fallback aceptable | Fallback NO aceptable |
|------|-------------------|----------------------|
| Generación de plan | Template con 5 fases predefinidas | `{ phases: [] }` |
| Estimación | Heurísticas por keywords | `{ hours: 0 }` |
| Detección de riesgos | Reglas basadas en datos | `{ risks: [] }` |
| Resumen | Key points extraídos mecánicamente | `"No disponible"` |
| OCR | Template vacío editable | Error que bloquea la UI |
| Clasificación | Matching de keywords con scoring | `{ intent: "unknown" }` |

---

## FASE 3 — Variables de entorno

### 3.1 En el `.env` de cada app (ya configurado)

`apps/api/.env` y `agent/apps/api/.env` ya declaran:
```
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

### 3.2 En `.env.example`

`apps/api/.env.example` y `agent/apps/api/.env.example` ya incluyen la sección:
```
# --- AI ---
OPENROUTER_API_KEY=
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

### 3.3 Una sola API key para todo el monorepo
La misma `OPENROUTER_API_KEY` se configura en cada `.env` (`apps/api` y
`agent/apps/api`) pero es el mismo valor. En producción se configura como
variable de entorno del sistema.

---

## FASE 4 — Dependencias

**NO se necesita instalar ningún SDK**. OpenRouter usa `fetch` nativo
(disponible en Node 22). No se requiere `@anthropic-ai/sdk` ni `openai` —
hoy ninguno está instalado en `apps/api` ni en `agent/apps/api`, y la
integración debe mantenerse así.

---

## FASE 5 — Frontend

Aplica tanto a `apps/web/src/**` como a `agent/apps/web/src/**`.

### 5.1 Mostrar indicador de modelo
Cuando el response incluya `model`, mostrar un badge discreto:
- `anthropic/*` o cualquier modelo real → badge "IA" en color primario
- `fallback` / `rule-based` → badge "Auto" en color outline

### 5.2 Manejar errores graciosamente
- Si el endpoint de IA falla → mostrar los datos sin IA, nunca bloquear la UI
- `useQuery` para endpoints AI debe tener `retry: 1` y `staleTime` alto
- Nunca hacer que un módulo completo dependa de un endpoint de IA

### 5.3 Loading state visible mientras la IA responde — OBLIGATORIO

Todo componente que dispare una llamada a un endpoint IA (mutation o query)
**debe mostrar feedback visible al usuario** mientras la respuesta está en
vuelo. Llamadas a Claude/OpenRouter típicamente tardan **3-60 segundos** — un
botón "Generar" sin loader hace que el usuario re-clickee, dispara doble-
submit, o cree dudas sobre si el sistema está vivo.

> Hoy aún no hay rutas `/api/ai/*` reales; el endpoint conversacional destino
> es `/api/copilot/chat` (stub en `apps/api/server/routes/copilot.ts`). Esta
> regla aplica a cualquier endpoint IA cuando se implemente.

**Indicadores aceptables** (al menos uno por interacción):

| Tipo de UI | Loader esperado |
|---|---|
| Botón "Generar / Preguntar / Aplicar IA" | `disabled={mutation.isPending}` + texto cambia a "Generando..." / "Analizando..." + spinner inline (Material Symbols `progress_activity` con `animate-spin`) |
| Panel de chat (copilot) | Burbuja "Escribiendo..." con animación `animate-pulse` o 3 dots animados, en lugar del input habilitado |
| Modal "Generar descripción IA" | Skeleton del textarea destino + texto debajo "Claude está pensando... (15-30s)" |
| Card de insights / dashboard | Skeleton card con shimmer mientras `useQuery` está pending |
| Tooltip / popover de sugerencias | Spinner centrado + texto "Analizando contexto..." |

**Patrón canónico (mutation con `isPending`):**

```tsx
const generate = useMutation({
  mutationFn: () => apiPost("/api/copilot/generate-description", { productName }),
  onSuccess: (res) => setDescription(res.description),
});

return (
  <button
    type="button"
    onClick={() => generate.mutate()}
    disabled={generate.isPending}
    aria-busy={generate.isPending}
  >
    {generate.isPending ? (
      <>
        <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Generando…
      </>
    ) : (
      <>
        <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Generar con IA
      </>
    )}
  </button>
);
```

**Patrón canónico (chat con typing indicator):**

```tsx
{isTyping && (
  <div className="flex gap-2.5">
    <div className="h-7 w-7 rounded-full ai-avatar">
      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
    </div>
    <div className="bg-surface-container-low rounded-xl px-3 py-2 text-xs">
      <span className="animate-pulse">Escribiendo…</span>
    </div>
  </div>
)}
```

**Anti-patterns prohibidos:**
- ❌ Botón "Generar con IA" sin `disabled` ni cambio de texto — el usuario clickea 3 veces
- ❌ Loader solo en consola (`console.log("loading")`) sin UI visible
- ❌ Spinner pero el botón sigue habilitado (permite doble-submit)
- ❌ Toast `"Generando..."` que aparece y desaparece en 200ms (no captura el tiempo real de 15-30s)
- ❌ Modal con campos vacíos sin texto explicativo de "Claude está pensando, 15-30s típicos"

**Validación** — cuando la integración IA esté implementada, todo componente
que llame a un endpoint IA desde el FE debe mostrar al menos uno de:
- `isPending` / `isLoading` / `isTyping` aplicado a `disabled` o renderizado condicional
- Un spinner (`progress_activity` con `animate-spin`), `<Skeleton>` o shimmer cerca de la mutation/query
- Texto "Generando", "Analizando", "Pensando", "Escribiendo" condicional al estado

Si no lo cumple, el módulo no está listo para production — los usuarios
reportarán "el botón no hace nada" cuando en realidad Claude tarda 30s.

### 5.4 Patrón de chat IA — UX completo

Aplica a cualquier UI con conversación bidireccional contra un endpoint IA:
el **co-piloto conversacional** de Copiloto (ruta FE
[`apps/web/src/app/copilot/`](../apps/web/src/app/copilot/page.tsx), endpoint
BE destino `/api/copilot/chat`), y cualquier chat IA futuro en el agente
(`agent/apps/web/src/**`). Estos chats requieren **4 ingredientes** por encima
del loader genérico de §5.3.

> No hay aún una implementación de referencia completa en el repo (la página
> `copilot/page.tsx` renderiza mensajes estáticos de demo, sin handler de
> envío real). Cuando se construya el chat conversacional, debe nacer
> cumpliendo los 4 ingredientes de esta sección.

#### 5.4.1 Estado mínimo del chat

```tsx
const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
const [input, setInput] = useState("");
const [pending, setPending] = useState(false);   // IA respondiendo
const [launching, setLaunching] = useState(false); // animacion del send (700ms)
const scrollRef = useRef<HTMLDivElement>(null);
```

#### 5.4.2 Ingredientes obligatorios

| # | Patrón | Por qué |
|---|---|---|
| 1 | **Efecto rocket_launch al enviar** | Feedback inmediato de "tu mensaje despegó" — el usuario sabe que el click fue registrado aunque la respuesta tarde 10s. |
| 2 | **3 puntos rebotando** en la posición donde llegará la respuesta IA | Ocupa el espacio destino, evita layout shift cuando llega el texto. Mismo lugar que la burbuja final → el ojo no salta. |
| 3 | **Auto-scroll al último mensaje** en `open`, `nuevo mensaje`, `pending` | El usuario nunca tiene que scrollear manualmente para ver lo que llega. El feed se siente como WhatsApp/iMessage. |
| 4 | **Botón send y handler bloqueados** durante `pending`/`launching` | Evita doble-submit cuando la respuesta tarda 30s. |

#### 5.4.3 Patrón canónico — efecto rocket_launch

CSS (en `<style>` del componente o `globals.css`):

```css
@keyframes rocket-launch {
  0%   { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
  25%  { transform: translate(3px, -8px) rotate(-8deg) scale(1.05); opacity: 1; }
  100% { transform: translate(40px, -60px) rotate(-12deg) scale(0.55); opacity: 0; }
}
.rocket-launch { animation: rocket-launch 700ms cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards; }

@keyframes rocket-trail {
  0%   { opacity: 0; transform: translate(-50%, 0) scaleY(0.4); }
  30%  { opacity: 0.8; transform: translate(-50%, 8px) scaleY(1); }
  100% { opacity: 0; transform: translate(-50%, 22px) scaleY(0.6); }
}
.rocket-trail { animation: rocket-trail 700ms ease-out forwards; }
```

Handler:

```tsx
const handleSend = async () => {
  if (!input.trim() || pending) return;
  setLaunching(true);
  window.setTimeout(() => setLaunching(false), 700);
  setMessages((m) => [...m, { role: "user", text: input }]);
  setInput("");
  setPending(true);
  try {
    const data = await apiPost("/api/copilot/chat", { ... });
    setMessages((m) => [...m, { role: "ai", text: data.answer }]);
  } finally {
    setPending(false);
  }
};
```

Botón (Copiloto usa Material Symbols Outlined; el ícono `rocket_launch` está
disponible):

```tsx
<button
  onClick={handleSend}
  disabled={!input.trim() || launching || pending}
  aria-label="Enviar al co-piloto IA"
  style={{ position: "relative", overflow: "visible" /* permite que el cohete escape del botón */ }}
>
  {launching ? (
    <>
      <span className="material-symbols-outlined rocket-launch" style={{ color: "#fff" }}>rocket_launch</span>
      <span aria-hidden className="rocket-trail" style={{
        position: "absolute", top: "60%", left: "50%",
        width: 6, height: 20, borderRadius: 9999,
        background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0))",
        pointerEvents: "none",
      }} />
    </>
  ) : (
    <span className="material-symbols-outlined">send</span>
  )}
</button>
```

#### 5.4.4 Patrón canónico — typing dots en la posición de la respuesta

```tsx
{pending && (
  <div
    style={{ display: "flex", justifyContent: "flex-start" }}
    aria-live="polite"
    aria-label="El co-piloto esta escribiendo"
  >
    <div style={{
      padding: "12px 14px",
      borderRadius: "14px 14px 14px 4px",  /* mismo radio que las burbujas AI */
      background: "var(--surface-low)",
      display: "inline-flex", gap: 5, alignItems: "center",
    }}>
      <span className="bounce-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: "#888", animationDelay: "0s" }} />
      <span className="bounce-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: "#888", animationDelay: "0.2s" }} />
      <span className="bounce-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: "#888", animationDelay: "0.4s" }} />
    </div>
  </div>
)}
```

```css
@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%           { transform: translateY(-4px); opacity: 1; }
}
.bounce-dot { animation: bounce-dot 1.2s infinite ease-in-out; }
```

Reglas:
- Los 3 puntos van **dentro de una burbuja con el mismo styling que las respuestas IA finales** (mismo radio, mismo fondo, misma alineación a la izquierda). El usuario percibe que es la respuesta materializándose, no un loader genérico.
- `aria-live="polite"` para que screen readers anuncien cuando la IA está respondiendo.
- Renderizar **después** del `.map(messages)` para que aparezca como último item visual.

#### 5.4.5 Patrón canónico — auto-scroll al último mensaje

```tsx
useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;
  // requestAnimationFrame garantiza que el DOM ya midio las burbujas nuevas
  // (incluyendo markdown rendereado con dangerouslySetInnerHTML) antes de scrollear.
  const id = requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  return () => cancelAnimationFrame(id);
}, [messages, pending, chatOpen]);
```

Y el ref en el contenedor scrollable:

```tsx
<div ref={scrollRef} style={{ flex: 1, overflowY: "auto" }}>
  {messages.map(...)}
  {pending && <TypingDots />}
</div>
```

Dependencias del effect (los 3 son obligatorios):
- `messages` — al agregar mensaje del user o respuesta IA
- `pending` — al aparecer/desaparecer los typing dots
- `chatOpen` (o equivalente: el tab activo del panel copilot) — al abrir el panel, scrollea al último msg histórico

**Importante:** `requestAnimationFrame` no es opcional. Sin él, el primer mensaje largo o un markdown alto queda cortado por arriba porque `scrollHeight` se calcula antes del layout final.

#### 5.4.6 Anti-patterns prohibidos en chats IA

- ❌ Botón send sin animación de despegue — el usuario no sabe si el click registró
- ❌ Spinner genérico (`progress_activity` con `animate-spin`) en vez de los 3 puntos en la posición de la respuesta — rompe la percepción de conversación
- ❌ Los 3 puntos fuera de la burbuja (ej. en el header del chat) — layout shift cuando llega el texto
- ❌ Sin `scrollRef` + `useEffect` — el usuario tiene que scrollear manual cada vez que llega una respuesta
- ❌ Scroll con `scrollIntoView({ behavior: "smooth" })` en chats — el smooth scroll choca con el flujo de typing dots → respuesta. Usar `scrollTop = scrollHeight` directo dentro de `requestAnimationFrame`.
- ❌ Permitir nuevo `handleSend` mientras `pending === true` — duplica requests, gasta tokens

#### 5.4.7 Estado de los chats IA (2026-06-13)

| Ubicación | Componente | Estado |
|---|---|---|
| `apps/web/src/app/copilot/` | Co-piloto del turno (`page.tsx`) | ⚠️ scaffold — mensajes de demo estáticos, sin handler de envío ni endpoint real |
| `apps/api/server/routes/copilot.ts` | `/api/copilot/chat` | ⚠️ stub — solo expone `GET /__stub` |
| `agent/apps/web/src/**` | (sin chat IA aún) | — |

Cuando se construya el co-piloto conversacional, debe nacer cumpliendo los 4
ingredientes de §5.4, no añadirlos después.

---

## FASE 6 — Testing

### 6.1 Probar sin API key (fallback)
```bash
unset OPENROUTER_API_KEY
# Reiniciar backend
# Verificar que TODOS los endpoints AI retornan datos útiles
```

### 6.2 Probar con API key
```bash
export OPENROUTER_API_KEY="sk-or-v1-..."
# Reiniciar backend
# Verificar que las respuestas son más ricas y el campo model muestra anthropic/claude-3.5-sonnet
```

---

## MÓDULOS IA POR ÁREA (roadmap prospectivo)

Ninguno está implementado todavía — son las oportunidades destino una vez que
arranque la integración IA. Rutas en `apps/api/server/routes/` (core) y
`agent/apps/api/server/routes/` (agente).

### Copilot (core conversacional)
- [ ] `/api/copilot/chat` — Co-piloto conversacional con tool calls + human-in-the-loop
- [ ] `/api/copilot/threads` — Historial de conversaciones por usuario
- [ ] Resumen de turno (`summarizeShift`) — Post-mortem narrativo de 3–5 bullets

### Dashboard / KPIs
- [ ] Resumen ejecutivo inteligente del turno
- [ ] Insights automáticos sobre KPIs

### Anomalies
- [ ] Detección y explicación narrativa de anomalías
- [ ] Sugerencia de acción correctiva

### Forecast
- [ ] Pronóstico de demanda enriquecido con contexto narrativo

### Inventory / Suppliers
- [ ] Sugerencia de par levels y reabastecimiento
- [ ] Draft de orden de compra

### Campaigns
- [ ] Generación de copy de campaña (`draftCampaignCopy`) con tono es-MX por canal

### Invoices / Recipes
- [ ] OCR de recibos/facturas con visión IA
- [ ] Sugerencia de costeo de recetas

---

## REGLAS ABSOLUTAS

1. **NUNCA** hacer que la app crashee si no hay `OPENROUTER_API_KEY`
2. **SIEMPRE** incluir fallback funcional con datos útiles
3. **SIEMPRE** incluir campo `model` en la response
4. **SIEMPRE** usar `anthropic/claude-3.5-sonnet` como modelo default
5. **NUNCA** enviar datos sensibles (passwords, tokens) a la IA
6. **SIEMPRE** hacer try/catch — la API puede fallar
7. **SIEMPRE** tener `OPENROUTER_API_KEY` en `.env` y `.env.example`
8. **NUNCA** hardcodear la API key en el código
9. **SIEMPRE** probar primero sin API key para validar fallback
10. Los prompts deben ser en **español** y especificar formato de respuesta
11. **NO instalar SDKs** — usar `fetch` nativo de Node 22
12. **Una sola API key** sirve para todo el monorepo (`apps/api` + `agent/apps/api`)
13. Toda acción de alto impacto del co-piloto (cambiar precios, campañas masivas, override de schedule en hora pico) cae en **human-in-the-loop** por defecto
