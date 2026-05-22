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
