// Integración con Mercado Pago (Checkout Pro). El cliente paga en el checkout
// hospedado por MP (cero datos de tarjeta tocan nuestro server) y MP nos avisa
// por webhook. Todo es opcional: si no hay MERCADO_PAGO_TOKEN, isMpEnabled()
// es false y el flujo de pago cae al modo simulado.
import {
  MercadoPagoConfig,
  Preference,
  Payment,
  WebhookSignatureValidator,
} from "mercadopago";

const ACCESS_TOKEN = process.env.MERCADO_PAGO_TOKEN;
const WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

/**
 * ¿Está la pasarela COMPLETAMENTE configurada para cobrar en línea? Exige el
 * token Y el webhook secret: sin el secret, validateWebhookSignature siempre
 * lanza y ningún pago se confirma (el cliente pagaría pero el pedido nunca
 * entraría a cocina). Si devuelve false, el caller NO debe iniciar pago en
 * línea (ver la lógica fail-closed en routes/orders.ts).
 */
export function isMpEnabled(): boolean {
  return Boolean(ACCESS_TOKEN && WEBHOOK_SECRET);
}

function client(): MercadoPagoConfig {
  if (!ACCESS_TOKEN) throw new Error("MERCADO_PAGO_TOKEN no configurado");
  return new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
}

export interface CheckoutItem {
  id: string;
  title: string;
  quantity: number;
  unitCents: number;
}

/**
 * Crea una preferencia de Checkout Pro y devuelve el init_point (URL a la que
 * redirigir al cliente). `external_reference` = orderId para reconciliar en el
 * webhook. Los precios van en pesos (MP no usa centavos).
 */
export async function createCheckoutPreference(args: {
  orderId: string;
  items: CheckoutItem[];
  currency: string;
  backUrl: string;
  notificationUrl: string;
}): Promise<{ preferenceId: string; checkoutUrl: string }> {
  const pref = await new Preference(client()).create({
    body: {
      items: args.items.map((i) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unitCents / 100,
        currency_id: args.currency,
      })),
      external_reference: args.orderId,
      back_urls: {
        success: args.backUrl,
        pending: args.backUrl,
        failure: args.backUrl,
      },
      auto_return: "approved",
      notification_url: args.notificationUrl,
    },
  });
  const checkoutUrl = pref.init_point ?? pref.sandbox_init_point;
  if (!pref.id || !checkoutUrl) {
    throw new Error("Mercado Pago no devolvió init_point");
  }
  return { preferenceId: String(pref.id), checkoutUrl };
}

/** Trae un pago por id para conocer su estado real (no confiar en el webhook). */
export async function getPayment(paymentId: string): Promise<{
  status: string | undefined;
  externalReference: string | undefined;
  transactionAmount: number | undefined; // monto cobrado, en pesos (no centavos)
}> {
  const p = await new Payment(client()).get({ id: paymentId });
  return {
    status: p.status,
    externalReference: p.external_reference,
    transactionAmount: p.transaction_amount,
  };
}

/**
 * Valida la firma del webhook (HMAC-SHA256 oficial del SDK, tiempo constante +
 * tolerancia anti-replay). Lanza si la firma es inválida. Si no hay secret
 * configurado, lanza también (no aceptamos webhooks sin verificar).
 */
export function validateWebhookSignature(args: {
  xSignature: string | string[] | undefined;
  xRequestId: string | string[] | undefined;
  dataId: string | string[] | undefined;
}): void {
  if (!WEBHOOK_SECRET) {
    throw new Error("MERCADO_PAGO_WEBHOOK_SECRET no configurado");
  }
  WebhookSignatureValidator.validate({
    xSignature: args.xSignature,
    xRequestId: args.xRequestId,
    dataId: args.dataId,
    secret: WEBHOOK_SECRET,
    toleranceSeconds: 300,
  });
}
