"use client";

import { useMemo } from "react";
import type { KpiTrendPoint } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useKpiSummary } from "@/lib/hooks/useOpsData";
import { formatMoney } from "@/lib/format";

export default function Page() {
  const { currentLocation } = useAuth();
  const { data: kpi, isLoading, error } = useKpiSummary(currentLocation?.id);

  const revenue14 = useMemo(() => (kpi ? kpi.trend.reduce((a, t) => a + t.revenueCents, 0) : 0), [kpi]);

  return (
    <AppShell>
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          KPIs{currentLocation ? ` · ${currentLocation.name}` : ""}
        </h1>
        <p className="text-on-surface-variant font-body-md">Indicadores operativos con base en tus ventas.</p>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar los KPIs</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {isLoading || !kpi ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-container-high/70 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard label="Ventas 14 días" value={formatMoney(revenue14)} accent="border-l-primary" />
            <KpiCard label="Ventas de hoy" value={formatMoney(kpi.today.revenueCents)} accent="border-l-secondary" delta={`${kpi.revenueDeltaPct >= 0 ? "+" : ""}${kpi.revenueDeltaPct}% vs ayer`} deltaUp={kpi.revenueDeltaPct >= 0} />
            <KpiCard label="Ticket promedio" value={formatMoney(kpi.today.avgTicketCents)} accent="border-l-tertiary" />
            <KpiCard label="Food cost promedio" value={`${kpi.foodCostPct}%`} accent="border-l-on-surface" deltaTone={kpi.foodCostPct >= 30 ? "error" : "primary"} delta={kpi.foodCostPct >= 30 ? "sobre objetivo" : "en objetivo"} deltaUp={kpi.foodCostPct < 30} />
          </>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <section className="lg:col-span-8 bg-white border border-outline-variant rounded-xl p-lg card-shadow">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Ingresos · últimos 14 días</h3>
          {kpi ? <RevenueChart trend={kpi.trend} /> : <div className="h-56 bg-surface-container-high/60 rounded animate-pulse" />}
        </section>

        <section className="lg:col-span-4 bg-white border border-outline-variant rounded-xl p-lg card-shadow">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Menu mix (30 días)</h3>
          <div className="flex flex-col gap-3">
            {kpi?.menuMix.length ? (
              kpi.menuMix.map((m) => (
                <div key={m.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface font-label-md truncate">{m.name}</span>
                    <span className="text-on-surface-variant whitespace-nowrap ml-2">{m.qty} ud</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.max(4, (m.revenueCents / kpi.menuMix[0]!.revenueCents) * 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-on-surface-variant">{formatMoney(m.revenueCents)}</p>
                </div>
              ))
            ) : (
              <p className="text-on-surface-variant text-sm">Sin datos de ventas.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function RevenueChart({ trend }: { trend: KpiTrendPoint[] }) {
  const max = Math.max(1, ...trend.map((t) => t.revenueCents));
  return (
    <div className="h-56 flex items-end justify-between gap-1.5">
      {trend.map((t) => (
        <div key={t.date} className="flex-1 h-full flex flex-col items-center justify-end" title={`${t.date}: ${formatMoney(t.revenueCents)}`}>
          <div className="w-full bg-primary rounded-t hover:bg-primary-container transition-colors" style={{ height: `${Math.max(2, (t.revenueCents / max) * 100)}%` }} />
          <span className="text-[9px] text-on-surface-variant mt-1">{t.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
  delta,
  deltaUp,
  deltaTone,
}: {
  label: string;
  value: string;
  accent: string;
  delta?: string;
  deltaUp?: boolean;
  deltaTone?: "primary" | "error";
}) {
  const tone = deltaTone ?? (deltaUp ? "primary" : "error");
  return (
    <div className={`bg-white p-md rounded-xl card-shadow border border-outline-variant border-l-4 ${accent}`}>
      <span className="font-label-md text-on-surface-variant">{label}</span>
      <p className="font-numeral-xl text-numeral-xl text-on-surface mt-xs">{value}</p>
      {delta && (
        <div className={`flex items-center gap-xs mt-1 ${tone === "primary" ? "text-primary" : "text-error"}`}>
          <span className="material-symbols-outlined text-[16px]">{deltaUp ? "trending_up" : "trending_down"}</span>
          <span className="font-body-sm">{delta}</span>
        </div>
      )}
    </div>
  );
}
