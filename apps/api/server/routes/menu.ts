import { Router } from "express";
import multer from "multer";
import { PrismaClient } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { uploadBuffer, isStorageConfigured } from "../lib/storage.js";
import {
  MenuItemUpsertSchema,
  MenuCategoryUpsertSchema,
  type AdminMenuItem,
  type AdminMenuResponse,
  type MenuCategoryPublic,
  type MenuItemPublic,
  type PublicMenuResponse,
} from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

// Roles que pueden editar la carta (no STAFF).
const canEditMenu = requireRole("OWNER", "MANAGER", "ADMIN");

// SKU legible + único por tenant a partir del nombre.
function skuFromName(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita diacríticos
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || "ITEM"}-${rand}`;
}

const upload = multer({
  storage: multer.memoryStorage(), // memoria, nunca disco
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error(`Tipo no permitido: ${file.mimetype}`));
  },
});

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

// ─── ADMIN: gestión de la carta (autenticado, tenant-scoped) ──────────

/** Valida que la sucursal exista y sea del tenant del JWT. */
async function ownedLocation(tenantId: string, locationId: string) {
  return prisma.location.findFirst({
    where: { id: locationId, tenantId },
    select: { id: true, name: true },
  });
}

/**
 * GET /api/menu/admin/:locationId — categorías + items (incl. inactivos) del
 * tenant, para el editor de la carta.
 */
router.get("/admin/:locationId", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const location = await ownedLocation(tenantId, String(req.params.locationId));
  if (!location) {
    res.status(404).json({ error: "Sucursal no encontrada" });
    return;
  }
  const [categories, items] = await Promise.all([
    prisma.menuCategory.findMany({
      where: { tenantId },
      orderBy: { sortKey: "asc" },
      select: { id: true, name: true, sortKey: true },
    }),
    prisma.menuItem.findMany({
      where: { tenantId },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        sku: true,
        categoryId: true,
        name: true,
        description: true,
        priceCents: true,
        taxRate: true,
        imageUrl: true,
        tags: true,
        rating: true,
        active: true,
      },
    }),
  ]);
  const payload: AdminMenuResponse = {
    locationId: location.id,
    locationName: location.name,
    categories,
    items: items.map(
      (i): AdminMenuItem => ({
        id: i.id,
        sku: i.sku,
        categoryId: i.categoryId,
        name: i.name,
        description: i.description,
        priceCents: i.priceCents,
        taxRate: num(i.taxRate) ?? 0.16,
        imageUrl: i.imageUrl,
        tags: i.tags,
        rating: num(i.rating),
        active: i.active,
      })
    ),
  };
  res.json(payload);
});

/** Verifica que la categoría (si viene) sea del tenant. */
async function validCategory(tenantId: string, categoryId: string | null | undefined) {
  if (!categoryId) return true;
  const cat = await prisma.menuCategory.findFirst({
    where: { id: categoryId, tenantId },
    select: { id: true },
  });
  return Boolean(cat);
}

/** POST /api/menu/items — alta de platillo. */
router.post("/items", requireAuth, canEditMenu, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const parsed = MenuItemUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Platillo inválido", details: parsed.error.flatten() });
    return;
  }
  const d = parsed.data;
  if (!(await validCategory(tenantId, d.categoryId))) {
    res.status(400).json({ error: "Categoría no válida" });
    return;
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const created = await prisma.menuItem.create({
        data: {
          tenantId,
          sku: skuFromName(d.name),
          name: d.name,
          description: d.description ?? null,
          priceCents: d.priceCents,
          taxRate: d.taxRate ?? 0.16,
          categoryId: d.categoryId ?? null,
          imageUrl: d.imageUrl ?? null,
          tags: d.tags,
          rating: d.rating ?? null,
          active: d.active ?? true,
        },
        select: { id: true },
      });
      res.status(201).json({ id: created.id });
      return;
    } catch (err: unknown) {
      if (attempt < 4 && (err as { code?: string }).code === "P2002") continue; // sku colisión
      console.error("[menu] create item failed", err);
      res.status(500).json({ error: "No se pudo crear el platillo" });
      return;
    }
  }
});

/** PATCH /api/menu/items/:id — edición (parcial). */
router.patch("/items/:id", requireAuth, canEditMenu, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const id = String(req.params.id);
  const parsed = MenuItemUpsertSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Cambio inválido", details: parsed.error.flatten() });
    return;
  }
  const existing = await prisma.menuItem.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Platillo no encontrado" });
    return;
  }
  const d = parsed.data;
  if (d.categoryId !== undefined && !(await validCategory(tenantId, d.categoryId))) {
    res.status(400).json({ error: "Categoría no válida" });
    return;
  }
  await prisma.menuItem.update({
    where: { id },
    data: {
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.description !== undefined ? { description: d.description } : {}),
      ...(d.priceCents !== undefined ? { priceCents: d.priceCents } : {}),
      ...(d.taxRate !== undefined ? { taxRate: d.taxRate } : {}),
      ...(d.categoryId !== undefined ? { categoryId: d.categoryId } : {}),
      ...(d.imageUrl !== undefined ? { imageUrl: d.imageUrl } : {}),
      ...(d.tags !== undefined ? { tags: d.tags } : {}),
      ...(d.rating !== undefined ? { rating: d.rating } : {}),
      ...(d.active !== undefined ? { active: d.active } : {}),
    },
  });
  res.json({ ok: true });
});

/** DELETE /api/menu/items/:id — soft delete (active=false). */
router.delete("/items/:id", requireAuth, canEditMenu, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const { count } = await prisma.menuItem.updateMany({
    where: { id: String(req.params.id), tenantId },
    data: { active: false },
  });
  if (count === 0) {
    res.status(404).json({ error: "Platillo no encontrado" });
    return;
  }
  res.json({ ok: true });
});

/** POST /api/menu/categories — alta de categoría. */
router.post("/categories", requireAuth, canEditMenu, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const parsed = MenuCategoryUpsertSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Categoría inválida", details: parsed.error.flatten() });
    return;
  }
  const created = await prisma.menuCategory.create({
    data: { tenantId, name: parsed.data.name, sortKey: parsed.data.sortKey ?? 0 },
    select: { id: true },
  });
  res.status(201).json({ id: created.id });
});

/** PATCH /api/menu/categories/:id — renombrar / reordenar. */
router.patch("/categories/:id", requireAuth, canEditMenu, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const parsed = MenuCategoryUpsertSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Cambio inválido", details: parsed.error.flatten() });
    return;
  }
  const { count } = await prisma.menuCategory.updateMany({
    where: { id: String(req.params.id), tenantId },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.sortKey !== undefined ? { sortKey: parsed.data.sortKey } : {}),
    },
  });
  if (count === 0) {
    res.status(404).json({ error: "Categoría no encontrada" });
    return;
  }
  res.json({ ok: true });
});

/** DELETE /api/menu/categories/:id — borra la categoría; sus items quedan sin
 *  categoría (no se borran). */
router.delete("/categories/:id", requireAuth, canEditMenu, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const id = String(req.params.id);
  const cat = await prisma.menuCategory.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
  if (!cat) {
    res.status(404).json({ error: "Categoría no encontrada" });
    return;
  }
  await prisma.$transaction([
    prisma.menuItem.updateMany({ where: { categoryId: id, tenantId }, data: { categoryId: null } }),
    prisma.menuCategory.delete({ where: { id } }),
  ]);
  res.json({ ok: true });
});

/** POST /api/menu/upload — sube una imagen a Supabase Storage y devuelve la URL. */
router.post("/upload", requireAuth, canEditMenu, upload.single("file"), async (req, res) => {
  if (!isStorageConfigured()) {
    res.status(503).json({ error: "Almacenamiento no configurado (SUPABASE_URL/KEY)" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "No se envió archivo" });
    return;
  }
  try {
    const stored = await uploadBuffer(req.file.buffer, req.file.mimetype, {
      folder: "menu",
      originalName: req.file.originalname,
    });
    res.status(201).json({ url: stored.url, path: stored.path, size: stored.size });
  } catch (err) {
    console.error("[menu] upload failed", err);
    res.status(500).json({ error: "No se pudo subir la imagen" });
  }
});

export default router;
