"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { CopilotChatMessage, CopilotChatResponse } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { api, ApiError } from "@/lib/api";

const SUGGESTIONS = [
  "¿Por qué cambió mi ticket promedio hoy?",
  "¿Qué anomalías debo atender primero?",
  "¿Cómo se ve el pronóstico de esta semana?",
  "¿Qué insumos están por debajo del par?",
];

export default function Page() {
  const { currentLocation } = useAuth();
  const [messages, setMessages] = useState<CopilotChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [notConfigured, setNotConfigured] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ model: string; contextAt: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = useMutation({
    mutationFn: (history: CopilotChatMessage[]) =>
      api<CopilotChatResponse>("/api/copilot/chat", {
        method: "POST",
        body: JSON.stringify({ locationId: currentLocation?.id, messages: history }),
      }),
    onSuccess: (res) => {
      setMessages((prev) => [...prev, { role: "assistant", content: res.message }]);
      setMeta({ model: res.model, contextAt: res.contextAt });
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 503) {
        setNotConfigured(true);
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Error al consultar al co-piloto");
      }
      // Revertir el mensaje del usuario que no obtuvo respuesta.
      setMessages((prev) => (prev[prev.length - 1]?.role === "user" ? prev.slice(0, -1) : prev));
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chat.isPending]);

  function send(text: string) {
    const content = text.trim();
    if (!content || chat.isPending || !currentLocation?.id) return;
    setErrorMsg(null);
    const next: CopilotChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    chat.mutate(next);
  }

  const empty = messages.length === 0;

  return (
    <AppShell>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Conversación */}
        <div className="lg:col-span-8 bg-white rounded-[20px] border border-outline-variant card-shadow flex flex-col min-h-[640px] max-h-[calc(100vh-140px)]">
          <header className="flex flex-col gap-1 p-6 border-b border-outline-variant/60">
            <h1 className="font-display-md text-[20px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              Co-piloto del turno{currentLocation ? ` · ${currentLocation.name}` : ""}
            </h1>
            <p className="text-sm text-on-surface-variant">
              Chat fundamentado en tus datos reales (KPIs, anomalías, pronóstico, inventario). Solo lectura.
            </p>
          </header>

          <div ref={scrollRef} className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">
            {notConfigured && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-4">
                <p className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">key_off</span>
                  Co-piloto no configurado
                </p>
                <p className="text-sm mt-1">
                  Falta <code className="font-mono">OPENROUTER_API_KEY</code> en el backend. Agrégala en{" "}
                  <code className="font-mono">apps/api/.env</code> y reinicia la API para activar el chat. El
                  resto del sistema arma el contexto correctamente.
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-3 text-sm">
                {errorMsg}
              </div>
            )}

            {empty && !notConfigured ? (
              <div className="flex flex-col items-center justify-center text-center gap-5 flex-1 py-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #B9532A 0%, #9A3412 100%)" }}>
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">¿En qué te ayudo con el turno?</p>
                  <p className="text-sm text-on-surface-variant mt-1">Pregúntame sobre tus ventas, costos, anomalías o pronóstico.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="text-left px-4 py-3 rounded-xl border border-outline-variant hover:bg-surface-container-low text-sm text-on-surface"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="self-end max-w-[80%] bg-primary-container text-on-primary-container rounded-2xl rounded-br-md px-4 py-3">
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                ) : (
                  <div key={i} className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-secondary-container text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                    </div>
                    <div className="bg-surface-container-low rounded-2xl rounded-tl-md px-4 py-3">
                      <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  </div>
                )
              )
            )}

            {chat.isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container text-[18px]">auto_awesome</span>
                </div>
                <div className="bg-surface-container-low rounded-2xl rounded-tl-md px-4 py-3 flex gap-1 items-center">
                  <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
                </div>
              </div>
            )}
          </div>

          <footer className="p-4 border-t border-outline-variant/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={notConfigured}
                placeholder={notConfigured ? "Configura OPENROUTER_API_KEY para activar" : "Pregunta al co-piloto…"}
                className="flex-1 px-4 py-2.5 rounded-full border border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-primary outline-none bg-surface-container-lowest disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={chat.isPending || notConfigured || !input.trim()}
                className="px-5 py-2.5 btn-terracota-gradient rounded-full text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                Enviar
              </button>
            </form>
            {meta && (
              <p className="text-[11px] text-on-surface-variant mt-2 text-center">
                Respondido por {meta.model} · datos al {new Date(meta.contextAt).toLocaleString("es-MX")}
              </p>
            )}
          </footer>
        </div>

        {/* Panel lateral */}
        <aside className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-white border border-outline-variant rounded-xl card-shadow p-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tips_and_updates</span>
              Qué puedo responder
            </h3>
            <ul className="text-sm text-on-surface-variant space-y-2">
              <li>· Ventas de hoy vs ayer y ticket promedio</li>
              <li>· Food cost y platillos más caros de producir</li>
              <li>· Más y menos vendidos (30 días)</li>
              <li>· Pronóstico de comensales e ingreso</li>
              <li>· Anomalías abiertas y recomendaciones</li>
              <li>· Insumos por debajo del nivel par</li>
            </ul>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md text-sm text-on-surface-variant flex gap-sm items-start">
            <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
            <p>
              El co-piloto es de <strong>solo lectura</strong>: responde sobre tus datos pero no
              ejecuta cambios. Las acciones con aprobación humana (Action Ledger) llegan en una
              próxima versión.
            </p>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60 animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}
