import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { CampaignDTO, CampaignsResponse } from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/campaigns — campañas del tenant con métricas agregadas de sus envíos
 * (apertura, respuesta, conversión). Autenticado + tenant-scoped.
 */
router.get("/", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const campaigns = await prisma.campaign.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      segment: { select: { name: true } },
      sends: { select: { read: true, responded: true, conversionCents: true } },
    },
  });

  const dtos: CampaignDTO[] = campaigns.map((c) => {
    const n = c.sends.length;
    const reads = c.sends.filter((s) => s.read).length;
    const responses = c.sends.filter((s) => s.responded).length;
    const conversionCents = c.sends.reduce((a, s) => a + (s.conversionCents ?? 0), 0);
    return {
      id: c.id,
      templateId: c.templateId,
      segmentName: c.segment?.name ?? null,
      channel: c.channel,
      status: c.status,
      sends: n,
      openRatePct: n > 0 ? Math.round((reads / n) * 1000) / 10 : 0,
      responseRatePct: n > 0 ? Math.round((responses / n) * 1000) / 10 : 0,
      conversionCents,
    };
  });

  const payload: CampaignsResponse = { campaigns: dtos };
  res.json(payload);
});

export default router;
