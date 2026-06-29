# Pago real con Mercado Pago (Checkout Pro)

El botón **"Pagar ahora desde el móvil"** del menú del cliente cobra con
**Mercado Pago Checkout Pro**: el comensal se va al checkout hospedado por MP
(tarjetas, SPEI, OXXO, MSI) y MP confirma el pago por **webhook**. "Enviar a
caja" sigue igual (entra a cocina, se cobra en caja).

## Cómo funciona el flujo

1. El cliente elige "Pagar desde el móvil" → `POST /api/orders/public` crea el
   pedido en estado **`AWAITING_PAYMENT`** (NO entra a cocina todavía) y genera
   una preferencia de MP. La respuesta trae `checkoutUrl`.
2. El web redirige al `checkoutUrl`. El cliente paga en MP.
3. MP llama a `POST /api/orders/webhook/mp`. El server **verifica la firma**,
   consulta el pago real en MP y, si está `approved`, mueve el pedido a
   **`PLACED` + `PAID`** (ahí sí aparece en cocina). Es **idempotente**.
4. MP regresa al cliente a `/menu/:loc/confirmacion/:order`, que hace polling
   hasta ver el pago confirmado.

> **Fallback:** si `MERCADO_PAGO_TOKEN` está vacío, el pago móvil cae a modo
> **simulado** (se marca `PAID` al instante). Así dev/staging funcionan sin
> credenciales. El pago real se activa solo con el token puesto.

## Configuración

### 1. Credenciales en Mercado Pago
- [Tus Integraciones](https://www.mercadopago.com.mx/developers/panel) → crea una
  aplicación → copia el **Access Token** (de producción).
- En **Webhooks** de esa app, registra la URL
  `https://<API>/api/orders/webhook/mp` (evento **Pagos**) y copia la **clave
  secreta** de firma.

### 2. Variables de entorno (en Render/Fly)
| Variable | Valor |
|---|---|
| `MERCADO_PAGO_TOKEN` | Access Token de producción |
| `MERCADO_PAGO_WEBHOOK_SECRET` | clave secreta del webhook |
| `PUBLIC_WEB_URL` | URL pública del web (ej. `https://copiloto-web.vercel.app`) |
| `PUBLIC_API_URL` | URL pública de la API (ej. `https://copiloto-api-z7j2.onrender.com`) |

`PUBLIC_WEB_URL` arma las `back_urls`; `PUBLIC_API_URL` arma el `notification_url`.

## Probar en sandbox

1. Usa el **Access Token de prueba** y el secret de prueba de tu app.
2. Crea un pedido con "Pagar desde el móvil" → te manda al checkout sandbox.
3. Paga con una [tarjeta de prueba](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/additional-content/test-cards).
4. El webhook debe llegar y el pedido pasar a `PLACED`/`PAID` (aparece en `/orders`).

> El `notification_url` debe ser **público** para que MP lo alcance. En local,
> usa un túnel (ngrok/cloudflared) y pon esa URL en `PUBLIC_API_URL`.

## Seguridad (implementado)
- Webhook con **verificación de firma** HMAC (anti-replay, tiempo constante) vía
  `WebhookSignatureValidator` del SDK oficial.
- El estado del pago se lee **desde MP** (`getPayment`), no del body del webhook.
- **Idempotente**: `updateMany` solo si el pedido no estaba ya `PAID`.
- Montos calculados en el server (nunca se confía en el cliente).
