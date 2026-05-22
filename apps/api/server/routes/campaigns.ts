import { Router } from "express";

const router = Router();

// Campanas conversacionales. Guardrails criticos:
//   - Toda campana > 100 destinatarios requiere approval explicito.
//   - WhatsApp solo a guests con marketingOptIn=true.
//   - Rate limit por tenant para no caer en spam de WBA.
//
// TODO: GET    /api/campaigns
// TODO: POST   /api/campaigns                   — body: CampaignDraftSchema (queda en DRAFT)
// TODO: POST   /api/campaigns/:id/schedule      — pasa a SCHEDULED + agenda job
// TODO: POST   /api/campaigns/:id/cancel
// TODO: GET    /api/campaigns/:id/stats         — entregadas, leidas, respondidas, conversion
// TODO: POST   /api/campaigns/:id/draft-copy    — invoca ai.draftCampaignCopy y guarda en variables

router.get("/__stub", (_req, res) => {
  res.json({ module: "campaigns", status: "scaffold" });
});

export default router;
