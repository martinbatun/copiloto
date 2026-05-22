# INTEGRATION PLAN — Copiloto

Las integraciones son el moat. Sin POS conectado no hay producto. Sin WhatsApp no hay propuesta LATAM diferenciada.

## 1. POS connectors

### Soft Restaurant (prioridad 1)

- **Por qué primero:** mayor base instalada en restaurantes independientes en MX (~30k sucursales según estimaciones de canal).
- **Tipo de conexión:** mayoritariamente on-prem. Tres modos posibles:
  1. **API REST** si el operador ya tiene Soft Restaurant Cloud.
  2. **SFTP** con dumps periódicos (cada 30 min) si la sucursal corre la versión local.
  3. **SQL mirror** vía agente liviano que replica la DB local a Supabase.
- **Estrategia:** empezar con (1) para operadores en la nube. (2) y (3) requieren cliente del operador descargando un binario; agendar para fase 2.
- **Frecuencia:** polling cada 5 min (no hay webhooks).
- **Adapter:** `apps/api/server/lib/pos.ts` define la interfaz; implementación en archivo aparte por provider.

### OneCore (prioridad 2)

- API REST documentada. Conexión más simple que Soft. Operadores típicamente mid-market.
- Polling cada 5 min.

### Clip (prioridad 3)

- API REST + webhooks. Buen volumen en MX como procesador de pagos + POS ligero.
- Webhook idempotente vía `posExternalId`.

### Square / Toast (prioridad 4)

- OAuth + webhooks. Para operadores con presencia dual MX-US.
- Square es el más simple; Toast tiene su propio gating de acceso a developer.

### Manual CSV (fallback)

- Para operadores con POS no soportado. Upload semanal de CSV con esquema fijo.
- Permite onboarding desde el día 1 incluso sin conector nativo.

### Validación de calidad (en todos los adapters)

- `posExternalId` único por (locationId, provider).
- `totalCents === sum(lines.totalCents) - discount + tax + tip` con tolerancia ±5¢ (redondeos).
- `closedAt > openedAt`.
- Si una venta cambia post-cierre (reapertura, void), reingestamos con el mismo `posExternalId` → upsert.

## 2. WhatsApp Business API

### Provider: Meta Cloud API (no BSP)

- Por qué: control directo, costo más bajo a escala, no dependemos de un BSP intermediario.
- Costo: utility messages gratis dentro de la ventana de 24h; marketing messages tarificados por país.

### Setup técnico

1. Cliente crea su WhatsApp Business Account en Meta Business Manager.
2. Asigna a Copiloto vía System User token (no compartimos credenciales personales).
3. Compramos número o portamos el existente.
4. Configuramos webhook → `https://app.copiloto.mx/agent-api/api/webhook/whatsapp`.

### Templates aprobados

Mínimo set para v1:
- `reservation_confirm_v1` — utility — confirmación de reserva.
- `reservation_reminder_v1` — utility — recordatorio 24h antes.
- `no_show_recovery_v1` — marketing — cupón post no-show.
- `post_visit_feedback_v1` — utility — pregunta de feedback.

Todo template marketing requiere opt-in registrado en Guest.

### Rate limits

- Tier 1 (default Meta): 1,000 conversaciones únicas/24h.
- Tier upgrade requiere 30 días de volumen consistente.
- En el agente: rate-limit por tenant + queue priorización para no chocar contra el límite global.

## 3. OCR de facturas

### Provider: Mindee (primero) / AWS Textract (escala)

- **Mindee** tiene templates pre-entrenados para invoices LATAM. Buen ratio precio/precisión para v1.
- **AWS Textract** cuando crucemos ~10k facturas/mes.

### Pipeline

```
Upload → S3/Supabase Storage → trigger OCR → Mindee callback → parse → match supplier/ingredient → human review
```

- Estado `OCR_DONE → NORMALIZED` siempre pasa por revisión humana en v1 (precisión del mapping ingrediente requiere validación).
- Eventualmente automatizable cuando el modelo de matching supere 95% en producción.

## 4. Procesadores de pago (solo lectura para conciliación)

### Stripe / Mercado Pago / Clip

- Lectura via OAuth (no procesamos pagos).
- Match contra `SalesPayment` para detectar discrepancias (cobros sin venta, ventas sin cobro).
- Util para auditoría de propinas y chargebacks.

## 5. Forecast service

- Servicio Python independiente. Conexión vía HTTP interna en VPC.
- Entrenamiento: batch nocturno con datos del día.
- Serving: endpoint `POST /predict` con timeout 2s. Si excede → core usa baseline naive como fallback.

## 6. LLM

- **OpenRouter** como router de modelos. Permite cambiar provider sin tocar código.
- Default: `anthropic/claude-3.5-sonnet` para co-piloto + agente FOH.
- Modelos baratos (Haiku, Llama, GPT-4o-mini) para tareas batch.
- Abstracción en `apps/api/server/lib/ai.ts` y `agent/apps/api/server/lib/agent.ts`.

## 7. Email (transaccional)

- **Resend** para transaccional (welcome, reset password, alertas).
- No usamos email para marketing al huésped — eso vive en WhatsApp.

## 8. Observabilidad

- **Sentry** errores + perf.
- **OpenTelemetry** traces.
- **Logflare** o CloudWatch para logs estructurados.

## Roadmap de integraciones por fase

| Fase | Integración nueva | Por qué ahora |
|---|---|---|
| 1 | Soft Restaurant (REST), Forecast Python, Sentry | Probar promesa de margen |
| 2 | OpenRouter LLM, Slack para alertas internas | Co-piloto necesita LLM real |
| 3 | Meta Cloud API, OneCore, Resend | CRM + WhatsApp |
| 4 | Mindee OCR, Clip, Stripe (lectura) | Recetas dinámicas + conciliación |
| 5 | Square, Toast, AWS Textract, visión (Roboflow / propio) | Escala y ampliación geográfica |
