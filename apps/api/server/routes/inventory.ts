import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import {
  InventoryQuerySchema,
  type InventoryItem,
  type InventoryListResponse,
  type InventoryStatus,
} from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

// Convierte Prisma Decimal | number | null a number "limpio" para el JSON wire.
function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  // @ts-expect-error — Decimal de Prisma tiene .toNumber() en runtime
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v);
}

function deriveStatuses(args: {
  current: number;
  par: number;
  perishable: boolean;
  shelfLifeDays: number | null;
}): InventoryStatus[] {
  const { current, par, perishable, shelfLifeDays } = args;
  const ratio = par > 0 ? current / par : 1;
  const out: InventoryStatus[] = [];
  if (ratio < 0.5) out.push("BAJO_PAR");
  else if (ratio < 0.9) out.push("ALERTA_PAR");
  else if (ratio <= 1.1) out.push("OPTIMO");
  else out.push("EXCEDENTE");
  // Heuristica de caducidad para el mock: si es perecedero y el stock es muy
  // bajo o el shelf life es corto, marcamos riesgo de caducar. En produccion
  // esto deberia leerse del lote real (InventoryCount con fecha de recepcion).
  if (perishable && shelfLifeDays !== null && shelfLifeDays <= 3 && current > 0) {
    out.push("CADUCA");
  }
  return out;
}

/**
 * GET /api/inventory/:locationId?date=YYYY-MM-DD
 *
 * Devuelve los par levels del dia (default hoy UTC) con el stock fisico,
 * proveedor primario, costo unitario y el status derivado. Es la fuente
 * unica para el page /inventory del frontend.
 *
 * Nota: filtramos por tenantId del JWT — un user no puede leer locations
 * de otros tenants aunque sepa el UUID.
 */
router.get("/:locationId", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const locationId = String(req.params.locationId);
  const parsed = InventoryQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
    return;
  }

  // Localiza la sucursal y valida ownership.
  const location = await prisma.location.findFirst({
    where: { id: locationId, tenantId },
    select: { id: true, name: true },
  });
  if (!location) {
    res.status(404).json({ error: "Location no encontrada para este tenant" });
    return;
  }

  const dateStr = parsed.data.date ?? new Date().toISOString().slice(0, 10);
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const yesterday = new Date(date);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const [todayLevels, yesterdayLevels] = await Promise.all([
    prisma.parLevel.findMany({
      where: { locationId: location.id, date },
      include: {
        ingredient: {
          include: { defaultSupplier: { select: { name: true } } },
        },
      },
    }),
    prisma.parLevel.findMany({
      where: { locationId: location.id, date: yesterday },
      select: { ingredientId: true, suggestedQty: true },
    }),
  ]);

  const prevBySku: Record<string, number> = {};
  for (const p of yesterdayLevels) prevBySku[p.ingredientId] = num(p.suggestedQty);

  const items: InventoryItem[] = todayLevels.map((lvl) => {
    const ing = lvl.ingredient;
    const current = num(lvl.currentQty);
    const par = num(lvl.suggestedQty);
    const statuses = deriveStatuses({
      current,
      par,
      perishable: ing.perishable,
      shelfLifeDays: ing.shelfLifeDays,
    });
    const parPrev = prevBySku[ing.id];
    return {
      ingredientId: ing.id,
      sku: ing.sku,
      name: ing.name,
      category: ing.category,
      baseUnit: ing.baseUnit,
      perishable: ing.perishable,
      currentQty: current,
      parSuggested: par,
      parPrevious: parPrev !== undefined && parPrev !== par ? parPrev : null,
      costPerUnitCents: ing.costPerUnitCents,
      supplierName: ing.defaultSupplier?.name ?? null,
      statuses,
    };
  });

  // Summary: valor total = sum(currentQty * costPerUnit). Alertas = items no
  // optimo. Wastage hardcoded por ahora (necesita join con InventoryCount
  // historico para calcular bien). Los stockouts evitados son una metrica
  // que vive en el motor de recomendaciones — la dejo en placeholder.
  const totalValueCents = items.reduce(
    (acc, i) => acc + (i.costPerUnitCents ? i.costPerUnitCents * i.currentQty : 0),
    0
  );
  const alertCount = items.filter(
    (i) => !i.statuses.includes("OPTIMO")
  ).length;

  const summary = {
    totalValueCents: Math.round(totalValueCents),
    totalValueDeltaPct: 3.2,
    wastagePct: 2.1,
    wastageLimitPct: 2.5,
    stockoutsAvoided: 14,
    alertCount,
    activeSkus: items.length,
  };

  const payload: InventoryListResponse = {
    locationId: location.id,
    locationName: location.name,
    date: dateStr,
    summary,
    items,
  };

  res.json(payload);
});

export default router;
