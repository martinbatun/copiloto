import { AppShell } from "@/components/AppShell";

export default function Page() {
  return (
    <AppShell>
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Tablero ejecutivo</h1>
        <p className="text-on-surface-variant font-body-md">Q1 2026 · 3 sucursales</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Promesa de Copiloto */}
        <section className="lg:col-span-8 bg-white border border-outline-variant rounded-xl p-lg card-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg">
            <div className="flex-1">
              <div className="flex items-center gap-xs text-primary mb-xs">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="font-label-md uppercase tracking-wider">Impacto real</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-md">
                La promesa de Copiloto
              </h2>
              <div className="flex items-baseline gap-xs text-primary">
                <span className="font-numeral-xl text-numeral-xl">+6.4</span>
                <span className="font-headline-sm text-headline-sm">puntos de mejora</span>
              </div>
              <p className="text-on-surface-variant font-body-md mt-xs">
                Incremento directo en margen operativo consolidado este trimestre.
              </p>
            </div>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" fill="transparent" r="80" stroke="#f0edf1" strokeWidth="16" />
                <circle
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke="#a93107"
                  strokeDasharray="502.6"
                  strokeDashoffset="311.6"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <circle
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke="#f59e0b"
                  strokeDasharray="502.6"
                  strokeDashoffset="460"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline-sm text-headline-sm text-on-surface">Margen</span>
                <span className="font-body-sm text-on-surface-variant">Desglose</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md mt-lg border-t border-outline-variant pt-lg">
            <Mini label="Staffing" value="38%" color="text-primary" />
            <Mini label="Merma" value="24%" color="text-secondary" />
            <Mini label="Supply Chain" value="22%" color="text-on-surface" />
            <Mini label="Otros" value="16%" color="text-on-surface" />
          </div>
        </section>

        <section className="lg:col-span-4 bg-white border border-outline-variant rounded-xl p-lg card-shadow">
          <h3 className="font-headline-sm text-headline-sm mb-lg text-on-surface">ROI por sucursal</h3>
          <div className="space-y-md">
            <RoiRow name="Roma Norte" mult="4.2x" direct={70} indirect={20} />
            <RoiRow name="Polanco" mult="3.8x" direct={65} indirect={15} />
            <RoiRow name="Condesa" mult="3.1x" direct={50} indirect={25} />
          </div>
          <div className="mt-lg flex gap-md">
            <span className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-xs font-label-md text-on-surface-variant">Directo</span>
            </span>
            <span className="flex items-center gap-xs">
              <span className="w-3 h-3 bg-secondary rounded-full" />
              <span className="text-xs font-label-md text-on-surface-variant">Indirecto</span>
            </span>
          </div>
        </section>

        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <KpiCard
            label="Margen operativo"
            value="37.2%"
            accent="border-l-primary"
            deltaIcon="trending_up"
            delta="+2.4% vs last mo"
            deltaTone="primary"
          />
          <KpiCard
            label="Food cost"
            value="28.4%"
            accent="border-l-secondary"
            deltaIcon="trending_up"
            delta="+0.8% vs target"
            deltaTone="error"
          />
          <KpiCard
            label="Labor cost"
            value="22.1%"
            accent="border-l-on-surface"
            deltaIcon="trending_down"
            delta="-1.2% vs target"
            deltaTone="primary"
          />
        </section>

        <section className="lg:col-span-4 bg-surface-container-low border border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center">
          <h3 className="font-label-md text-on-surface-variant mb-md uppercase tracking-widest">
            Motor de demanda
          </h3>
          <div className="relative w-48 h-28 overflow-hidden mb-md">
            <svg viewBox="0 0 200 110" className="w-full">
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#e4e1e6"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 20 100 A 80 80 0 0 1 150 35"
                fill="none"
                stroke="#a93107"
                strokeWidth="16"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <span className="font-numeral-xl text-numeral-xl text-primary leading-none">8.4%</span>
              <span className="font-label-md text-on-surface-variant">MAPE</span>
            </div>
          </div>
          <p className="text-center font-body-sm text-on-surface-variant">
            Precisión excepcional. Tu &quot;error medio absoluto&quot; es 12% mejor que el promedio
            de la industria.
          </p>
        </section>

        <section
          className="lg:col-span-8 text-white rounded-xl p-lg shadow-lg relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #B9532A 0%, #9A3412 100%)" }}
        >
          <div className="flex items-center gap-md mb-lg">
            <div className="bg-white/20 p-xs rounded-lg backdrop-blur-sm">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm">Narrativa del Co-piloto AI</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="space-y-md">
              <NarrativeCard
                icon="lightbulb"
                title="Oportunidad en merma"
                body="Roma Norte presenta un pico de merma en proteínas los martes. Copiloto sugiere ajustar el pedido de los lunes un -15% para alinear con la demanda proyectada."
              />
              <NarrativeCard
                icon="auto_graph"
                title="Eficiencia laboral"
                body="El nuevo esquema de turnos en Polanco ha reducido las horas extra en un 22% sin afectar los tiempos de servicio promedio."
              />
            </div>
            <div className="flex items-center justify-center p-md bg-white/5 rounded-2xl border border-white/10">
              <div className="text-center">
                <p className="font-label-md text-white/70 mb-sm">Consolidado del trimestre</p>
                <div className="text-[64px] font-black leading-none text-secondary-container">A+</div>
                <p className="font-body-md mt-sm text-white">Desempeño operativo top 5%</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Mini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="font-body-sm text-on-surface-variant">{label}</p>
      <p className={`font-headline-sm text-headline-sm ${color}`}>{value}</p>
    </div>
  );
}

function RoiRow({
  name,
  mult,
  direct,
  indirect,
}: {
  name: string;
  mult: string;
  direct: number;
  indirect: number;
}) {
  return (
    <div className="space-y-xs">
      <div className="flex justify-between font-label-md">
        <span className="text-on-surface">{name}</span>
        <span className="text-primary">{mult}</span>
      </div>
      <div className="w-full h-4 bg-surface-container rounded-full overflow-hidden flex">
        <div className="h-full bg-primary" style={{ width: `${direct}%` }} />
        <div className="h-full bg-secondary" style={{ width: `${indirect}%` }} />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
  deltaIcon,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  accent: string;
  deltaIcon: string;
  delta: string;
  deltaTone: "primary" | "error";
}) {
  const color = deltaTone === "primary" ? "text-primary" : "text-error";
  return (
    <div className={`bg-white p-md rounded-xl card-shadow border border-outline-variant border-l-4 ${accent}`}>
      <span className="font-label-md text-on-surface-variant">{label}</span>
      <p className="font-numeral-xl text-numeral-xl text-on-surface mt-xs">{value}</p>
      <div className={`flex items-center gap-xs ${color} mt-1`}>
        <span className="material-symbols-outlined text-[16px]">{deltaIcon}</span>
        <span className="font-body-sm">{delta}</span>
      </div>
    </div>
  );
}

function NarrativeCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="bg-white/10 p-md rounded-xl border border-white/20 hover:bg-white/15 transition-all">
      <h4 className="font-label-md mb-xs flex items-center gap-xs">
        <span className="material-symbols-outlined text-secondary-container">{icon}</span>
        {title}
      </h4>
      <p className="text-body-sm text-white/90">{body}</p>
    </div>
  );
}
