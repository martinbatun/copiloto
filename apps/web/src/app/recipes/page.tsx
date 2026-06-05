import { AppShell } from "@/components/AppShell";

const RECIPES = [
  { name: "Guacamole tradicional", status: "ALERTA", fc: "32%", margin: "$145.00", border: "border-primary", active: true, fcColor: "text-error" },
  { name: "Tacos al pastor (3 pz)", status: "ÓPTIMO", fc: "24%", margin: "$122.50", border: "border-secondary" },
  { name: "Enchiladas Suizas", status: "ESTABLE", fc: "28%", margin: "$188.00", border: "border-outline" },
  { name: "Pozole Blanco", status: "ESTABLE", fc: "21%", margin: "$210.00", border: "border-outline" },
  { name: "Mole Poblano", status: "ESTABLE", fc: "26%", margin: "$245.00", border: "border-outline" },
  { name: "Sopa de tortilla", status: "ALERTA", fc: "31%", margin: "$95.00", border: "border-primary", fcColor: "text-error" },
];

const INGREDIENTS = [
  { name: "Aguacate Hass", qty: "200g", unit: "$85.00/kg", ext: "$17.00", status: { label: "UP 8%", icon: "trending_up", className: "text-error font-bold" }, alert: true },
  { name: "Cebolla Morada", qty: "30g", unit: "$24.00/kg", ext: "$0.72", status: { label: "ESTABLE", icon: "video_stable", className: "text-outline" } },
  { name: "Chile Serrano", qty: "10g", unit: "$42.00/kg", ext: "$0.42", status: { label: "DOWN 4%", icon: "trending_down", className: "text-green-600 font-bold" } },
  { name: "Cilantro Fresco", qty: "5g", unit: "$15.00/man.", ext: "$0.15", status: { label: "ESTABLE", icon: "", className: "text-outline" } },
  { name: "Totopos de Maíz", qty: "50g", unit: "$35.00/kg", ext: "$1.75", status: { label: "ESTABLE", icon: "", className: "text-outline" } },
];

export default function Page() {
  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <h1 className="font-display-md text-display-md font-bold text-on-surface">
            Recetas y costeo dinámico
          </h1>
          <p className="text-on-surface-variant font-body-md">
            Optimiza tus márgenes basándote en precios de mercado en tiempo real.
          </p>
        </div>
        <div className="bg-surface-container-high px-md py-xs rounded-full flex items-center gap-xs w-fit">
          <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
          <span className="text-body-sm font-semibold text-on-surface">
            3 alertas de costo críticas
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Recipe list */}
        <section className="lg:col-span-4 flex flex-col gap-sm">
          <div className="relative">
            <span className="absolute left-md top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar receta…"
              className="w-full pl-xl pr-md py-sm bg-white border-outline-variant border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          <div className="space-y-sm">
            {RECIPES.map((r) => (
              <div
                key={r.name}
                className={`bg-white border-l-4 ${r.border} rounded-xl p-md card-shadow ring-1 ring-outline-variant cursor-pointer hover:bg-surface-container-low transition-all ${
                  r.active ? "ring-primary/40 ring-2" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-base">
                  <h4 className={`font-headline-sm ${r.active ? "text-primary" : "text-on-surface"}`}>
                    {r.name}
                  </h4>
                  <RecipeBadge status={r.status} />
                </div>
                <div className="flex gap-md mt-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Food Cost</span>
                    <span className={`font-numeral-xl text-2xl ${r.fcColor ?? "text-on-surface"}`}>
                      {r.fc}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-outline-variant pl-md">
                    <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Margen</span>
                    <span className="font-numeral-xl text-on-surface text-2xl">{r.margin}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Detail */}
        <section className="lg:col-span-8 bg-white rounded-2xl card-shadow ring-1 ring-outline-variant flex flex-col overflow-hidden relative">
          <div
            className="absolute top-md right-md z-10 w-72 p-md rounded-xl text-white shadow-xl"
            style={{
              background: "linear-gradient(135deg, #C2512D 0%, #cb4921 100%)",
            }}
          >
            <div className="flex gap-sm items-start">
              <span
                className="material-symbols-outlined text-secondary-fixed"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lightbulb
              </span>
              <div>
                <p className="font-bold text-sm mb-base">Recomendación de Copiloto</p>
                <p className="text-xs leading-relaxed mb-sm">
                  El aguacate subió un <span className="font-bold text-secondary-fixed">8%</span>. Tu
                  margen cayó $12 MXN por orden. Sugiero incrementar precio de $185 a $199 o reducir
                  el gramaje de 200g a 180g.
                </p>
                <div className="flex gap-xs">
                  <button className="bg-white/20 hover:bg-white/30 px-sm py-1 rounded text-[10px] font-bold transition-all">
                    AJUSTAR PRECIO
                  </button>
                  <button className="bg-white text-primary px-sm py-1 rounded text-[10px] font-bold transition-all">
                    REVISAR GRAMAJE
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="h-48 w-full relative bg-gradient-to-br from-primary/40 to-tertiary/60 flex items-end p-md">
            <div className="text-white">
              <h2 className="font-headline-lg text-headline-lg">Guacamole tradicional</h2>
              <p className="text-sm opacity-90">SKU: REC-001 · Categoría: Entradas</p>
            </div>
          </div>

          <div className="p-md flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
              <StatBox label="Precio Venta" value="$185.00" />
              <StatBox
                label="Costo Unitario"
                value="$59.20"
                tone="error"
                hint={{ icon: "trending_up", text: "+12.4% vs mes ant." }}
              />
              <StatBox label="Utilidad Bruta" value="$125.80" />
              <StatBox label="Mermas Prom." value="4.2%" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Desglose de ingredientes
                </h3>
                <button className="text-primary font-bold text-sm flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">edit</span> Editar receta
                </button>
              </div>
              <div className="border border-outline-variant rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-[11px] uppercase tracking-wider font-bold text-outline">
                    <tr>
                      <th className="px-md py-sm">Ingrediente</th>
                      <th className="px-md py-sm text-right">Cantidad</th>
                      <th className="px-md py-sm text-right">Costo unit.</th>
                      <th className="px-md py-sm text-right">Costo ext.</th>
                      <th className="px-md py-sm">Estatus mercado</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-sm divide-y divide-outline-variant/60">
                    {INGREDIENTS.map((ing) => (
                      <tr key={ing.name} className={ing.alert ? "bg-error-container/10" : ""}>
                        <td className={`px-md py-sm ${ing.alert ? "font-bold" : ""}`}>{ing.name}</td>
                        <td className="px-md py-sm text-right">{ing.qty}</td>
                        <td className="px-md py-sm text-right">{ing.unit}</td>
                        <td className={`px-md py-sm text-right ${ing.alert ? "font-bold" : ""}`}>{ing.ext}</td>
                        <td className="px-md py-sm">
                          <span className={`text-[10px] flex items-center gap-xs ${ing.status.className}`}>
                            {ing.status.icon && (
                              <span className="material-symbols-outlined text-[14px]">{ing.status.icon}</span>
                            )}
                            {ing.status.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-lg grid grid-cols-1 md:grid-cols-2 gap-md">
              <button className="border border-dashed border-outline-variant p-md rounded-xl flex items-center justify-center gap-sm text-outline hover:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined">add_circle</span>
                <span className="font-label-md">Añadir ingrediente</span>
              </button>
              <button className="border border-dashed border-outline-variant p-md rounded-xl flex items-center justify-center gap-sm text-outline hover:bg-surface-container-low transition-all">
                <span className="material-symbols-outlined">history</span>
                <span className="font-label-md">Historial de costos</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function RecipeBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ALERTA: "bg-error-container text-on-error-container",
    ÓPTIMO: "bg-green-100 text-green-700",
    ESTABLE: "bg-surface-container text-on-surface-variant",
  };
  return (
    <span className={`text-[10px] px-xs py-[2px] rounded-full font-bold ${map[status]}`}>
      {status}
    </span>
  );
}

function StatBox({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "error";
  hint?: { icon: string; text: string };
}) {
  return (
    <div
      className={`p-md rounded-xl ${
        tone === "error" ? "bg-error-container/40 border border-error-container" : "bg-surface-container"
      }`}
    >
      <p className={`text-[10px] uppercase font-bold ${tone === "error" ? "text-error" : "text-outline"}`}>
        {label}
      </p>
      <p className={`font-numeral-xl text-2xl ${tone === "error" ? "text-error" : "text-on-surface"}`}>
        {value}
      </p>
      {hint && (
        <span className="text-[10px] text-error flex items-center gap-1 mt-1">
          <span className="material-symbols-outlined text-[12px]">{hint.icon}</span>
          {hint.text}
        </span>
      )}
    </div>
  );
}
