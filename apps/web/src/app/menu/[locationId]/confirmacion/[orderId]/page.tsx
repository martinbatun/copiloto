"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { useOrderStatus } from "@/lib/hooks/useMenu";
import { CustomerTopBar, CustomerBottomNav } from "@/components/menu/chrome";

export default function ConfirmacionPage() {
  const { locationId, orderId } = useParams<{ locationId: string; orderId: string }>();
  const { data: order, isLoading, error } = useOrderStatus(orderId);

  return (
    <div className="min-h-screen bg-canvas">
      <CustomerTopBar locationId={locationId} />

      <main className="pt-20 pb-40 px-margin-mobile max-w-2xl mx-auto">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-24 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
              progress_activity
            </span>
            <p className="font-label-md">Confirmando tu pedido…</p>
          </div>
        )}

        {error && (
          <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4 mt-8">
            <p className="font-bold">No encontramos tu pedido</p>
            <p className="text-sm">{String((error as Error).message)}</p>
          </div>
        )}

        {order && (
          <div className="flex flex-col items-center text-center mt-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span
                className="material-symbols-outlined text-primary text-[44px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">
              ¡Pedido enviado a cocina!
            </h1>
            <p className="font-body-md text-on-surface-variant mb-6">
              Muestra este código al personal para recoger o pagar tu orden.
            </p>

            <div className="bg-surface-container-lowest border border-outline-variant/30 card-shadow rounded-2xl px-10 py-6 mb-8">
              <p className="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Tu código
              </p>
              <p className="font-numeral-xl text-numeral-xl text-primary">{order.code}</p>
            </div>

            {/* Items */}
            <div className="w-full bg-surface-container-low rounded-2xl border border-outline-variant/20 p-6 mb-6 text-left">
              <div className="space-y-2 mb-3">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between font-body-sm">
                    <span className="text-on-surface-variant">
                      {it.qty}× {it.name}
                    </span>
                    <span className="text-on-surface">{formatMoney(it.totalCents)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-outline-variant/30 flex justify-between">
                <span className="font-headline-sm text-headline-sm text-on-surface">Total</span>
                <span className="font-headline-sm text-headline-sm text-primary">
                  {formatMoney(order.totalCents)}
                </span>
              </div>
            </div>

            {/* Estado de pago */}
            <div
              className={
                order.paymentStatus === "PAID"
                  ? "w-full flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-lg mb-8 border border-primary/20"
                  : "w-full flex items-center gap-2 px-4 py-3 bg-secondary-fixed/30 rounded-lg mb-8 border border-secondary-fixed/50"
              }
            >
              <span
                className={`material-symbols-outlined text-lg ${
                  order.paymentStatus === "PAID" ? "text-primary" : "text-secondary"
                }`}
              >
                {order.paymentStatus === "PAID" ? "task_alt" : "point_of_sale"}
              </span>
              <p
                className={`font-body-sm ${
                  order.paymentStatus === "PAID" ? "text-primary" : "text-secondary"
                }`}
              >
                {order.paymentStatus === "PAID"
                  ? "Pago confirmado desde el móvil."
                  : "Pasa a caja para completar tu pago."}
              </p>
            </div>

            <Link
              href={`/menu/${locationId}`}
              className="px-6 py-3 btn-terracota-gradient rounded-full font-bold"
            >
              Volver al menú
            </Link>
          </div>
        )}
      </main>

      <CustomerBottomNav locationId={locationId} active="pedido" />
    </div>
  );
}
