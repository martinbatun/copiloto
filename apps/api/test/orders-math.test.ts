import { describe, it, expect } from "vitest";
import { computeOrderTotals } from "../server/lib/orders-math";

describe("computeOrderTotals", () => {
  it("suma subtotal, IVA por línea y total en centavos", () => {
    // 2× $95.00 (9500) + 1× $125.00 (12500) al 16% → subtotal 31500, IVA 5040.
    const r = computeOrderTotals([
      { menuItemId: "a", name: "Esquites", qty: 2, unitCents: 9500, taxRate: 0.16 },
      { menuItemId: "b", name: "Guacamole", qty: 1, unitCents: 12500, taxRate: 0.16 },
    ]);
    expect(r.subtotalCents).toBe(31500);
    expect(r.taxCents).toBe(5040);
    expect(r.totalCents).toBe(36540);
    expect(r.lines).toHaveLength(2);
    expect(r.lines[0]).toMatchObject({ totalCents: 19000, notes: null });
  });

  it("aplica IVA por línea (no sobre el subtotal) y redondea cada una", () => {
    // línea de 333 * 0.16 = 53.28 → 53; con dos líneas iguales el redondeo es por línea.
    const r = computeOrderTotals([
      { menuItemId: "x", name: "A", qty: 1, unitCents: 333, taxRate: 0.16 },
      { menuItemId: "y", name: "B", qty: 1, unitCents: 333, taxRate: 0.16 },
    ]);
    expect(r.taxCents).toBe(53 + 53);
  });

  it("respeta taxRate distinto por item", () => {
    const r = computeOrderTotals([
      { menuItemId: "a", name: "Sin IVA", qty: 1, unitCents: 10000, taxRate: 0 },
      { menuItemId: "b", name: "Con IVA", qty: 1, unitCents: 10000, taxRate: 0.16 },
    ]);
    expect(r.subtotalCents).toBe(20000);
    expect(r.taxCents).toBe(1600);
    expect(r.totalCents).toBe(21600);
  });

  it("carrito vacío → todo en cero", () => {
    const r = computeOrderTotals([]);
    expect(r).toMatchObject({ subtotalCents: 0, taxCents: 0, totalCents: 0, lines: [] });
  });

  it("normaliza notes undefined → null", () => {
    const r = computeOrderTotals([
      { menuItemId: "a", name: "A", qty: 1, unitCents: 100, taxRate: 0 },
    ]);
    expect(r.lines[0]!.notes).toBeNull();
  });
});
