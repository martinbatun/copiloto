"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";
import { useKpiSummary } from "@/lib/hooks/useOpsData";
import { formatMoney } from "@/lib/format";

// Fracción de labor asumida sobre ingresos (no tenemos datos de nómina aún).
const LABOR_FRACTION = 0.22;

export default function Page() {
  const { currentLocation } = useAuth();
  const { data: kpi, isLoading, error } = useKpiSummary(currentLocation?.id);

  const [pricePct, setPricePct] = useState(0);
  const [costPct, setCostPct] = useState(0);
  const [laborPct, setLaborPct] = useState(0);

  const sim = useMemo(() => {
    if (!kpi) return null;
    // Baseline mensual = promedio diario (tendencia 14d) × 30.
    const dailyAvg = kpi.trend.reduce((a, t) => a + t.revenueCents, 0) / Math.max(1, kpi.trend.length);
    const R = dailyAvg * 30;
    const f = kpi.foodCostPct / 100;

    const marginBaseline = R - R * f - R * LABOR_FRACTION;
    const marginPctBaseline = R > 0 ? (marginBaseline / R) * 100 : 0;

    const Rp = R * (1 + pricePct / 100);
    const foodCost = R * f * (1 + costPct / 100);
    const labor = R * LABOR_FRACTION * (1 + laborPct / 100);
    const marginSim = Rp - foodCost - labor;
    const marginPctSim = Rp > 0 ? (marginSim / Rp) * 100 : 0;

    return {
      monthlyRevenue: R,
      marginBaselineCents: Math.round(marginBaseline),
      marginSimCents: Math.round(marginSim),
      marginPtsDelta: Math.round((marginPctSim - marginPctBaseline) * 10) / 10,
      marginPctSim: Math.round(marginPctSim * 10) / 10,
      revenueSimCents: Math.round(Rp),
    };
  }, [kpi, pricePct, costPct, laborPct]);

  return (
    <AppShell>
      <header>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Simulador de escenarios</h1>
        <p className="text-on-surface-variant font-body-md">
          Proyecta el impacto de precio, costos y labor sobre tu margen — con base en tus ventas reales.
        </p>
      </header>

      {error && (
        <div className="bg-error-container/40 border border-error/30 text-on-error-container rounded-xl p-4">
          <p className="font-bold">No pudimos cargar el baseline</p>
          <p className="text-sm">{String((error as Error).message)}</p>
        </div>
      )}

      {isLoading || !kpi || !sim ? (
        <div className="h-64 bg-surface-container-high/60 rounded-xl animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Parámetros */}
          <div className="lg:col-span-5 space-y-gutter">
            <ParamPanel icon="restaurant_menu" iconColor="text-secondary" accent="border-l-secondary-container" title="Menú & pricing">
              <SliderRow label="Incremento de precios" value={pricePct} onChange={setPricePct} min={-10} max={25} tone="primary" />
            </ParamPanel>
            <ParamPanel icon="local_shipping" iconColor="text-primary" accent="border-l-primary" title="Supply chain">
              <SliderRow label="Variación costo insumos" value={costPct} onChange={setCostPct} min={-15} max={25} tone="error" />
            </ParamPanel>
            <ParamPanel icon="engineering" iconColor="text-tertiary" accent="border-l-tertiary" title="Labor & ops">
              <SliderRow label="Ajuste de plantilla" value={laborPct} onChange={setLaborPct} min={-25} max={15} tone="default" />
            </ParamPanel>
          </div>

          {/* Impacto */}
          <div className="lg:col-span-7 space-y-gutter">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-sm">
              <StatBox label="Impacto en margen" value={`${sim.marginPtsDelta >= 0 ? "+" : ""}${sim.marginPtsDelta} pts`} tone={sim.marginPtsDelta >= 0 ? "primary" : "error"} hint="vs baseline" />
              <StatBox label="Margen simulado" value={`${sim.marginPctSim}%`} tone="secondary" hint="sobre ingresos" />
              <StatBox label="Utilidad mensual" value={formatMoney(sim.marginSimCents)} tone="default" hint="proyectada" />
            </div>

            <div className="bg-white rounded-xl p-md border border-outline-variant card-shadow">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Utilidad proyectada · 6 meses</h3>
              <p className="font-body-sm text-on-surface-variant mb-6">Baseline vs escenario simulado (acumulado)</p>
              <SixMonthChart baseline={sim.marginBaselineCents} simulated={sim.marginSimCents} />
              <div className="mt-md pt-md border-t border-outline-variant/30 grid grid-cols-2 gap-md">
                <div>
                  <span className="font-label-md text-on-surface-variant block">Ingreso mensual base</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">{formatMoney(sim.monthlyRevenue)}</span>
                </div>
                <div>
                  <span className="font-label-md text-on-surface-variant block">Utilidad simulada 6m</span>
                  <span className="font-headline-sm text-headline-sm text-secondary">{formatMoney(sim.marginSimCents * 6)}</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-lg flex gap-md items-start">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg, #B9532A 0%, #9A3412 100%)" }}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <p className="font-body-md text-on-surface leading-relaxed">
                {sim.marginPtsDelta >= 0 ? (
                  <>Con estos parámetros, tu margen sube <span className="font-bold text-primary">{sim.marginPtsDelta} puntos</span> ({formatMoney(sim.marginSimCents - sim.marginBaselineCents)}/mes adicionales).</>
                ) : (
                  <>Con estos parámetros, tu margen cae <span className="font-bold text-error">{Math.abs(sim.marginPtsDelta)} puntos</span>. Ajusta precio o costos para compensar.</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function SixMonthChart({ baseline, simulated }: { baseline: number; simulated: number }) {
  const months = [1, 2, 3, 4, 5, 6];
  const max = Math.max(1, baseline * 6, simulated * 6);
  return (
    <div className="h-56 flex items-end justify-between gap-3">
      {months.map((m) => (
        <div key={m} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
          <div className="w-full flex items-end justify-center gap-1 h-full">
            <div className="w-1/2 bg-surface-container-highest rounded-t" style={{ height: `${Math.max(2, ((baseline * m) / max) * 100)}%` }} title={`Baseline: ${formatMoney(baseline * m)}`} />
            <div className="w-1/2 bg-primary rounded-t" style={{ height: `${Math.max(2, ((simulated * m) / max) * 100)}%` }} title={`Simulado: ${formatMoney(simulated * m)}`} />
          </div>
          <span className="text-[10px] text-on-surface-variant">Mes {m}</span>
        </div>
      ))}
    </div>
  );
}

function ParamPanel({ icon, iconColor, accent, title, children }: { icon: string; iconColor: string; accent: string; title: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white border border-outline-variant rounded-xl p-md card-shadow border-l-4 ${accent}`}>
      <h3 className="font-headline-sm text-headline-sm mb-md flex items-center gap-xs text-on-surface">
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function SliderRow({ label, value, onChange, min, max, tone }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; tone: "primary" | "secondary" | "error" | "default" }) {
  const color = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : tone === "error" ? "text-error" : "text-on-surface";
  return (
    <div className="space-y-xs">
      <div className="flex justify-between items-center">
        <label className="font-label-md text-on-surface-variant">{label}</label>
        <span className={`font-numeral-xl text-headline-sm ${color}`}>{value >= 0 ? "+" : ""}{value}%</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );
}

function StatBox({ label, value, tone, hint }: { label: string; value: string; tone: "primary" | "secondary" | "default" | "error"; hint: string }) {
  const color = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : tone === "error" ? "text-error" : "text-on-surface";
  return (
    <div className="bg-white p-md rounded-xl border border-outline-variant card-shadow flex flex-col items-center justify-center text-center">
      <span className="font-label-md text-on-surface-variant">{label}</span>
      <span className={`font-numeral-xl text-numeral-xl mt-1 ${color}`}>{value}</span>
      <div className="mt-1 text-[12px] text-on-surface-variant">{hint}</div>
    </div>
  );
}
