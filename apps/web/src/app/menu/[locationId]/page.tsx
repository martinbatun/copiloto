"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { MenuCategoryPublic, MenuItemPublic } from "@copiloto/shared";
import { usePublicMenu } from "@/lib/hooks/useMenu";
import { ApiError } from "@/lib/api";
import { useCart } from "@/components/menu/CartProvider";
import { CustomerTopBar, CustomerBottomNav } from "@/components/menu/chrome";
import { CategoryChips } from "@/components/menu/CategoryChips";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { AiSuggestionCard } from "@/components/menu/AiSuggestionCard";
import { CartFab } from "@/components/menu/CartFab";

export default function MenuPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const { data, isLoading, error, refetch, isFetching } = usePublicMenu(locationId);
  const { setTable, tableLabel } = useCart();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  // El QR de la mesa llega como /menu/:loc?mesa=12 → guardamos la mesa para
  // prellenar el pedido. Leemos de window.location (evita Suspense de useSearchParams).
  useEffect(() => {
    const mesa = new URLSearchParams(window.location.search).get("mesa");
    if (mesa) setTable(mesa.trim());
  }, [setTable]);

  const allItems = useMemo(
    () => data?.categories.flatMap((c) => c.items) ?? [],
    [data]
  );

  // Recomendación de IA: prioriza un item "Especial", si no el mejor rating.
  const featured = useMemo<MenuItemPublic | null>(() => {
    if (allItems.length === 0) return null;
    const special = allItems.find((i) => i.tags.includes("Especial"));
    if (special) return special;
    return [...allItems].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0] ?? null;
  }, [allItems]);

  // Filtrado por categoría activa + búsqueda de texto.
  const visibleCategories = useMemo<MenuCategoryPublic[]>(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.categories
      .filter((c) => activeCat === null || c.id === activeCat)
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) =>
            q === "" ||
            i.name.toLowerCase().includes(q) ||
            (i.description ?? "").toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [data, activeCat, query]);

  return (
    <div className="min-h-screen pb-24 bg-canvas">
      <CustomerTopBar locationId={locationId} />

      <main className="pt-20 px-margin-mobile max-w-5xl mx-auto">
        <div className="mt-6 mb-8">
          {tableLabel && (
            <span className="inline-flex items-center gap-1 mb-3 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px]">table_restaurant</span>
              Mesa {tableLabel}
            </span>
          )}
          <h2 className="font-headline-lg text-headline-lg mb-2">
            ¿Qué te apetece hoy?
          </h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca platillos, ingredientes…"
              className="w-full h-14 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-body-md card-shadow outline-none"
            />
          </div>
        </div>

        {isLoading && <MenuSkeleton />}

        {error &&
          (error instanceof ApiError && error.status === 404 ? (
            <div className="flex flex-col items-center text-center py-16 gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[56px]">
                storefront
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Este menú no está disponible
              </h3>
              <p className="font-body-md text-on-surface-variant max-w-sm">
                La sucursal no existe o está inactiva. Verifica el código QR o pregunta al
                personal.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-16 gap-3">
              <span className="material-symbols-outlined text-error text-[56px]">wifi_off</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                No pudimos cargar el menú
              </h3>
              <p className="font-body-md text-on-surface-variant max-w-sm">
                Revisa tu conexión e inténtalo de nuevo.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-2 px-6 py-3 btn-terracota-gradient rounded-full font-bold disabled:opacity-60"
              >
                {isFetching ? "Reintentando…" : "Reintentar"}
              </button>
            </div>
          ))}

        {data && (
          <>
            <CategoryChips
              categories={data.categories.map((c) => ({ id: c.id, name: c.name }))}
              active={activeCat}
              onChange={setActiveCat}
            />

            {featured && activeCat === null && query === "" && (
              <AiSuggestionCard item={featured} />
            )}

            {visibleCategories.length === 0 ? (
              <p className="mt-12 text-center text-on-surface-variant font-body-md">
                No encontramos platillos para “{query}”.
              </p>
            ) : (
              visibleCategories.map((cat) => (
                <section key={cat.id} className="mt-12">
                  <h3 className="font-headline-sm text-headline-sm mb-6 border-l-4 border-primary pl-4">
                    {cat.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    {cat.items.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </>
        )}
      </main>

      <CartFab locationId={locationId} />
      <CustomerBottomNav locationId={locationId} active="menu" />
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mt-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden card-shadow"
        >
          <div className="h-48 bg-surface-container-high animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-2/3 bg-surface-container-high animate-pulse rounded" />
            <div className="h-4 w-full bg-surface-container-high/70 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-surface-container-high/70 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
