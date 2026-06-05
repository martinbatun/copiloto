import { AppShell } from "@/components/AppShell";

const TABLES = ["Mesa 10", "Mesa 11", "Mesa 12", "Mesa 14", "Mesa 15", "Mesa 16", "Mesa 17", "Mesa 18"];
const SLOTS = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

type Booking = {
  table: number;
  slot: number;
  span: number;
  name: string;
  meta: string;
  variant: "primary" | "vip" | "filled" | "pending";
  badge?: string;
};

const BOOKINGS: Booking[] = [
  { table: 0, slot: 0, span: 2, name: "Carlos Slim", meta: "2 personas · 19:15", variant: "primary" },
  { table: 1, slot: 6, span: 2, name: "Marta Gomez", meta: "2 personas · 22:15", variant: "pending" },
  { table: 2, slot: 2, span: 3, name: "Lucia Robles", meta: "6 personas · 20:00–21:45", variant: "vip", badge: "VIP 🎂" },
  { table: 3, slot: 4, span: 2, name: "Raul Jimenez", meta: "4 personas · 21:00", variant: "filled" },
];

export default function Page() {
  return (
    <AppShell>
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Reservaciones — Roma Norte
          </h1>
          <p className="font-body-md text-on-surface-variant">Viernes, 24 de Mayo · Turno Cena</p>
        </div>
        <div className="flex gap-xs">
          <button className="px-md py-sm bg-white border border-outline-variant rounded-full font-label-md flex items-center gap-xs hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Calendario
          </button>
          <button className="px-md py-sm bg-primary text-white rounded-full font-label-md flex items-center gap-xs shadow-md">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva reserva
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Timeline */}
        <div className="lg:col-span-8 bg-white border border-outline-variant rounded-xl card-shadow overflow-hidden flex flex-col">
          <div className="p-md border-b border-outline-variant flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center bg-surface-container-lowest">
            <h2 className="font-headline-sm text-headline-sm flex items-center gap-xs text-on-surface">
              <span className="material-symbols-outlined text-primary">schedule</span>
              Timeline de la noche
            </h2>
            <div className="flex flex-wrap items-center gap-sm text-body-sm">
              <Legend color="bg-primary-container/40" label="Confirmada" />
              <Legend color="bg-secondary-container" label="VIP" />
              <Legend color="bg-surface-container-highest" label="Pendiente" />
            </div>
          </div>
          <div className="grow overflow-auto">
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-outline-variant flex">
              <div className="w-24 p-sm border-r border-outline-variant shrink-0 font-label-md bg-surface-container-low text-center">
                Mesas
              </div>
              <div className="flex grow">
                {SLOTS.map((s, i) => (
                  <div
                    key={s}
                    className={`w-[100px] p-sm text-center font-label-md ${
                      i < SLOTS.length - 1 ? "border-r border-outline-variant" : ""
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex min-w-max">
              <div className="w-24 shrink-0 bg-surface-container-lowest border-r border-outline-variant">
                {TABLES.map((t) => (
                  <div
                    key={t}
                    className="h-20 border-b border-outline-variant flex items-center justify-center font-bold text-primary"
                  >
                    {t}
                  </div>
                ))}
              </div>
              <div className="grow relative" style={{ minWidth: SLOTS.length * 100 }}>
                {/* Grid lines */}
                {TABLES.map((_, ti) => (
                  <div
                    key={ti}
                    className="absolute left-0 right-0 border-b border-outline-variant/40"
                    style={{ top: ti * 80, height: 80 }}
                  />
                ))}
                {/* Bookings */}
                {BOOKINGS.map((b, i) => {
                  const colors = {
                    primary: "bg-primary-container/30 border-l-primary text-primary",
                    vip: "bg-secondary-container border-l-primary text-on-secondary-container shadow-md",
                    filled: "bg-primary-container border-l-white/40 text-white",
                    pending: "bg-surface-container-highest/60 border-l-outline text-on-surface",
                  }[b.variant];
                  return (
                    <div
                      key={i}
                      className={`absolute h-16 rounded-lg p-xs flex flex-col justify-center border-l-4 ${colors} cursor-pointer hover:scale-[1.02] transition-transform`}
                      style={{
                        top: b.table * 80 + 8,
                        left: b.slot * 100 + 6,
                        width: b.span * 100 - 12,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-label-md">{b.name}</span>
                        {b.badge && (
                          <span className="text-[10px] font-bold opacity-80">{b.badge}</span>
                        )}
                      </div>
                      <span className="text-[11px] opacity-80">{b.meta}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right side stack */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-white border border-outline-variant rounded-xl card-shadow p-md border-l-4 border-secondary">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-sm text-headline-sm flex items-center gap-xs text-on-surface">
                <span className="material-symbols-outlined text-secondary">hourglass_top</span>
                Waitlist
              </h3>
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-sm py-xs rounded-full font-label-md">
                3 esperando
              </span>
            </div>
            <div className="flex flex-col gap-sm">
              <WaitRow name="M. Perez (4p)" wait="15 min" active />
              <WaitRow name="J. Herrera (2p)" wait="8 min" />
              <WaitRow name="L. Vargas (3p)" wait="4 min" />
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-xl card-shadow p-md border-l-4 border-error">
            <h3 className="font-headline-sm text-headline-sm flex items-center gap-xs mb-md text-on-surface">
              <span className="material-symbols-outlined text-error">event_busy</span>
              No-shows
            </h3>
            <div className="flex items-center gap-md p-sm bg-error-container/20 rounded-lg mb-sm">
              <div className="flex-1">
                <p className="font-label-md text-on-error-container">Ana Paula (20:30)</p>
                <p className="text-body-sm text-on-surface-variant">No llegó. Mesa liberada.</p>
              </div>
              <button className="bg-primary text-white py-xs rounded-full flex items-center gap-xs text-[12px] px-sm">
                <span className="material-symbols-outlined text-[16px]">send</span> Recovery
              </button>
            </div>
            <p className="text-[12px] text-on-surface-variant italic">
              IA enviará recordatorio de penalización vía WhatsApp.
            </p>
          </div>

          <div
            className="text-white rounded-xl shadow-lg p-md relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #B9532A 0%, #9A3412 100%)" }}
          >
            <div className="flex items-center gap-sm mb-md">
              <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center shadow-inner">
                <span
                  className="material-symbols-outlined text-on-secondary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  smart_toy
                </span>
              </div>
              <div>
                <h3 className="font-label-md">Copiloto FOH</h3>
                <p className="text-[11px] opacity-80">Agente de Reservas Activo</p>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div className="flex flex-col gap-sm">
              <div className="bg-white/10 backdrop-blur-md p-sm rounded-lg border border-white/20 -translate-x-2">
                <p className="text-[12px] italic">
                  &ldquo;¡Hola! ¿Aún tienen mesa para 4 a las 9pm?&rdquo;
                </p>
                <p className="text-[10px] opacity-60 mt-xs text-right">Gaby T. · Hace 1m</p>
              </div>
              <div className="bg-primary-container p-sm rounded-lg self-end border border-white/20 translate-x-2">
                <p className="text-[12px]">
                  &ldquo;¡Hola Gaby! Sí, solo nos queda en Terraza. ¿Te la reservo?&rdquo;
                </p>
                <p className="text-[10px] opacity-60 mt-xs">Copiloto AI</p>
              </div>
            </div>
            <div className="mt-md pt-sm border-t border-white/20 flex justify-between items-center">
              <span className="text-body-sm">4 conversaciones activas</span>
              <button className="text-[12px] font-bold underline">Ver todas</button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-xs">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function WaitRow({ name, wait, active }: { name: string; wait: string; active?: boolean }) {
  return (
    <div className="flex justify-between items-center p-sm bg-surface-container-low rounded-lg">
      <div className="flex flex-col">
        <span className="font-label-md text-on-surface">{name}</span>
        <span className="text-body-sm text-on-surface-variant">Espera: {wait}</span>
      </div>
      <button
        className={`material-symbols-outlined ${active ? "text-secondary" : "text-outline"}`}
        aria-label="Notificar"
      >
        {active ? "notifications_active" : "notifications"}
      </button>
    </div>
  );
}
