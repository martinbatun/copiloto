// Helpers de margen y food cost. Trabajan sobre cents.

export interface MenuItemCosting {
  priceCents: number;
  foodCostCents: number;
  laborCostCents?: number;
}

export function foodCostPct({ priceCents, foodCostCents }: MenuItemCosting): number {
  if (priceCents <= 0) return 0;
  return foodCostCents / priceCents;
}

export function contributionMarginCents(c: MenuItemCosting): number {
  return c.priceCents - c.foodCostCents - (c.laborCostCents ?? 0);
}

export function contributionMarginPct(c: MenuItemCosting): number {
  if (c.priceCents <= 0) return 0;
  return contributionMarginCents(c) / c.priceCents;
}

// Umbrales sugeridos en industria; deben ser configurables por tenant.
export const FOOD_COST_TARGET = 0.32; // 32%
export const FOOD_COST_WARN = 0.36;   // 36%
export const FOOD_COST_ALARM = 0.4;   // 40%

export function foodCostStatus(pct: number): "ok" | "warn" | "alarm" {
  if (pct >= FOOD_COST_ALARM) return "alarm";
  if (pct >= FOOD_COST_WARN) return "warn";
  return "ok";
}
