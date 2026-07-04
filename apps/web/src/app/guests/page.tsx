"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { GuestDTO, GuestSegmentDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useGuests } from "@/lib/hooks/useGuests";
import { formatMoney } from "@/lib/format";

export default function Page() {
  const { data, isLoading, error } = useGuests();

  return (
    <AppShell>
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Huéspedes</h1>
        <p className="text-on-surface-variant font-body-md">
          Gestiona la base de datos de clientes y fidelización.
        </p>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar los huéspedes</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {isLoading || !data ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-high/70 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard icon="grade" tint="primary" label="VIPs activos" value={String(data.summary.vips)} />
            <KpiCard
              icon="warning"
              tint="error"
              label="En riesgo de churn"
              value={String(data.summary.churnRisk)}
            />
            <KpiCard
              icon="calendar_today"
              tint="secondary"
              label="Visitas promedio"
              value={String(data.summary.avgVisits)}
            />
          </>
        )}
      </section>

      {data && data.segments.length > 0 && (
        <div>
          <h2 className="font-headline-sm text-headline-sm mb-md text-on-surface">
            Segmentos estratégicos
          </h2>
          <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {data.segments.map((s) => (
              <SegmentCard key={s.id} segment={s} />
            ))}
          </section>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-outline-variant card-shadow overflow-hidden">
        <div className="p-md border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Listado de huéspedes</h3>
          <button className="flex items-center gap-xs px-sm py-xs bg-primary text-white rounded-lg font-label-md shadow-sm">
            <span className="material-symbols-outlined text-[18px]">person_add</span> Nuevo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-md">
              <tr>
                <th className="px-md py-sm">Huésped</th>
                <th className="px-md py-sm">Categoría</th>
                <th className="px-md py-sm">Última visita</th>
                <th className="px-md py-sm">Gasto total</th>
              </tr>
            </thead>
            <tbody className="text-body-sm divide-y divide-outline-variant/60">
              {isLoading || !data ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-md py-md">
                        <div className="h-4 w-24 bg-surface-container-high/70 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.guests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-md py-xl text-center text-on-surface-variant">
                    Aún no hay huéspedes registrados.
                  </td>
                </tr>
              ) : (
                data.guests.map((g) => <GuestRow key={g.id} guest={g} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function GuestRow({ guest }: { guest: GuestDTO }) {
  const initials = guest.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
  const lastVisit = guest.lastVisitAt
    ? formatDistanceToNow(new Date(guest.lastVisitAt), { addSuffix: true, locale: es })
    : "—";
  return (
    <tr className={`transition-colors ${guest.birthdayToday ? "bg-primary/5" : "hover:bg-surface-container-low"}`}>
      <td className="px-md py-md">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-bold text-[12px]">
            {initials}
          </div>
          <div>
            <p className="font-bold text-on-surface">{guest.name}</p>
            {guest.birthdayToday ? (
              <span className="text-[10px] text-primary flex items-center gap-xs font-bold uppercase tracking-tight">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  cake
                </span>
                Cumple hoy
              </span>
            ) : (
              <span className="text-[10px] text-on-surface-variant">{guest.email ?? ""}</span>
            )}
          </div>
        </div>
      </td>
      <td className="px-md py-md">
        <CategoryBadge cat={guest.category} />
      </td>
      <td className="px-md py-md">{lastVisit}</td>
      <td className="px-md py-md font-bold">{formatMoney(guest.totalSpentCents)}</td>
    </tr>
  );
}

function KpiCard({
  icon,
  tint,
  label,
  value,
}: {
  icon: string;
  tint: "primary" | "secondary" | "error";
  label: string;
  value: string;
}) {
  const tintMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    error: "bg-error-container text-error",
  };
  return (
    <div className="bg-white p-md rounded-xl border border-outline-variant flex items-center gap-md card-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tintMap[tint]}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-on-surface-variant font-label-md">{label}</p>
        <p className="font-numeral-xl text-primary text-[32px]">{value}</p>
      </div>
    </div>
  );
}

const SEGMENT_STYLE: Record<
  GuestSegmentDTO["kind"],
  { border: string; color: string; icon: string; desc: string }
> = {
  VIP: { border: "border-primary", color: "text-primary", icon: "workspace_premium", desc: "Clientes con más visitas anuales." },
  BIG_SPENDER: { border: "border-tertiary", color: "text-tertiary", icon: "restaurant", desc: "Consumo alto en especialidades." },
  FIRST_VISIT: { border: "border-secondary", color: "text-secondary", icon: "fiber_new", desc: "Primera visita reciente." },
  CHURN_RISK: { border: "border-error", color: "text-error", icon: "heart_broken", desc: "Sin visitas hace tiempo." },
  LAPSED: { border: "border-error", color: "text-error", icon: "heart_broken", desc: "Clientes perdidos." },
  REGULAR: { border: "border-outline", color: "text-on-surface-variant", icon: "group", desc: "Clientes recurrentes." },
};

function SegmentCard({ segment }: { segment: GuestSegmentDTO }) {
  const s = SEGMENT_STYLE[segment.kind];
  return (
    <div className={`bg-white border-l-4 ${s.border} p-md rounded-xl card-shadow hover:-translate-y-1 transition-transform`}>
      <span className={`material-symbols-outlined ${s.color} mb-xs`}>{s.icon}</span>
      <p className="font-bold text-on-surface">{segment.name}</p>
      <p className="text-body-sm text-on-surface-variant">{s.desc}</p>
      <p className={`${s.color} font-bold mt-sm`}>
        {segment.count} {segment.count === 1 ? "huésped" : "huéspedes"}
      </p>
    </div>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    VIP: "bg-primary/10 text-primary",
    Foodie: "bg-tertiary/10 text-tertiary",
    Nuevo: "bg-secondary/10 text-secondary",
    Riesgo: "bg-error-container text-error",
    Habitual: "bg-surface-container-high text-on-surface-variant",
  };
  return (
    <span
      className={`px-xs py-[2px] rounded font-bold text-[10px] uppercase ${
        map[cat] ?? "bg-surface-container-high text-on-surface-variant"
      }`}
    >
      {cat}
    </span>
  );
}
