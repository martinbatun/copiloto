"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { RecommendationDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useRecommendationsFeed } from "@/lib/hooks/useOpsData";
import { formatMoney } from "@/lib/format";

export default function Page() {
  const { currentLocation } = useAuth();
  const { data, isLoading, error } = useRecommendationsFeed(currentLocation?.id);

  return (
    <AppShell>
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Anomalías y recomendaciones
        </h1>
        <p className="text-on-surface-variant font-body-md mt-1">
          Acciones inteligentes basadas en la operación en tiempo real.
        </p>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar el feed</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {isLoading || !data ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-container-high/70 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard label="Anomalías hoy" value={String(data.summary.anomaliesToday)} accent="bg-error" icon="warning" iconBg="bg-error-container" iconColor="text-error" />
            <KpiCard label="ROI proyectado (pendientes)" value={formatMoney(data.summary.roiProjectedCents)} accent="bg-secondary-container" icon="attach_money" iconBg="bg-secondary-fixed" iconColor="text-on-secondary-container" />
            <KpiCard label="Recomendaciones aplicadas" value={String(data.summary.appliedCount)} accent="bg-primary" icon="verified" iconBg="bg-primary-fixed" iconColor="text-primary" />
          </>
        )}
      </section>

      <section>
        <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-sm text-on-surface">
          Recomendaciones prioritarias
          <span className="bg-primary-container text-white text-[12px] px-2 py-0.5 rounded-full">IA activa</span>
        </h3>
        <div className="flex flex-col gap-sm">
          {isLoading || !data ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface-container-high/70 rounded-xl animate-pulse" />
            ))
          ) : data.recommendations.length === 0 ? (
            <p className="text-on-surface-variant text-center py-8">Sin recomendaciones por ahora.</p>
          ) : (
            data.recommendations.map((r) => <RecCard key={r.id} rec={r} />)
          )}
        </div>
      </section>
    </AppShell>
  );
}

function KpiCard({
  label,
  value,
  accent,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  accent: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white p-lg rounded-xl card-shadow border border-outline-variant relative overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-1 ${accent}`} />
      <div className="flex justify-between items-start">
        <div>
          <p className="font-label-md text-on-surface-variant uppercase tracking-wider">{label}</p>
          <h2 className="font-numeral-xl text-numeral-xl text-on-surface mt-xs">{value}</h2>
        </div>
        <div className={`p-sm rounded-lg ${iconBg} ${iconColor}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </div>
  );
}

// Estilo de la card según kind/status.
function recStyle(rec: RecommendationDTO): {
  border: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  tag: string;
  tagClass: string;
  muted?: boolean;
} {
  if (rec.status === "EXECUTED") {
    return { border: "border-outline", icon: "check_circle", iconBg: "bg-surface-container-highest", iconColor: "text-outline", tag: "Ejecutada", tagClass: "bg-outline text-white", muted: true };
  }
  if (rec.kind === "ANOMALY_TRIAGE" || rec.kind === "WASTE_ALERT") {
    return { border: "border-error", icon: "report", iconBg: "bg-error-container", iconColor: "text-error", tag: "Anomalía", tagClass: "bg-error-container text-on-error-container" };
  }
  if (rec.kind === "GUEST_CAMPAIGN") {
    return { border: "border-primary", icon: "person_alert", iconBg: "bg-primary-fixed", iconColor: "text-primary", tag: "Oportunidad", tagClass: "bg-primary-fixed text-on-primary-fixed-variant" };
  }
  return { border: "border-secondary-container", icon: "bolt", iconBg: "bg-secondary-fixed", iconColor: "text-on-secondary-container", tag: "Alta prioridad", tagClass: "bg-secondary-fixed text-on-secondary-fixed-variant" };
}

function RecCard({ rec }: { rec: RecommendationDTO }) {
  const s = recStyle(rec);
  const meta = rec.expiresAt
    ? `Vence ${formatDistanceToNow(new Date(rec.expiresAt), { addSuffix: true, locale: es })}`
    : rec.status === "EXECUTED"
    ? formatDistanceToNow(new Date(rec.createdAt), { addSuffix: true, locale: es })
    : null;
  return (
    <div className={`${s.muted ? "bg-surface-container-low opacity-80" : "bg-white"} border-l-4 ${s.border} p-md rounded-xl card-shadow flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:translate-x-1 transition-transform`}>
      <div className={`w-12 h-12 rounded-full ${s.iconBg} flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined ${s.iconColor}`}>{s.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-xs mb-xs flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${s.tagClass}`}>{s.tag}</span>
          {meta && <span className="text-on-surface-variant font-label-md">• {meta}</span>}
        </div>
        <h4 className={`font-headline-sm text-[17px] ${s.muted ? "text-outline" : "text-on-surface"}`}>{rec.title}</h4>
        <p className="text-on-surface-variant text-body-sm">{rec.rationale}</p>
      </div>
      {rec.estimatedImpactCents != null && (
        <div className="text-right shrink-0">
          <div className="text-secondary font-bold text-headline-sm">+{formatMoney(rec.estimatedImpactCents)}</div>
          <div className="text-on-surface-variant text-[12px]">ROI estimado</div>
        </div>
      )}
    </div>
  );
}
