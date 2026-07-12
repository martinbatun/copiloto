import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type {
  ForecastDayDTO,
  ForecastDaypartDTO,
  ForecastResponse,
} from "@copiloto/shared";

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
 * GET /api/forecast/:locationId — pronóstico de los próximos 7 días desde
 * ForecastBucket (agregado por día) + resumen (MAPE, covers 7d, confianza) y
 * el desglose por daypart del día pico. Autenticado + tenant-scoped.
 */
router.get("/:locationId", requireAuth, async (req, res) => {
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

  const buckets = await prisma.forecastBucket.findMany({
    where: { locationId, date: { gte: startToday } },
    orderBy: { date: "asc" },
  });

  // Agrupa por fecha.
  const byDate = new Map<string, ForecastDayDTO>();
  const daypartsByDate = new Map<string, ForecastDaypartDTO[]>();
  let mapeSum = 0;
  let mapeCount = 0;
  for (const b of buckets) {
    const key = b.date.toISOString().slice(0, 10);
    const day =
      byDate.get(key) ??
      { date: key, covers: 0, revenueCents: 0, confidenceLowCents: 0, confidenceHighCents: 0 };
    day.covers += b.expectedCovers;
    day.revenueCents += b.expectedRevenue;
    day.confidenceLowCents += b.confidenceLow;
    day.confidenceHighCents += b.confidenceHigh;
    byDate.set(key, day);
    const dps = daypartsByDate.get(key) ?? [];
    dps.push({ daypart: b.daypart, covers: b.expectedCovers, revenueCents: b.expectedRevenue });
    daypartsByDate.set(key, dps);
    if (b.mape != null) {
      mapeSum += num(b.mape);
      mapeCount += 1;
    }
  }

  const days = [...byDate.values()].slice(0, 7);
  const covers7d = days.reduce((a, d) => a + d.covers, 0);
  const revenue7dCents = days.reduce((a, d) => a + d.revenueCents, 0);
  const mapePct = mapeCount > 0 ? Math.round((mapeSum / mapeCount) * 1000) / 10 : 0;
  const avgConfidencePct = mapeCount > 0 ? Math.round((1 - mapeSum / mapeCount) * 1000) / 10 : 0;

  const peak = days.reduce<ForecastDayDTO | null>((best, d) => (!best || d.covers > best.covers ? d : best), null);
  const peakDay = peak ? { date: peak.date, dayparts: daypartsByDate.get(peak.date) ?? [] } : null;

  const payload: ForecastResponse = {
    summary: { mapePct, covers7d, revenue7dCents, avgConfidencePct },
    days,
    peakDay,
  };
  res.json(payload);
});

export default router;
