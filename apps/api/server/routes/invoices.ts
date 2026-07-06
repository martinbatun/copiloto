import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type { InvoiceDTO, InvoiceLineDTO, InvoicesResponse } from "@copiloto/shared";

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

const STATUS_LABEL: Record<string, string> = {
  RECEIVED: "Pendiente",
  OCR_PENDING: "Pendiente",
  OCR_DONE: "Procesada",
  NORMALIZED: "Procesada",
  RECONCILED: "Conciliada",
  REJECTED: "Rechazada",
};

/**
 * GET /api/invoices — facturas de las sucursales del tenant con sus líneas.
 * Incluye las líneas para que el detalle del panel no necesite otro round-trip.
 */
router.get("/", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const invoices = await prisma.invoice.findMany({
    where: { location: { tenantId } },
    orderBy: { invoicedAt: "desc" },
    include: {
      supplier: { select: { name: true } },
      lines: { select: { id: true, description: true, qty: true, unit: true, unitCostCents: true, totalCents: true } },
    },
  });

  const dtos: InvoiceDTO[] = invoices.map((i) => {
    const lines: InvoiceLineDTO[] = i.lines.map((l) => ({
      id: l.id,
      description: l.description,
      qty: num(l.qty),
      unit: l.unit,
      unitCostCents: l.unitCostCents,
      totalCents: l.totalCents,
    }));
    const subtotalCents = lines.reduce((a, l) => a + l.totalCents, 0);
    const taxCents = Math.round(subtotalCents * 0.16);
    return {
      id: i.id,
      supplierName: i.supplier?.name ?? null,
      status: i.status,
      statusLabel: STATUS_LABEL[i.status] ?? i.status,
      invoicedAt: i.invoicedAt?.toISOString() ?? null,
      subtotalCents,
      taxCents,
      totalCents: subtotalCents + taxCents,
      lines,
    };
  });

  const payload: InvoicesResponse = { invoices: dtos };
  res.json(payload);
});

export default router;
