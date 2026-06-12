"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/components/menu/CartProvider";

/** Botón flotante "Ver Pedido (n) · $total" — sólo visible con items. */
export function CartFab({ locationId }: { locationId: string }) {
  const { count, subtotalCents } = useCart();
  if (count === 0) return null;
  return (
    <div className="fixed bottom-24 right-6 z-40">
      <Link
        href={`/menu/${locationId}/pedido`}
        className="flex items-center gap-3 bg-primary text-on-primary px-6 py-4 rounded-full shadow-2xl hover:bg-primary-container transition-all active:scale-95"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          receipt_long
        </span>
        <span className="font-label-md text-label-md font-bold">Ver Pedido ({count})</span>
        <span className="ml-2 pl-2 border-l border-on-primary/30 font-numeral-xl text-lg">
          {formatMoney(subtotalCents)}
        </span>
      </Link>
    </div>
  );
}
