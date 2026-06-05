import { AppShell } from "@/components/AppShell";

type Shift = {
  initials: string;
  name: string;
  start: number; // percentage
  width: number; // percentage
  zone: "Cocina" | "Piso";
  reassigned?: boolean;
};

const SHIFTS: Shift[] = [
  { initials: "ER", name: "Eduardo Reyes", start: 10, width: 40, zone: "Cocina" },
  { initials: "LR", name: "Luis Robles", start: 40, width: 45, zone: "Piso", reassigned: true },
  { initials: "AC", name: "Adriana Castillo", start: 5, width: 40, zone: "Cocina" },
  { initials: "MG", name: "Miguel García", start: 50, width: 40, zone: "Piso" },
  { initials: "SP", name: "Sara Patiño", start: 30, width: 50, zone: "Cocina" },
  { initials: "JT", name: "Juan Torres", start: 55, width: 35, zone: "Piso" },
];

export default function Page() {
  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <p className="text-primary font-label-md mb-xs">Operaciones / Personal</p>
          <h1 className="font-display-md text-display-md text-on-surface">
            Schedule de la semana
          </h1>
        </div>
        <div className="flex gap-sm">
          <div className="bg-surface-container-high p-1 rounded-xl flex">
            <button className="px-md py-xs bg-white rounded-lg shadow-sm font-label-md">
              Día
            </button>
            <button className="px-md py-xs text-on-surface-variant font-label-md">Semana</button>
          </div>
          <button className="bg-primary text-white px-lg py-sm rounded-xl font-label-md shadow-lg flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[18px]">send</span>
            Publicar y notificar
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden flex flex-col">
          <div className="p-md border-b border-outline-variant bg-surface-container-lowest flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center gap-md">
              <span className="font-headline-sm text-on-surface">Timeline de turnos</span>
              <span className="text-body-sm text-on-surface-variant">Lunes, 24 de mayo</span>
            </div>
            <div className="flex gap-base">
              <Legend color="bg-secondary" label="Cocina" />
              <Legend color="bg-tertiary" label="Piso" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[180px_1fr] border-b border-outline-variant">
                <div className="p-sm bg-surface-container-low border-r border-outline-variant font-label-md text-on-surface-variant">
                  Personal
                </div>
                <div className="flex">
                  {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"].map((h, i) => (
                    <div
                      key={h}
                      className={`flex-1 text-center py-sm text-[11px] font-bold ${
                        i === 3 ? "text-primary" : "text-on-surface-variant"
                      } ${i < 7 ? "border-r border-outline-variant/30" : ""}`}
                    >
                      {h}
                    </div>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-outline-variant/40">
                {SHIFTS.map((s, idx) => {
                  const zoneColor =
                    s.zone === "Cocina"
                      ? "bg-secondary/20 border-l-secondary text-secondary"
                      : "bg-tertiary-container/20 border-l-tertiary text-tertiary";
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-[180px_1fr] items-center hover:bg-surface-container-lowest transition-colors"
                    >
                      <div className="p-sm border-r border-outline-variant flex flex-col">
                        <div className="flex items-center gap-xs">
                          <div className="w-6 h-6 rounded-full bg-surface-container-high text-[10px] flex items-center justify-center font-bold text-on-surface-variant">
                            {s.initials}
                          </div>
                          <span className="text-body-sm font-medium text-on-surface">{s.name}</span>
                        </div>
                        {s.reassigned && (
                          <span className="mt-1 inline-block text-[9px] bg-secondary-container/20 text-on-secondary-container px-1.5 py-0.5 rounded font-bold self-start">
                            Reasignado por IA
                          </span>
                        )}
                      </div>
                      <div className="relative h-12 flex items-center px-4">
                        <div
                          className={`absolute h-6 rounded-md border-l-4 flex items-center px-2 ${zoneColor} ${
                            s.reassigned ? "animate-pulse" : ""
                          }`}
                          style={{ left: `${s.start}%`, width: `${s.width}%` }}
                        >
                          <span className="text-[10px] font-bold uppercase">
                            {s.zone === "Cocina" ? "AM" : "PM"} · {s.zone}
                            {s.reassigned ? " (IA OPT)" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <section className="bg-white rounded-xl border-l-4 border-secondary p-md card-shadow border-y border-r border-outline-variant">
            <div className="flex justify-between items-start mb-sm">
              <h3 className="font-headline-sm text-label-md text-on-surface">Coverage vs Pronóstico</h3>
              <span className="bg-secondary-container/20 text-on-secondary-container text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> Optimizado
              </span>
            </div>
            <div className="flex items-end gap-base h-24 mb-3">
              {[
                { fc: 60, real: 55, color: "bg-secondary" },
                { fc: 80, real: 78, color: "bg-secondary" },
                { fc: 100, real: 95, color: "bg-primary", peak: true },
                { fc: 70, real: 65, color: "bg-secondary" },
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex-1 bg-surface-container rounded-t-lg overflow-hidden relative"
                  style={{ height: 96 }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-outline-variant opacity-40"
                    style={{ height: `${b.fc}%` }}
                  />
                  <div
                    className={`absolute bottom-0 w-full ${b.color}`}
                    style={{ height: `${b.real}%` }}
                  />
                  {b.peak && (
                    <div className="absolute top-1 w-full text-center text-[9px] font-bold text-primary">
                      PEAK
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-sm">
              <StatPill label="Eficiencia" value="98%" tone="secondary" />
              <StatPill label="Costo Labor" value="14.2%" tone="primary" />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-outline-variant p-md card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 -mr-16 -mt-16 rounded-full" />
            <div className="flex items-center gap-xs mb-md">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                restaurant_menu
              </span>
              <h3 className="font-headline-sm text-label-md text-on-surface">Prep list por día</h3>
            </div>
            <div className="space-y-sm">
              <PrepItem
                icon="ramen_dining"
                title="Mise en place mole"
                target="Meta: 12 litros"
                priority="Prioridad alta"
                priorityClass="text-primary"
              />
              <PrepItem
                icon="bakery_dining"
                title="Tortillas de maíz azul"
                target="Meta: 400 unidades"
                priority="Media"
                priorityClass="text-secondary"
              />
              <PrepItem
                icon="kebab_dining"
                title="Salsa de tomatillo"
                target="Meta: 8 litros"
                priority="Rutina"
                priorityClass="text-on-surface-variant"
              />
            </div>
            <button className="w-full mt-md text-primary font-label-md py-sm border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
              Ver prep list completa
            </button>
          </section>

          <div
            className="p-md rounded-xl text-white shadow-lg relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #B9532A 0%, #9A3412 100%)" }}
          >
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span
                className="material-symbols-outlined text-[100px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <h4 className="font-headline-sm text-label-md mb-xs flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              Copiloto AI Insight
            </h4>
            <p className="text-[13px] leading-relaxed opacity-90">
              Detectamos un incremento del 15% en reservas para el miércoles. Sugerimos adelantar
              la preparación de 4kg extra de proteína para evitar cuellos de botella.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
      <span className={`w-2 h-2 rounded-full ${color}`} /> {label}
    </span>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "secondary";
}) {
  const color = tone === "primary" ? "text-primary" : "text-secondary";
  return (
    <div className="bg-surface-container-low p-sm rounded-lg">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase">{label}</p>
      <p className={`text-headline-sm ${color}`}>{value}</p>
    </div>
  );
}

function PrepItem({
  icon,
  title,
  target,
  priority,
  priorityClass,
}: {
  icon: string;
  title: string;
  target: string;
  priority: string;
  priorityClass: string;
}) {
  return (
    <div className="flex items-center gap-sm p-sm bg-surface-container-low rounded-xl border border-transparent hover:border-outline-variant transition-all cursor-pointer">
      <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-primary/10 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="flex-grow">
        <p className="text-body-sm font-bold text-on-surface">{title}</p>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-on-surface-variant">{target}</p>
          <span className={`text-[10px] font-bold ${priorityClass}`}>{priority}</span>
        </div>
      </div>
    </div>
  );
}
