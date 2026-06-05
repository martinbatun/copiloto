import { AppShell } from "@/components/AppShell";

export default function Page() {
  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <h1 className="font-display-md text-display-md text-on-surface">
            Campañas de WhatsApp
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            Automatiza la comunicación con tus clientes para aumentar la frecuencia de visita sin
            saturar el canal.
          </p>
        </div>
        <button className="bg-primary text-white px-md py-sm rounded-xl font-label-md flex items-center gap-xs shadow-md hover:bg-primary-container transition-all w-fit">
          <span className="material-symbols-outlined text-[18px]">add</span> Nueva campaña
        </button>
      </header>

      <section className="bg-white rounded-2xl border border-outline-variant p-lg card-shadow flex flex-col md:flex-row gap-lg items-start md:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-sm mb-xs">
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Channel guardrails</h2>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Protección activa para evitar el spam y bloqueos de Meta.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-md w-full md:w-auto">
          <GuardCard label="Límite mensual" value="2,480" suffix="/5k" pct={49} />
          <GuardCard label="Cooldown" value="7" suffix="días" hint="Entre envíos por usuario" />
          <GuardCard
            label="Tasa de reporte"
            value="0.2%"
            tone="secondary"
            hint="Umbral seguro (<1%)"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col gap-md">
          <h3 className="font-headline-sm text-headline-sm px-base text-on-surface">
            Campañas activas
          </h3>

          <div className="bg-white rounded-2xl border-l-4 border-l-primary border border-outline-variant p-md card-shadow">
            <div className="flex flex-col md:flex-row gap-md">
              <div className="w-full md:w-[200px] h-[280px] bg-surface-container-low rounded-xl overflow-hidden relative border border-outline-variant/50 shrink-0">
                <div className="absolute top-0 left-0 w-full bg-[#E7FFDB] p-xs text-[10px] font-bold text-center border-b border-outline-variant/20 uppercase tracking-widest text-[#128C7E]">
                  Preview WhatsApp
                </div>
                <div className="p-sm pt-8 space-y-sm">
                  <div className="bg-white p-xs rounded-lg shadow-sm text-[11px] border border-outline-variant">
                    <p className="font-bold text-primary mb-1">¡Felicidades Mónica!</p>
                    <p className="text-on-surface-variant mb-2 leading-tight">
                      Queremos celebrar contigo. Te regalamos una bebida de cortesía en tu próxima
                      visita…
                    </p>
                    <div className="mt-xs pt-xs border-t border-outline-variant text-center text-blue-500 font-bold">
                      Canjear regalo
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div
                      className="p-xs rounded-lg shadow-sm text-[11px] w-2/3"
                      style={{ backgroundColor: "#DCF8C6" }}
                    >
                      <p>¡Muchas gracias! Estaré ahí hoy.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-sm">
                  <div>
                    <span className="inline-block px-sm py-1 rounded-full bg-primary-container/20 text-primary font-label-md text-[10px] uppercase mb-1">
                      En curso
                    </span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">
                      Cumpleañeros · 18 Mar
                    </h4>
                  </div>
                  <button className="material-symbols-outlined text-on-surface-variant">
                    more_vert
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-md mt-base mb-auto">
                  <div className="p-sm bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <p className="font-label-md text-on-surface-variant">Apertura</p>
                    <p className="font-numeral-xl text-[28px] text-on-surface">94.2%</p>
                  </div>
                  <div className="p-sm bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <p className="font-label-md text-on-surface-variant">Conversión</p>
                    <p className="font-numeral-xl text-[28px] text-primary">12.5%</p>
                  </div>
                </div>
                <div className="mt-md pt-md border-t border-outline-variant flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest border-2 border-white flex items-center justify-center font-bold text-[10px] text-on-surface-variant">
                      ML
                    </div>
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed border-2 border-white flex items-center justify-center font-bold text-[10px] text-secondary">
                      JD
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary-fixed border-2 border-white flex items-center justify-center font-bold text-[10px] text-primary">
                      +42
                    </div>
                  </div>
                  <button className="text-primary font-label-md hover:underline">
                    Ver analíticas
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-l-4 border-l-secondary border border-outline-variant p-md card-shadow">
            <div className="flex flex-col md:flex-row justify-between gap-3 mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    history
                  </span>
                </div>
                <div>
                  <span className="inline-block px-sm py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-md text-[10px] uppercase mb-1">
                    Pendiente de aprobación
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">
                    Recover churn — 60d sin visita
                  </h4>
                </div>
              </div>
              <div className="flex gap-sm">
                <button className="bg-surface-container-high px-md py-sm rounded-xl font-label-md text-on-surface">
                  Editar
                </button>
                <button className="bg-secondary text-white px-md py-sm rounded-xl font-label-md shadow-sm">
                  Activar
                </button>
              </div>
            </div>
            <div className="bg-surface-container-low p-md rounded-xl flex items-center gap-md">
              <span className="material-symbols-outlined text-on-surface-variant">auto_awesome</span>
              <p className="font-body-sm text-on-surface-variant flex-1">
                <strong className="text-on-surface">Insight IA:</strong> 1,240 clientes han superado
                los 60 días sin visita. Esta campaña podría recuperar un valor estimado de{" "}
                <span className="text-primary font-bold">$18,400 MXN</span> este trimestre.
              </p>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-md">
          <h3 className="font-headline-sm text-headline-sm px-base text-on-surface">
            Plantillas WBA aprobadas
          </h3>
          <div className="space-y-sm">
            <Template
              name="birthday_dineout"
              status="approved"
              body="“¡Hola {{name}}! Queremos celebrar tu cumpleaños contigo en…”"
              category="Marketing"
            />
            <Template
              name="churn_recover"
              status="approved"
              body="“Te extrañamos en {{restaurant_name}}, hace tiempo que…”"
              category="Utility"
            />
            <Template
              name="new_menu_alert"
              status="pending"
              body="“Ven a probar nuestra nueva carta de temporada…”"
              category="Marketing"
            />
            <button className="w-full py-sm border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant font-label-md hover:bg-white hover:border-primary transition-all">
              + Nueva plantilla
            </button>
          </div>

          <div
            className="mt-md p-lg rounded-2xl text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #B9532A 0%, #9A3412 100%)" }}
          >
            <span
              className="material-symbols-outlined mb-sm block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              tips_and_updates
            </span>
            <h4 className="font-headline-sm text-headline-sm mb-xs">Mejor horario</h4>
            <p className="font-body-sm mb-md opacity-90">
              Tus clientes de Roma Norte responden un 45% más a los mensajes enviados los miércoles
              a las 11:30 AM.
            </p>
            <div className="bg-white/20 p-sm rounded-lg backdrop-blur-md">
              <p className="text-[10px] uppercase font-bold mb-1 opacity-70">Sugerencia</p>
              <p className="font-label-md">Reprogramar &quot;Recover churn&quot; para el miércoles 20.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function GuardCard({
  label,
  value,
  suffix,
  pct,
  hint,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  pct?: number;
  hint?: string;
  tone?: "secondary";
}) {
  return (
    <div className="bg-surface-container-low p-md rounded-xl border border-outline-variant/40 min-w-[160px]">
      <p className="font-label-md text-on-surface-variant mb-xs">{label}</p>
      <p
        className={`font-numeral-xl text-numeral-xl ${
          tone === "secondary" ? "text-secondary" : "text-primary"
        }`}
      >
        {value}
        {suffix && <span className="text-body-sm font-normal text-on-surface-variant ml-xs">{suffix}</span>}
      </p>
      {pct !== undefined && (
        <div className="w-full bg-surface-container-high h-1 rounded-full mt-sm">
          <div className="bg-primary h-1 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      )}
      {hint && <p className="font-body-sm text-on-surface-variant mt-sm">{hint}</p>}
    </div>
  );
}

function Template({
  name,
  status,
  body,
  category,
}: {
  name: string;
  status: "approved" | "pending";
  body: string;
  category: string;
}) {
  const muted = status === "pending";
  return (
    <div
      className={`bg-white border border-outline-variant p-sm rounded-xl ${
        muted
          ? "opacity-60 cursor-not-allowed"
          : "hover:bg-surface-container-lowest transition-colors cursor-pointer"
      }`}
    >
      <div className="flex justify-between items-center mb-xs">
        <span className={`font-label-md ${muted ? "text-on-surface" : "text-primary"}`}>{name}</span>
        <span
          className={`px-xs py-0.5 text-[10px] rounded uppercase font-bold ${
            status === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          {status}
        </span>
      </div>
      <p className="font-body-sm text-on-surface-variant line-clamp-2">{body}</p>
      <div className="mt-sm flex justify-between items-center text-[11px] text-on-surface-variant">
        <span>{category}</span>
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </div>
    </div>
  );
}
