import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { ReviewDTO, ReviewsResponse, ReviewTopicDTO } from "@copiloto/shared";

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
 * GET /api/reviews/:locationId — reseñas de la sucursal + resumen (rating
 * promedio, sentimiento, % positivas) y agregado de topics. Auth + tenant-scoped.
 */
router.get("/:locationId", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const locationId = String(req.params.locationId);
  const location = await prisma.location.findFirst({ where: { id: locationId, tenantId }, select: { id: true } });
  if (!location) {
    res.status(404).json({ error: "Sucursal no encontrada para este tenant" });
    return;
  }

  const reviews = await prisma.review.findMany({
    where: { locationId },
    orderBy: { createdAt: "desc" },
    select: { id: true, source: true, rating: true, text: true, sentiment: true, topics: true, createdAt: true },
  });

  const count = reviews.length;
  const avgRating = count > 0 ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / count) * 10) / 10 : 0;
  const sentiments = reviews.filter((r) => r.sentiment != null).map((r) => num(r.sentiment));
  const avgSentiment = sentiments.length > 0 ? Math.round((sentiments.reduce((a, b) => a + b, 0) / sentiments.length) * 100) / 100 : 0;
  const positivePct = count > 0 ? Math.round((reviews.filter((r) => r.rating >= 4).length / count) * 1000) / 10 : 0;

  const topicMap = new Map<string, number>();
  for (const r of reviews) {
    const topics = Array.isArray(r.topics) ? (r.topics as string[]) : [];
    for (const t of topics) topicMap.set(t, (topicMap.get(t) ?? 0) + 1);
  }
  const topics: ReviewTopicDTO[] = [...topicMap.entries()]
    .map(([topic, c]) => ({ topic, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const payload: ReviewsResponse = {
    summary: { avgRating, count, avgSentiment, positivePct },
    topics,
    reviews: reviews.map(
      (r): ReviewDTO => ({
        id: r.id,
        source: r.source,
        rating: r.rating,
        text: r.text,
        sentiment: r.sentiment != null ? num(r.sentiment) : null,
        topics: Array.isArray(r.topics) ? (r.topics as string[]) : [],
        createdAt: r.createdAt.toISOString(),
      })
    ),
  };
  res.json(payload);
});

export default router;
