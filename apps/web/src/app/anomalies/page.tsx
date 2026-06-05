import { AppShell } from "@/components/AppShell";

export default function Page() {
  return (
    <AppShell>
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Anomalías y recomendaciones
          </h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            Acciones inteligentes basadas en la operación en tiempo real.
          </p>
        </div>
        <button className="bg-white border border-outline-variant px-md py-sm rounded-lg flex items-center gap-xs text-on-surface-variant hover:bg-surface-container-low transition-all w-fit">
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          Hoy, 24 Oct
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <KpiCard
          label="Anomalías hoy"
          value="12"
          accent="bg-error"
          icon="warning"
          iconBg="bg-error-container"
          iconColor="text-error"
          hint="+4 vs promedio diario"
          hintIcon="trending_up"
          hintColor="text-error"
        />
        <KpiCard
          label="ROI mes proyectado"
          value="$18,420"
          accent="bg-secondary-container"
          icon="attach_money"
          iconBg="bg-secondary-fixed"
          iconColor="text-on-secondary-container"
          hint="18 recomendaciones aplicadas"
          hintIcon="verified"
          hintColor="text-on-secondary-fixed-variant"
        />
      </section>

      <section>
        <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-sm text-on-surface">
          Recomendaciones prioritarias
          <span className="bg-primary-container text-white text-[12px] px-2 py-0.5 rounded-full">
            IA activa
          </span>
        </h3>
        <div className="flex flex-col gap-sm">
          <RecCard
            border="border-secondary-container"
            icon="bolt"
            iconBg="bg-secondary-fixed"
            iconColor="text-on-secondary-container"
            iconFilled
            tagLabel="Alta prioridad"
            tagClass="bg-secondary-fixed text-on-secondary-fixed-variant"
            meta="Vence en 2h"
            title="Promo flash: agua de tomate cortesía"
            body="Exceso de inventario de tomate cherry detectado. Incrementa lealtad en mesas de +4 personas."
            right={
              <div className="text-right shrink-0">
                <div className="text-secondary font-bold text-headline-sm">+$2,840</div>
                <div className="text-on-surface-variant text-[12px]">ROI estimado</div>
              </div>
            }
          />
          <RecCard
            border="border-error"
            icon="report"
            iconBg="bg-error-container"
            iconColor="text-error"
            tagLabel="Anomalía"
            tagClass="bg-error-container text-on-error-container"
            title="Spike de voids en mesa 4 — José Núñez"
            body="3 cancelaciones consecutivas en los últimos 15 min. Posible problema en cocina o error de sistema."
            right={
              <button className="bg-primary text-white px-md py-sm rounded-lg font-bold text-body-sm hover:bg-primary-container transition-all">
                Intervenir
              </button>
            }
          />
          <RecCard
            border="border-primary"
            icon="person_alert"
            iconBg="bg-primary-fixed"
            iconColor="text-primary"
            tagLabel="Oportunidad"
            tagClass="bg-primary-fixed text-on-primary-fixed-variant"
            title="184 huéspedes en riesgo de churn"
            body="Clientes frecuentes sin visita en >21 días. Se sugiere campaña de re-engagement."
            right={
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary">
                  AC
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-secondary">
                  MR
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                  +182
                </div>
              </div>
            }
          />
          <RecCard
            border="border-outline"
            icon="check_circle"
            iconBg="bg-surface-container-highest"
            iconColor="text-outline"
            tagLabel="Ejecutada"
            tagClass="bg-outline text-white"
            meta="Hace 3 horas"
            title="Subir par level aguacate"
            body="Ajustado a 45kg/día basado en pronóstico de fin de semana largo."
            muted
            right={
              <div className="text-outline">
                <span className="material-symbols-outlined">verified</span>
              </div>
            }
          />
        </div>
      </section>

      <section className="bg-white p-lg rounded-xl border border-outline-variant card-shadow">
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center mb-lg">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Action Ledger</h3>
            <p className="text-on-surface-variant text-body-sm">
              Seguimiento de impactos financieros últimos 30 días.
            </p>
          </div>
          <div className="flex gap-base">
            <button className="px-md py-base font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">
              Impacto ($)
            </button>
            <button className="px-md py-base font-label-md bg-primary-container text-white rounded-lg">
              Frecuencia
            </button>
          </div>
        </div>
        <div className="h-64 flex items-end justify-between gap-1 pt-md">
          {[40, 55, 85, 60, 45, 30, 95, 70, 50, 100, 65, 40, 55, 35].map((h, i) => {
            const tone =
              i === 2
                ? "bg-primary"
                : i === 6
                ? "bg-secondary-container"
                : i === 9
                ? "bg-primary-container"
                : "bg-surface-container";
            return (
              <div
                key={i}
                className={`flex-1 ${tone} rounded-t-sm transition-all hover:bg-primary-container`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-sm border-t border-outline-variant pt-base text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
          <span>Semana 1</span>
          <span>Semana 2</span>
          <span>Semana 3</span>
          <span>Semana 4</span>
        </div>
      </section>
    </AppShell>
  );
}

function KpiCard({
  label,
  value,
  accent,
  icon,
  iconBg,
  iconColor,
  hint,
  hintIcon,
  hintColor,
}: {
  label: string;
  value: string;
  accent: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  hint: string;
  hintIcon: string;
  hintColor: string;
}) {
  return (
    <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant relative overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-1 ${accent}`} />
      <div className="flex justify-between items-start">
        <div>
          <p className="font-label-md text-on-surface-variant uppercase tracking-wider">{label}</p>
          <h2 className="font-numeral-xl text-numeral-xl text-on-surface mt-xs">{value}</h2>
        </div>
        <div className={`p-sm rounded-lg ${iconBg} ${iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <p className={`font-label-md mt-sm flex items-center gap-xs ${hintColor}`}>
        <span className="material-symbols-outlined text-[16px]">{hintIcon}</span>
        {hint}
      </p>
    </div>
  );
}

function RecCard({
  border,
  icon,
  iconBg,
  iconColor,
  iconFilled,
  tagLabel,
  tagClass,
  meta,
  title,
  body,
  right,
  muted,
}: {
  border: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  iconFilled?: boolean;
  tagLabel: string;
  tagClass: string;
  meta?: string;
  title: string;
  body: string;
  right?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={`${
        muted ? "bg-surface-container-low opacity-80" : "bg-white"
      } border-l-4 ${border} p-md rounded-xl card-shadow flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:translate-x-1 transition-transform`}
    >
      <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        <span
          className={`material-symbols-outlined ${iconColor}`}
          style={iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-xs mb-xs flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${tagClass}`}>
            {tagLabel}
          </span>
          {meta && <span className="text-on-surface-variant font-label-md">• {meta}</span>}
        </div>
        <h4 className={`font-headline-sm text-[17px] ${muted ? "text-outline" : "text-on-surface"}`}>
          {title}
        </h4>
        <p className="text-on-surface-variant text-body-sm">{body}</p>
      </div>
      {right}
    </div>
  );
}
