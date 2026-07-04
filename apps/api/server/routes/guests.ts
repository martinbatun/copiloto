import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { GuestCategory, GuestsResponse, GuestSegment } from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

// Mapea el enum de segmento a la etiqueta en español que pinta el front.
const CATEGORY_BY_KIND: Record<GuestSegment, GuestCategory> = {
  VIP: "VIP",
  BIG_SPENDER: "Foodie",
  FIRST_VISIT: "Nuevo",
  CHURN_RISK: "Riesgo",
  LAPSED: "Riesgo",
  REGULAR: "Habitual",
};

/**
 * GET /api/guests — base de huéspedes del tenant con su categoría (derivada de
 * su segmento), resumen (VIPs, en riesgo, frecuencia) y conteo por segmento.
 */
router.get("/", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const now = new Date();

  const [guests, segments] = await Promise.all([
    prisma.guest.findMany({
      where: { tenantId },
      orderBy: { totalSpentCents: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        birthdate: true,
        lastVisitAt: true,
        totalSpentCents: true,
        visitCount: true,
        segments: { select: { segment: { select: { kind: true } } } },
      },
    }),
    prisma.segment.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, kind: true, _count: { select: { guests: true } } },
    }),
  ]);

  const dtos = guests.map((g) => {
    const kind = (g.segments[0]?.segment.kind ?? "REGULAR") as GuestSegment;
    const category = CATEGORY_BY_KIND[kind];
    const birthdayToday =
      g.birthdate != null &&
      g.birthdate.getUTCMonth() === now.getUTCMonth() &&
      g.birthdate.getUTCDate() === now.getUTCDate();
    return {
      id: g.id,
      name: g.name,
      email: g.email,
      category,
      lastVisitAt: g.lastVisitAt?.toISOString() ?? null,
      totalSpentCents: g.totalSpentCents,
      visitCount: g.visitCount,
      birthdayToday,
    };
  });

  const vips = dtos.filter((d) => d.category === "VIP").length;
  const churnRisk = dtos.filter((d) => d.category === "Riesgo").length;
  const avgVisits =
    dtos.length > 0
      ? Math.round((dtos.reduce((a, d) => a + d.visitCount, 0) / dtos.length) * 10) / 10
      : 0;

  const payload: GuestsResponse = {
    summary: { vips, churnRisk, avgVisits },
    segments: segments.map((s) => ({
      id: s.id,
      name: s.name,
      kind: s.kind as GuestSegment,
      count: s._count.guests,
    })),
    guests: dtos,
  };
  res.json(payload);
});

export default router;
