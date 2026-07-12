// Tipos compartidos entre apps/api, apps/web y agent/*.
//
// Mantener este archivo en sincronía con el Prisma schema y los esquemas Zod.
// Los enums replican los del schema para que el frontend no dependa de Prisma.

export type Role = "OWNER" | "MANAGER" | "STAFF" | "ADMIN";

export type PosProvider =
  | "SOFT_RESTAURANT"
  | "ONECORE"
  | "CLIP"
  | "SQUARE"
  | "TOAST"
  | "MANUAL_CSV";

export type Channel = "DINE_IN" | "TAKEOUT" | "DELIVERY" | "PICKUP";

export type DeliveryProvider =
  | "RAPPI"
  | "UBER_EATS"
  | "DIDI_FOOD"
  | "DIRECT"
  | "OTHER";

export type Daypart =
  | "BREAKFAST"
  | "BRUNCH"
  | "LUNCH"
  | "AFTERNOON"
  | "DINNER"
  | "LATE_NIGHT";

export type RecommendationKind =
  | "STAFFING_ADJUST"
  | "PAR_LEVEL_ADJUST"
  | "PREP_LIST"
  | "MENU_REPRICE"
  | "MENU_PROMOTE"
  | "DISCOUNT_REVIEW"
  | "GUEST_CAMPAIGN"
  | "WASTE_ALERT"
  | "ANOMALY_TRIAGE"
  | "RECIPE_REFORMULATE";

export type RecommendationStatus =
  | "PENDING"
  | "APPROVED"
  | "EXECUTED"
  | "REJECTED"
  | "SNOOZED"
  | "EXPIRED";

export type AnomalyKind =
  | "VOID_SPIKE"
  | "DISCOUNT_SPIKE"
  | "FOOD_COST_DRIFT"
  | "LABOR_OVERSHOOT"
  | "NO_SALE"
  | "REFUND_BURST"
  | "INGREDIENT_PRICE_JUMP";

export type GuestSegment =
  | "VIP"
  | "BIG_SPENDER"
  | "REGULAR"
  | "FIRST_VISIT"
  | "CHURN_RISK"
  | "LAPSED";

export type CampaignChannel = "WHATSAPP" | "EMAIL" | "SMS";

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SEATED"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED"
  | "WAITLIST";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  country: "MX" | "CO" | "CL" | "PE" | "AR" | "OTHER";
  currency: "MXN" | "USD" | "COP" | "CLP" | "PEN" | "ARS";
  timezone: string;
}

export interface Location {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  timezone: string;
  posProvider: PosProvider;
  active: boolean;
}

/**
 * Respuesta de GET /api/auth/me — todo lo que el web necesita en su boot
 * para construir el AppShell sin segundo round-trip: quien soy + a que
 * sucursales tengo acceso + branding del tenant.
 */
export interface MeResponse {
  user: AuthUser;
  tenant: Tenant;
  locations: Pick<Location, "id" | "name" | "slug" | "timezone">[];
}

export interface ForecastBucket {
  locationId: string;
  date: string; // YYYY-MM-DD
  daypart: Daypart;
  channel: Channel;
  expectedCovers: number;
  expectedRevenue: number;
  confidenceLow: number;
  confidenceHigh: number;
  mape: number | null;
}

export interface Recommendation {
  id: string;
  locationId: string;
  kind: RecommendationKind;
  status: RecommendationStatus;
  title: string;
  rationale: string;
  estimatedImpactMxn: number | null;
  expiresAt: string | null;
  createdAt: string;
}

// ─── MENU DIGITAL DEL CLIENTE (público, QR en mesa) ──────────

export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "PLACED"
  | "IN_KITCHEN"
  | "READY"
  | "SERVED"
  | "CANCELLED";

export type OrderPaymentMethod = "MOBILE" | "CASHIER";

export type OrderPaymentStatus = "PENDING" | "PAID";

export interface MenuItemPublic {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  priceCents: number;
  taxRate: number;
  imageUrl: string | null;
  tags: string[];
  rating: number | null;
}

export interface MenuCategoryPublic {
  id: string;
  name: string;
  sortKey: number;
  items: MenuItemPublic[];
}

/** Respuesta de GET /api/menu/public/:locationId — todo lo que el menú del
 *  cliente necesita para renderizar sin segundo round-trip. */
export interface PublicMenuResponse {
  locationId: string;
  locationName: string;
  tenantName: string;
  currency: Tenant["currency"];
  categories: MenuCategoryPublic[];
}

// ─── KPIs / TABLERO (agregados sobre ventas) ────────────────

export interface KpiTrendPoint {
  date: string; // YYYY-MM-DD
  revenueCents: number;
}

export interface KpiMenuMixItem {
  name: string;
  qty: number;
  revenueCents: number;
}

export interface KpiSummaryResponse {
  today: {
    revenueCents: number;
    tickets: number;
    covers: number;
    avgTicketCents: number;
  };
  yesterdayRevenueCents: number;
  revenueDeltaPct: number; // hoy vs ayer
  foodCostPct: number; // promedio de recetas (0..100)
  forecastCoversToday: number;
  trend: KpiTrendPoint[]; // últimos 14 días
  menuMix: KpiMenuMixItem[]; // top por ingreso (30 días)
  counts: {
    ordersActive: number;
    recommendationsPending: number;
    anomaliesToday: number;
    reservationsToday: number;
  };
}

// ─── SCHEDULE (staffing por daypart/rol) ────────────────────

export interface ScheduleRoleDTO {
  role: string;
  needed: number;
  suggested: number;
  actual: number;
}

export interface ScheduleDaypartDTO {
  daypart: string;
  roles: ScheduleRoleDTO[];
  neededTotal: number;
  actualTotal: number;
}

export interface ScheduleResponse {
  date: string;
  dayparts: ScheduleDaypartDTO[];
  summary: { neededTotal: number; suggestedTotal: number; actualTotal: number; coveragePct: number };
}

// ─── CAMPAÑAS (WhatsApp) ────────────────────────────────────

export interface CampaignDTO {
  id: string;
  templateId: string;
  segmentName: string | null;
  channel: string;
  status: string;
  sends: number;
  openRatePct: number;
  responseRatePct: number;
  conversionCents: number;
}

export interface CampaignsResponse {
  campaigns: CampaignDTO[];
}

// ─── RESEÑAS ────────────────────────────────────────────────

export interface ReviewDTO {
  id: string;
  source: string;
  rating: number;
  text: string | null;
  sentiment: number | null;
  topics: string[];
  createdAt: string;
}

export interface ReviewTopicDTO {
  topic: string;
  count: number;
}

export interface ReviewsResponse {
  summary: { avgRating: number; count: number; avgSentiment: number; positivePct: number };
  topics: ReviewTopicDTO[];
  reviews: ReviewDTO[];
}

// ─── RESERVAS (agenda del día) ──────────────────────────────

export interface ReservationDTO {
  id: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedAt: string; // ISO
  time: string; // HH:mm (hora local MX ya formateada por el server)
  status: ReservationStatus;
  notes: string | null;
  source: string;
}

export interface ReservationsResponse {
  date: string; // YYYY-MM-DD
  locationName: string;
  summary: {
    total: number; // reservas agendadas (excluye waitlist)
    covers: number; // comensales esperados (activas + sentadas + completadas)
    confirmed: number;
    seated: number;
    completed: number;
    pending: number;
    noShow: number;
    waitlist: number;
  };
  reservations: ReservationDTO[]; // agendadas, ordenadas por hora
  waitlist: ReservationDTO[]; // lista de espera
}

// ─── CO-PILOTO (chat fundamentado en datos reales) ──────────

export interface CopilotChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CopilotChatResponse {
  message: string; // respuesta del asistente
  model: string; // modelo que respondió (p.ej. anthropic/claude-3.5-sonnet)
  contextAt: string; // ISO — momento del snapshot de datos usado como contexto
}

// ─── ADMIN (panel de plataforma, rol ADMIN) ─────────────────

export interface AdminTenantDTO {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  createdAt: string;
  locations: number;
  users: number;
  orders: number; // total histórico
  monthRevenueCents: number; // ventas del mes en curso
  lastActivityAt: string | null; // ISO — última venta o pedido
}

export interface AdminTenantsResponse {
  summary: {
    tenants: number;
    locations: number;
    users: number;
    orders: number;
    monthRevenueCents: number;
  };
  tenants: AdminTenantDTO[];
}

// ─── FORECAST (motor de demanda) ────────────────────────────

export interface ForecastDayDTO {
  date: string; // YYYY-MM-DD
  covers: number;
  revenueCents: number;
  confidenceLowCents: number;
  confidenceHighCents: number;
}

export interface ForecastDaypartDTO {
  daypart: string; // LUNCH | AFTERNOON | DINNER | ...
  covers: number;
  revenueCents: number;
}

export interface ForecastResponse {
  summary: {
    mapePct: number;
    covers7d: number;
    revenue7dCents: number;
    avgConfidencePct: number;
  };
  days: ForecastDayDTO[];
  peakDay: { date: string; dayparts: ForecastDaypartDTO[] } | null;
}

// ─── RECETAS (costeo dinámico) ──────────────────────────────

export interface RecipeIngredientDTO {
  ingredientId: string;
  name: string;
  qty: number;
  unit: string;
  unitCostCents: number | null;
  extCents: number; // qty * unitCost
}

export interface RecipeDTO {
  menuItemId: string;
  sku: string;
  name: string;
  priceCents: number;
  foodCostCents: number;
  foodCostPct: number; // 0..100
  marginCents: number;
  lines: RecipeIngredientDTO[];
}

export interface RecipesResponse {
  recipes: RecipeDTO[];
}

// ─── FACTURAS (OCR de compras) ──────────────────────────────

export interface InvoiceLineDTO {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitCostCents: number;
  totalCents: number;
}

export interface InvoiceDTO {
  id: string;
  supplierName: string | null;
  status: string; // enum InvoiceStatus
  statusLabel: string; // etiqueta en español
  invoicedAt: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  lines: InvoiceLineDTO[];
}

export interface InvoicesResponse {
  invoices: InvoiceDTO[];
}

// ─── ANOMALÍAS + RECOMENDACIONES (feed) ─────────────────────

export interface RecommendationDTO {
  id: string;
  kind: RecommendationKind;
  status: RecommendationStatus;
  title: string;
  rationale: string;
  estimatedImpactCents: number | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface RecommendationsFeedResponse {
  summary: { anomaliesToday: number; roiProjectedCents: number; appliedCount: number };
  recommendations: RecommendationDTO[];
}

// ─── PROVEEDORES ────────────────────────────────────────────

export interface SupplierDTO {
  id: string;
  name: string;
  rfc: string | null;
  email: string | null;
  phone: string | null;
  ingredientCount: number;
}

export interface SupplierIngredientDTO {
  id: string;
  name: string;
  category: string | null;
  baseUnit: string;
  costPerUnitCents: number | null;
  supplierName: string | null;
}

export interface SuppliersResponse {
  suppliers: SupplierDTO[];
  ingredients: SupplierIngredientDTO[];
}

// ─── CRM: HUÉSPEDES ─────────────────────────────────────────

/** Categoría en español que espera el badge del front. */
export type GuestCategory = "VIP" | "Foodie" | "Nuevo" | "Riesgo" | "Habitual";

export interface GuestDTO {
  id: string;
  name: string;
  email: string | null;
  category: GuestCategory;
  lastVisitAt: string | null;
  totalSpentCents: number;
  visitCount: number;
  birthdayToday: boolean;
}

export interface GuestSegmentDTO {
  id: string;
  name: string;
  kind: GuestSegment;
  count: number;
}

export interface GuestsResponse {
  summary: { vips: number; churnRisk: number; avgVisits: number };
  segments: GuestSegmentDTO[];
  guests: GuestDTO[];
}

// ─── MENU ADMIN (gestión de la carta desde el panel) ────────

export interface AdminMenuItem {
  id: string;
  sku: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  priceCents: number;
  taxRate: number;
  imageUrl: string | null;
  tags: string[];
  rating: number | null;
  active: boolean;
}

export interface AdminMenuCategory {
  id: string;
  name: string;
  sortKey: number;
}

/** Respuesta de GET /api/menu/admin/:locationId — categorías + items (incl.
 *  inactivos) para el editor de la carta. */
export interface AdminMenuResponse {
  locationId: string;
  locationName: string;
  categories: AdminMenuCategory[];
  items: AdminMenuItem[];
}

/** Respuesta del endpoint de subida de imágenes. */
export interface UploadResponse {
  url: string;
  path: string;
  size: number;
}

export interface OrderItemDTO {
  id: string;
  menuItemId: string | null;
  name: string;
  qty: number;
  unitCents: number;
  totalCents: number;
  notes: string | null;
}

/** Respuesta al crear un pedido. `checkoutUrl` viene solo cuando el pago es
 *  MOBILE con pasarela activa: el cliente debe redirigirse ahí para pagar. */
export interface CreateOrderResponse extends OrderSummaryDTO {
  checkoutUrl?: string | null;
}

/** Respuesta al crear/consultar un pedido (POST y GET /api/orders/public). */
export interface OrderSummaryDTO {
  id: string;
  code: string;
  status: OrderStatus;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;
  customerName: string | null;
  tableLabel: string | null;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: string;
  items: OrderItemDTO[];
}
