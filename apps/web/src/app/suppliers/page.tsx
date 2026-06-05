import { AppShell } from "@/components/AppShell";

const INGREDIENTS = [
  {
    icon: "🥑",
    iconBg: "bg-green-100 text-green-700",
    name: "Aguacate Hass",
    sub: "Caja 10kg · Michoacán",
    price: "$840.00",
    low: "$780.00",
    trend: "M0,25 L10,20 L20,28 L30,15 L40,10 L50,18 L60,5 L70,8 L80,2",
    color: "#10b981",
  },
  {
    icon: "🌽",
    iconBg: "bg-orange-100 text-orange-700",
    name: "Tortilla Nixtamal",
    sub: "Bulto 20kg · Local",
    price: "$320.00",
    low: "$315.00",
    trend: "M0,15 L10,14 L20,16 L30,15 L40,15 L50,14 L60,15 L70,16 L80,15",
    color: "#855300",
  },
  {
    icon: "🧅",
    iconBg: "bg-gray-100 text-gray-700",
    name: "Cebolla Blanca",
    sub: "Costal 25kg · Bajío",
    price: "$450.00",
    low: "$390.00",
    trend: "M0,5 L10,12 L20,15 L30,22 L40,28 L50,25 L60,20 L70,18 L80,22",
    color: "#ba1a1a",
  },
];

const SUPPLIERS = [
  { name: "Sigma Alimentos", cat: "Carnes & Lácteos", delivery: "24–48h entrega", rating: "4.9", grade: "A+" },
  { name: "Lácteos Polanco", cat: "Quesos & Cremas", delivery: "12h (Local)", rating: "4.7", grade: "A" },
  { name: "Frutas Selectas", cat: "Frutas & Verduras", delivery: "24h Express", rating: "4.8", grade: "A+" },
];

export default function Page() {
  return (
    <AppShell>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Centro de proveedores
          </h1>
          <p className="text-on-surface-variant font-body-md max-w-2xl mt-1">
            Optimiza tu cadena de suministro con IA. Compara precios en tiempo real y gestiona tus
            pedidos desde un solo lugar.
          </p>
        </div>
        <button className="px-6 py-2.5 bg-primary text-white font-label-md rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary-container transition-colors w-fit">
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          Nuevo pedido
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <MetricCard
          accent="border-l-secondary"
          icon="savings"
          iconBg="bg-secondary-fixed/30 text-secondary"
          label="Ahorro potencial"
          value="$4,200"
          suffix="MXN"
          delta="+12%"
        />
        <MetricCard
          accent="border-l-primary"
          icon="package_2"
          iconBg="bg-primary-fixed/30 text-primary"
          label="Pedidos pendientes"
          value="08"
          hint="Hoy"
        />
        <div className="bg-white p-6 rounded-2xl border border-outline-variant card-shadow border-l-4 border-l-tertiary flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-tertiary bg-tertiary-fixed/30 p-2 rounded-lg">
              verified
            </span>
            <span className="text-on-surface-variant font-label-md">Top desempeño</span>
          </div>
          <div>
            <p className="text-on-surface-variant font-label-md mb-1">Mejor proveedor</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-tertiary text-xs">
                SA
              </div>
              <p className="font-headline-sm text-headline-sm text-on-surface">Sigma Alimentos</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter">
        <div className="xl:col-span-2 space-y-gutter">
          <section className="bg-white border border-outline-variant card-shadow rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Comparador de precios
              </h3>
              <button className="text-primary font-label-md hover:underline">
                Ver reporte completo
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low">
                  <tr>
                    {[
                      "Ingrediente",
                      "Precio actual",
                      "Histórico bajo",
                      "Tendencia (3m)",
                      "Acción",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider text-xs whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {INGREDIENTS.map((i) => (
                    <tr key={i.name} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${i.iconBg}`}>
                            {i.icon}
                          </div>
                          <div>
                            <p className="font-label-md text-on-surface">{i.name}</p>
                            <p className="text-xs text-on-surface-variant">{i.sub}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-headline-sm text-headline-sm text-on-surface">
                        {i.price}
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-label-md">{i.low}</td>
                      <td className="px-6 py-4">
                        <svg height="30" width="80">
                          <path
                            d={i.trend}
                            stroke={i.color}
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                      </td>
                      <td className="px-6 py-4">
                        <button className="bg-primary text-white px-4 py-2 rounded-lg font-label-md transition-all hover:brightness-110">
                          Comprar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface">
              Marketplace de proveedores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUPPLIERS.map((s) => (
                <SupplierCard key={s.name} {...s} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div
            className="p-6 rounded-2xl text-white shadow-xl relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #B9532A 0%, #9A3412 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="material-symbols-outlined text-secondary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <h3 className="font-headline-sm text-headline-sm">Copiloto AI Insight</h3>
              </div>
              <p className="font-body-lg mb-6 leading-relaxed">
                &ldquo;Sugerencia: Cambiar de proveedor de{" "}
                <span className="font-bold text-secondary-container">Aguacate</span> a &lsquo;Frutas
                del Bosque&rsquo; este mes ahorraría un{" "}
                <span className="font-bold">8% en food cost total</span>.&rdquo;
              </p>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/20">
                <p className="text-xs font-label-md uppercase tracking-wider mb-2 text-primary-fixed">
                  Impacto estimado
                </p>
                <div className="flex items-end gap-2">
                  <span className="font-numeral-xl text-3xl">$12,450</span>
                  <span className="text-xs mb-1">MXN / mes</span>
                </div>
              </div>
              <button className="w-full py-3 bg-secondary-container text-on-secondary-container font-bold rounded-xl hover:bg-secondary-fixed shadow-lg">
                Aplicar cambios ahora
              </button>
            </div>
          </div>

          <div className="bg-white border border-outline-variant card-shadow p-6 rounded-2xl">
            <h4 className="font-label-md mb-4 flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary">monitoring</span>
              Alertas de stock bajo
            </h4>
            <div className="space-y-3">
              <StockRow icon="🍋" name="Limón Colima" left="2.5 kg" critical />
              <StockRow icon="🥩" name="Arrachera Angus" left="8 kg" />
            </div>
            <button className="w-full mt-6 py-2 border border-primary text-primary font-label-md rounded-xl hover:bg-primary/5 transition-colors">
              Gestionar todo el stock
            </button>
          </div>

          <div className="bg-secondary-fixed/10 border border-outline-variant card-shadow p-6 rounded-2xl">
            <h4 className="font-label-md mb-4 flex items-center gap-2 text-on-surface">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                history
              </span>
              Pedidos recientes
            </h4>
            <div className="space-y-3 text-sm">
              <OrderRow id="#ORD-8923" time="Hace 2h" />
              <OrderRow id="#ORD-8922" time="Hace 5h" />
              <OrderRow id="#ORD-8921" time="Ayer" />
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function MetricCard({
  accent,
  icon,
  iconBg,
  label,
  value,
  suffix,
  delta,
  hint,
}: {
  accent: string;
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  suffix?: string;
  delta?: string;
  hint?: string;
}) {
  return (
    <div className={`bg-white p-6 rounded-2xl border border-outline-variant card-shadow border-l-4 ${accent}`}>
      <div className="flex justify-between items-start mb-4">
        <span className={`material-symbols-outlined p-2 rounded-lg ${iconBg}`}>{icon}</span>
        {delta && (
          <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> {delta}
          </span>
        )}
        {hint && <span className="text-on-surface-variant font-label-md">{hint}</span>}
      </div>
      <p className="text-on-surface-variant font-label-md mb-1">{label}</p>
      <p className="font-numeral-xl text-numeral-xl text-on-surface">
        {value} {suffix && <span className="text-body-lg">{suffix}</span>}
      </p>
    </div>
  );
}

function SupplierCard({
  name,
  cat,
  delivery,
  rating,
  grade,
}: {
  name: string;
  cat: string;
  delivery: string;
  rating: string;
  grade: string;
}) {
  return (
    <div className="bg-white border border-outline-variant card-shadow rounded-2xl overflow-hidden flex flex-col">
      <div className="h-32 bg-gradient-to-br from-primary/30 to-secondary/30 relative flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-[64px] opacity-80">storefront</span>
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <span
            className="material-symbols-outlined text-secondary text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-bold text-xs">{rating}</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-label-md mb-1 text-on-surface">{name}</h4>
        <p className="text-xs text-on-surface-variant mb-3">{cat}</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[14px]">local_shipping</span>
          <span className="text-xs text-on-surface-variant">{delivery}</span>
        </div>
        <div className="mt-auto pt-4 border-t border-outline-variant flex justify-between items-center">
          <div className="bg-primary-fixed/30 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            Copiloto AI Rating
          </div>
          <span className="font-bold text-primary">{grade}</span>
        </div>
      </div>
    </div>
  );
}

function StockRow({
  icon,
  name,
  left,
  critical,
}: {
  icon: string;
  name: string;
  left: string;
  critical?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border ${
        critical
          ? "bg-error-container/20 border-error-container"
          : "bg-surface-container-low border-outline-variant"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm font-bold text-on-surface">{name}</p>
          <p className="text-[10px] text-on-surface-variant">Quedan {left}</p>
        </div>
      </div>
      <button className="material-symbols-outlined text-primary hover:scale-110 transition-transform">
        shopping_cart
      </button>
    </div>
  );
}

function OrderRow({ id, time }: { id: string; time: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-bold text-on-surface">{id}</span>
      <span className="text-on-surface-variant">{time}</span>
    </div>
  );
}
