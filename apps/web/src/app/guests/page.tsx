import { AppShell } from "@/components/AppShell";

const SAMPLE_GUESTS = [
  { name: "Sofia Castro", cat: "Foodie", days: 4, spend: 14820 },
  { name: "Mateo Silva", cat: "Habitual", days: 9, spend: 9610 },
  { name: "Isabella Gomez", cat: "Nuevo", days: 2, spend: 1840 },
  { name: "Daniela Ortiz", cat: "VIP", days: 6, spend: 41250 },
  { name: "Gabriel Ruiz", cat: "Riesgo", days: 18, spend: 7430 },
  { name: "Valentina Vega", cat: "VIP", days: 5, spend: 39120 },
  { name: "Alejandro Leon", cat: "Habitual", days: 12, spend: 11260 },
  { name: "Ximena Duarte", cat: "Foodie", days: 7, spend: 18950 },
  { name: "Sebastian Peña", cat: "Habitual", days: 15, spend: 8210 },
  { name: "Mariana Soler", cat: "Riesgo", days: 22, spend: 5640 },
];

export default function Page() {
  return (
    <AppShell>
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Huéspedes</h1>
        <p className="text-on-surface-variant font-body-md">
          Gestiona la base de datos de clientes y fidelización.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <KpiCard icon="grade" tint="primary" label="VIPs Activos" value="412" />
        <KpiCard icon="warning" tint="error" label="En riesgo de churn" value="184" />
        <KpiCard
          icon="calendar_today"
          tint="secondary"
          label="Frecuencia media"
          value="2.4"
          suffix="/mes"
        />
      </section>

      <div>
        <h2 className="font-headline-sm text-headline-sm mb-md text-on-surface">
          Segmentos estratégicos
        </h2>
        <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <SegmentCard
            border="border-primary"
            color="text-primary"
            icon="workspace_premium"
            title="VIPs Embajadores"
            desc="Clientes con >12 visitas anuales."
            count="124 huéspedes"
          />
          <SegmentCard
            border="border-secondary"
            color="text-secondary"
            icon="fiber_new"
            title="Nuevos"
            desc="Primera visita en los últimos 30 días."
            count="56 huéspedes"
          />
          <SegmentCard
            border="border-error"
            color="text-error"
            icon="heart_broken"
            title="Riesgo"
            desc="Sin visitas en más de 60 días."
            count="88 huéspedes"
          />
          <SegmentCard
            border="border-tertiary"
            color="text-tertiary"
            icon="restaurant"
            title="Foodies"
            desc="Consumo alto en vinos y especialidades."
            count="210 huéspedes"
          />
        </section>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant card-shadow overflow-hidden">
        <div className="p-md border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Listado de huéspedes</h3>
          <div className="flex gap-xs">
            <button className="flex items-center gap-xs px-sm py-xs border border-outline-variant rounded-lg font-label-md hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span> Filtrar
            </button>
            <button className="flex items-center gap-xs px-sm py-xs bg-primary text-white rounded-lg font-label-md shadow-sm">
              <span className="material-symbols-outlined text-[18px]">person_add</span> Nuevo
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-md">
              <tr>
                <th className="px-md py-sm">Huésped</th>
                <th className="px-md py-sm">Categoría</th>
                <th className="px-md py-sm">Última visita</th>
                <th className="px-md py-sm">Gasto total</th>
                <th className="px-md py-sm" />
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/60">
              <tr className="hover:bg-primary/5 transition-colors bg-primary/5">
                <td className="px-md py-md">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full border border-primary/20 bg-primary-fixed flex items-center justify-center text-primary font-bold text-[12px]">
                      LR
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Lucia Robles</p>
                      <span className="text-[10px] text-primary flex items-center gap-xs font-bold uppercase tracking-tight">
                        <span
                          className="material-symbols-outlined text-[12px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          cake
                        </span>
                        Cumple hoy
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-md py-md">
                  <CategoryBadge cat="VIP" />
                </td>
                <td className="px-md py-md">Hace 3 días</td>
                <td className="px-md py-md font-bold">$54,200</td>
                <td className="px-md py-md">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                    more_vert
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="px-md py-md">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold">
                      RM
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Ricardo Mendoza</p>
                      <span className="text-[10px] text-on-surface-variant">
                        ricardo.m@gmail.com
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-md py-md">
                  <CategoryBadge cat="Habitual" />
                </td>
                <td className="px-md py-md">Hace 1 semana</td>
                <td className="px-md py-md font-bold">$22,150</td>
                <td className="px-md py-md">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                    more_vert
                  </button>
                </td>
              </tr>
              {SAMPLE_GUESTS.map((g) => (
                <tr key={g.name} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-md py-md">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-[12px]">
                        {g.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{g.name}</p>
                        <span className="text-[10px] text-on-surface-variant">
                          {g.name.toLowerCase().replace(/ /g, ".")}@email.com
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-md py-md">
                    <CategoryBadge cat={g.cat} />
                  </td>
                  <td className="px-md py-md">Hace {g.days} días</td>
                  <td className="px-md py-md font-bold">${g.spend.toLocaleString("en-US")}</td>
                  <td className="px-md py-md">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                      more_vert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-md bg-surface-container-low flex justify-between items-center text-body-sm text-on-surface-variant">
          <p>Mostrando 12 de 1,245 huéspedes</p>
          <div className="flex gap-xs">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-white transition-colors"
              >
                {n}
              </button>
            ))}
            <span className="px-xs flex items-center">…</span>
            <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-white transition-colors">
              104
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function KpiCard({
  icon,
  tint,
  label,
  value,
  suffix,
}: {
  icon: string;
  tint: "primary" | "secondary" | "error";
  label: string;
  value: string;
  suffix?: string;
}) {
  const tintMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    error: "bg-error-container text-error",
  };
  return (
    <div className="bg-white p-md rounded-xl border border-outline-variant flex items-center gap-md card-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tintMap[tint]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-on-surface-variant font-label-md">{label}</p>
        <p className="font-numeral-xl text-primary text-[32px]">
          {value}
          {suffix && <span className="font-label-md text-on-surface-variant">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

function SegmentCard({
  border,
  color,
  icon,
  title,
  desc,
  count,
}: {
  border: string;
  color: string;
  icon: string;
  title: string;
  desc: string;
  count: string;
}) {
  return (
    <div
      className={`bg-white border-l-4 ${border} p-md rounded-xl card-shadow hover:-translate-y-1 transition-transform cursor-pointer`}
    >
      <span className={`material-symbols-outlined ${color} mb-xs`}>{icon}</span>
      <p className="font-bold text-on-surface">{title}</p>
      <p className="text-body-sm text-on-surface-variant">{desc}</p>
      <p className={`${color} font-bold mt-sm`}>{count}</p>
    </div>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    VIP: "bg-primary/10 text-primary",
    Foodie: "bg-tertiary/10 text-tertiary",
    Nuevo: "bg-secondary/10 text-secondary",
    Riesgo: "bg-error-container text-error",
    Habitual: "bg-surface-container-high text-on-surface-variant",
  };
  return (
    <span
      className={`px-xs py-[2px] rounded font-bold text-[10px] uppercase ${
        map[cat] ?? "bg-surface-container-high text-on-surface-variant"
      }`}
    >
      {cat}
    </span>
  );
}
