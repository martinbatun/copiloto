"use client";

import { useEffect, useMemo, useState } from "react";
import type { RecipeDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useRecipes } from "@/lib/hooks/useOpsData";
import { formatMoney } from "@/lib/format";

function statusOf(foodCostPct: number): { label: string; badge: string; border: string; fcColor: string } {
  if (foodCostPct >= 30) return { label: "ALERTA", badge: "bg-error-container text-on-error-container", border: "border-primary", fcColor: "text-error" };
  if (foodCostPct <= 24) return { label: "ÓPTIMO", badge: "bg-green-100 text-green-700", border: "border-secondary", fcColor: "text-on-surface" };
  return { label: "ESTABLE", badge: "bg-surface-container text-on-surface-variant", border: "border-outline", fcColor: "text-on-surface" };
}

export default function Page() {
  const { data, isLoading, error } = useRecipes();
  const recipes = useMemo(() => data?.recipes ?? [], [data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && recipes.length > 0) setSelectedId(recipes[0]!.menuItemId);
  }, [recipes, selectedId]);

  const selected = recipes.find((r) => r.menuItemId === selectedId) ?? null;
  const alerts = recipes.filter((r) => r.foodCostPct >= 30).length;

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <h1 className="font-display-md text-display-md font-bold text-on-surface">
            Recetas y costeo dinámico
          </h1>
          <p className="text-on-surface-variant font-body-md">
            Optimiza tus márgenes con base en el costo real de tus insumos.
          </p>
        </div>
        {alerts > 0 && (
          <div className="bg-surface-container-high px-md py-xs rounded-full flex items-center gap-xs w-fit">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="text-body-sm font-semibold text-on-surface">
              {alerts} {alerts === 1 ? "alerta de costo" : "alertas de costo"}
            </span>
          </div>
        )}
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar las recetas</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Lista */}
        <section className="lg:col-span-4 flex flex-col gap-sm">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-surface-container-high/70 rounded-xl animate-pulse" />
            ))
          ) : recipes.length === 0 ? (
            <p className="text-on-surface-variant p-md">Aún no hay recetas con costeo.</p>
          ) : (
            recipes.map((r) => {
              const st = statusOf(r.foodCostPct);
              const active = r.menuItemId === selectedId;
              return (
                <button
                  key={r.menuItemId}
                  onClick={() => setSelectedId(r.menuItemId)}
                  className={`text-left bg-white border-l-4 ${st.border} rounded-xl p-md card-shadow ring-1 transition-all ${
                    active ? "ring-primary/40 ring-2" : "ring-outline-variant hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex justify-between items-start mb-base">
                    <h4 className={`font-headline-sm ${active ? "text-primary" : "text-on-surface"}`}>{r.name}</h4>
                    <span className={`text-[10px] px-xs py-[2px] rounded-full font-bold ${st.badge}`}>{st.label}</span>
                  </div>
                  <div className="flex gap-md mt-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Food cost</span>
                      <span className={`font-numeral-xl text-2xl ${st.fcColor}`}>{r.foodCostPct}%</span>
                    </div>
                    <div className="flex flex-col border-l border-outline-variant pl-md">
                      <span className="text-[10px] uppercase tracking-wider text-outline font-bold">Margen</span>
                      <span className="font-numeral-xl text-on-surface text-2xl">{formatMoney(r.marginCents)}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </section>

        {/* Detalle */}
        <section className="lg:col-span-8 bg-white rounded-2xl card-shadow ring-1 ring-outline-variant flex flex-col overflow-hidden">
          {selected ? (
            <RecipeDetail recipe={selected} />
          ) : (
            <div className="p-xl text-center text-on-surface-variant">
              {isLoading ? "Cargando…" : "Selecciona una receta."}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function RecipeDetail({ recipe }: { recipe: RecipeDTO }) {
  return (
    <>
      <div className="h-40 w-full bg-gradient-to-br from-primary/40 to-tertiary/60 flex items-end p-md">
        <div className="text-white">
          <h2 className="font-headline-lg text-headline-lg">{recipe.name}</h2>
          <p className="text-sm opacity-90">SKU: {recipe.sku}</p>
        </div>
      </div>

      <div className="p-md flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
          <StatBox label="Precio venta" value={formatMoney(recipe.priceCents)} />
          <StatBox label="Costo insumos" value={formatMoney(recipe.foodCostCents)} tone={recipe.foodCostPct >= 30 ? "error" : undefined} />
          <StatBox label="Margen bruto" value={formatMoney(recipe.marginCents)} />
          <StatBox label="Food cost" value={`${recipe.foodCostPct}%`} tone={recipe.foodCostPct >= 30 ? "error" : undefined} />
        </div>

        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Desglose de ingredientes</h3>
        <div className="border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-[11px] uppercase tracking-wider font-bold text-outline">
              <tr>
                <th className="px-md py-sm">Ingrediente</th>
                <th className="px-md py-sm text-right">Cantidad</th>
                <th className="px-md py-sm text-right">Costo unit.</th>
                <th className="px-md py-sm text-right">Costo ext.</th>
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/60">
              {recipe.lines.map((l) => (
                <tr key={l.ingredientId}>
                  <td className="px-md py-sm">{l.name}</td>
                  <td className="px-md py-sm text-right">
                    {l.qty} {l.unit}
                  </td>
                  <td className="px-md py-sm text-right">
                    {l.unitCostCents != null ? `${formatMoney(l.unitCostCents)}/${l.unit}` : "—"}
                  </td>
                  <td className="px-md py-sm text-right font-bold">{formatMoney(l.extCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone?: "error" }) {
  return (
    <div className={`p-md rounded-xl ${tone === "error" ? "bg-error-container/40 border border-error-container" : "bg-surface-container"}`}>
      <p className={`text-[10px] uppercase font-bold ${tone === "error" ? "text-error" : "text-outline"}`}>{label}</p>
      <p className={`font-numeral-xl text-2xl ${tone === "error" ? "text-error" : "text-on-surface"}`}>{value}</p>
    </div>
  );
}
