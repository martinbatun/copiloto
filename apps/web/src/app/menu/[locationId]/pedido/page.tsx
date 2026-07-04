"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { OrderPaymentMethod } from "@copiloto/shared";
import { useCart } from "@/components/menu/CartProvider";
import { useCreateOrder } from "@/lib/hooks/useMenu";
import { CustomerTopBar, CustomerBottomNav } from "@/components/menu/chrome";
import { OrderItemRow, OrderSummary, PaymentActions } from "@/components/menu/order";

const TAX_RATE = 0.16; // preview en cliente; el server recalcula al confirmar.

export default function PedidoPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const router = useRouter();
  const { lines, subtotalCents, clear, tableLabel } = useCart();
  const createOrder = useCreateOrder();

  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents;

  function handlePay(method: OrderPaymentMethod) {
    createOrder.mutate(
      {
        locationId,
        paymentMethod: method,
        tableLabel: tableLabel || undefined,
        items: lines.map((l) => ({ menuItemId: l.menuItemId, qty: l.qty })),
      },
      {
        onSuccess: (order) => {
          clear();
          // Pago en línea: nos vamos al checkout de la pasarela. Si no (pago en
          // caja o modo simulado), directo a la confirmación.
          if (order.checkoutUrl) {
            window.location.href = order.checkoutUrl;
            return;
          }
          router.push(`/menu/${locationId}/confirmacion/${order.id}`);
        },
        onError: (err) => {
          toast.error("No pudimos enviar tu pedido", {
            description: String((err as Error).message),
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <CustomerTopBar locationId={locationId} />

      <main className="pt-20 pb-40 px-margin-mobile max-w-2xl mx-auto">
        <header className="mb-6">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1">
            Mi Pedido
          </h1>
          <p className="font-body-sm text-on-surface-variant">
            Revisa tus artículos antes de confirmar.
          </p>
          {tableLabel && (
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px]">table_restaurant</span>
              Mesa {tableLabel}
            </span>
          )}
        </header>

        {lines.length === 0 ? (
          <EmptyCart locationId={locationId} />
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {lines.map((line, i) => (
                <OrderItemRow key={line.menuItemId} line={line} index={i} />
              ))}
            </div>

            {/* Sugerencia de Copiloto AI */}
            <div className="bg-gradient-to-br from-tertiary-container to-tertiary p-4 rounded-xl mb-8 text-on-tertiary-container shadow-md border border-white/10">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary-fixed animate-pulse">
                  auto_awesome
                </span>
                <div>
                  <p className="font-label-md text-label-md mb-1">Sugerencia de Copiloto AI</p>
                  <p className="font-body-sm opacity-90">
                    ¿Sabías que acompañar tu pedido con nuestra <b>Salsa de Habanero Quemado</b> es
                    la opción más popular hoy? Pídela con tu mesero por solo $15.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <OrderSummary
                subtotalCents={subtotalCents}
                taxCents={taxCents}
                totalCents={totalCents}
              />
            </div>

            <div className="flex items-center gap-2 px-4 py-3 bg-secondary-fixed/30 rounded-lg mb-8 border border-secondary-fixed/50">
              <span className="material-symbols-outlined text-secondary text-lg">info</span>
              <p className="font-body-sm text-secondary">
                Tu pedido se enviará a cocina inmediatamente después de elegir una opción de pago.
              </p>
            </div>

            <PaymentActions onPay={handlePay} pending={createOrder.isPending} />
          </>
        )}
      </main>

      <CustomerBottomNav locationId={locationId} active="pedido" />
    </div>
  );
}

function EmptyCart({ locationId }: { locationId: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-16">
      <span className="material-symbols-outlined text-on-surface-variant text-[64px]">
        shopping_cart
      </span>
      <p className="font-body-md text-on-surface-variant">Tu pedido está vacío.</p>
      <Link
        href={`/menu/${locationId}`}
        className="px-6 py-3 btn-terracota-gradient rounded-full font-bold"
      >
        Ver el menú
      </Link>
    </div>
  );
}
