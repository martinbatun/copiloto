import { z } from "zod";

export type ConversationStatus = "ACTIVE" | "WAITING_HUMAN" | "RESOLVED" | "ABANDONED";

export type FlowKind =
  | "RESERVATION_NEW"
  | "RESERVATION_CONFIRM"
  | "RESERVATION_REMINDER"
  | "NO_SHOW_RECOVERY"
  | "MENU_QUESTION"
  | "POST_VISIT_FEEDBACK"
  | "GENERIC_INQUIRY"
  | "MANAGER_COPILOT";

export type MessageDirection = "INBOUND" | "OUTBOUND";

export type MessageStatus = "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED";

export const WhatsAppInboundSchema = z.object({
  // Subset del payload de Meta Cloud API. Validamos solo lo que usamos.
  object: z.literal("whatsapp_business_account"),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(z.unknown()),
    })
  ),
});

export const BroadcastDraftSchema = z.object({
  campaignId: z.string().uuid(),     // id del core
  templateName: z.string(),          // template aprobado por Meta
  segment: z.array(z.string()),      // E.164 phone numbers
  variables: z.record(z.string()).default({}),
  scheduledAt: z.string().datetime().optional(),
});
