import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type {
  RecommendationDTO,
  RecommendationsFeedResponse,
} from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/recommendations/feed/:locationId — feed de recomendaciones de la
 * sucursal + resumen (anomalías de hoy, ROI proyectado de las pendientes,
 * recomendaciones ya aplicadas). Autenticado y tenant-scoped.
 */
router.get("/feed/:locationId", requireAuth, async (req, res) => {
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

  const [recs, anomaliesToday] = await Promise.all([
    prisma.recommendation.findMany({
      where: { tenantId, locationId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.anomaly.count({ where: { locationId, detectedAt: { gte: startToday } } }),
  ]);

  const roiProjectedCents = recs
    .filter((r) => r.status === "PENDING")
    .reduce((a, r) => a + (r.estimatedImpactCents ?? 0), 0);
  const appliedCount = recs.filter((r) => r.status === "EXECUTED").length;

  const payload: RecommendationsFeedResponse = {
    summary: { anomaliesToday, roiProjectedCents, appliedCount },
    recommendations: recs.map(
      (r): RecommendationDTO => ({
        id: r.id,
        kind: r.kind as RecommendationDTO["kind"],
        status: r.status as RecommendationDTO["status"],
        title: r.title,
        rationale: r.rationale,
        estimatedImpactCents: r.estimatedImpactCents,
        expiresAt: r.expiresAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })
    ),
  };
  res.json(payload);
});

export default router;
