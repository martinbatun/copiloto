"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { ForecastDayDTO, ForecastDaypartDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useForecast } from "@/lib/hooks/useOpsData";
import { formatMoney } from "@/lib/format";

const DAYPART_LABEL: Record<string, string> = {
  BREAKFAST: "Desayuno",
  BRUNCH: "Brunch",
  LUNCH: "Comida",
  AFTERNOON: "Tarde",
  DINNER: "Cena",
  LATE_NIGHT: "Late night",
};

export default function Page() {
  const { currentLocation } = useAuth();
  const { data, isLoading, error } = useForecast(currentLocation?.id);

  return (
    <AppShell>
      <header>
        <h1 className="font-display-md text-display-md font-bold text-on-surface">Motor de demanda</h1>
        <p className="font-body-sm text-on-surface-variant">
          Pronóstico 7 días por sucursal{data ? <> · MAPE <span className="text-primary font-bold">{data.summary.mapePct}%</span> · objetivo &lt;10%</> : null}
        </p>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar el pronóstico</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-high/70 rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <KpiCard accent="border-l-primary" label="MAPE 7d" value={`${data.summary.mapePct}%`} badge={data.summary.mapePct < 10 ? "objetivo <10%" : "sobre objetivo"} badgeTone={data.summary.mapePct < 10 ? "emerald" : "amber"} />
            <KpiCard accent="border-l-secondary-container" label="Confianza promedio" value={`${data.summary.avgConfidencePct}%`} />
            <KpiCard accent="border-l-tertiary" label="Covers pronosticados 7d" value={data.summary.covers7d.toLocaleString("es-MX")} />
            <KpiCard accent="border-l-primary-container" label="Ingreso proyectado 7d" value={formatMoney(data.summary.revenue7dCents)} />
          </>
        )}
      </section>

      <section className="bg-white p-6 md:p-lg rounded-xl border border-outline-variant card-shadow">
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">
          Covers pronosticados · próximos 7 días
        </h3>
        {data ? <ForecastChart days={data.days} /> : <div className="h-56 bg-surface-container-high/60 rounded animate-pulse" />}
      </section>

      {data?.peakDay && (
        <div>
          <h3 className="font-headline-sm text-headline-sm mb-md text-on-surface">
            Detalle por daypart · día pico ({format(parseISO(data.peakDay.date), "EEEE d 'de' MMM", { locale: es })})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {data.peakDay.dayparts.map((dp) => (
              <DaypartCard key={dp.daypart} dp={dp} max={Math.max(...data.peakDay!.dayparts.map((x) => x.covers))} />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function ForecastChart({ days }: { days: ForecastDayDTO[] }) {
  const maxCovers = Math.max(1, ...days.map((d) => d.covers));
  return (
    <div className="h-56 flex items-end justify-between gap-3">
      {days.map((d) => (
        <div key={d.date} className="flex-1 h-full flex flex-col items-center justify-end gap-1" title={`${d.date}: ${d.covers} covers · ${formatMoney(d.revenueCents)}`}>
          <span className="text-[10px] font-bold text-on-surface">{d.covers}</span>
          <div className="w-full bg-primary rounded-t hover:bg-primary-container transition-colors" style={{ height: `${Math.max(3, (d.covers / maxCovers) * 100)}%` }} />
          <span className="text-[10px] text-on-surface-variant capitalize">
            {format(parseISO(d.date), "EEE d", { locale: es })}
          </span>
        </div>
      ))}
    </div>
  );
}

function DaypartCard({ dp, max }: { dp: ForecastDaypartDTO; max: number }) {
  const pct = Math.round((dp.covers / max) * 100);
  return (
    <div className="bg-white p-md rounded-xl border border-outline-variant card-shadow flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#f0edf1" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none" stroke="#a93107" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 264} 264`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-numeral-xl text-headline-lg text-on-surface">{dp.covers}</span>
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">covers</span>
        </div>
      </div>
      <span className="font-label-md text-on-surface">{DAYPART_LABEL[dp.daypart] ?? dp.daypart}</span>
    </div>
  );
}

function KpiCard({
  accent,
  label,
  value,
  badge,
  badgeTone,
}: {
  accent: string;
  label: string;
  value: string;
  badge?: string;
  badgeTone?: "emerald" | "amber";
}) {
  return (
    <div className={`bg-white p-md rounded-xl border border-outline-variant card-shadow border-l-4 ${accent}`}>
      <p className="font-label-md text-on-surface-variant mb-xs">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <span className="font-numeral-xl text-numeral-xl text-on-surface">{value}</span>
        {badge && (
          <span className={`font-label-md text-[11px] px-xs py-[2px] rounded-full ${badgeTone === "amber" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
