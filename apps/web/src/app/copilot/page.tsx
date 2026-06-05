import { AppShell } from "@/components/AppShell";

export default function Page() {
  return (
    <AppShell>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Conversación */}
        <div className="lg:col-span-8 bg-white rounded-[20px] border border-outline-variant card-shadow flex flex-col min-h-[640px]">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-outline-variant/60">
            <div>
              <h1 className="font-display-md text-[20px] font-bold text-on-surface">
                Co-piloto del turno · Roma Norte
              </h1>
              <p className="text-sm text-on-surface-variant">
                Asistente conversacional con acciones ejecutables y human-in-the-loop.
              </p>
            </div>
            <div className="flex items-center gap-xs">
              <button className="px-3 py-1.5 rounded-full border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low">
                Chat
              </button>
              <button className="px-3 py-1.5 rounded-full text-sm font-semibold tab-active">
                Action Ledger
              </button>
              <button className="px-3 py-1.5 rounded-full border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low">
                Recomendaciones
              </button>
            </div>
          </header>

          <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">
            <Message
              role="assistant"
              icon="auto_awesome"
              variant="insight"
              title="Acción ejecutada · Aguacate par level 12 → 18kg"
              body={
                <ul className="mt-2 space-y-1 text-sm text-on-surface-variant">
                  <li>· Notificado a Chef Eduardo vía WhatsApp (entregado 16:02)</li>
                  <li>· Pedido de reposición creado a Sigma Alimentos (orden #SA-8627)</li>
                  <li>· Entrega ETA: 16:45 — costo $1,480 MXN</li>
                  <li>· Acción en Action Ledger por Monica Salinas</li>
                </ul>
              }
              footer={
                <div className="flex gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                    APROBADO POR HUMANO
                  </span>
                  <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[11px] font-bold rounded-full">
                    TRAZABLE
                  </span>
                </div>
              }
            />

            <Message
              role="user"
              body="Para el plato del día son las 14:25, ¿algo más?"
            />

            <Message
              role="assistant"
              icon="smart_toy"
              variant="default"
              body={
                <>
                  Mientras tanto: ya saliste el ticket de Lucia Robles, ¿quieres que envíe un saludo
                  de cumpleaños con cortesía de postre por WhatsApp?
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-bold">
                      Sí, postre cortesía
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-sm font-semibold">
                      Sí, pero sin postre
                    </button>
                  </div>
                </>
              }
            />
          </div>

          <footer className="p-4 border-t border-outline-variant/60 flex items-center gap-3">
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                attach_file
              </span>
            </button>
            <input
              type="text"
              placeholder="Pregunta o pide una acción al co-piloto…"
              className="flex-1 px-4 py-2.5 rounded-full border border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-primary outline-none bg-surface-container-lowest"
            />
            <button
              type="button"
              className="px-5 py-2.5 btn-terracota-gradient rounded-full text-sm font-bold"
            >
              Enviar
            </button>
          </footer>
        </div>

        {/* Sidebar: contexto + ledger + recos */}
        <aside className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-white rounded-[20px] border border-outline-variant card-shadow p-6">
            <h2 className="font-display-md text-[16px] font-bold text-on-surface mb-3">
              Lo que el co-piloto sabe
            </h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Fact label="Sucursal" value="Roma Norte" />
              <Fact label="Turno actual" value="Comida (12:00–17:00)" />
              <Fact label="Pronóstico" value="284 tickets · +12%" />
              <Fact label="Riesgos hoy" value="2 anomalías" />
              <Fact label="Reservaciones" value="8 confirmadas / 1 walk-in" />
            </dl>
          </div>

          <div className="bg-white rounded-[20px] border border-outline-variant card-shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display-md text-[16px] font-bold text-on-surface">
                Hoy · 4 acciones
              </h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                APROBADAS
              </span>
            </div>
            <ul className="space-y-3 text-sm">
              <LedgerRow time="16:02" title="Subir par level aguacate — aprobado por Monica" tag="ROI · $480" />
              <LedgerRow time="15:38" title="Cerrar plato del día — aprobado, sin impacto" tag="" />
              <LedgerRow time="14:18" title="Reasignar staff Sara → Cocina · rotación B" tag="esperando aprobación" />
              <LedgerRow time="13:50" title="Subir prep de guacamole 8 → 14kg" tag="ROI · $260" />
              <LedgerRow
                time="13:30"
                title="Rechazado: ofrecer postre cortesía a cumpleaños"
                tag="razón: contexto"
                muted
              />
            </ul>
            <button className="mt-4 text-sm font-bold text-primary hover:underline">
              Ver ledger completo →
            </button>
          </div>

          <div className="bg-white rounded-[20px] border border-outline-variant card-shadow p-6">
            <h2 className="font-display-md text-[16px] font-bold text-on-surface mb-3">
              Recomendaciones pendientes
            </h2>
            <ul className="space-y-3 text-sm">
              <RecRow icon="restaurant" title="Pre-comprar mango -16%" />
              <RecRow icon="schedule" title="Reasignar staff 4 a Caliente" />
            </ul>
          </div>
        </aside>
      </section>
    </AppShell>
  );
}

function Message({
  role,
  icon,
  variant,
  title,
  body,
  footer,
}: {
  role: "user" | "assistant";
  icon?: string;
  variant?: "default" | "insight";
  title?: string;
  body: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-primary text-white rounded-2xl rounded-tr-md px-4 py-2.5 text-sm font-semibold shadow-sm">
          {body}
        </div>
      </div>
    );
  }
  const wrap =
    variant === "insight"
      ? "border-l-4 border-primary ai-insight-bg"
      : "border border-outline-variant bg-surface-container-lowest";
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
        <span
          className="material-symbols-outlined text-white text-[18px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon ?? "auto_awesome"}
        </span>
      </div>
      <div className={`flex-1 rounded-2xl ${wrap} p-4`}>
        {title && <p className="font-bold text-on-surface mb-1">{title}</p>}
        <div className="text-sm text-on-surface">{body}</div>
        {footer}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
        {label}
      </dt>
      <dd className="font-semibold text-on-surface">{value}</dd>
    </div>
  );
}

function LedgerRow({
  time,
  title,
  tag,
  muted,
}: {
  time: string;
  title: string;
  tag: string;
  muted?: boolean;
}) {
  return (
    <li className={`flex items-start gap-2 ${muted ? "opacity-50" : ""}`}>
      <span className="text-[11px] font-bold text-on-surface-variant w-10 shrink-0">{time}</span>
      <span className="flex-1 text-on-surface">{title}</span>
      {tag && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant whitespace-nowrap">
          {tag}
        </span>
      )}
    </li>
  );
}

function RecRow({ icon, title }: { icon: string; title: string }) {
  return (
    <li className="flex items-center justify-between gap-2 p-3 bg-surface-container-low rounded-xl">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
        <span className="font-semibold text-on-surface">{title}</span>
      </div>
      <button type="button" className="text-sm font-bold text-primary hover:underline">
        Aplicar
      </button>
    </li>
  );
}
