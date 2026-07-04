// Cálculo de totales de un pedido. Pura y sin dependencias (Prisma/red) para
// poder testearla en aislamiento — es lógica crítica de dinero.

export interface PricedLine {
  menuItemId: string;
  name: string;
  qty: number;
  unitCents: number;
  taxRate: number; // 0..1 (ej. 0.16)
  notes?: string | null;
}

export interface OrderLineData {
  menuItemId: string;
  name: string;
  qty: number;
  unitCents: number;
  totalCents: number;
  notes: string | null;
}

export interface OrderTotals {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  lines: OrderLineData[];
}

/**
 * Suma el subtotal (unit * qty) y el IVA por línea (round(línea * taxRate)).
 * El total es subtotal + impuestos. Todo en centavos enteros.
 */
export function computeOrderTotals(items: PricedLine[]): OrderTotals {
  let subtotalCents = 0;
  let taxCents = 0;
  const lines = items.map((l): OrderLineData => {
    const totalCents = l.unitCents * l.qty;
    subtotalCents += totalCents;
    taxCents += Math.round(totalCents * l.taxRate);
    return {
      menuItemId: l.menuItemId,
      name: l.name,
      qty: l.qty,
      unitCents: l.unitCents,
      totalCents,
      notes: l.notes ?? null,
    };
  });
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents, lines };
}
