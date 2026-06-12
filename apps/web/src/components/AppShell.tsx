"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@copiloto/ui";
import { useAuth } from "@/components/AuthProvider";
import { useOpsOrders } from "@/lib/hooks/useOrders";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Tablero", icon: "dashboard" },
  { href: "/orders", label: "Pedidos", icon: "room_service" },
  { href: "/copilot", label: "Co-piloto", icon: "auto_awesome" },
  { href: "/forecast", label: "Forecast", icon: "trending_up" },
  { href: "/schedule", label: "Schedule", icon: "calendar_today" },
  { href: "/inventory", label: "Inventario", icon: "inventory_2" },
  { href: "/recipes", label: "Recetas", icon: "menu_book" },
  { href: "/kpis", label: "KPIs", icon: "leaderboard" },
];

const MORE_NAV: NavItem[] = [
  { href: "/anomalies", label: "Anomalías", icon: "warning" },
  { href: "/guests", label: "Huéspedes", icon: "groups" },
  { href: "/reservations", label: "Reservas", icon: "event_available" },
  { href: "/campaigns", label: "Campañas", icon: "campaign" },
  { href: "/invoices", label: "Facturas", icon: "receipt_long" },
  { href: "/suppliers", label: "Proveedores", icon: "store" },
  { href: "/simulator", label: "Simulador", icon: "tune" },
  { href: "/admin", label: "Admin", icon: "settings" },
];

/** Pastilla de conteo para avisos en el nav (pedidos nuevos sin atender). */
function NavBadge({ count }: { count: number }) {
  return (
    <span className="ml-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-on-primary rounded-full text-[10px] font-bold inline-flex items-center justify-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavLink({
  item,
  active,
  badge,
}: {
  item: NavItem;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all whitespace-nowrap",
        active
          ? "tab-active"
          : "text-on-surface-variant hover:bg-surface-container-low"
      )}
    >
      <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
      <span className="font-label-md text-[13px]">{item.label}</span>
      {badge ? <NavBadge count={badge} /> : null}
    </Link>
  );
}

function MoreMenu({
  items,
  isActive,
}: {
  items: NavItem[];
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const anyActive = items.some((i) => isActive(i.href));

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all whitespace-nowrap",
          anyActive || open
            ? "tab-active"
            : "text-on-surface-variant hover:bg-surface-container-low"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[15px]">more_horiz</span>
        <span className="font-label-md text-[13px]">Más</span>
        <span className="material-symbols-outlined text-[14px]">expand_more</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 w-60 bg-white border border-outline-variant rounded-xl shadow-lg p-1 z-50"
        >
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  active
                    ? "tab-active"
                    : "text-on-surface hover:bg-surface-container-low"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="font-label-md text-[14px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BranchSwitcher({
  locations,
  currentId,
  onChange,
}: {
  locations: { id: string; name: string; slug: string }[];
  currentId: string | undefined;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = locations.find((l) => l.id === currentId);
  if (locations.length === 0) return null;

  return (
    <div className="relative hidden lg:block ml-1 shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-canvas border border-outline-variant rounded-full hover:bg-surface-container-high transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[13px] text-primary">
          location_on
        </span>
        <span className="text-[13px] font-bold text-on-surface">
          {current?.name ?? "Sucursal"}
        </span>
        <span className="material-symbols-outlined text-[13px] text-on-surface-variant">
          expand_more
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 w-60 bg-white border border-outline-variant rounded-xl shadow-lg p-1 z-50"
        >
          {locations.map((loc) => {
            const active = loc.id === currentId;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  onChange(loc.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  active
                    ? "tab-active"
                    : "text-on-surface hover:bg-surface-container-low"
                )}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {active ? "radio_button_checked" : "location_on"}
                </span>
                <span className="font-label-md text-[14px]">{loc.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileMenu({
  items,
  isActive,
  badges,
}: {
  items: NavItem[];
  isActive: (href: string) => boolean;
  badges?: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const totalBadge = Object.values(badges ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="relative xl:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
        aria-label="Abrir menú"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">menu</span>
        {totalBadge > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border border-white" />
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 w-64 bg-white border border-outline-variant rounded-xl shadow-lg p-1 z-50 max-h-[80vh] overflow-y-auto"
        >
          {items.map((item) => {
            const active = isActive(item.href);
            const badge = badges?.[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  active
                    ? "tab-active"
                    : "text-on-surface hover:bg-surface-container-low"
                )}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="font-label-md text-[14px] flex-1">{item.label}</span>
                {badge ? <NavBadge count={badge} /> : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, locations, currentLocation, setCurrentLocationId, logout, isLoading } =
    useAuth();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Badge de "pedidos nuevos sin atender" = pedidos en estado PLACED de la
  // sucursal activa. Comparte la query key del board (React Query dedupe), así
  // que no genera fetch extra cuando ya estás en /orders.
  const { data: ordersData } = useOpsOrders(currentLocation?.id);
  const pendingOrders =
    ordersData?.orders.filter((o) => o.status === "PLACED").length ?? 0;
  const navBadges: Record<string, number> = pendingOrders
    ? { "/orders": pendingOrders }
    : {};

  // Iniciales del usuario para el avatar; "?" mientras carga.
  const initials =
    user?.name
      ?.split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "?";

  // Mientras /me todavia no resuelve, dejamos el shell visible pero los
  // bloques que dependen de la sesion se ven en estado neutral (no rompe SSR).
  if (isLoading && !user) {
    return (
      <div className="main-canvas min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
            progress_activity
          </span>
          <p className="font-label-md">Cargando sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[64px] z-50 glass-nav px-4 lg:px-margin-desktop flex items-center justify-between gap-3">
        <div className="flex items-center gap-md min-w-0">
          {/* Mobile menu (xl-) */}
          <MobileMenu
            items={[...PRIMARY_NAV, ...MORE_NAV]}
            isActive={isActive}
            badges={navBadges}
          />

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-xs shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[14px] text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                cooking
              </span>
            </div>
            <span className="font-display-md text-[15px] font-extrabold tracking-tight text-primary">
              Copiloto
            </span>
          </Link>

          {/* Branch switcher real */}
          <BranchSwitcher
            locations={locations}
            currentId={currentLocation?.id}
            onChange={setCurrentLocationId}
          />

          {/* Primary nav + Más dropdown — un solo bloque, sin segunda fila */}
          <nav className="hidden xl:flex items-center gap-base ml-2">
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
                badge={navBadges[item.href]}
              />
            ))}
            <MoreMenu items={MORE_NAV} isActive={isActive} />
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Search */}
          <button
            type="button"
            className="hidden 2xl:flex items-center gap-2 px-3 py-2 bg-canvas border border-outline-variant rounded-full text-on-surface-variant hover:border-primary transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span className="text-[13px] w-24 text-left">Buscar…</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-outline-variant rounded text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            className="2xl:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
            aria-label="Buscar"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
          </button>

          {/* Profile */}
          <div
            title={user?.name ?? ""}
            className="w-[38px] h-[38px] bg-primary-fixed rounded-full flex items-center justify-center font-bold text-primary text-sm ring-2 ring-white shadow-sm"
          >
            {initials}
          </div>

          {/* Logout real */}
          <button
            type="button"
            onClick={logout}
            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-on-surface-variant hover:text-error hover:bg-error-container transition-colors"
            aria-label="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      <main className="main-canvas pt-[88px] pb-xl px-4 sm:px-6 lg:px-margin-desktop">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-gutter">
          {children}
        </div>
      </main>

      {/* Floating AI Prompt */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          type="button"
          className="flex items-center gap-3 px-6 py-4 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group overflow-hidden relative"
          style={{ background: "#D9532A" }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span className="font-bold tracking-tight">Solicitar IA Insight</span>
        </button>
      </div>
    </>
  );
}
