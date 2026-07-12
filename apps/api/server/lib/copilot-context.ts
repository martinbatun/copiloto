// Ensambla un snapshot compacto de los datos operativos reales de una
// sucursal para inyectarlo como contexto (system prompt) del co-piloto.
// Todo es SOLO LECTURA y tenant/location-scoped. El co-piloto responde
// fundamentado en esto — sin este contexto el modelo no tendría datos.

import type { PrismaClient } from "../db.js";

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  // @ts-expect-error — Decimal de Prisma tiene .toNumber() en runtime
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v);
}

function money(cents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const ANOMALY_LABEL: Record<string, string> = {
  VOID_SPIKE: "exceso de cancelaciones (voids)",
  DISCOUNT_SPIKE: "exceso de descuentos",
  FOOD_COST_DRIFT: "desviación de food cost",
  LABOR_OVERSHOOT: "sobrecosto de labor",
  NO_SALE: "caja sin movimiento",
  REFUND_BURST: "ráfaga de reembolsos",
  INGREDIENT_PRICE_JUMP: "salto de precio de insumo",
};

export interface OpsContext {
  text: string;
  at: Date;
}

export async function buildOpsContext(
  prisma: PrismaClient,
  tenantId: string,
  locationId: string,
  locationName: string
): Promise<OpsContext> {
  const at = new Date();
  const startToday = new Date(at);
  startToday.setUTCHours(0, 0, 0, 0);
  const startYesterday = new Date(startToday);
  startYesterday.setUTCDate(startYesterday.getUTCDate() - 1);
  const start30 = new Date(startToday);
  start30.setUTCDate(start30.getUTCDate() - 29);
  const in7 = new Date(startToday);
  in7.setUTCDate(in7.getUTCDate() + 7);

  const [
    salesToday,
    yesterdayAgg,
    mixLines,
    recipes,
    forecast,
    anomalies,
    recommendations,
    parLevels,
  ] = await Promise.all([
    prisma.salesEvent.findMany({
      where: { locationId, openedAt: { gte: startToday } },
      select: { totalCents: true, covers: true },
    }),
    prisma.salesEvent.aggregate({
      where: { locationId, openedAt: { gte: startYesterday, lt: startToday } },
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.salesLine.findMany({
      where: { sale: { locationId, openedAt: { gte: start30 } } },
      select: { qty: true, totalCents: true, menuItem: { select: { name: true } } },
    }),
    prisma.recipe.findMany({
      where: { tenantId },
      select: { foodCostCents: true, menuItem: { select: { name: true, priceCents: true } } },
    }),
    prisma.forecastBucket.findMany({
      where: { locationId, date: { gte: startToday, lt: in7 } },
      select: { date: true, expectedCovers: true, expectedRevenue: true },
      orderBy: { date: "asc" },
    }),
    prisma.anomaly.findMany({
      where: { locationId, resolvedAt: null },
      orderBy: [{ severity: "desc" }, { detectedAt: "desc" }],
      take: 8,
      select: { kind: true, severity: true, detectedAt: true },
    }),
    prisma.recommendation.findMany({
      where: { tenantId, locationId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { title: true, estimatedImpactCents: true },
    }),
    prisma.parLevel.findMany({
      where: { locationId, date: startToday },
      select: { suggestedQty: true, currentQty: true, unit: true, ingredient: { select: { name: true } } },
    }),
  ]);

  // Ventas de hoy vs ayer.
  const revenueToday = salesToday.reduce((a, s) => a + s.totalCents, 0);
  const tickets = salesToday.length;
  const covers = salesToday.reduce((a, s) => a + s.covers, 0);
  const avgTicket = tickets > 0 ? Math.round(revenueToday / tickets) : 0;
  const yRevenue = yesterdayAgg._sum.totalCents ?? 0;
  const yTickets = yesterdayAgg._count ?? 0;
  const deltaPct = yRevenue > 0 ? Math.round(((revenueToday - yRevenue) / yRevenue) * 1000) / 10 : 0;

  // Food cost promedio + peores 3 platillos.
  const fc = recipes
    .filter((r) => r.menuItem.priceCents > 0)
    .map((r) => ({ name: r.menuItem.name, pct: (r.foodCostCents / r.menuItem.priceCents) * 100 }));
  const foodCostPct = fc.length > 0 ? Math.round((fc.reduce((a, b) => a + b.pct, 0) / fc.length) * 10) / 10 : 0;
  const worstFc = [...fc].sort((a, b) => b.pct - a.pct).slice(0, 3);

  // Menu mix 30d (top 5 / bottom 3 por unidades).
  const mixMap = new Map<string, { qty: number; revenueCents: number }>();
  for (const l of mixLines) {
    const name = l.menuItem?.name ?? "Otros";
    const cur = mixMap.get(name) ?? { qty: 0, revenueCents: 0 };
    cur.qty += l.qty;
    cur.revenueCents += l.totalCents;
    mixMap.set(name, cur);
  }
  const mix = [...mixMap.entries()].map(([name, v]) => ({ name, ...v }));
  const topSellers = [...mix].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const bottomSellers = [...mix].sort((a, b) => a.qty - b.qty).slice(0, 3);

  // Forecast: agregado por día (7 días).
  const fcByDay = new Map<string, { covers: number; revenue: number }>();
  for (const f of forecast) {
    const key = f.date.toISOString().slice(0, 10);
    const cur = fcByDay.get(key) ?? { covers: 0, revenue: 0 };
    cur.covers += f.expectedCovers;
    cur.revenue += f.expectedRevenue;
    fcByDay.set(key, cur);
  }

  // Inventario bajo par (currentQty / suggestedQty < 0.6).
  const lowStock = parLevels
    .map((p) => {
      const sug = num(p.suggestedQty);
      const cur = p.currentQty == null ? null : num(p.currentQty);
      const ratio = cur != null && sug > 0 ? cur / sug : null;
      return { name: p.ingredient.name, cur, sug, unit: p.unit, ratio };
    })
    .filter((p) => p.ratio != null && p.ratio < 0.6)
    .sort((a, b) => (a.ratio ?? 1) - (b.ratio ?? 1));

  // ─── Render markdown compacto ─────────────────────────────
  const L: string[] = [];
  L.push(`# Snapshot operativo — ${locationName}`);
  L.push(`Fecha (UTC): ${startToday.toISOString().slice(0, 10)}. Moneda: MXN.`);
  L.push("");
  L.push("## Ventas de hoy");
  L.push(`- Ingreso: ${money(revenueToday)} (${deltaPct >= 0 ? "+" : ""}${deltaPct}% vs ayer ${money(yRevenue)})`);
  L.push(`- Tickets: ${tickets} (ayer ${yTickets}) · Comensales: ${covers} · Ticket promedio: ${money(avgTicket)}`);
  L.push("");
  L.push("## Costos");
  L.push(`- Food cost promedio de recetas: ${foodCostPct}%`);
  if (worstFc.length > 0) {
    L.push(`- Platillos con mayor food cost: ${worstFc.map((w) => `${w.name} (${Math.round(w.pct)}%)`).join(", ")}`);
  }
  L.push("");
  L.push("## Menú (últimos 30 días)");
  if (topSellers.length > 0) {
    L.push(`- Más vendidos: ${topSellers.map((t) => `${t.name} (${t.qty}u, ${money(t.revenueCents)})`).join(", ")}`);
    L.push(`- Menos vendidos: ${bottomSellers.map((t) => `${t.name} (${t.qty}u)`).join(", ")}`);
  } else {
    L.push("- Sin datos de ventas por platillo en el periodo.");
  }
  L.push("");
  L.push("## Pronóstico (próximos días)");
  if (fcByDay.size > 0) {
    for (const [date, v] of fcByDay) L.push(`- ${date}: ${v.covers} comensales, ${money(v.revenue)} esperado`);
  } else {
    L.push("- Sin pronóstico disponible.");
  }
  L.push("");
  L.push("## Anomalías abiertas");
  if (anomalies.length > 0) {
    for (const a of anomalies) {
      const label = ANOMALY_LABEL[a.kind] ?? a.kind;
      const sev = a.severity >= 5 ? "crítica" : a.severity >= 3 ? "media" : "info";
      L.push(`- ${label} (severidad ${sev}, detectada ${a.detectedAt.toISOString().slice(0, 10)})`);
    }
  } else {
    L.push("- Sin anomalías abiertas.");
  }
  L.push("");
  L.push("## Recomendaciones pendientes");
  if (recommendations.length > 0) {
    for (const r of recommendations) {
      const impact = r.estimatedImpactCents ? ` (impacto est. ${money(r.estimatedImpactCents)})` : "";
      L.push(`- ${r.title}${impact}`);
    }
  } else {
    L.push("- Sin recomendaciones pendientes.");
  }
  L.push("");
  L.push("## Inventario bajo par");
  if (lowStock.length > 0) {
    for (const p of lowStock) {
      L.push(`- ${p.name}: ${p.cur}${p.unit} de ${p.sug}${p.unit} sugerido (${Math.round((p.ratio ?? 0) * 100)}%)`);
    }
  } else {
    L.push("- Todo el inventario está en o sobre el nivel par.");
  }

  return { text: L.join("\n"), at };
}
