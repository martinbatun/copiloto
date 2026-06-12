import { Router } from "express";
import { PrismaClient } from "../db.js";
import type {
  MenuCategoryPublic,
  MenuItemPublic,
  PublicMenuResponse,
} from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

// Convierte Prisma Decimal | number | null a number "limpio" para el JSON wire.
function num(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  // @ts-expect-error — Decimal de Prisma tiene .toNumber() en runtime
  if (typeof v.toNumber === "function") return v.toNumber();
  return Number(v);
}

/**
 * GET /api/menu/public/:locationId  (PÚBLICO — sin auth)
 *
 * Fuente del menú digital del cliente (QR en mesa). Resuelve la sucursal por
 * id, trae las categorías del tenant + los items activos, y los agrupa.
 * Es pública a propósito: el comensal no tiene cuenta.
 */
router.get("/public/:locationId", async (req, res) => {
  const locationId = String(req.params.locationId);

  const location = await prisma.location.findFirst({
    where: { id: locationId, active: true },
    select: { id: true, name: true, tenantId: true, tenant: { select: { name: true, currency: true } } },
  });
  if (!location) {
    res.status(404).json({ error: "Sucursal no encontrada" });
    return;
  }

  const [categories, items] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { tenantId: location.tenantId },
      orderBy: { sortKey: "asc" },
      select: { id: true, name: true, sortKey: true },
    }),
    prisma.menuItem.findMany({
      where: { tenantId: location.tenantId, active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        categoryId: true,
        name: true,
        description: true,
        priceCents: true,
        taxRate: true,
        imageUrl: true,
        tags: true,
        rating: true,
      },
    }),
  ]);

  const toPublic = (i: (typeof items)[number]): MenuItemPublic => ({
    id: i.id,
    categoryId: i.categoryId,
    name: i.name,
    description: i.description,
    priceCents: i.priceCents,
    taxRate: num(i.taxRate) ?? 0.16,
    imageUrl: i.imageUrl,
    tags: i.tags,
    rating: num(i.rating),
  });

  // Agrupa items por categoría; los sin categoría caen en "Otros" al final.
  const byCategory = new Map<string | null, MenuItemPublic[]>();
  for (const i of items) {
    const key = i.categoryId;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(toPublic(i));
  }

  const grouped: MenuCategoryPublic[] = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      sortKey: c.sortKey,
      items: byCategory.get(c.id) ?? [],
    }))
    .filter((c) => c.items.length > 0);

  const orphans = byCategory.get(null) ?? [];
  if (orphans.length > 0) {
    grouped.push({ id: "uncategorized", name: "Otros", sortKey: 9999, items: orphans });
  }

  const payload: PublicMenuResponse = {
    locationId: location.id,
    locationName: location.name,
    tenantName: location.tenant.name,
    currency: location.tenant.currency,
    categories: grouped,
  };

  res.json(payload);
});

router.get("/__stub", (_req, res) => {
  res.json({ module: "menu", status: "live" });
});

export default router;
