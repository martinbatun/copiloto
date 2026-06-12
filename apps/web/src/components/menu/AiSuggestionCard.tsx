"use client";

import { formatMoney } from "@/lib/format";
import type { MenuItemPublic } from "@copiloto/shared";
import { useCart } from "@/components/menu/CartProvider";

/** Banner de recomendación de Copiloto AI sobre el menú (gradiente terracota). */
export function AiSuggestionCard({ item }: { item: MenuItemPublic }) {
  const { add } = useCart();
  return (
    <div className="mt-6 p-6 rounded-2xl ai-badge text-white shadow-lg relative overflow-hidden group">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="material-symbols-outlined text-secondary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="font-label-md text-label-md uppercase tracking-wider text-secondary-container">
              Recomendación Copiloto
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm mb-1">{item.name}</h3>
          {item.description && (
            <p className="font-body-sm text-body-sm opacity-90 line-clamp-2">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-numeral-xl text-numeral-xl">{formatMoney(item.priceCents)}</span>
          <button
            type="button"
            onClick={() => add(item)}
            className="bg-white text-primary px-6 py-3 rounded-xl font-label-md text-label-md font-bold shadow-sm active:scale-95 transition-transform"
          >
            Agregar
          </button>
        </div>
      </div>
      <div className="absolute right-[-10%] bottom-[-20%] opacity-10 rotate-12 transition-transform duration-700 group-hover:scale-110">
        <span
          className="material-symbols-outlined text-[200px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          restaurant_menu
        </span>
      </div>
    </div>
  );
}
