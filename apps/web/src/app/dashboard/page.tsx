"use client";

import type { KpiMenuMixItem, KpiTrendPoint, RecommendationDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useKpiSummary, useRecommendationsFeed } from "@/lib/hooks/useOpsData";
import { formatMoney } from "@/lib/format";

export default function Page() {
  const { user, currentLocation } = useAuth();
  const locationId = currentLocation?.id;
  const { data: kpi, isLoading, error } = useKpiSummary(locationId);
  const { data: feed } = useRecommendationsFeed(locationId);

  const firstName = user?.name?.split(" ")[0] ?? "";
  const recs = feed?.recommendations.filter((r) => r.status !== "EXECUTED").slice(0, 3) ?? [];

  return (
    <AppShell>
      <section className="bg-white rounded-[20px] p-6 md:p-9 card-shadow flex flex-col lg:flex-row justify-between gap-lg border border-outline-variant copiloto-gradient">
        <div className="flex-1 flex flex-col justify-center gap-6">
          <div>
            <h1 className="font-display-md text-[30px] font-bold text-on-surface mb-2">
              Hola{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="font-body-md text-on-surface-variant">
              {kpi ? (
                <>Forecast de hoy: <span className="font-bold text-on-surface">{kpi.forecastCoversToday} covers</span> proyectados.</>
              ) : (
                "Cargando el pulso de tu turno…"
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Chip icon="local_fire_department" tone="primary" label={`${kpi?.counts.ordersActive ?? 0} órdenes en cocina`} />
            <Chip icon="auto_awesome" tone="primary" label={`${kpi?.counts.recommendationsPending ?? 0} recomendaciones`} />
            <Chip icon="warning" tone="secondary" label={`${kpi?.counts.anomaliesToday ?? 0} anomalías`} />
            <Chip icon="calendar_month" tone="info" label={`${kpi?.counts.reservationsToday ?? 0} reservas`} />
          </div>
        </div>
        <div className="w-full lg:w-[320px] bg-surface-container-lowest p-6 rounded-xl border border-outline-variant card-shadow">
          <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider mb-4">Pulso del turno</h3>
          <div className="flex flex-col gap-4">
            <PulseRow label="Ventas de hoy" value={kpi ? formatMoney(kpi.today.revenueCents) : "—"} tone="ok" />
            <PulseRow label="Ticket promedio" value={kpi ? formatMoney(kpi.today.avgTicketCents) : "—"} tone="ok" />
            <PulseRow label="Food cost" value={kpi ? `${kpi.foodCostPct}%` : "—"} tone={kpi && kpi.foodCostPct >= 30 ? "warn" : "ok"} />
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar el tablero</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {isLoading || !kpi ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-container-high/70 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard label="Ventas del día" value={formatMoney(kpi.today.revenueCents)} delta={`${kpi.revenueDeltaPct >= 0 ? "+" : ""}${kpi.revenueDeltaPct}% vs ayer`} deltaUp={kpi.revenueDeltaPct >= 0} />
            <KpiCard label="Ticket promedio" value={formatMoney(kpi.today.avgTicketCents)} />
            <KpiCard label="Food cost promedio" value={`${kpi.foodCostPct}%`} />
            <KpiCard label="Covers de hoy" value={String(kpi.today.covers)} footer={`${kpi.today.tickets} tickets`} />
          </>
        )}
      </section>

      {recs.length > 0 && (
        <section className="bg-white rounded-[20px] border border-primary/20 card-shadow overflow-hidden">
          <div className="p-6 border-b border-primary/10 flex items-center gap-3">
            <span className="material-symbols-outlined" style={{ color: "#F59E0B", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h2 className="font-display-md text-[18px] font-bold text-on-surface">
              Tu co-piloto tiene {recs.length} {recs.length === 1 ? "acción" : "acciones"} para ti
            </h2>
          </div>
          <div className="flex flex-col">
            {recs.map((r) => (
              <InsightRow key={r.id} rec={r} />
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[20px] border border-outline-variant card-shadow">
          <h3 className="font-display-md text-[18px] font-bold text-on-surface mb-6">Ventas · últimos 14 días</h3>
          {kpi ? <RevenueChart trend={kpi.trend} /> : <div className="h-40 bg-surface-container-high/60 rounded animate-pulse" />}
        </div>
        <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-[20px] border border-outline-variant card-shadow">
          <h3 className="font-display-md text-[18px] font-bold mb-6 text-on-surface">Top platillos (30 días)</h3>
          <div className="flex flex-col gap-3">
            {kpi?.menuMix.length ? kpi.menuMix.map((m) => <MixRow key={m.name} item={m} max={kpi.menuMix[0]!.revenueCents} />) : (
              <p className="text-on-surface-variant text-sm">Sin ventas registradas.</p>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function RevenueChart({ trend }: { trend: KpiTrendPoint[] }) {
  const max = Math.max(1, ...trend.map((t) => t.revenueCents));
  return (
    <div className="h-48 flex items-end justify-between gap-1">
      {trend.map((t) => (
        <div key={t.date} className="flex-1 h-full flex flex-col items-center justify-end group" title={`${t.date}: ${formatMoney(t.revenueCents)}`}>
          <div
            className="w-full bg-primary rounded-t-sm hover:bg-primary-container transition-colors"
            style={{ height: `${Math.max(2, (t.revenueCents / max) * 100)}%` }}
          />
          <span className="text-[9px] text-on-surface-variant mt-1">{t.date.slice(8)}</span>
        </div>
      ))}
    </div>
  );
}

function MixRow({ item, max }: { item: KpiMenuMixItem; max: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-on-surface font-label-md truncate">{item.name}</span>
        <span className="text-on-surface-variant whitespace-nowrap ml-2">{formatMoney(item.revenueCents)}</span>
      </div>
      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${Math.max(4, (item.revenueCents / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function Chip({ icon, label, tone }: { icon: string; label: string; tone: "primary" | "secondary" | "info" }) {
  const color = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-blue-500";
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline-variant rounded-full card-shadow">
      <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
      <span className="text-sm font-semibold text-on-surface">{label}</span>
    </div>
  );
}

function PulseRow({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "bad" }) {
  const dot = tone === "ok" ? "bg-emerald-500" : tone === "warn" ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-on-surface">{value}</span>
        <span className={`w-2 h-2 rounded-full ${dot}`} />
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, deltaUp, footer }: { label: string; value: string; delta?: string; deltaUp?: boolean; footer?: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-outline-variant card-shadow flex flex-col gap-2">
      <span className="text-on-surface-variant font-label-md">{label}</span>
      <span className="font-display-md text-[28px] font-extrabold text-on-surface">{value}</span>
      {delta && (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold w-fit ${deltaUp ? "text-emerald-600 bg-emerald-50" : "text-error bg-error-container/40"}`}>
          <span className="material-symbols-outlined text-[14px]">{deltaUp ? "arrow_upward" : "arrow_downward"}</span>
          {delta}
        </span>
      )}
      {footer && <span className="text-xs font-medium text-on-surface-variant">{footer}</span>}
    </div>
  );
}

function InsightRow({ rec }: { rec: RecommendationDTO }) {
  const border = rec.kind === "ANOMALY_TRIAGE" || rec.kind === "WASTE_ALERT" ? "border-error" : rec.kind === "GUEST_CAMPAIGN" ? "border-blue-500" : "border-primary";
  return (
    <div className={`p-5 border-l-[4px] ${border} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant/50 last:border-b-0`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-on-surface">{rec.title}</span>
          {rec.estimatedImpactCents != null && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
              +{formatMoney(rec.estimatedImpactCents)}
            </span>
          )}
        </div>
        <p className="text-sm text-on-surface-variant">{rec.rationale}</p>
      </div>
    </div>
  );
}
