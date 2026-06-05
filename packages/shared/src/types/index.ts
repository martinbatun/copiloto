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
