import { Router } from "express";
import { randomInt } from "node:crypto";
import { PrismaClient, type Prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import {
  isMpEnabled,
  createCheckoutPreference,
  getPayment,
  validateWebhookSignature,
} from "../lib/mercadopago.js";
import { computeOrderTotals } from "../lib/orders-math.js";
import {
  CreateOrderSchema,
  OrderStatusSchema,
  UpdateOrderSchema,
  type OrderSummaryDTO,
  type OrderItemDTO,
} from "@copiloto/shared";

const PUBLIC_WEB_URL = process.env.PUBLIC_WEB_URL || "http://localhost:5400";
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || "http://localhost:3400";

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

// Código corto legible para cocina/caja: letra + 2 dígitos (ej. "A37").
function genCode(): string {
  const letter = "ABCDEFGHJKLMNPQRSTUVWXYZ"[randomInt(0, 24)];
  const digits = String(randomInt(0, 100)).padStart(2, "0");
  return `${letter}${digits}`;
}

function toDTO(order: {
  id: string;
  code: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string | null;
  tableLabel: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: Date;
  items: {
    id: string;
    menuItemId: string | null;
    name: string;
    qty: number;
    unitCents: number;
    totalCents: number;
    notes: string | null;
  }[];
}): OrderSummaryDTO {
  return {
    id: order.id,
    code: order.code,
    status: order.status as OrderSummaryDTO["status"],
    paymentMethod: order.paymentMethod as OrderSummaryDTO["paymentMethod"],
    paymentStatus: order.paymentStatus as OrderSummaryDTO["paymentStatus"],
    customerName: order.customerName,
    tableLabel: order.tableLabel,
    subtotalCents: order.subtotalCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(
      (i): OrderItemDTO => ({
        id: i.id,
        menuItemId: i.menuItemId,
        name: i.name,
        qty: i.qty,
        unitCents: i.unitCents,
        totalCents: i.totalCents,
        notes: i.notes,
      })
    ),
  };
}

/**
 * POST /api/orders/public  (PÚBLICO — sin auth)
 *
 * Crea un pedido desde el menú digital del cliente. Los precios SIEMPRE se
 * recalculan en el server leyendo el MenuItem real — nunca confiamos en los
 * montos que manda el cliente. El IVA se aplica por item según su taxRate.
 *
 * Pago: MOBILE con Mercado Pago configurado → AWAITING_PAYMENT (no entra a
 * cocina hasta que el webhook confirme el cobro del total con IVA). MOBILE sin
 * pasarela → 503 en producción (fail-closed, nunca se marca PAID sin cobro);
 * solo se simula PAID en desarrollo o con ALLOW_SIMULATED_PAYMENTS=true.
 * CASHIER → PLACED + PENDING (cobra en caja).
 */
router.post("/public", async (req, res) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Pedido inválido", details: parsed.error.flatten() });
    return;
  }
  const { locationId, items, paymentMethod, customerName, tableLabel, notes } = parsed.data;

  const location = await prisma.location.findFirst({
    where: { id: locationId, active: true },
    select: { id: true, tenantId: true, tenant: { select: { currency: true } } },
  });
  if (!location) {
    res.status(404).json({ error: "Sucursal no encontrada" });
    return;
  }

  // Trae los MenuItem reales del tenant (activos). Valida ownership e inactivos.
  const ids = [...new Set(items.map((i) => i.menuItemId))];
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: ids }, tenantId: location.tenantId, active: true },
    select: { id: true, name: true, priceCents: true, taxRate: true },
  });
  const byId = new Map(menuItems.map((m) => [m.id, m]));

  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    res.status(400).json({ error: "Algunos platillos no están disponibles", missing });
    return;
  }

  // Calcula totales en centavos (subtotal + IVA por item) con la lógica pura.
  const { subtotalCents, taxCents, totalCents, lines: lineData } = computeOrderTotals(
    items.map((line) => {
      const mi = byId.get(line.menuItemId)!;
      return {
        menuItemId: mi.id,
        name: mi.name,
        qty: line.qty,
        unitCents: mi.priceCents,
        taxRate: num(mi.taxRate),
        notes: line.notes ?? null,
      };
    })
  );

  // Pago en línea real solo si es MOBILE y la pasarela está configurada.
  // FAIL-CLOSED por defecto: NUNCA marcamos PAID sin evidencia de cobro. El
  // modo simulado (PAID inmediato) es OPT-IN explícito y solo para dev/staging:
  // requiere NODE_ENV=development o ALLOW_SIMULATED_PAYMENTS=true. Así, si un
  // deploy productivo olvida NODE_ENV o la pasarela, un pago móvil se rechaza
  // (503) en vez de regalar comida. CASHIER siempre entra a cocina y cobra en caja.
  const allowSimulatedPay =
    process.env.NODE_ENV === "development" || process.env.ALLOW_SIMULATED_PAYMENTS === "true";
  if (paymentMethod === "MOBILE" && !isMpEnabled() && !allowSimulatedPay) {
    res.status(503).json({
      error: "El pago en línea no está disponible por ahora. Elige pagar en caja.",
      code: "ONLINE_PAYMENT_UNAVAILABLE",
    });
    return;
  }
  const payOnline = paymentMethod === "MOBILE" && isMpEnabled();
  const simulatedPaid = paymentMethod === "MOBILE" && !isMpEnabled() && allowSimulatedPay;
  const initialStatus = payOnline ? "AWAITING_PAYMENT" : "PLACED";
  const paymentStatus = simulatedPaid ? "PAID" : "PENDING";

  // Crea el pedido; reintenta si el code corto colisiona (raro).
  let created;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      created = await prisma.order.create({
        data: {
          tenantId: location.tenantId,
          locationId: location.id,
          code: genCode(),
          status: initialStatus,
          paymentMethod,
          paymentStatus,
          customerName: customerName ?? null,
          tableLabel: tableLabel ?? null,
          notes: notes ?? null,
          subtotalCents,
          taxCents,
          totalCents,
          items: { create: lineData },
        },
        include: { items: true },
      });
      break;
    } catch (err: unknown) {
      // P2002 = unique constraint (code). Reintenta con otro code.
      if (
        attempt < 4 &&
        typeof err === "object" &&
        err !== null &&
        (err as { code?: string }).code === "P2002"
      ) {
        continue;
      }
      console.error("[orders] create failed", err);
      res.status(500).json({ error: "No se pudo crear el pedido" });
      return;
    }
  }

  // Pago en línea: crea la preferencia de Mercado Pago y devuelve checkoutUrl.
  // Si MP falla, cancelamos el pedido (quedó en AWAITING_PAYMENT) y avisamos.
  if (payOnline) {
    try {
      // Líneas de la preferencia = items + una línea de IVA, para que MP cobre
      // el TOTAL (subtotal + impuestos). Sin la línea de IVA, MP cobraría solo
      // el subtotal y el webhook (que compara contra totalCents) lo rechazaría.
      const prefItems = created!.items.map((it) => ({
        id: it.menuItemId ?? it.id,
        title: it.name,
        quantity: it.qty,
        unitCents: it.unitCents,
      }));
      if (created!.taxCents > 0) {
        prefItems.push({ id: "tax", title: "Impuestos (IVA)", quantity: 1, unitCents: created!.taxCents });
      }
      const { preferenceId, checkoutUrl } = await createCheckoutPreference({
        orderId: created!.id,
        currency: location.tenant.currency,
        items: prefItems,
        backUrl: `${PUBLIC_WEB_URL}/menu/${location.id}/confirmacion/${created!.id}`,
        notificationUrl: `${PUBLIC_API_URL}/api/orders/webhook/mp`,
      });
      await prisma.order.update({
        where: { id: created!.id },
        data: { paymentRef: preferenceId },
      });
      res.status(201).json({ ...toDTO(created!), checkoutUrl });
      return;
    } catch (err) {
      console.error("[orders] mercadopago preference failed", err);
      await prisma.order.update({
        where: { id: created!.id },
        data: { status: "CANCELLED" },
      });
      res.status(502).json({ error: "No se pudo iniciar el pago" });
      return;
    }
  }

  res.status(201).json(toDTO(created!));
});

/**
 * POST /api/orders/webhook/mp  (PÚBLICO — lo llama Mercado Pago)
 *
 * Confirma el pago de un pedido en línea. Verifica la firma del webhook, trae
 * el pago real desde MP (no confía en el body) y, si está aprobado, mueve el
 * pedido de AWAITING_PAYMENT → PLACED + PAID. Idempotente: si ya está pagado,
 * no hace nada. Siempre responde 200 para que MP no reintente en loop salvo
 * error transitorio nuestro.
 */
router.post("/webhook/mp", async (req, res) => {
  // 1. Verifica firma (HMAC + anti-replay). Firma inválida → 401.
  try {
    validateWebhookSignature({
      xSignature: req.header("x-signature"),
      xRequestId: req.header("x-request-id"),
      dataId: req.query["data.id"] as string | undefined,
    });
  } catch (err) {
    console.warn("[orders] webhook firma inválida", (err as Error).message);
    res.status(401).json({ error: "Firma inválida" });
    return;
  }

  // 2. Solo nos interesan notificaciones de pago.
  const type = req.query.type ?? req.body?.type;
  const paymentId = (req.query["data.id"] as string) ?? req.body?.data?.id;
  if (type !== "payment" || !paymentId) {
    res.status(200).json({ ignored: true });
    return;
  }

  try {
    // 3. Trae el pago real desde MP (fuente de verdad).
    const payment = await getPayment(String(paymentId));
    const orderId = payment.externalReference;
    if (!orderId) {
      res.status(200).json({ ignored: "sin external_reference" });
      return;
    }

    // 4. Trae el pedido para validar estado y monto antes de tocar nada.
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, totalCents: true },
    });
    if (!order) {
      res.status(200).json({ ignored: "pedido no encontrado" });
      return;
    }

    if (payment.status === "approved") {
      // Verifica que el monto cobrado coincida con el total del pedido. Si no,
      // NO confirmamos automáticamente: se marca para revisión manual (posible
      // fraude/manipulación o preferencia obsoleta).
      const paidCents = Math.round((payment.transactionAmount ?? 0) * 100);
      if (paidCents !== order.totalCents) {
        console.warn(
          `[orders] webhook monto no coincide: pagó ${paidCents}¢ vs total ${order.totalCents}¢ (order ${orderId}, payment ${paymentId})`
        );
        res.status(200).json({ ok: true, flagged: "monto no coincide" });
        return;
      }
      // Solo transiciona pedidos que SIGUEN esperando pago. Excluye CANCELLED
      // (no revivir un pedido cancelado) y ya-PLACED (idempotencia).
      await prisma.order.updateMany({
        where: { id: orderId, status: "AWAITING_PAYMENT" },
        data: { status: "PLACED", paymentStatus: "PAID", paymentRef: String(paymentId) },
      });
    } else if (["rejected", "cancelled", "refunded", "charged_back"].includes(payment.status ?? "")) {
      if (order.status === "AWAITING_PAYMENT") {
        // Pago fallido antes de confirmar: cancela para que el front corte el
        // polling y no quede atascado en AWAITING_PAYMENT.
        await prisma.order.updateMany({
          where: { id: orderId, status: "AWAITING_PAYMENT" },
          data: { status: "CANCELLED" },
        });
      } else {
        // Reembolso/contracargo sobre un pedido ya en cocina/servido: no lo
        // revertimos automáticamente; queda para revisión manual de operaciones.
        console.warn(
          `[orders] pago '${payment.status}' sobre pedido ${orderId} en estado ${order.status} — requiere revisión manual (reembolso/contracargo)`
        );
      }
    }
    // pending / in_process: no-op (esperamos otra notificación).
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[orders] webhook procesamiento falló", err);
    // 500 → MP reintenta más tarde (es transitorio nuestro, no del pago).
    res.status(500).json({ error: "Error procesando webhook" });
  }
});

/**
 * GET /api/orders/public/:orderId  (PÚBLICO)
 * Estado del pedido para la pantalla de confirmación / seguimiento.
 */
router.get("/public/:orderId", async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: String(req.params.orderId) },
    include: { items: true },
  });
  if (!order) {
    res.status(404).json({ error: "Pedido no encontrado" });
    return;
  }
  res.json(toDTO(order));
});

/**
 * POST /api/orders/public/:orderId/cancel  (PÚBLICO)
 *
 * Cancelación por el propio comensal. Solo se permite cuando el pedido AÚN NO
 * entró a cocina: estado AWAITING_PAYMENT (pago en línea no completado). Una vez
 * PLACED ya está en cocina y debe cancelarlo el personal. El id es un UUID no
 * adivinable → tenerlo basta como autorización para este self-service.
 */
router.post("/public/:orderId/cancel", async (req, res) => {
  const id = String(req.params.orderId);
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!order) {
    res.status(404).json({ error: "Pedido no encontrado" });
    return;
  }
  if (order.status !== "AWAITING_PAYMENT") {
    res.status(409).json({
      error: "Este pedido ya no se puede cancelar desde aquí. Pídelo al personal.",
    });
    return;
  }
  const updated = await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { items: true },
  });
  res.json(toDTO(updated));
});

// ─── PANEL DE OPERACIONES (cocina / caja) — autenticado ──────

/**
 * GET /api/orders/location/:locationId?status=PLACED,IN_KITCHEN&include=active
 *
 * Lista los pedidos de una sucursal para el board de cocina/caja. Tenant-scoped:
 * valida que la location pertenezca al tenant del JWT. Por default trae los
 * pedidos "activos" (no SERVED ni CANCELLED); con ?include=all trae todos del día.
 */
router.get("/location/:locationId", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const locationId = String(req.params.locationId);

  const location = await prisma.location.findFirst({
    where: { id: locationId, tenantId },
    select: { id: true },
  });
  if (!location) {
    res.status(404).json({ error: "Location no encontrada para este tenant" });
    return;
  }

  // Filtro de status: explícito (?status=A,B) o el default "activos".
  const statusParam = typeof req.query.status === "string" ? req.query.status : "";
  const requested = statusParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const validStatuses = requested.filter(
    (s) => OrderStatusSchema.safeParse(s).success
  ) as OrderSummaryDTO["status"][];

  const includeAll = req.query.include === "all";
  const where: Prisma.OrderWhereInput = { locationId: location.id };
  if (validStatuses.length > 0) {
    where.status = { in: validStatuses };
  } else if (!includeAll) {
    // Default del board: solo pedidos activos en cocina (excluye AWAITING_PAYMENT,
    // SERVED y CANCELLED).
    where.status = { in: ["PLACED", "IN_KITCHEN", "READY"] };
  }

  // ?since=<ISO datetime> → solo pedidos creados a partir de ese instante.
  // El cliente manda el inicio del día en su zona horaria (historial "del día").
  const sinceParam = typeof req.query.since === "string" ? req.query.since : "";
  const since = sinceParam ? new Date(sinceParam) : null;
  if (since && !Number.isNaN(since.getTime())) {
    where.createdAt = { gte: since };
  }

  // Cocina quiere los más viejos primero (cola FIFO); el historial, los más
  // recientes primero.
  const order: Prisma.SortOrder = req.query.order === "desc" ? "desc" : "asc";

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: order },
    include: { items: true },
  });

  res.json({ orders: orders.map(toDTO) });
});

/**
 * PATCH /api/orders/:id  — autenticado, tenant-scoped.
 * Avanza el status (cocina) y/o marca el pago (caja).
 */
router.patch("/:id", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const id = String(req.params.id);

  const parsed = UpdateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Cambio inválido", details: parsed.error.flatten() });
    return;
  }

  // Valida ownership por tenant antes de tocar nada.
  const existing = await prisma.order.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
  if (!existing) {
    res.status(404).json({ error: "Pedido no encontrado" });
    return;
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
    },
    include: { items: true },
  });

  res.json(toDTO(updated));
});

export default router;
