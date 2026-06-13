---
name: ai-loader
description: Asegura que todo componente FE que llame a un endpoint IA (hoy `/api/copilot/*`; futuras rutas `/api/ai/*`) muestre un loader visible (botón disabled + spinner + texto "Generando..." o burbuja "Escribiendo..." en chats) mientras la IA responde. Para chats IA (co-piloto conversacional) además exige los 4 ingredientes: rocket_launch al enviar, 3 puntos rebotando en la posición de la respuesta, auto-scroll al último mensaje, y handler bloqueado durante pending. Auto-activar cuando se crea/edita un archivo `apps/web/src/**` o `agent/apps/web/src/**` que llame a un endpoint IA, useMutation que apunte a un endpoint AI, un componente con "Generar con IA"/"Co-piloto"/"Sugerencia IA"/"Asistente IA", o cuando el usuario pregunta "cómo muestro que la IA está pensando", "loader cuando llama a Claude", "indicador de espera para AI", "efecto rocket en el chat", "scroll automatico chat IA". La regla canónica está en `.claude/RULES-AI-INTEGRATION.md` §5.3 (loaders genéricos) y §5.4 (UX de chats IA).
---

# ai-loader

Hace cumplir la regla §5.3 de `RULES-AI-INTEGRATION.md`: todo botón/panel
que dispare una llamada a un endpoint IA debe mostrar feedback visible mientras
la IA responde (3-60s típicos). Sin loader, los usuarios re-clickean, sienten
que el sistema está roto, o disparan doble-submit.

> **Estado del proyecto**: la integración IA de Copiloto está en etapa
> temprana. El endpoint conversacional destino es `/api/copilot/chat`
> (`apps/api/server/routes/copilot.ts`, hoy stub) y aún NO existen rutas
> `/api/ai/*` reales. Esta skill describe el patrón objetivo que debe
> cumplirse en cuanto se implemente cualquier UI que llame a un endpoint IA,
> en `apps/web/src/**` o `agent/apps/web/src/**`.

## Cuándo aplicar

**Auto-activar** cuando estás:
- Creando o editando un componente que llama a un endpoint IA (`/api/copilot/*`, futuras `/api/ai/*`)
- Implementando un botón "Generar / Aplicar IA / Analizar"
- Implementando un chat tipo "Co-piloto", "Asistente IA"
- Implementando una sugerencia/insight con badge "IA"
- Respondiendo a "cómo muestro que la IA está pensando"

## Patrones canónicos (copy-paste-friendly)

Copiloto usa **Material Symbols Outlined** para íconos (el ícono `rocket_launch`
está disponible) y react-query (`@tanstack/react-query`) con el helper `apiPost`
/ `apiGet` de `apps/web/src/lib/api.ts`.

### Patrón A — Botón con mutation

```tsx
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";

const generate = useMutation({
  mutationFn: () => apiPost("/api/copilot/generate-description", { productName }),
  onSuccess: (res) => setDescription(res.description),
  onError: (e: any) => toast.error(e.message || "Error al generar"),
});

return (
  <button
    type="button"
    onClick={() => generate.mutate()}
    disabled={generate.isPending}
    aria-busy={generate.isPending}
    style={{ opacity: generate.isPending ? 0.6 : 1, cursor: generate.isPending ? "wait" : "pointer" }}
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

**Checks que se cumplen**:
- ✅ `disabled={isPending}` evita doble-submit
- ✅ Texto cambia a "Generando…" — usuario sabe que algo pasa
- ✅ Spinner inline con `animate-spin`
- ✅ `aria-busy` para lectores de pantalla
- ✅ Cursor cambia a `wait`

### Patrón B — Chat IA (los 4 ingredientes obligatorios)

Para el co-piloto conversacional de Copiloto (ruta FE
`apps/web/src/app/copilot/`, endpoint BE destino `/api/copilot/chat`) y
cualquier chat IA futuro del agente (`agent/apps/web/src/**`). **Requiere los 4
ingredientes** de §5.4 de `.claude/RULES-AI-INTEGRATION.md` — el snippet
completo con CSS, handler, botón con rocket, typing dots en posición de
respuesta y auto-scroll vive allí.

> Aún no hay una implementación de referencia completa en el repo: la página
> `apps/web/src/app/copilot/page.tsx` renderiza mensajes de demo estáticos, sin
> handler de envío real. Cuando se construya el chat conversacional, debe nacer
> cumpliendo los 4 ingredientes — no reinventar.

Resumen del flujo visual obligatorio:

```
escribes pregunta → click Send
   ↓  🚀 rocket despega del botón (700ms, Send → rocket_launch animado → vuelve a Send)
tu mensaje aparece a la derecha → auto-scroll
   ↓  ⋯⋯⋯ 3 puntos rebotando dentro de burbuja AI estilo respuesta → auto-scroll
respuesta IA reemplaza los puntos en la misma burbuja → auto-scroll
```

Estado mínimo:

```tsx
const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
const [input, setInput] = useState("");
const [pending, setPending] = useState(false);
const [launching, setLaunching] = useState(false);
const scrollRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;
  const id = requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  return () => cancelAnimationFrame(id);
}, [messages, pending, chatOpen]);  // los 3 deps son obligatorios
```

Anti-pattern del legacy: `<span className="animate-pulse">Escribiendo…</span>`
en una caja gris junto a un avatar. Eso era el patrón anterior y NO cumple
§5.4 — falta rocket, typing dots NO van en burbuja de respuesta, y NO hay
auto-scroll. Cualquier chat IA nuevo debe nacer con el patrón completo.

### Patrón C — Card de insight con `useQuery`

```tsx
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

const insight = useQuery({
  queryKey: ["ai", "insight", productId],
  queryFn: () => apiGet(`/api/copilot/recommendations/${productId}`),
  retry: 1,
  staleTime: 60_000,
});

return (
  <div className="bg-white rounded-[20px] border border-outline-variant card-shadow p-6">
    {insight.isLoading ? (
      <div className="h-20 w-full animate-pulse rounded-xl bg-surface-container-low" />
    ) : insight.isError ? (
      <p className="text-on-surface-variant text-xs">Sin sugerencias por ahora.</p>
    ) : (
      <RecommendationList items={insight.data?.recommendations ?? []} />
    )}
  </div>
);
```

### Patrón D — Modal "Generar contenido con IA"

```tsx
{open && (
  <Modal>
    {!result && !isPending && <InitialForm onSubmit={handleGenerate} />}
    {isPending && (
      <div className="flex flex-col items-center gap-3 py-12">
        <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
        <p className="text-sm font-bold">Claude está pensando…</p>
        <p className="text-xs text-on-surface-variant">Esto puede tomar 15-30 segundos.</p>
      </div>
    )}
    {result && <ResultView data={result} />}
  </Modal>
)}
```

## Anti-patterns prohibidos

- ❌ `<button onClick={() => mutate()}>Generar IA</button>` sin `disabled` ni cambio de texto
- ❌ Spinner pero el botón sigue habilitado (permite doble-submit)
- ❌ Solo `console.log("loading")` sin UI visible
- ❌ Toast `"Generando..."` que aparece y desaparece en 200ms (no captura los 15-30s reales)
- ❌ Modal con campos vacíos sin texto explicativo del tiempo de espera
- ❌ Botón con `{loading ? "..." : "Generar"}` (los 3 puntos solos no comunican)

## Validación

Antes de declarar un módulo IA listo, todo archivo de `apps/web/src/**` o
`agent/apps/web/src/**` que llame a un endpoint IA debe tener AL MENOS uno de:
- State var: `isPending` / `isLoading` / `isTyping` / `isWaiting` / `isSending` / `isGenerating`
- Spinner: `progress_activity` con `animate-spin`, skeleton o shimmer
- Animation: `animate-spin` / `animate-pulse` / `animate-bounce`
- Texto: "Generando" / "Analizando" / "Pensando" / "Escribiendo" / "Procesando"
- Accessibility: `aria-busy=`

Si ninguno aplica, el componente necesita loader.

## Reglas estrictas (no romper)

- **Nunca mostrar el resultado vacío mientras la IA carga.** Si la respuesta llega en 30s y mientras tanto muestras `<div>{result}</div>` con `result = ""`, el usuario ve la card vacía y asume bug.
- **Nunca depender solo de `aria-busy`** — los usuarios sin screen reader necesitan feedback visual.
- **Nunca habilitar el botón si la mutation está pending.** Doble-submit en endpoints AI cuesta dinero real (tokens de OpenRouter).
- **Para tiempos > 10s** (resumen de turno, generación de campaña, etc.), incluir mensaje del tiempo esperado ("Claude está pensando, puede tomar 30s") para no asustar al usuario.
- **Si el endpoint AI puede fallar** (no API key, rate limit), tener fallback UI explicado en §5.2 de RULES-AI-INTEGRATION.md.
