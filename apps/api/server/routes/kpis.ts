import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { KpiSummaryResponse, KpiMenuMixItem, KpiTrendPoint } from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  // @ts-expect-error — Decimal de Prisma tiene .toNumber() en runtime
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v);
}

/**
 * GET /api/kpis/:locationId/summary — métricas del tablero calculadas sobre
 * SalesEvent (ventas de hoy, ticket promedio, tendencia 14d, menu-mix),
 * food cost promedio de recetas, forecast de hoy y conteos operativos.
 */
router.get("/:locationId/summary", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const locationId = String(req.params.locationId);

  const location = await prisma.location.findFirst({
    where: { id: locationId, tenantId },
    select: { id: true },
  });
  if (!location) {
    res.status(404).json({ error: "Sucursal no encontrada para este tenant" });
    return;
  }

  const startToday = new Date();
  startToday.setUTCHours(0, 0, 0, 0);
  const startYesterday = new Date(startToday);
  startYesterday.setUTCDate(startYesterday.getUTCDate() - 1);
  const start14 = new Date(startToday);
  start14.setUTCDate(start14.getUTCDate() - 13);
  const start30 = new Date(startToday);
  start30.setUTCDate(start30.getUTCDate() - 29);
  const startTomorrow = new Date(startToday);
  startTomorrow.setUTCDate(startTomorrow.getUTCDate() + 1);

  const [
    salesToday,
    sales14,
    yesterdayAgg,
    mixLines,
    recipes,
    forecastToday,
    ordersActive,
    recommendationsPending,
    anomaliesToday,
    reservationsToday,
  ] = await Promise.all([
    prisma.salesEvent.findMany({
      where: { locationId, openedAt: { gte: startToday } },
      select: { totalCents: true, covers: true },
    }),
    prisma.salesEvent.findMany({
      where: { locationId, openedAt: { gte: start14 } },
      select: { totalCents: true, openedAt: true },
    }),
    prisma.salesEvent.aggregate({
      where: { locationId, openedAt: { gte: startYesterday, lt: startToday } },
      _sum: { totalCents: true },
    }),
    prisma.salesLine.findMany({
      where: { sale: { locationId, openedAt: { gte: start30 } } },
      select: { qty: true, totalCents: true, menuItem: { select: { name: true } } },
    }),
    prisma.recipe.findMany({
      where: { tenantId },
      select: { foodCostCents: true, menuItem: { select: { priceCents: true } } },
    }),
    prisma.forecastBucket.aggregate({
      where: { locationId, date: startToday },
      _sum: { expectedCovers: true },
    }),
    prisma.order.count({ where: { locationId, status: { in: ["PLACED", "IN_KITCHEN", "READY"] } } }),
    prisma.recommendation.count({ where: { tenantId, locationId, status: "PENDING" } }),
    prisma.anomaly.count({ where: { locationId, detectedAt: { gte: startToday } } }),
    prisma.reservation.count({
      where: {
        locationId,
        reservedAt: { gte: startToday, lt: startTomorrow },
        status: { in: ["CONFIRMED", "SEATED", "PENDING"] },
      },
    }),
  ]);

  const revenueToday = salesToday.reduce((a, s) => a + s.totalCents, 0);
  const tickets = salesToday.length;
  const covers = salesToday.reduce((a, s) => a + s.covers, 0);
  const avgTicketCents = tickets > 0 ? Math.round(revenueToday / tickets) : 0;
  const yesterdayRevenueCents = yesterdayAgg._sum.totalCents ?? 0;
  const revenueDeltaPct =
    yesterdayRevenueCents > 0
      ? Math.round(((revenueToday - yesterdayRevenueCents) / yesterdayRevenueCents) * 1000) / 10
      : 0;

  // Tendencia 14 días (bucket por fecha UTC).
  const byDay = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(start14);
    d.setUTCDate(d.getUTCDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const s of sales14) {
    const key = s.openedAt.toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, byDay.get(key)! + s.totalCents);
  }
  const trend: KpiTrendPoint[] = [...byDay.entries()].map(([date, revenueCents]) => ({ date, revenueCents }));

  // Menu mix (top 5 por ingreso, 30 días).
  const mixMap = new Map<string, { qty: number; revenueCents: number }>();
  for (const l of mixLines) {
    const name = l.menuItem?.name ?? "Otros";
    const cur = mixMap.get(name) ?? { qty: 0, revenueCents: 0 };
    cur.qty += l.qty;
    cur.revenueCents += l.totalCents;
    mixMap.set(name, cur);
  }
  const menuMix: KpiMenuMixItem[] = [...mixMap.entries()]
    .map(([name, v]) => ({ name, qty: v.qty, revenueCents: v.revenueCents }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 5);

  // Food cost promedio de recetas (con precio > 0).
  const fcPcts = recipes
    .filter((r) => r.menuItem.priceCents > 0)
    .map((r) => (r.foodCostCents / r.menuItem.priceCents) * 100);
  const foodCostPct = fcPcts.length > 0 ? Math.round((fcPcts.reduce((a, b) => a + b, 0) / fcPcts.length) * 10) / 10 : 0;

  const payload: KpiSummaryResponse = {
    today: { revenueCents: revenueToday, tickets, covers, avgTicketCents },
    yesterdayRevenueCents,
    revenueDeltaPct,
    foodCostPct,
    forecastCoversToday: forecastToday._sum.expectedCovers ?? 0,
    trend,
    menuMix,
    counts: {
      ordersActive,
      recommendationsPending,
      anomaliesToday,
      reservationsToday,
    },
  };
  res.json(payload);
});

export default router;
