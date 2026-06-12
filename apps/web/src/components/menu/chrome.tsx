"use client";

import Link from "next/link";
import { useCart } from "@/components/menu/CartProvider";

/** Top app bar del menú del cliente — logo Copiloto + carrito con badge. */
export function CustomerTopBar({ locationId }: { locationId: string }) {
  const { count } = useCart();
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 glass-nav border-b border-outline-variant/30 flex items-center justify-between px-margin-mobile">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-2xl">restaurant</span>
        <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
          Copiloto
        </span>
      </div>
      <Link
        href={`/menu/${locationId}/pedido`}
        aria-label="Ver mi pedido"
        className="relative p-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 text-on-surface-variant"
      >
        <span className="material-symbols-outlined">shopping_cart</span>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-on-primary rounded-full text-[10px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
    </header>
  );
}

type Tab = "menu" | "pedido" | "asistencia";

function NavTab({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-5 py-1 transition-all active:scale-90"
          : "flex flex-col items-center justify-center text-on-surface-variant p-2 hover:text-primary transition-all active:scale-90"
      }
    >
      <span
        className="material-symbols-outlined"
        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <span className="font-label-md text-label-md">{label}</span>
    </Link>
  );
}

/** Bottom nav: Menú / Mi Pedido / Asistencia. */
export function CustomerBottomNav({
  locationId,
  active,
}: {
  locationId: string;
  active: Tab;
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass-nav border-t border-outline-variant/30 shadow-[0_-1px_4px_rgba(0,0,0,0.06)] rounded-t-xl flex justify-around items-center h-20 px-4 pb-safe">
      <NavTab
        href={`/menu/${locationId}`}
        icon="menu_book"
        label="Menú"
        active={active === "menu"}
      />
      <NavTab
        href={`/menu/${locationId}/pedido`}
        icon="receipt_long"
        label="Mi Pedido"
        active={active === "pedido"}
      />
      <NavTab
        href={`/menu/${locationId}/asistencia`}
        icon="live_help"
        label="Asistencia"
        active={active === "asistencia"}
      />
    </nav>
  );
}
