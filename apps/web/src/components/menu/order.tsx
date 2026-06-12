"use client";

import { formatMoney } from "@/lib/format";
import type { OrderPaymentMethod } from "@copiloto/shared";
import { useCart, type CartLine } from "@/components/menu/CartProvider";

const ACCENTS = ["border-l-primary", "border-l-secondary-container", "border-l-tertiary"];

/** Fila de un artículo en "Mi Pedido" con stepper de cantidad. */
export function OrderItemRow({ line, index }: { line: CartLine; index: number }) {
  const { setQty } = useCart();
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant/30 border-l-4 ${accent} p-4 rounded-xl card-shadow flex gap-4`}
    >
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center">
        {line.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={line.imageUrl} alt={line.name} className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant text-3xl">
            restaurant
          </span>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-label-md text-label-md text-on-surface">{line.name}</h3>
          <span className="font-label-md text-label-md text-primary whitespace-nowrap">
            {formatMoney(line.priceCents * line.qty)}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => setQty(line.menuItemId, line.qty - 1)}
            aria-label="Quitar uno"
            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <span className="font-label-md text-label-md w-4 text-center">{line.qty}</span>
          <button
            type="button"
            onClick={() => setQty(line.menuItemId, line.qty + 1)}
            aria-label="Agregar uno"
            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Resumen de totales: subtotal + IVA + total. */
export function OrderSummary({
  subtotalCents,
  taxCents,
  totalCents,
}: {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}) {
  return (
    <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20">
      <div className="space-y-3">
        <div className="flex justify-between font-body-md">
          <span className="text-on-surface-variant">Subtotal</span>
          <span className="text-on-surface">{formatMoney(subtotalCents)}</span>
        </div>
        <div className="flex justify-between font-body-md">
          <span className="text-on-surface-variant">Impuestos (IVA 16%)</span>
          <span className="text-on-surface">{formatMoney(taxCents)}</span>
        </div>
        <div className="pt-3 border-t border-outline-variant/30 flex justify-between">
          <span className="font-headline-sm text-headline-sm text-on-surface">Total</span>
          <span className="font-headline-sm text-headline-sm text-primary">
            {formatMoney(totalCents)}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Botones de pago: pagar desde el móvil / enviar a caja. */
export function PaymentActions({
  onPay,
  pending,
}: {
  onPay: (method: OrderPaymentMethod) => void;
  pending: boolean;
}) {
  return (
    <div className="grid gap-4">
      <button
        type="button"
        disabled={pending}
        onClick={() => onPay("MOBILE")}
        className="btn-terracota-gradient text-on-primary h-14 rounded-full font-label-md text-label-md flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all w-full disabled:opacity-60 disabled:active:scale-100"
      >
        <span className="material-symbols-outlined">smartphone</span>
        Pagar ahora desde el móvil
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => onPay("CASHIER")}
        className="bg-white border-2 border-primary text-primary h-14 rounded-full font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-all w-full disabled:opacity-60 disabled:active:scale-100"
      >
        <span className="material-symbols-outlined">point_of_sale</span>
        Enviar pedido a caja
      </button>
    </div>
  );
}
