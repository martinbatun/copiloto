"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@copiloto/ui";
import {
  LayoutDashboard,
  Bot,
  TrendingUp,
  Users,
  Soup,
  Package,
  CalendarClock,
  AlertTriangle,
  Megaphone,
  MapPin,
  Settings,
  ScrollText,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/copilot", label: "Co-piloto", icon: Bot },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
  { href: "/schedule", label: "Staffing", icon: CalendarClock },
  { href: "/inventory", label: "Inventario", icon: Package },
  { href: "/recipes", label: "Recetas", icon: Soup },
  { href: "/anomalies", label: "Anomalías", icon: AlertTriangle },
  { href: "/guests", label: "Huéspedes", icon: Users },
  { href: "/campaigns", label: "Campañas", icon: Megaphone },
  { href: "/reservations", label: "Reservas", icon: ScrollText },
  { href: "/locations", label: "Sucursales", icon: MapPin },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <Link href="/dashboard" className="font-display text-lg font-bold">
            copiloto
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}
