import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { RecipeDTO, RecipeIngredientDTO, RecipesResponse } from "@copiloto/shared";

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
 * GET /api/recipes — recetas del tenant con food cost calculado (costo por
 * línea = qty × costo unitario del ingrediente), margen y % de food cost.
 * Ordenadas por food cost desc (las más caras primero, para revisar márgenes).
 */
router.get("/", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const recipes = await prisma.recipe.findMany({
    where: { tenantId },
    include: {
      menuItem: { select: { id: true, sku: true, name: true, priceCents: true } },
      lines: {
        include: { ingredient: { select: { id: true, name: true, baseUnit: true, costPerUnitCents: true } } },
      },
    },
  });

  const dtos: RecipeDTO[] = recipes.map((r) => {
    const lines: RecipeIngredientDTO[] = r.lines.map((l) => {
      const qty = num(l.qty);
      const unitCost = l.ingredient.costPerUnitCents;
      return {
        ingredientId: l.ingredient.id,
        name: l.ingredient.name,
        qty,
        unit: l.unit,
        unitCostCents: unitCost,
        extCents: unitCost != null ? Math.round(qty * unitCost) : 0,
      };
    });
    const foodCostCents = lines.reduce((a, l) => a + l.extCents, 0);
    const price = r.menuItem.priceCents;
    return {
      menuItemId: r.menuItem.id,
      sku: r.menuItem.sku,
      name: r.menuItem.name,
      priceCents: price,
      foodCostCents,
      foodCostPct: price > 0 ? Math.round((foodCostCents / price) * 1000) / 10 : 0,
      marginCents: price - foodCostCents,
      lines,
    };
  });
  dtos.sort((a, b) => b.foodCostPct - a.foodCostPct);

  const payload: RecipesResponse = { recipes: dtos };
  res.json(payload);
});

export default router;
