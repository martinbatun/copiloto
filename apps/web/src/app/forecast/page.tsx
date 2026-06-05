import { AppShell } from "@/components/AppShell";

export default function Page() {
  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
        <div>
          <h1 className="font-display-md text-display-md font-bold text-on-surface">
            Motor de Demanda
          </h1>
          <p className="font-body-sm text-on-surface-variant">
            Pronóstico 7 días por sucursal y daypart · MAPE actual{" "}
            <span className="text-primary font-bold">8.4%</span> · objetivo &lt;10%
          </p>
        </div>
        <div className="flex flex-wrap gap-sm items-center">
          <Chip icon="calendar_month" label="16–22 Mar 2026" />
          <Chip icon="keyboard_arrow_down" label="Roma Norte" trailing />
          <button className="border border-primary text-primary font-label-md px-md py-xs rounded-full hover:bg-primary/5 transition-colors">
            Re-entrenar modelo
          </button>
          <button className="border border-outline text-on-surface font-label-md px-md py-xs rounded-full hover:bg-surface-container-low transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <KpiCard accent="border-l-primary" label="MAPE 7d" value="8.4%" badge="objetivo <10%" badgeTone="emerald" />
        <KpiCard accent="border-l-secondary-container" label="Bias del modelo" value="+1.2%" badge="leve sobre-estimación" badgeTone="amber" />
        <KpiCard accent="border-l-tertiary" label="Confianza promedio" value="92%" trendline />
        <KpiCard accent="border-l-primary-container" label="Tickets pronosticados 7d" value="1,968" delta="+8% vs sem. pas." />
      </section>

      <section className="bg-white p-6 md:p-lg rounded-xl border border-outline-variant card-shadow relative overflow-hidden">
        <div className="flex justify-between items-center mb-md">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Pronóstico de Tickets vs Intervalo de Confianza
          </h3>
          <div className="flex gap-md items-center text-body-sm">
            <span className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-primary rounded-full" /> Predicción
            </span>
            <span className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-primary/10 rounded-full" /> Banda de confianza
            </span>
          </div>
        </div>
        <div className="h-[320px] w-full relative">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
            <path
              d="M0 200 Q 150 180, 300 220 T 600 150 T 1000 190 L 1000 250 T 600 210 T 300 280 Q 150 240, 0 260 Z"
              fill="rgba(169, 49, 7, 0.08)"
            />
            <path
              d="M0 230 Q 150 210, 300 250 T 600 180 T 1000 220"
              fill="none"
              stroke="#a93107"
              strokeLinecap="round"
              strokeWidth="3"
            />
            {[142, 285, 428, 571, 714, 857].map((x) => (
              <line key={x} stroke="#E7E5E4" strokeDasharray="4 4" x1={x} x2={x} y1={0} y2={300} />
            ))}
          </svg>
          <div className="absolute top-4 left-[10%] bg-white/90 border border-outline-variant px-xs py-1 rounded-lg shadow-sm text-[11px] font-bold">
            Lun 16: Día escolar
          </div>
          <div className="absolute top-[30%] left-[65%] bg-primary text-white px-xs py-1 rounded-lg shadow-md text-[11px] font-bold">
            Vie 20: Quincena
          </div>
          <div className="absolute bottom-[20%] right-[5%] bg-white/90 border border-outline-variant px-xs py-1 rounded-lg shadow-sm text-[11px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">cloudy_snowing</span>
            Dom 22: Lluvia
          </div>
          <div className="flex justify-between mt-xs px-2 text-[12px] font-bold text-on-surface-variant">
            {["Lun 16", "Mar 17", "Mié 18", "Jue 19", "Vie 20", "Sáb 21", "Dom 22"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-7 bg-white p-lg rounded-xl border border-outline-variant card-shadow">
          <h3 className="font-headline-sm text-headline-sm mb-md text-on-surface">
            Drivers de Demanda (Impacto %)
          </h3>
          <div className="space-y-md">
            <DriverRow label="Quincena" pct={75} delta="+15%" tone="up" />
            <DriverRow label="Promo 2x1" pct={50} delta="+10%" tone="up" />
            <DriverRow label="Evento Local" pct={40} delta="+8%" tone="up" />
            <DriverRow label="Lluvia" pct={30} delta="-6%" tone="down" />
            <DriverRow label="Día festivo" pct={25} delta="-5%" tone="down" />
          </div>
        </div>
        <div
          className="md:col-span-5 p-lg rounded-xl shadow-lg flex flex-col justify-between text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #B9532A 0%, #9A3412 100%)" }}
        >
          <div className="absolute -right-4 -top-4 opacity-20">
            <span className="material-symbols-outlined text-[120px]">auto_awesome</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-xs mb-xs">
              <span
                className="material-symbols-outlined text-secondary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
              <span className="font-label-md tracking-wider uppercase">Copiloto Insight</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm mb-sm leading-tight">
              Optimización para el Viernes 20
            </h4>
            <p className="font-body-sm opacity-90 mb-md">
              La coincidencia de quincena y el evento local &quot;Roma Fest&quot; incrementará el
              volumen de pedidos un 22% por encima del promedio.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-sm border border-white/20 relative z-10">
            <div className="flex justify-between items-center mb-xs">
              <span className="font-label-md">Acción sugerida:</span>
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-xs py-[2px] rounded uppercase">
                Alta prioridad
              </span>
            </div>
            <ul className="space-y-xs">
              <li className="flex items-center gap-xs font-body-sm">
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                Subir Staff +1 en Cocina Caliente
              </li>
              <li className="flex items-center gap-xs font-body-sm">
                <span className="material-symbols-outlined text-[16px]">restaurant</span>
                Prep de Carnes +18% (Mise en place)
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div>
        <h3 className="font-headline-sm text-headline-sm mb-md text-on-surface">
          Detalle por Daypart (Viernes 20)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <DaypartCard label="Desayuno" value={62} pct={45} color="#F59E0B" />
          <DaypartCard label="Comida" value={148} pct={100} color="#a93107" />
          <DaypartCard label="Cena" value={61} pct={50} color="#a23917" />
          <DaypartCard label="Late night" value={13} pct={15} color="#1b1b1e" />
        </div>
      </div>

      <div>
        <h3 className="font-headline-sm text-headline-sm mb-md text-on-surface">
          Planes de Acción Derivados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <OutputCard icon="groups" tint="primary" label="Staffing Sugerido" value="12 personas" hint="(Vie 20)" />
          <OutputCard icon="inventory_2" tint="secondary" label="Par Levels" value="18 SKUs" hint="ajustados" />
          <OutputCard icon="assignment" tint="tertiary" label="Prep List" value="284" hint="covers proyectados" />
        </div>
      </div>
    </AppShell>
  );
}

function Chip({ icon, label, trailing }: { icon: string; label: string; trailing?: boolean }) {
  return (
    <div className="flex items-center bg-white border border-outline-variant rounded-full px-sm py-xs gap-xs">
      {!trailing && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      <span className="font-label-md">{label}</span>
      {trailing && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
    </div>
  );
}

function KpiCard({
  accent,
  label,
  value,
  badge,
  badgeTone,
  delta,
  trendline,
}: {
  accent: string;
  label: string;
  value: string;
  badge?: string;
  badgeTone?: "emerald" | "amber";
  delta?: string;
  trendline?: boolean;
}) {
  return (
    <div className={`bg-white p-md rounded-xl border border-outline-variant card-shadow border-l-4 ${accent}`}>
      <p className="font-label-md text-on-surface-variant mb-xs">{label}</p>
      <div className="flex items-end justify-between">
        <span className="font-numeral-xl text-numeral-xl text-on-surface">{value}</span>
        {badge && (
          <span
            className={`font-label-md text-[12px] px-xs py-[2px] rounded-full ${
              badgeTone === "amber"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {badge}
          </span>
        )}
        {delta && <span className="text-emerald-600 font-label-md">{delta}</span>}
        {trendline && (
          <div className="w-16 h-8 flex items-end gap-[2px]">
            <div className="w-2 bg-primary/20 h-4 rounded-t-sm" />
            <div className="w-2 bg-primary/20 h-6 rounded-t-sm" />
            <div className="w-2 bg-primary h-8 rounded-t-sm" />
            <div className="w-2 bg-primary/60 h-7 rounded-t-sm" />
          </div>
        )}
      </div>
    </div>
  );
}

function DriverRow({ label, pct, delta, tone }: { label: string; pct: number; delta: string; tone: "up" | "down" }) {
  return (
    <div className="flex items-center gap-md">
      <span className="w-28 font-label-md text-on-surface-variant">{label}</span>
      <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${tone === "up" ? "bg-emerald-500" : "bg-error"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`w-14 font-bold text-right ${tone === "up" ? "text-emerald-600" : "text-error"}`}>
        {delta}
      </span>
    </div>
  );
}

function DaypartCard({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  const dash = Math.round((pct / 100) * 125);
  return (
    <div className="bg-white p-md rounded-xl border border-outline-variant card-shadow flex flex-col items-center">
      <div className="relative w-24 h-24 mb-xs">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="40"
            stroke="#f0edf1"
            strokeDasharray="125 251"
            strokeLinecap="round"
            strokeWidth="8"
            transform="rotate(135 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            fill="none"
            r="40"
            stroke={color}
            strokeDasharray={`${dash} 251`}
            strokeLinecap="round"
            strokeWidth="8"
            transform="rotate(135 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="font-numeral-xl text-headline-lg">{value}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Tix</span>
        </div>
      </div>
      <span className="font-label-md">{label}</span>
    </div>
  );
}

function OutputCard({
  icon,
  tint,
  label,
  value,
  hint,
}: {
  icon: string;
  tint: "primary" | "secondary" | "tertiary";
  label: string;
  value: string;
  hint: string;
}) {
  const tintMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary-container/10 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
  };
  return (
    <div className="bg-white p-md rounded-xl border border-outline-variant card-shadow flex items-center gap-md">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tintMap[tint]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="font-label-md text-on-surface-variant">{label}</p>
        <p className="font-headline-sm text-headline-sm">
          {value} <span className="text-body-sm font-normal text-on-surface-variant">{hint}</span>
        </p>
      </div>
    </div>
  );
}
