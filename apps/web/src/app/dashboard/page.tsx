import { AppShell } from "@/components/AppShell";

export default function Page() {
  return (
    <AppShell>
      {/* 1. HERO */}
      <section className="bg-white rounded-[20px] p-6 md:p-9 card-shadow flex flex-col lg:flex-row justify-between gap-lg border border-outline-variant copiloto-gradient">
        <div className="flex-1 flex flex-col justify-center gap-6">
          <div>
            <h1 className="font-display-md text-[30px] font-bold text-on-surface mb-2">
              Buenos días, Monica
            </h1>
            <p className="font-body-md text-on-surface-variant">
              Hoy es miércoles. Pronóstico de{" "}
              <span className="font-bold text-on-surface">284 tickets</span> — 12%
              arriba del promedio.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Chip icon="local_fire_department" tone="primary" label="12 órdenes en cocina" />
            <Chip icon="auto_awesome" tone="primary" label="3 recomendaciones" />
            <Chip icon="warning" tone="secondary" label="2 anomalías" />
            <Chip icon="calendar_month" tone="info" label="8 reservas confirmadas" />
          </div>
        </div>
        <div className="w-full lg:w-[320px] bg-surface-container-lowest p-6 rounded-xl border border-outline-variant card-shadow">
          <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4">
            Pulso del turno
          </h3>
          <div className="flex flex-col gap-4">
            <PulseRow label="Margen vs meta" value="37.2% / 35%" tone="ok" />
            <PulseRow label="Food cost" value="28.4%" tone="warn" />
            <PulseRow label="Labor %" value="22.1%" tone="ok" />
          </div>
        </div>
      </section>

      {/* 2. KPI CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <KpiCard label="Ventas del día" value="$48,720" suffix="MXN" delta="+9% vs forecast" />
        <KpiCard label="Ticket promedio" value="$284" trendline />
        <KpiCard label="Food cost del turno" value="28.4%" donut />
        <KpiCard label="Labor % proyectado" value="22.1%" footer="8 staff en piso" />
      </section>

      {/* 3. CO-PILOTO INSIGHTS */}
      <section className="bg-white rounded-[20px] border border-primary/20 ai-insight-bg card-shadow overflow-hidden">
        <div className="p-6 border-b border-primary/10 flex items-center gap-3">
          <span
            className="material-symbols-outlined"
            style={{ color: "#F59E0B", fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <h2 className="font-display-md text-[18px] font-bold text-on-surface">
            Tu co-piloto tiene 3 acciones para ti
          </h2>
        </div>
        <div className="flex flex-col">
          <InsightRow
            border="primary"
            title="Sube par level de aguacate a 18kg"
            chip="+ $480 MXN evitados"
            description="Se proyecta un pico de consumo por el evento corporativo en mesa 4-8."
            ctas={[
              { label: "Aprobar", variant: "primary" },
              { label: "Modificar", variant: "ghost" },
            ]}
          />
          <InsightRow
            border="secondary"
            title="Cierra el plato del día: ya saliste con 78 órdenes (cap 80)"
            description="Evita tiempos de espera prolongados desactivándolo en el menú digital ahora."
            ctas={[
              { label: "Cerrar plato", variant: "secondary" },
              { label: "Posponer", variant: "ghost" },
            ]}
          />
          <InsightRow
            border="info"
            title="Llama a Lucia Robles — VIP hoy en mesa 12"
            description="Cumpleaños detectado. Inicia protocolo de bienvenida premium."
            ctas={[
              { label: "WhatsApp", variant: "ok", icon: "chat" },
              { label: "Marcar visto", variant: "ghost" },
            ]}
          />
        </div>
      </section>

      {/* 4. DOUBLE COLUMN 60/40 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Forecast vs Real */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[20px] border border-outline-variant card-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display-md text-[18px] font-bold text-on-surface">
              Pronóstico vs Real
            </h3>
            <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-[2px] bg-primary inline-block" /> Forecast
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Real
              </div>
            </div>
          </div>
          <div className="relative h-[260px] w-full">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <line stroke="#F0EDF1" strokeWidth="0.5" x1="0" x2="100" y1="20" y2="20" />
              <line stroke="#F0EDF1" strokeWidth="0.5" x1="0" x2="100" y1="50" y2="50" />
              <line stroke="#F0EDF1" strokeWidth="0.5" x1="0" x2="100" y1="80" y2="80" />
              <path
                d="M0 90 L10 85 L20 88 L30 40 L40 50 L50 75 L60 85 L70 30 L80 40 L90 85 L100 80 V 100 H 0 Z"
                fill="rgba(16, 185, 129, 0.05)"
              />
              <path
                d="M0 90 L10 85 L20 88 L30 40 L40 50 L50 75 L60 85 L70 30 L80 40 L90 85 L100 80"
                fill="none"
                stroke="#10b981"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M0 88 L10 82 L20 85 L30 35 L40 45 L50 70 L60 80 L70 25 L80 35 L90 80 L100 75"
                fill="none"
                stroke="#D9532A"
                strokeDasharray="4,2"
                strokeWidth="1.5"
              />
            </svg>
            <div className="flex justify-between mt-4 text-xs font-bold text-on-surface-variant/60 uppercase">
              <span>12:00</span>
              <span>13:00</span>
              <span>14:00</span>
              <span>15:00</span>
              <span>16:00</span>
              <span>17:00</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[20px] border border-outline-variant card-shadow">
          <h3 className="font-display-md text-[18px] font-bold mb-8 text-on-surface">
            Agenda del turno
          </h3>
          <ol className="relative flex flex-col gap-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
            <TimelineItem
              icon="login"
              time="10:30 AM"
              label="Apertura y Checklist"
              bg="bg-emerald-100"
              fg="text-emerald-600"
            />
            <TimelineItem
              icon="book_online"
              time="12:00 PM"
              label="Primer bloque de Reservas (14 pax)"
              bg="bg-blue-100"
              fg="text-blue-600"
            />
            <TimelineItem
              icon="trending_up"
              time="13:30 PM"
              label="Pico de Demanda Proyectado"
              bg="bg-primary-fixed"
              fg="text-primary"
            />
            <TimelineItem
              icon="coffee"
              time="15:30 PM"
              label="Break de Staff - Rotación B"
              bg="bg-surface-variant"
              fg="text-on-surface-variant"
              muted
            />
            <TimelineItem
              icon="inventory"
              time="17:00 PM"
              label="Reposición de Insumos Críticos"
              bg="bg-surface-variant"
              fg="text-on-surface-variant"
              muted
            />
            <TimelineItem
              icon="assignment"
              time="18:00 PM"
              label="Scorecard y Cierre de Turno"
              bg="bg-surface-variant"
              fg="text-on-surface-variant"
              muted
            />
          </ol>
        </div>
      </section>
    </AppShell>
  );
}

/* -------- Sub-componentes internos del dashboard -------- */

function Chip({
  icon,
  label,
  tone,
}: {
  icon: string;
  label: string;
  tone: "primary" | "secondary" | "info";
}) {
  const color =
    tone === "primary"
      ? "text-primary"
      : tone === "secondary"
      ? "text-secondary"
      : "text-blue-500";
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant rounded-full card-shadow">
      <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
      <span className="text-sm font-semibold text-on-surface">{label}</span>
    </div>
  );
}

function PulseRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "bad";
}) {
  const dot =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-on-surface">{value}</span>
        <span className={`w-2 h-2 rounded-full ${dot}`} />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  suffix,
  delta,
  trendline,
  donut,
  footer,
}: {
  label: string;
  value: string;
  suffix?: string;
  delta?: string;
  trendline?: boolean;
  donut?: boolean;
  footer?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-outline-variant card-shadow flex flex-col gap-2 relative overflow-hidden">
      <span className="text-on-surface-variant font-label-md">{label}</span>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display-md text-[28px] font-extrabold text-on-surface">
          {value}
        </span>
        {suffix && <span className="text-xs font-bold text-on-surface-variant">{suffix}</span>}
        {donut && (
          <div className="w-12 h-12 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E7E5E4"
                strokeWidth="4"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#D9532A"
                strokeDasharray="28, 100"
                strokeWidth="4"
              />
            </svg>
          </div>
        )}
      </div>
      {delta && (
        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold w-fit">
          <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
          {delta}
        </span>
      )}
      {trendline && (
        <div className="absolute bottom-4 right-4 h-8 w-24">
          <svg
            className="w-full h-full text-primary opacity-30"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 100 40"
          >
            <path d="M0 35 L10 32 L25 38 L40 15 L60 25 L80 5 L100 12" strokeLinecap="round" />
          </svg>
        </div>
      )}
      {footer && (
        <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">groups</span>
          {footer}
        </span>
      )}
    </div>
  );
}

function InsightRow({
  border,
  title,
  chip,
  description,
  ctas,
}: {
  border: "primary" | "secondary" | "info";
  title: string;
  chip?: string;
  description: string;
  ctas: { label: string; variant: "primary" | "secondary" | "ok" | "ghost"; icon?: string }[];
}) {
  const borderColor =
    border === "primary"
      ? "border-primary"
      : border === "secondary"
      ? "border-secondary"
      : "border-blue-500";

  return (
    <div
      className={`p-5 border-l-[4px] ${borderColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/50 last:border-b-0`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-on-surface">{title}</span>
          {chip && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
              {chip}
            </span>
          )}
        </div>
        <p className="text-sm text-on-surface-variant">{description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {ctas.map((cta, i) => (
          <button
            key={i}
            type="button"
            className={
              cta.variant === "primary"
                ? "px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm hover:brightness-110 transition-all"
                : cta.variant === "secondary"
                ? "px-4 py-2 bg-secondary text-white rounded-lg text-sm font-bold shadow-sm hover:brightness-110 transition-all"
                : cta.variant === "ok"
                ? "px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:brightness-110 transition-all flex items-center gap-2"
                : "px-4 py-2 bg-white border border-outline-variant text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-all"
            }
          >
            {cta.icon && <span className="material-symbols-outlined text-[16px]">{cta.icon}</span>}
            {cta.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimelineItem({
  icon,
  time,
  label,
  bg,
  fg,
  muted,
}: {
  icon: string;
  time: string;
  label: string;
  bg: string;
  fg: string;
  muted?: boolean;
}) {
  return (
    <li className={`relative pl-10 ${muted ? "opacity-50" : ""}`}>
      <div
        className={`absolute left-0 top-1 w-6 h-6 rounded-full ${bg} flex items-center justify-center border-2 border-white z-10`}
      >
        <span className={`material-symbols-outlined text-[14px] ${fg}`}>{icon}</span>
      </div>
      <div>
        <span className="block text-xs font-bold text-on-surface-variant uppercase">{time}</span>
        <span className="font-bold text-sm text-on-surface">{label}</span>
      </div>
    </li>
  );
}
