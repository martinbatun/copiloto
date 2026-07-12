import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { ScheduleResponse, ScheduleDaypartDTO, ScheduleRoleDTO } from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/schedules/:locationId?date=YYYY-MM-DD — staffing por daypart × rol
 * (sugerido vs real) y cobertura. Autenticado + tenant-scoped.
 */
router.get("/:locationId", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const locationId = String(req.params.locationId);
  const location = await prisma.location.findFirst({ where: { id: locationId, tenantId }, select: { id: true } });
  if (!location) {
    res.status(404).json({ error: "Sucursal no encontrada para este tenant" });
    return;
  }

  const dateStr = typeof req.query.date === "string" ? req.query.date : new Date().toISOString().slice(0, 10);
  const date = new Date(`${dateStr}T00:00:00.000Z`);

  const shifts = await prisma.shift.findMany({
    where: { locationId, date },
    orderBy: [{ daypart: "asc" }, { role: "asc" }],
  });

  const byDaypart = new Map<string, ScheduleRoleDTO[]>();
  for (const s of shifts) {
    const arr = byDaypart.get(s.daypart) ?? [];
    arr.push({ role: s.role, needed: s.staffNeeded, suggested: s.staffSuggested, actual: s.staffActual ?? 0 });
    byDaypart.set(s.daypart, arr);
  }
  const dayparts: ScheduleDaypartDTO[] = [...byDaypart.entries()].map(([daypart, roles]) => ({
    daypart,
    roles,
    neededTotal: roles.reduce((a, r) => a + r.needed, 0),
    actualTotal: roles.reduce((a, r) => a + r.actual, 0),
  }));

  const neededTotal = dayparts.reduce((a, d) => a + d.neededTotal, 0);
  const suggestedTotal = shifts.reduce((a, s) => a + s.staffSuggested, 0);
  const actualTotal = dayparts.reduce((a, d) => a + d.actualTotal, 0);
  const coveragePct = neededTotal > 0 ? Math.round((actualTotal / neededTotal) * 1000) / 10 : 0;

  const payload: ScheduleResponse = { date: dateStr, dayparts, summary: { neededTotal, suggestedTotal, actualTotal, coveragePct } };
  res.json(payload);
});

export default router;
