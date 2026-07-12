import { Router } from "express";
import type { AdminTenantDTO, AdminTenantsResponse } from "@copiloto/shared";
import { PrismaClient } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Panel de plataforma de Copiloto (rol ADMIN — staff de soporte / customer
// success). NO confundir con OWNER del tenant. Vista cross-tenant: no está
// tenant-scoped a propósito.
//
// FUTURO:
//   TODO: POST /api/admin/tenants               — alta + bootstrap
//   TODO: GET  /api/admin/usage/:tenantId       — tokens LLM, WhatsApp, POS sync
//   TODO: POST /api/admin/impersonate/:userId   — soporte auditado

/**
 * GET /api/admin/tenants — lista de cuentas con métricas reales derivadas
 * de los modelos existentes (sucursales, usuarios, pedidos, ventas del mes,
 * última actividad). Requiere rol ADMIN.
 */
router.get("/tenants", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const [tenants, locations, salesMonth, salesLast, ordersLast] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        currency: true,
        createdAt: true,
        _count: { select: { locations: true, users: true, orders: true } },
      },
    }),
    prisma.location.findMany({ select: { id: true, tenantId: true } }),
    prisma.salesEvent.groupBy({
      by: ["locationId"],
      where: { openedAt: { gte: monthStart } },
      _sum: { totalCents: true },
    }),
    prisma.salesEvent.groupBy({
      by: ["locationId"],
      _max: { openedAt: true },
    }),
    prisma.order.groupBy({
      by: ["tenantId"],
      _max: { createdAt: true },
    }),
  ]);

  // location → tenant
  const tenantByLoc = new Map<string, string>();
  for (const l of locations) tenantByLoc.set(l.id, l.tenantId);

  // Ventas del mes por tenant (sumando sus sucursales).
  const monthRevByTenant = new Map<string, number>();
  for (const row of salesMonth) {
    const tid = tenantByLoc.get(row.locationId);
    if (!tid) continue;
    monthRevByTenant.set(tid, (monthRevByTenant.get(tid) ?? 0) + (row._sum.totalCents ?? 0));
  }

  // Última venta por tenant.
  const lastSaleByTenant = new Map<string, number>();
  for (const row of salesLast) {
    const tid = tenantByLoc.get(row.locationId);
    if (!tid || !row._max.openedAt) continue;
    const t = row._max.openedAt.getTime();
    if (t > (lastSaleByTenant.get(tid) ?? 0)) lastSaleByTenant.set(tid, t);
  }

  // Último pedido por tenant.
  const lastOrderByTenant = new Map<string, number>();
  for (const row of ordersLast) {
    if (!row._max.createdAt) continue;
    lastOrderByTenant.set(row.tenantId, row._max.createdAt.getTime());
  }

  const rows: AdminTenantDTO[] = tenants.map((t) => {
    const lastCandidates = [lastSaleByTenant.get(t.id), lastOrderByTenant.get(t.id)].filter(
      (v): v is number => typeof v === "number"
    );
    const lastActivity = lastCandidates.length > 0 ? Math.max(...lastCandidates) : null;
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      country: t.country,
      currency: t.currency,
      createdAt: t.createdAt.toISOString(),
      locations: t._count.locations,
      users: t._count.users,
      orders: t._count.orders,
      monthRevenueCents: monthRevByTenant.get(t.id) ?? 0,
      lastActivityAt: lastActivity != null ? new Date(lastActivity).toISOString() : null,
    };
  });

  rows.sort((a, b) => b.monthRevenueCents - a.monthRevenueCents);

  const payload: AdminTenantsResponse = {
    summary: {
      tenants: rows.length,
      locations: rows.reduce((a, r) => a + r.locations, 0),
      users: rows.reduce((a, r) => a + r.users, 0),
      orders: rows.reduce((a, r) => a + r.orders, 0),
      monthRevenueCents: rows.reduce((a, r) => a + r.monthRevenueCents, 0),
    },
    tenants: rows,
  };
  res.json(payload);
});

export default router;
