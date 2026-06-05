import { AppShell } from "@/components/AppShell";

export default function Page() {
  return (
    <AppShell>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div className="space-y-xs">
          <p className="flex items-center text-on-surface-variant font-label-md text-sm">
            <span>Estrategia</span>
            <span className="material-symbols-outlined text-[14px] mx-1">chevron_right</span>
            <span className="text-on-surface">Simulador</span>
          </p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Simulador de escenarios
          </h1>
          <div className="flex items-center gap-sm flex-wrap">
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 pr-10 font-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                defaultValue="opt"
              >
                <option value="opt">Optimización de menú Q3</option>
                <option value="prov">Cambio de proveedor (carne)</option>
                <option value="infl">Ajuste inflacionario 2024</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                expand_more
              </span>
            </div>
            <button className="flex items-center gap-xs px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors font-label-md text-on-surface">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nuevo escenario
            </button>
          </div>
        </div>
        <button className="bg-primary hover:bg-primary-container text-white font-label-md px-6 py-3 rounded-lg shadow-sm transition-all flex items-center gap-xs w-fit">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Guardar escenario
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Parameters */}
        <div className="lg:col-span-5 space-y-gutter">
          <ParamPanel
            icon="restaurant_menu"
            iconColor="text-secondary"
            accent="border-l-secondary-container"
            title="Menú & pricing"
            controls={
              <>
                <Slider label="Incremento de precios (%)" value="+4.5%" tone="primary" />
                <Slider label="Cambio en mix de ventas" value="Agresivo" tone="default" />
              </>
            }
          />
          <ParamPanel
            icon="local_shipping"
            iconColor="text-primary"
            accent="border-l-primary"
            title="Supply chain"
            controls={
              <>
                <Slider label="Variación costo insumos (%)" value="+2.0%" tone="error" />
                <Slider label="Ahorro por nuevo proveedor" value="-$1.2k" tone="secondary" />
              </>
            }
          />
          <ParamPanel
            icon="engineering"
            iconColor="text-tertiary"
            accent="border-l-tertiary"
            title="Labor & ops"
            controls={
              <>
                <Slider label="Ajuste de plantilla (horas)" value="-12h" tone="default" />
                <Slider label="Eficiencia operativa" value="+8% optimización" tone="secondary" />
              </>
            }
          />
        </div>

        {/* Impact visualization */}
        <div className="lg:col-span-7 space-y-gutter">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
            <StatBox label="Impacto margen" value="+2.4%" tone="primary" hint="vs actual" hintIcon="trending_up" />
            <StatBox label="Punto de equilibrio" value="1,450" tone="default" hint="platos / mes" />
            <StatBox label="Proyección mensual" value="$42.8k" tone="secondary" hint="utilidad bruta" />
          </div>

          <div className="bg-white rounded-xl p-md border border-outline-variant card-shadow min-h-[420px] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-lg">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Tendencia proyectada (6 meses)
                </h3>
                <p className="font-body-sm text-on-surface-variant">Comparativa real vs simulado</p>
              </div>
              <div className="flex gap-md">
                <span className="flex items-center gap-1 text-xs font-label-md text-on-surface-variant">
                  <span className="w-3 h-3 rounded-full bg-outline-variant" /> Actual
                </span>
                <span className="flex items-center gap-1 text-xs font-label-md text-on-surface">
                  <span className="w-3 h-3 rounded-full bg-primary" /> Simulado
                </span>
              </div>
            </div>
            <div className="flex-1 relative mt-4">
              <svg
                className="w-full h-full min-h-[260px]"
                preserveAspectRatio="none"
                viewBox="0 0 800 250"
              >
                {[50, 100, 150, 200].map((y) => (
                  <line key={y} stroke="#e4e1e6" strokeDasharray="4" x1={0} x2={800} y1={y} y2={y} />
                ))}
                <polyline
                  fill="none"
                  points="0,180 133,175 266,182 399,178 532,185 665,180 800,183"
                  stroke="#c9c4cd"
                  strokeWidth="3"
                />
                <polyline
                  fill="none"
                  points="0,180 133,160 266,145 399,120 532,105 665,95 800,85"
                  stroke="#a93107"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
                <path
                  d="M0,180 133,160 266,145 399,120 532,105 665,95 800,85 L800,250 L0,250 Z"
                  fill="#a93107"
                  opacity="0.08"
                />
              </svg>
              <div className="flex justify-between px-2 mt-2 font-label-md text-on-surface-variant text-xs">
                <span>Mes 1</span>
                <span>Mes 2</span>
                <span>Mes 3</span>
                <span>Mes 4</span>
                <span>Mes 5</span>
                <span>Mes 6</span>
              </div>
            </div>
            <div className="mt-md pt-md border-t border-outline-variant/30 grid grid-cols-2 gap-md">
              <div>
                <span className="font-label-md text-on-surface-variant block">
                  Facturación estimada
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">$1.2M MXN</span>
              </div>
              <div>
                <span className="font-label-md text-on-surface-variant block">
                  Retorno sobre inversión
                </span>
                <span className="font-headline-sm text-headline-sm text-secondary">18.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="glass-card rounded-2xl p-lg flex flex-col md:flex-row gap-lg items-start md:items-center relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary-container/10 blur-[80px] rounded-full" />
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #B9532A 0%, #9A3412 100%)" }}
        >
          <span
            className="material-symbols-outlined text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            psychology
          </span>
        </div>
        <div className="flex-1 space-y-xs">
          <h4 className="font-headline-sm text-headline-sm text-tertiary">
            Copiloto AI · Análisis de simulación
          </h4>
          <p className="font-body-md text-on-surface leading-relaxed">
            <span className="font-bold text-primary">Sugerencia estratégica:</span> Un incremento
            del <span className="underline decoration-secondary decoration-2">4% en el precio de las bebidas</span>{" "}
            compensaría el alza del costo del aguacate proyectada sin afectar el volumen de ventas,
            manteniendo un margen saludable del 22%. Los datos sugieren que la elasticidad del
            precio en coctelería es baja los fines de semana.
          </p>
          <div className="flex flex-wrap gap-sm mt-md">
            <button className="bg-surface-container-highest/60 hover:bg-surface-container-highest px-4 py-2 rounded-full font-label-md text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              Aplicar recomendación
            </button>
            <button className="bg-surface-container-highest/60 hover:bg-surface-container-highest px-4 py-2 rounded-full font-label-md text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">share</span>
              Exportar reporte
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function ParamPanel({
  icon,
  iconColor,
  accent,
  title,
  controls,
}: {
  icon: string;
  iconColor: string;
  accent: string;
  title: string;
  controls: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white border border-outline-variant rounded-xl p-md card-shadow border-l-4 ${accent}`}
    >
      <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-xs text-on-surface">
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
        {title}
      </h3>
      <div className="space-y-lg">{controls}</div>
    </div>
  );
}

function Slider({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "secondary" | "error" | "default";
}) {
  const color =
    tone === "primary"
      ? "text-primary"
      : tone === "secondary"
      ? "text-secondary"
      : tone === "error"
      ? "text-error"
      : "text-on-surface";
  return (
    <div className="space-y-xs">
      <div className="flex justify-between items-center">
        <label className="font-label-md text-on-surface-variant">{label}</label>
        <span className={`font-numeral-xl text-headline-sm ${color}`}>{value}</span>
      </div>
      <input type="range" defaultValue={50} className="w-full accent-primary" />
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
  hint,
  hintIcon,
}: {
  label: string;
  value: string;
  tone: "primary" | "secondary" | "default";
  hint: string;
  hintIcon?: string;
}) {
  const color =
    tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-on-surface";
  const hintColor =
    tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-on-surface-variant";
  return (
    <div className="bg-white p-md rounded-xl border border-outline-variant card-shadow flex flex-col items-center justify-center text-center">
      <span className="font-label-md text-on-surface-variant">{label}</span>
      <span className={`font-numeral-xl text-numeral-xl mt-1 ${color}`}>{value}</span>
      <div className={`mt-2 text-[12px] flex items-center gap-1 ${hintColor}`}>
        {hintIcon && <span className="material-symbols-outlined text-[14px]">{hintIcon}</span>}
        {hint}
      </div>
    </div>
  );
}
