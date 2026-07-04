"use client";

import { useMemo } from "react";
import type { SupplierDTO, SupplierIngredientDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useSuppliers } from "@/lib/hooks/useSuppliers";
import { formatMoney } from "@/lib/format";

export default function Page() {
  const { data, isLoading, error } = useSuppliers();

  const topSupplier = useMemo(() => {
    if (!data) return null;
    return [...data.suppliers].sort((a, b) => b.ingredientCount - a.ingredientCount)[0] ?? null;
  }, [data]);

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Centro de proveedores
          </h1>
          <p className="text-on-surface-variant font-body-md max-w-2xl mt-1">
            Compara costos de insumos y gestiona a tus proveedores desde un solo lugar.
          </p>
        </div>
        <button className="px-6 py-2.5 bg-primary text-white font-label-md rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary-container transition-colors w-fit">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            add
          </span>
          Nuevo pedido
        </button>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar los proveedores</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {isLoading || !data ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-container-high/70 rounded-2xl animate-pulse" />
          ))
        ) : (
          <>
            <MetricCard
              accent="border-l-primary"
              icon="storefront"
              iconBg="bg-primary-fixed/30 text-primary"
              label="Proveedores activos"
              value={String(data.suppliers.length)}
            />
            <MetricCard
              accent="border-l-secondary"
              icon="nutrition"
              iconBg="bg-secondary-fixed/30 text-secondary"
              label="Insumos en catálogo"
              value={String(data.ingredients.length)}
            />
            <MetricCard
              accent="border-l-tertiary"
              icon="verified"
              iconBg="bg-tertiary-fixed/30 text-tertiary"
              label="Proveedor con más insumos"
              value={topSupplier?.name ?? "—"}
              small
            />
          </>
        )}
      </section>

      {/* Comparador de precios (ingredientes) */}
      <section className="bg-white border border-outline-variant card-shadow rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Comparador de insumos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low">
              <tr>
                {["Ingrediente", "Categoría", "Costo actual", "Proveedor", "Acción"].map((h) => (
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
              {isLoading || !data ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-24 bg-surface-container-high/70 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.ingredients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                    Sin insumos en el catálogo.
                  </td>
                </tr>
              ) : (
                data.ingredients.map((i) => <IngredientRow key={i.id} ingredient={i} />)
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Marketplace de proveedores */}
      <section>
        <h3 className="font-headline-sm text-headline-sm mb-4 text-on-surface">
          Proveedores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading || !data
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-56 bg-surface-container-high/70 rounded-2xl animate-pulse" />
              ))
            : data.suppliers.map((s) => <SupplierCard key={s.id} supplier={s} />)}
        </div>
      </section>
    </AppShell>
  );
}

function MetricCard({
  accent,
  icon,
  iconBg,
  label,
  value,
  small,
}: {
  accent: string;
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className={`bg-white p-6 rounded-2xl border border-outline-variant card-shadow border-l-4 ${accent}`}>
      <div className="flex justify-between items-start mb-4">
        <span className={`material-symbols-outlined p-2 rounded-lg ${iconBg}`}>{icon}</span>
      </div>
      <p className="text-on-surface-variant font-label-md mb-1">{label}</p>
      <p className={`${small ? "font-headline-sm text-headline-sm" : "font-numeral-xl text-numeral-xl"} text-on-surface`}>
        {value}
      </p>
    </div>
  );
}

function IngredientRow({ ingredient }: { ingredient: SupplierIngredientDTO }) {
  return (
    <tr className="hover:bg-surface-container-lowest transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">nutrition</span>
          </div>
          <p className="font-label-md text-on-surface">{ingredient.name}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        {ingredient.category ? (
          <span className="bg-surface-container px-2 py-1 rounded text-xs text-on-surface-variant">
            {ingredient.category}
          </span>
        ) : (
          <span className="text-on-surface-variant">—</span>
        )}
      </td>
      <td className="px-6 py-4 font-headline-sm text-headline-sm text-on-surface">
        {ingredient.costPerUnitCents != null
          ? `${formatMoney(ingredient.costPerUnitCents)} /${ingredient.baseUnit}`
          : "—"}
      </td>
      <td className="px-6 py-4 text-on-surface-variant font-label-md whitespace-nowrap">
        {ingredient.supplierName ?? "—"}
      </td>
      <td className="px-6 py-4">
        <button className="bg-primary text-white px-4 py-2 rounded-lg font-label-md transition-all hover:brightness-110">
          Comprar
        </button>
      </td>
    </tr>
  );
}

function SupplierCard({ supplier }: { supplier: SupplierDTO }) {
  return (
    <div className="bg-white border border-outline-variant card-shadow rounded-2xl overflow-hidden flex flex-col">
      <div className="h-28 bg-gradient-to-br from-primary/30 to-secondary/30 relative flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-[56px] opacity-80">storefront</span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-label-md mb-1 text-on-surface">{supplier.name}</h4>
        {supplier.rfc && <p className="text-xs text-on-surface-variant mb-3">RFC: {supplier.rfc}</p>}
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-[16px]">nutrition</span>
          <span className="text-xs text-on-surface-variant">
            {supplier.ingredientCount} {supplier.ingredientCount === 1 ? "insumo" : "insumos"}
          </span>
        </div>
        {supplier.phone && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[16px]">call</span>
            <span className="text-xs text-on-surface-variant">{supplier.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
