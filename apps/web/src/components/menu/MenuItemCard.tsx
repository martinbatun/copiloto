"use client";

import { formatMoney } from "@/lib/format";
import type { MenuItemPublic } from "@copiloto/shared";
import { useCart } from "@/components/menu/CartProvider";

/** Card de platillo del menú — imagen, precio, tags, rating y botón agregar. */
export function MenuItemCard({ item }: { item: MenuItemPublic }) {
  const { add, qtyOf } = useCart();
  const qty = qtyOf(item.id);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden card-shadow hover:shadow-md transition-shadow group">
      {item.imageUrl && (
        <div className="h-48 overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full font-label-md text-label-md text-primary font-bold shadow-sm">
            {formatMoney(item.priceCents)}
          </div>
        </div>
      )}
      <div className="p-5">
        {item.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            {item.tags.map((t) => (
              <span
                key={t}
                className="bg-secondary-container/20 text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-headline-sm text-headline-sm mb-2 text-on-surface">{item.name}</h4>
          {!item.imageUrl && (
            <span className="font-label-md text-label-md text-primary font-bold whitespace-nowrap">
              {formatMoney(item.priceCents)}
            </span>
          )}
        </div>
        {item.description && (
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-4">
            {item.description}
          </p>
        )}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            {item.rating !== null && (
              <>
                <span
                  className="material-symbols-outlined text-primary text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-label-md text-label-md text-on-surface">
                  {item.rating.toFixed(1)}
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => add(item)}
            aria-label={`Agregar ${item.name}`}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all active:scale-90 relative"
          >
            <span className="material-symbols-outlined">add</span>
            {qty > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-on-primary rounded-full text-[10px] font-bold flex items-center justify-center">
                {qty}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
