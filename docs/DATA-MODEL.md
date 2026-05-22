# DATA MODEL — Copiloto

Hay dos schemas Prisma — uno para el core (`apps/api/prisma/schema.prisma`) y otro para el agente (`agent/apps/api/prisma/schema.prisma`). No comparten DB ni cliente.

## Core schema (20 modelos)

### Tenancy
- **Tenant** — cuenta del operador. Multi-sucursal por defecto. `country` + `currency` + `timezone` para localización.
- **User** — pertenece a un Tenant. Roles: `OWNER`, `MANAGER`, `STAFF`, `ADMIN`. `OWNER` es el firmante del contrato; `ADMIN` es staff de Copiloto.
- **Location** — sucursal. Tiene `PosCredential` y un timezone propio (un Tenant puede operar en TZ distintas).
- **UserLocation** — n:m de permisos por sucursal.
- **PosCredential** — credenciales encriptadas para el conector. Provider + `lastSyncAt` para diagnóstico.

### Menú y recetas
- **MenuCategory / MenuItem** — catálogo del operador. `priceCents + taxRate`.
- **Ingredient** — SKU de almacén. `baseUnit` (g / ml / pza) define la unidad de costo.
- **Recipe / RecipeLine** — receta por menu item. `foodCostCents` se cachea para queries rápidos del dashboard.

### Proveedores e ingestión OCR
- **Supplier** — catálogo simple.
- **Invoice** — pipeline de 4 estados: `RECEIVED → OCR_PENDING → OCR_DONE → NORMALIZED → RECONCILED`.
- **InvoiceLine** — el mapping `description → ingredient` puede fallar; cuando falla, queda con `ingredientId = null` para revisión manual.

### POS ingestion
- **SalesEvent** — la tabla más pesada. `@@unique([locationId, posExternalId])` garantiza idempotencia al re-ingestar.
- **SalesLine** — items vendidos. `voided` y `discountCents` separados para audit.
- **SalesPayment** — método de pago + processor (para conciliación).

### Forecasting y staffing
- **ForecastBucket** — `@@unique([locationId, date, daypart, channel])`. Persiste el output del servicio Python para queries rápidos. `mape` se llena post-hoc con la actual vs predicted.
- **Shift** — `@@unique([locationId, date, daypart, role])`. `staffSuggested` vs `staffActual` para medir adherencia.

### Inventario
- **ParLevel** — sugerido por ingrediente y fecha.
- **InventoryCount / InventoryCountLine** — conteo físico. Para calcular varianza = (sugerido − ventas − contado) ≈ merma.
- **PrepList / PrepLine** — mise en place generado a partir del forecast + recetas + par actual.

### Anomalies y recommendations (el corazón)
- **Anomaly** — 7 kinds. `severity 1–5`. `payload Json` para data específica del tipo.
- **Recommendation** — `kind` (10 tipos), `status` (6 estados), `estimatedImpactCents`, `expiresAt`. Linked a una Anomaly opcional.
- **ActionLog** — cada decisión del manager. `actualImpactCents` se llena por un cron N días después → input para entrenar el modelo de "qué recomendaciones de hecho funcionan".

### CRM
- **Guest** — `@@unique([tenantId, phone])` para merging. `marketingOptIn` controla WhatsApp.
- **Segment** — `kind` enum + `rules` JSON. Segmentos del sistema (VIP, CHURN_RISK) se recalculan diario.
- **GuestSegmentLink** — n:m.
- **Campaign** — coordinada con el agente. `templateId` apunta a un Template del agent schema.
- **CampaignSend** — métricas por guest (delivered, read, responded, conversion).

### Reservas y reviews
- **Reservation** — `@@index([locationId, reservedAt])`. `status` enum con WAITLIST como estado válido.
- **Review** — `source` (google / tripadvisor / whatsapp / direct), `sentiment` ∈ [-1, 1], `topics Json[]` (extraídos por LLM).

## Agent schema (7 modelos)

### Estado conversacional
- **Conversation** — `@@unique([locationId, phoneE164])`. `currentFlow + flowState` mantienen la state machine.
- **Message** — todo inbound y outbound. `externalId` = `wamid` de Meta. Status pipeline: `QUEUED → SENT → DELIVERED → READ` (o `FAILED`).

### Definición de campañas
- **Template** — `@@unique([tenantId, name, locale])`. `metaId` cuando ya fue aprobado por Meta. `status` enum.
- **Flow** — state machine nombrada. `definition Json` con DSL serializado.
- **Broadcast** — fan-out de WhatsApp. `campaignId` apunta a `Campaign` del core.

### Telemetría del agente
- **AgentSession** — thread + token usage para billing.

## Cuántos eventos al día (estimación)

Operador típico con 1 sucursal y ticket medio:
- 200–400 ventas/día → 200–400 `SalesEvent`, 600–1,200 `SalesLine`.
- 1 forecast por daypart × 4 dayparts × 4 channels = 16 `ForecastBucket`/día.
- 3–10 `Anomaly`/día.
- 5–15 `Recommendation`/día.
- 5–20 `Conversation` activas en WhatsApp.
- 50–200 `Message` en agente.

A 1,000 sucursales:
- 200–400k SalesEvent/día.
- 600k–1.2M SalesLine/día.

Particionado por `tenantId` o `locationId` se vuelve obligatorio antes de cruzar 100k SalesEvent/día por DB. Supabase aguanta el primer año sin esto.

## Diagrama ER simplificado

```
Tenant ──┬──> User ──┬──> UserLocation ──> Location ──┬──> PosCredential
         │           └──> ActionLog                   ├──> SalesEvent ──> SalesLine
         │                                            │                └──> SalesPayment
         ├──> MenuCategory ──> MenuItem ──> Recipe ──> RecipeLine ──> Ingredient
         │                                            ├──> ForecastBucket
         ├──> Supplier ──> Invoice ──> InvoiceLine ──┐│
         │                                           ││
         ├──> Ingredient <─────────────────────────────┘
         │       ├──> ParLevel                       │
         │       ├──> InventoryCountLine             │
         │       └──> PrepLine                       │
         │                                            │
         ├──> Guest ──> GuestSegmentLink ──> Segment │
         │       │                            │      │
         │       ├──> Reservation <───────────│──────┤
         │       ├──> Review <────────────────│──────┤
         │       └──> CampaignSend <── Campaign      │
         │                                            │
         ├──> Anomaly ──> Recommendation ──> ActionLog
         └──> Recommendation
```
