# Runbook — Copiloto (vertical de pedidos)

Guía rápida para los problemas más comunes en operación. Arquitectura: **web**
en Vercel (`copiloto-web`), **API** en Render (`copiloto-api`), **DB/Storage** en
Supabase, **pagos** con Mercado Pago.

## Diagnóstico exprés

```bash
curl https://<API>/api/health        # ¿la API responde?  → {"status":"ok"}
curl https://<API>/api/menu/public/<locationId>   # ¿DB + menú OK? → JSON
```
- `Cannot GET ...` → la API corre **código viejo**; redeploy desde `main`.
- `Tenant or user not found` → la **DB de Supabase está pausada** (ver abajo).
- 500 en el menú → revisa Sentry (si `SENTRY_DSN` está puesto) o los logs de Render.

## Síntomas y solución

### El menú del cliente no carga / "No pudimos cargar el menú"
1. `GET /api/health`: si no responde, la API está caída o dormida.
   - **Render plan free duerme** tras ~15 min sin tráfico (cold start 30–60s). La
     primera petición la despierta; súbelo a `starter` para always-on.
2. Si health responde pero el menú da 500 → **DB pausada** (siguiente punto).
3. Si el cliente ve "Este menú no está disponible" (404) → la sucursal no existe
   o está `active=false`. Verifica el `locationId` del QR.

### `Tenant or user not found` (Supabase pausado)
El free tier pausa el proyecto por inactividad. **Solución:** Supabase → el
proyecto → **Resume**. Las queries se restablecen en segundos.

### La API quedó con código viejo tras un merge
No hay auto-deploy salvo el de Render (autoDeploy en `main`). Si el web (Vercel)
se actualizó pero la API no:
- Render → servicio `copiloto-api` → **Manual Deploy → Deploy latest commit**.
- Verifica con `GET /api/health` y la ruta que fallaba.

### Un pedido pagado en línea no entró a cocina
El pedido queda en `AWAITING_PAYMENT` hasta que llega el **webhook de Mercado
Pago**. Si no llegó:
1. Revisa en MP → Webhooks que la URL sea `https://<API>/api/orders/webhook/mp`
   y esté activa.
2. Revisa logs de Render: `firma inválida` → `MERCADO_PAGO_WEBHOOK_SECRET` mal
   configurado; `sin external_reference` → preferencia creada sin el orderId.
3. El webhook es **idempotente**: MP reintenta; al corregir el secret se concilia.
4. Mientras tanto, cobra en caja y avanza el pedido manualmente en `/orders`.

### Rate limit (429) inesperado
El backstop es `RATE_LIMIT_PER_MIN` (default 300/IP/min). Un venue muy grande
detrás de un solo IP de WiFi podría toparlo → súbelo en las env de Render.
`/api/health` y el webhook de MP están exentos.

### Pedidos de prueba / demo en la DB
El seed (`db:seed`) mete datos demo y **está bloqueado en producción**
(`NODE_ENV=production`). Para limpiar pedidos de prueba, hazlo desde la DB o
márcalos `CANCELLED` en `/orders`.

## Checklist de deploy a un entorno nuevo
1. Supabase del entorno → `pnpm db:push` con sus `DATABASE_URL`/`DIRECT_URL` (NO `db:seed`).
2. Render (`render.yaml`) → llenar secretos: DB, `JWT_SECRET`, `SUPABASE_*`,
   `MERCADO_PAGO_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`, `SENTRY_DSN` (opcional).
3. Vercel → `NEXT_PUBLIC_API_URL` = URL de la API → redeploy del web.
4. MP → registrar webhook `https://<API>/api/orders/webhook/mp`.
5. Smoke: `GET /api/health`, abrir el menú, crear un pedido de prueba y cancelarlo.
