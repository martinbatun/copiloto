"use client";

import type { ScheduleDaypartDTO, ScheduleRoleDTO } from "@copiloto/shared";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useSchedule } from "@/lib/hooks/useOpsData";

const DAYPART_LABEL: Record<string, string> = {
  BREAKFAST: "Desayuno", BRUNCH: "Brunch", LUNCH: "Comida", AFTERNOON: "Tarde", DINNER: "Cena", LATE_NIGHT: "Late night",
};

function roleLabel(r: string) {
  return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Page() {
  const { currentLocation } = useAuth();
  const { data, isLoading, error } = useSchedule(currentLocation?.id);

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>
          <p className="text-primary font-label-md mb-xs">Operaciones / Personal</p>
          <h1 className="font-display-md text-display-md text-on-surface">Staffing del día</h1>
        </div>
        <button className="bg-primary text-white px-lg py-sm rounded-xl font-label-md shadow-lg flex items-center gap-sm hover:brightness-110 active:scale-95 transition-all w-fit">
          <span className="material-symbols-outlined text-[18px]">send</span>
          Publicar y notificar
        </button>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar el staffing</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {isLoading || !data ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-surface-container-high/70 rounded-xl animate-pulse" />)
        ) : (
          <>
            <KpiCard label="Personal sugerido" value={String(data.summary.suggestedTotal)} accent="border-l-secondary" />
            <KpiCard label="Personal en piso" value={String(data.summary.actualTotal)} accent="border-l-primary" />
            <KpiCard label="Cobertura" value={`${data.summary.coveragePct}%`} accent="border-l-tertiary" tone={data.summary.coveragePct >= 100 ? "ok" : "warn"} />
          </>
        )}
      </section>

      {data && data.dayparts.length === 0 && (
        <div className="bg-white border border-outline-variant card-shadow rounded-xl p-xl text-center text-on-surface-variant">
          Sin turnos programados para hoy.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {data?.dayparts.map((dp) => <DaypartPanel key={dp.daypart} dp={dp} />)}
      </div>
    </AppShell>
  );
}

function DaypartPanel({ dp }: { dp: ScheduleDaypartDTO }) {
  const coverage = dp.neededTotal > 0 ? Math.round((dp.actualTotal / dp.neededTotal) * 100) : 100;
  return (
    <section className="bg-white rounded-xl border border-outline-variant card-shadow overflow-hidden">
      <div className="p-md border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">{DAYPART_LABEL[dp.daypart] ?? dp.daypart}</h3>
        <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${coverage >= 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {coverage}% cobertura
        </span>
      </div>
      <table className="w-full text-left">
        <thead className="bg-surface-container-low text-[11px] uppercase tracking-wider font-bold text-outline">
          <tr>
            <th className="px-md py-sm">Rol</th>
            <th className="px-md py-sm text-center">Sugerido</th>
            <th className="px-md py-sm text-center">En piso</th>
            <th className="px-md py-sm text-center">Estado</th>
          </tr>
        </thead>
        <tbody className="text-body-sm divide-y divide-outline-variant/60">
          {dp.roles.map((r) => <RoleRow key={r.role} r={r} />)}
        </tbody>
      </table>
    </section>
  );
}

function RoleRow({ r }: { r: ScheduleRoleDTO }) {
  const ok = r.actual >= r.needed;
  return (
    <tr>
      <td className="px-md py-sm font-label-md text-on-surface">{roleLabel(r.role)}</td>
      <td className="px-md py-sm text-center">{r.suggested}</td>
      <td className="px-md py-sm text-center font-bold">{r.actual}</td>
      <td className="px-md py-sm text-center">
        <span className={`material-symbols-outlined text-[18px] ${ok ? "text-emerald-600" : "text-amber-600"}`}>
          {ok ? "check_circle" : "error"}
        </span>
      </td>
    </tr>
  );
}

function KpiCard({ label, value, accent, tone }: { label: string; value: string; accent: string; tone?: "ok" | "warn" }) {
  const valueColor = tone === "warn" ? "text-amber-600" : tone === "ok" ? "text-emerald-600" : "text-on-surface";
  return (
    <div className={`bg-white p-md rounded-xl border border-outline-variant card-shadow border-l-4 ${accent}`}>
      <p className="font-label-md text-on-surface-variant">{label}</p>
      <p className={`font-numeral-xl text-numeral-xl mt-xs ${valueColor}`}>{value}</p>
    </div>
  );
}
