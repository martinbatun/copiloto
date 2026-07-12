"use client";

import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useInventory } from "@/lib/hooks/useInventory";
import { useRecommendationsFeed } from "@/lib/hooks/useOpsData";
import type {
  InventoryItem,
  InventoryListResponse,
  InventoryStatus,
  RecommendationDTO,
} from "@copiloto/shared";

export default function Page() {
  const { currentLocation } = useAuth();
  const inventory = useInventory(currentLocation?.id);
  const feed = useRecommendationsFeed(currentLocation?.id);

  const data = inventory.data;
  const loading = inventory.isLoading;
  const error = inventory.error;

  return (
    <AppShell>
      <Header data={data} loading={loading} />

      {error && <ErrorBanner message={String((error as Error).message)} />}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {loading || !data ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </>
        ) : (
          <>
            <KpiCard
              label="Valor Total Stock"
              value={formatMxn(data.summary.totalValueCents)}
              tone="default"
              hint={`+${data.summary.totalValueDeltaPct.toFixed(1)}% vs semana pasada`}
              hintTone="primary"
            />
            <KpiCard
              label="Merma Actual"
              value={`${data.summary.wastagePct.toFixed(1)}%`}
              tone="tertiary"
              hint={`Debajo del límite (${data.summary.wastageLimitPct.toFixed(1)}%)`}
            />
            <KpiCard
              label="Stockouts Evitados"
              value={String(data.summary.stockoutsAvoided)}
              tone="secondary"
              hint="Optimización vía IA"
              hintTone="secondary"
            />
            <KpiCard
              label="SKUs en Alerta"
              value={String(data.summary.alertCount)}
              tone="primary"
              hint="Requiere acción inmediata"
              hintTone="error"
            />
          </>
        )}
      </section>

      <section className="bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden">
        <div className="p-md border-b border-outline-variant flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-surface-container-low">
          <div className="flex items-center gap-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Control de Existencias
            </h2>
            <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Filtros activos
            </span>
          </div>
          <div className="flex gap-sm">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar SKU o categoría…"
                className="pl-10 pr-md py-2 border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all w-64 bg-white"
              />
            </div>
            <button className="bg-primary text-white px-md py-2 rounded-lg font-label-md flex items-center gap-xs hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Nuevo registro
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant">
                {["SKU", "Categoría", "Stock actual", "Par level", "Costo prom.", "Proveedor", "Estado"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-md py-3 font-label-md text-on-surface-variant text-sm whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {loading || !data
                ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
                : data.items.map((item) => <Row key={item.ingredientId} item={item} />)}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-sm mb-md">
          <span
            className="material-symbols-outlined text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Copiloto AI Insights
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {feed.isLoading || !feed.data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-surface-container-high/60 rounded-xl animate-pulse" />
            ))
          ) : feed.data.recommendations.length === 0 ? (
            <div className="md:col-span-2 bg-white border border-outline-variant card-shadow rounded-xl p-lg text-center text-on-surface-variant">
              Sin recomendaciones activas. El motor no detectó anomalías que requieran acción.
            </div>
          ) : (
            feed.data.recommendations.slice(0, 4).map((rec) => <InsightCard key={rec.id} rec={rec} />)
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Header({ data, loading }: { data: InventoryListResponse | undefined; loading: boolean }) {
  if (loading || !data) {
    return (
      <header>
        <div className="h-7 w-72 rounded bg-surface-container-high animate-pulse mb-2" />
        <div className="h-5 w-96 rounded bg-surface-container-high/70 animate-pulse" />
      </header>
    );
  }
  return (
    <header>
      <h1 className="font-headline-lg text-headline-lg text-on-surface">
        Inventario · {data.locationName}
      </h1>
      <p className="font-body-md text-on-surface-variant">
        {data.summary.activeSkus} SKUs activos ·{" "}
        <span className="text-primary font-bold">{data.summary.alertCount} alertas</span> · merma
        del mes {data.summary.wastagePct.toFixed(1)}% (objetivo{" "}
        {data.summary.wastageLimitPct.toFixed(1)}%)
      </p>
    </header>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4 flex items-center gap-3">
      <span className="material-symbols-outlined text-error">error</span>
      <div>
        <p className="font-bold">No pudimos cargar el inventario</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-white p-md rounded-xl border border-outline-variant card-shadow animate-pulse">
      <div className="h-3 w-24 bg-surface-container-high rounded" />
      <div className="h-9 w-32 bg-surface-container-high rounded mt-2" />
      <div className="h-3 w-28 bg-surface-container-high/70 rounded mt-2" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-md py-4">
          <div className="h-4 w-24 bg-surface-container-high/70 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function Row({ item }: { item: InventoryItem }) {
  const ratio = item.parSuggested > 0 ? item.currentQty / item.parSuggested : 1;
  const pct = Math.min(140, Math.round(ratio * 100));
  const status = item.statuses[0];
  const stockColor =
    status === "BAJO_PAR"
      ? "bg-error"
      : status === "ALERTA_PAR"
      ? "bg-secondary"
      : status === "EXCEDENTE"
      ? "bg-amber-500"
      : "bg-primary";
  const stockError = status === "BAJO_PAR";
  const rowTint = stockError ? "bg-error-container/5" : "";

  return (
    <tr className={`hover:bg-surface-container-lowest transition-colors ${rowTint}`}>
      <td className="px-md py-4">
        <div className="flex flex-col">
          <span className="font-bold text-on-surface">{item.name}</span>
          <span className="text-xs text-on-surface-variant">#{item.sku}</span>
        </div>
      </td>
      <td className="px-md py-4">
        {item.category && (
          <span className="bg-surface-container px-2 py-1 rounded text-xs text-on-surface-variant">
            {item.category}
          </span>
        )}
      </td>
      <td className="px-md py-4">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="flex justify-between text-xs mb-1">
            <span className={`font-bold ${stockError ? "text-error" : "text-on-surface"}`}>
              {formatQty(item.currentQty, item.baseUnit)}
            </span>
            <span className={stockError ? "text-error" : "text-on-surface-variant"}>{pct}%</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2">
            <div
              className={`${stockColor} h-2 rounded-full`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-md py-4">
        {item.parPrevious !== null ? (
          <div className="flex items-center gap-xs">
            <span className="text-body-sm">{formatQty(item.parPrevious, item.baseUnit)}</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">arrow_forward</span>
            <span className="bg-secondary-container/20 text-secondary px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              {formatQty(item.parSuggested, item.baseUnit)}
            </span>
          </div>
        ) : (
          <span className="text-body-sm">{formatQty(item.parSuggested, item.baseUnit)}</span>
        )}
      </td>
      <td className="px-md py-4 text-body-sm">
        {item.costPerUnitCents !== null
          ? `${formatMxn(item.costPerUnitCents)} /${item.baseUnit}`
          : "—"}
      </td>
      <td className="px-md py-4 text-body-sm text-on-surface-variant whitespace-nowrap">
        {item.supplierName ?? "—"}
      </td>
      <td className="px-md py-4">
        <div className="flex flex-col gap-1">
          {item.statuses.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: InventoryStatus }) {
  const map: Record<InventoryStatus, { label: string; className: string }> = {
    BAJO_PAR: { label: "BAJO PAR", className: "bg-error text-white" },
    ALERTA_PAR: { label: "ALERTA PAR", className: "bg-secondary-container/20 text-secondary" },
    OPTIMO: { label: "ÓPTIMO", className: "bg-primary/10 text-primary" },
    EXCEDENTE: { label: "EXCEDENTE", className: "bg-amber-100 text-amber-700" },
    CADUCA: { label: "CADUCA", className: "bg-error-container text-on-error-container" },
  };
  const { label, className } = map[status];
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-center whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
}

function KpiCard({
  label,
  value,
  tone,
  hint,
  hintTone,
}: {
  label: string;
  value: string;
  tone: "default" | "primary" | "secondary" | "tertiary";
  hint: string;
  hintTone?: "primary" | "secondary" | "error";
}) {
  const accent =
    tone === "primary"
      ? "border-l-4 border-l-primary"
      : tone === "tertiary"
      ? "border-l-4 border-l-tertiary"
      : "";
  const valueColor =
    tone === "primary"
      ? "text-primary"
      : tone === "secondary"
      ? "text-secondary"
      : tone === "tertiary"
      ? "text-tertiary"
      : "text-on-surface";
  const hintColor =
    hintTone === "primary"
      ? "text-primary font-bold"
      : hintTone === "secondary"
      ? "text-secondary font-bold"
      : hintTone === "error"
      ? "text-error font-bold"
      : "text-on-surface-variant";
  return (
    <div className={`bg-white p-md rounded-xl border border-outline-variant card-shadow ${accent}`}>
      <p className="text-on-surface-variant font-label-md">{label}</p>
      <div className="flex items-baseline gap-xs">
        <span className={`font-numeral-xl text-numeral-xl ${valueColor}`}>{value}</span>
      </div>
      <div className={`mt-xs text-sm ${hintColor}`}>{hint}</div>
    </div>
  );
}

// Ícono y color por tipo de recomendación (fallback seguro si aparece un kind
// nuevo). Los datos vienen del feed real (/api/recommendations/feed).
const REC_ICON: Record<string, { icon: string; tint: "primary" | "secondary" | "error"; border: string }> = {
  PAR_LEVEL_ADJUST: { icon: "inventory", tint: "secondary", border: "border-l-secondary" },
  WASTE_ALERT: { icon: "event_busy", tint: "error", border: "border-l-error" },
  MENU_REPRICE: { icon: "payments", tint: "primary", border: "border-l-primary" },
  MENU_PROMOTE: { icon: "campaign", tint: "primary", border: "border-l-primary" },
  DISCOUNT_REVIEW: { icon: "sell", tint: "secondary", border: "border-l-secondary" },
  PREP_LIST: { icon: "checklist", tint: "secondary", border: "border-l-secondary" },
  STAFFING_ADJUST: { icon: "groups", tint: "secondary", border: "border-l-secondary" },
  GUEST_CAMPAIGN: { icon: "mail", tint: "primary", border: "border-l-primary" },
  ANOMALY_TRIAGE: { icon: "warning", tint: "error", border: "border-l-error" },
  RECIPE_REFORMULATE: { icon: "restaurant", tint: "secondary", border: "border-l-secondary" },
};
const REC_FALLBACK = { icon: "auto_awesome", tint: "secondary" as const, border: "border-l-secondary" };

function InsightCard({ rec }: { rec: RecommendationDTO }) {
  const tintMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    error: "bg-error/10 text-error",
  };
  const style = REC_ICON[rec.kind] ?? REC_FALLBACK;
  const impact =
    rec.estimatedImpactCents != null
      ? `$${(rec.estimatedImpactCents / 100).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`
      : null;
  return (
    <div
      className={`bg-white border border-outline-variant card-shadow rounded-xl p-md flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center hover:-translate-y-0.5 transition-all border-l-4 ${style.border}`}
    >
      <div className="flex items-center gap-md">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tintMap[style.tint]}`}>
          <span className="material-symbols-outlined text-[24px]">{style.icon}</span>
        </div>
        <div>
          <h4 className="font-bold text-on-surface">{rec.title}</h4>
          <p className="text-body-sm text-on-surface-variant">{rec.rationale}</p>
        </div>
      </div>
      {impact && (
        <span className={`shrink-0 px-3 py-1 rounded-full font-label-md text-xs whitespace-nowrap ${tintMap[style.tint]}`}>
          impacto {impact}
        </span>
      )}
    </div>
  );
}

function formatMxn(cents: number): string {
  const n = cents / 100;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatQty(qty: number, unit: string): string {
  const rounded = Number.isInteger(qty) ? qty : Number(qty.toFixed(1));
  return `${rounded}${unit}`;
}
