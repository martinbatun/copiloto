import { z } from "zod";

export const RoleSchema = z.enum(["OWNER", "MANAGER", "STAFF", "ADMIN"]);

export const PosProviderSchema = z.enum([
  "SOFT_RESTAURANT",
  "ONECORE",
  "CLIP",
  "SQUARE",
  "TOAST",
  "MANUAL_CSV",
]);

export const ChannelSchema = z.enum(["DINE_IN", "TAKEOUT", "DELIVERY", "PICKUP"]);

export const DaypartSchema = z.enum([
  "BREAKFAST",
  "BRUNCH",
  "LUNCH",
  "AFTERNOON",
  "DINNER",
  "LATE_NIGHT",
]);

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateLocationSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  timezone: z.string().default("America/Mexico_City"),
  posProvider: PosProviderSchema.default("MANUAL_CSV"),
});
export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;

export const PosCredentialsSchema = z.object({
  provider: PosProviderSchema,
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  storeId: z.string().optional(),
  webhookSecret: z.string().optional(),
  // SOFT_RESTAURANT y ONECORE en MX a veces son on-prem; conexion via SFTP/SQL
  // mirror se modela aparte. Aqui solo cubrimos API directa.
});

export const ForecastQuerySchema = z.object({
  locationId: z.string().uuid(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  daypart: DaypartSchema.optional(),
  channel: ChannelSchema.optional(),
});

export const RecommendationDecisionSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT", "SNOOZE"]),
  comment: z.string().max(500).optional(),
  snoozeUntil: z.string().datetime().optional(),
});

export const CopilotChatSchema = z.object({
  locationId: z.string().uuid(),
  message: z.string().min(1).max(2000),
  threadId: z.string().uuid().optional(),
});

export const CampaignDraftSchema = z.object({
  segmentId: z.string().uuid(),
  channel: z.enum(["WHATSAPP", "EMAIL", "SMS"]),
  templateId: z.string().min(1),
  variables: z.record(z.string()).default({}),
  scheduledAt: z.string().datetime().optional(),
});

export const ReservationSchema = z.object({
  locationId: z.string().uuid(),
  guestName: z.string().min(2),
  guestPhone: z.string().min(8),
  partySize: z.number().int().min(1).max(40),
  reservedAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

// ─── INVENTORY ───────────────────────────────────────────────
//
// Estado computado por el backend a partir de currentQty vs suggestedQty:
//   <0.5   → BAJO_PAR
//   <0.9   → ALERTA_PAR
//   0.9–1.1 → OPTIMO
//   >1.1   → EXCEDENTE
// El CADUCA es un flag extra para perecederos cerca de su shelf life.
export const InventoryStatusSchema = z.enum([
  "BAJO_PAR",
  "ALERTA_PAR",
  "OPTIMO",
  "EXCEDENTE",
  "CADUCA",
]);
export type InventoryStatus = z.infer<typeof InventoryStatusSchema>;

export const InventoryItemSchema = z.object({
  ingredientId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  category: z.string().nullable(),
  baseUnit: z.string(),
  perishable: z.boolean(),
  currentQty: z.number(),
  parSuggested: z.number(),
  parPrevious: z.number().nullable(),
  costPerUnitCents: z.number().int().nullable(),
  supplierName: z.string().nullable(),
  statuses: z.array(InventoryStatusSchema),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export const InventorySummarySchema = z.object({
  totalValueCents: z.number().int(),
  totalValueDeltaPct: z.number(),
  wastagePct: z.number(),
  wastageLimitPct: z.number(),
  stockoutsAvoided: z.number().int(),
  alertCount: z.number().int(),
  activeSkus: z.number().int(),
});
export type InventorySummary = z.infer<typeof InventorySummarySchema>;

export const InventoryListResponseSchema = z.object({
  locationId: z.string().uuid(),
  locationName: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: InventorySummarySchema,
  items: z.array(InventoryItemSchema),
});
export type InventoryListResponse = z.infer<typeof InventoryListResponseSchema>;

export const InventoryQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

// ─── ORDERS (menu digital del cliente) ───────────────────────

export const OrderPaymentMethodSchema = z.enum(["MOBILE", "CASHIER"]);

export const CreateOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  qty: z.number().int().min(1).max(50),
  notes: z.string().max(280).optional(),
});

export const CreateOrderSchema = z.object({
  locationId: z.string().uuid(),
  items: z.array(CreateOrderItemSchema).min(1),
  paymentMethod: OrderPaymentMethodSchema,
  customerName: z.string().max(120).optional(),
  tableLabel: z.string().max(40).optional(),
  notes: z.string().max(500).optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const OrderStatusSchema = z.enum([
  "PLACED",
  "IN_KITCHEN",
  "READY",
  "SERVED",
  "CANCELLED",
]);

export const OrderPaymentStatusSchema = z.enum(["PENDING", "PAID"]);

// Actualización de pedido desde el panel de operaciones (cocina/caja).
// Al menos uno de los dos campos debe venir.
export const UpdateOrderSchema = z
  .object({
    status: OrderStatusSchema.optional(),
    paymentStatus: OrderPaymentStatusSchema.optional(),
  })
  .refine((v) => v.status !== undefined || v.paymentStatus !== undefined, {
    message: "Nada que actualizar",
  });
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
