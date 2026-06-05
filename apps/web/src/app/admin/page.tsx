import { AppShell } from "@/components/AppShell";

const CHATS = [
  { initials: "AH", name: "Adriana Hidalgo", last: "Perfecto, confírmame para 4 personas a las 8pm.", time: "AHORA", active: true, color: "bg-primary-fixed text-primary" },
  { initials: "RN", name: "Roberto Nájera", last: "¿Tienen opciones veganas en el menú?", time: "10:45 AM", color: "bg-surface-container-high text-on-surface-variant" },
  { initials: "SC", name: "Sofía Castillo", last: "Gracias por la atención.", time: "Ayer", muted: true, color: "bg-surface-container-high text-on-surface-variant" },
  { initials: "MR", name: "Mauricio Reyes", last: "¿Hay estacionamiento cerca?", time: "Ayer", muted: true, color: "bg-surface-container-high text-on-surface-variant" },
  { initials: "LV", name: "Lorena Vidal", last: "Quiero reservar para 6.", time: "Lun", muted: true, color: "bg-surface-container-high text-on-surface-variant" },
];

export default function Page() {
  return (
    <AppShell>
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Agente WhatsApp · Copiloto FOH
        </h1>
        <p className="text-on-surface-variant font-body-md">
          Conversaciones en curso, intervención humana y flujos del bot de reservas.
        </p>
      </header>

      <section className="bg-white border border-outline-variant card-shadow rounded-xl p-md flex flex-wrap items-center gap-xl">
        <KpiInline icon="forum" tint="emerald" label="Conversaciones hoy" value="84" />
        <KpiInline icon="timer" tint="primary" label="Tiempo respuesta" value="1.8s" />
        <KpiInline icon="check_circle" tint="secondary" label="Auto-resueltas" value="78%" />
        <span className="ml-auto px-sm py-1 bg-emerald-600 text-white rounded-full text-[12px] font-bold flex items-center gap-1">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Agente Online
        </span>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Chat list */}
        <aside className="lg:col-span-4 bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden flex flex-col min-h-[640px]">
          <div className="p-md border-b border-outline-variant">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar conversaciones…"
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-low text-body-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CHATS.map((c) => (
              <div
                key={c.name}
                className={`p-md border-b border-outline-variant flex gap-md cursor-pointer transition-all ${
                  c.active ? "bg-surface-container border-l-4 border-l-primary" : "hover:bg-surface-container-low"
                } ${c.muted ? "opacity-60" : ""}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${c.color}`}
                >
                  {c.initials}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold font-label-md truncate text-on-surface">{c.name}</h4>
                    <span
                      className={`text-[10px] font-bold ${
                        c.active ? "text-primary" : "text-on-surface-variant/60"
                      }`}
                    >
                      {c.time}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant truncate">{c.last}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat detail */}
        <section className="lg:col-span-8 flex flex-col bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden relative min-h-[640px]">
          <header className="h-16 flex items-center px-md bg-white/80 backdrop-blur-md border-b border-outline-variant z-10">
            <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold mr-md">
              AH
            </div>
            <div>
              <h3 className="font-bold font-label-md text-on-surface">Adriana Hidalgo</h3>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">smartphone</span> +52 55 1234
                5678
              </p>
            </div>
            <div className="ml-auto flex gap-xs">
              <button className="p-xs text-on-surface-variant hover:bg-surface-container rounded-lg">
                <span className="material-symbols-outlined">call</span>
              </button>
              <button className="p-xs text-on-surface-variant hover:bg-surface-container rounded-lg">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-lg flex flex-col gap-md bg-surface-container-low">
            <div className="self-center bg-white/80 backdrop-blur px-md py-xs rounded-full text-[11px] font-bold text-on-surface-variant shadow-sm">
              HOY
            </div>
            <ChatMsg from="client" body="Hola, me gustaría reservar una mesa para esta noche." time="12:15 PM" />
            <ChatMsg
              from="bot"
              body="¡Claro que sí, Adriana! Con gusto te ayudo. ¿Para cuántas personas y a qué hora te gustaría?"
              time="12:15 PM"
            />
            <ChatMsg from="client" body="Somos 4 personas, a las 8:00 PM por favor." time="12:16 PM" />
            <ChatMsg
              from="bot"
              body="Revisando disponibilidad… ¡Tenemos mesa! Confírmame para 4 personas a las 8pm y queda lista tu reserva."
              time="12:16 PM"
            />
            <ChatMsg from="client" body="Perfecto, confírmame para 4 personas a las 8pm." time="12:17 PM" />
          </div>

          {/* Flow overlay */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[92%] bg-white/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-md flex flex-col xl:flex-row items-start xl:items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-primary uppercase mb-2 tracking-widest">
                Estado del flow · Reserva en curso
              </p>
              <div className="flex items-center gap-xs flex-wrap">
                <FlowStep n={1} label="Intención" done />
                <FlowConnector done />
                <FlowStep n={2} label="Datos" done />
                <FlowConnector done />
                <FlowStep n={3} label="Confirmación" active />
                <FlowConnector />
                <FlowStep n={4} label="Finalizar" />
              </div>
            </div>
            <div className="flex gap-sm shrink-0">
              <button className="px-md py-2 border border-primary text-primary rounded-lg font-label-md hover:bg-primary/5 transition-colors">
                Intervenir
              </button>
              <button className="px-md py-2 bg-primary text-white rounded-lg font-label-md shadow-md">
                Confirmar por bot
              </button>
            </div>
          </div>

          <footer className="p-md bg-white border-t border-outline-variant flex items-center gap-md">
            <button className="p-xs text-on-surface-variant">
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="flex-1 bg-surface-container-low rounded-xl px-md py-2 flex items-center">
              <input
                type="text"
                placeholder="Escribe un mensaje…"
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-body-sm"
              />
              <button className="text-on-surface-variant ml-2">
                <span className="material-symbols-outlined">mood</span>
              </button>
            </div>
            <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg transition-transform active:scale-95">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                send
              </span>
            </button>
          </footer>
        </section>
      </div>
    </AppShell>
  );
}

function KpiInline({
  icon,
  tint,
  label,
  value,
}: {
  icon: string;
  tint: "emerald" | "primary" | "secondary";
  label: string;
  value: string;
}) {
  const tintMap = {
    emerald: "bg-emerald-100 text-emerald-600",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
  };
  return (
    <div className="flex items-center gap-sm">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tintMap[tint]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-on-surface-variant">{label}</p>
        <p className="font-numeral-xl text-numeral-xl leading-none text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function ChatMsg({
  from,
  body,
  time,
}: {
  from: "client" | "bot";
  body: string;
  time: string;
}) {
  if (from === "bot") {
    return (
      <div className="flex flex-col items-end max-w-[70%] self-end">
        <div
          className="p-md rounded-2xl rounded-tr-none shadow-sm text-body-sm relative border border-emerald-200"
          style={{ backgroundColor: "#dcf8c6" }}
        >
          <div className="flex items-center gap-xs mb-1 text-[10px] font-bold text-primary">
            <span className="material-symbols-outlined text-[14px]">smart_toy</span> COPILOTO AI
          </div>
          {body}
          <span className="block mt-1 text-right text-[10px] text-on-surface-variant/60">{time}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start max-w-[70%]">
      <div className="bg-white p-md rounded-2xl rounded-tl-none shadow-sm text-body-sm">
        {body}
        <span className="block mt-1 text-right text-[10px] text-on-surface-variant/60">{time}</span>
      </div>
    </div>
  );
}

function FlowStep({ n, label, done, active }: { n: number; label: string; done?: boolean; active?: boolean }) {
  const dot = done
    ? "bg-emerald-600 text-white"
    : active
    ? "bg-primary text-white animate-pulse"
    : "bg-surface-variant text-on-surface-variant/40";
  const labelClass = active ? "text-primary" : done ? "text-on-surface" : "text-on-surface-variant/60";
  return (
    <div className="flex items-center gap-xs">
      <span className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold ${dot}`}>
        {n}
      </span>
      <span className={`text-[11px] font-bold ${labelClass}`}>{label}</span>
    </div>
  );
}

function FlowConnector({ done }: { done?: boolean }) {
  return <div className={`h-[2px] w-8 ${done ? "bg-emerald-600" : "bg-surface-variant"}`} />;
}
