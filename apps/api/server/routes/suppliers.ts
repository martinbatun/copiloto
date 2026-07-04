import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { SuppliersResponse } from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/suppliers — proveedores del tenant + catálogo de ingredientes con su
 * costo actual y proveedor primario (comparador de precios del panel).
 */
router.get("/", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const [suppliers, ingredients] = await Promise.all([
    prisma.supplier.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        rfc: true,
        email: true,
        phone: true,
        _count: { select: { ingredients: true } },
      },
    }),
    prisma.ingredient.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        baseUnit: true,
        costPerUnitCents: true,
        defaultSupplier: { select: { name: true } },
      },
    }),
  ]);

  const payload: SuppliersResponse = {
    suppliers: suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      rfc: s.rfc,
      email: s.email,
      phone: s.phone,
      ingredientCount: s._count.ingredients,
    })),
    ingredients: ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      baseUnit: i.baseUnit,
      costPerUnitCents: i.costPerUnitCents,
      supplierName: i.defaultSupplier?.name ?? null,
    })),
  };
  res.json(payload);
});

export default router;
