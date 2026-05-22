# ARCHITECTURE — Copiloto

## Vista general

```
┌──────────────────┐     ┌────────────────┐     ┌─────────────────┐
│ POS Connectors   │────▶│  Core API      │◀───▶│ Forecast Svc    │
│ (Soft, OneCore,  │     │ (Express 5)    │     │ (Python LightGBM│
│  Clip, Square,   │     │ apps/api :3400 │     │  XGBoost) :9100 │
│  Toast, CSV)     │     └────────────────┘     └─────────────────┘
└──────────────────┘            ▲    ▲
                                │    │
        ┌───────────────────────┘    │
        │                            │
┌──────────────────┐         ┌───────────────┐
│ Dashboard Web    │         │ Agent API     │
│ Next.js :5400    │         │ Express :3500 │
│ (apps/web)       │◀───────▶│ + WhatsApp WBA│
└──────────────────┘         └───────────────┘
        ▲                            ▲
        │                            │
        │                    ┌───────────────┐
        │                    │ Meta Cloud API│
        │                    │ (WhatsApp)    │
        │                    └───────────────┘
        │
┌──────────────────┐
│ Agent Admin Web  │
│ Next.js :5500    │  basePath /agent (proxied desde 5400)
│ agent/apps/web   │
└──────────────────┘
```

## Componentes

### Core API (`apps/api`)
- **Stack:** Express 5, Prisma 6, PostgreSQL (Supabase).
- **Responsabilidades:** ingesta POS, KPIs, motor de recomendaciones, action ledger, CRM, recetas/costeo, co-piloto conversacional (web).
- **Puerto:** 3400.

### Dashboard Web (`apps/web`)
- **Stack:** Next.js 15 App Router, React 19, Tailwind, Radix, TanStack Query, Recharts.
- **Responsabilidades:** UI del operador (manager + dueño). Login, dashboard, vistas de cada pilar.
- **Puerto:** 5400.

### Agent API (`agent/apps/api`)
- **Stack:** Express 5, Prisma 6, PostgreSQL (DB separada).
- **Responsabilidades:** webhook Meta Cloud API, state machine de conversaciones, agent loop (LLM con tools), broadcasts coordinados.
- **Puerto:** 3500.
- **Justificación de separación:** WhatsApp recibe ráfagas que no deben presionar al core; compliance de WBA tiene su propia capa.

### Agent Admin Web (`agent/apps/web`)
- **Stack:** Next.js 15 con `basePath: "/agent"`.
- **Responsabilidades:** inbox de conversaciones, gestión de templates aprobados, definición de flows.
- **Puerto:** 5500. Servido via rewrite desde 5400 para mantener single-origin.

### Forecast Service (sidecar Python)
- **Stack:** FastAPI + LightGBM/XGBoost + pandas.
- **Endpoint:** `POST /predict` con features serializados; devuelve `expectedCovers + expectedRevenueCents + intervalos de confianza + modelVersion`.
- **Por qué separado:** Prisma cliente JS no juega con Python; entrenamiento usa pandas/sklearn que no pertenecen en Node; permite escalar el servicio Python aparte.
- **Puerto:** 9100.
- **Modo dev:** si `FORECAST_SERVICE_URL` no está seteado, el core usa baseline naive para no bloquear desarrollo.

### LLM (OpenRouter)
- Provider abstracto. Routing por tarea + costo.
- Default: `anthropic/claude-3.5-sonnet` para co-piloto y agente FOH (calidad alta + tool use).
- Modelos más baratos (Haiku, Llama) para tareas batch como categorización de reviews.

## Flujos clave

### Flujo de ingesta POS

```
POS (Soft Restaurant) ─[poll cada 5 min]─▶ adapter ─▶ NormalizedSale[] ─▶ upsert SalesEvent
                                                                                     │
                                                                                     ▼
                                                                              [trigger jobs]
                                                                             ┌───────┴────────┐
                                                                             ▼                ▼
                                                                       anomaly detector   forecast recompute
                                                                             │                │
                                                                             ▼                ▼
                                                                       Anomaly[]         ForecastBucket[]
                                                                             │
                                                                             ▼
                                                                       Recommendation[]
                                                                             │
                                                                             ▼
                                                                       UI feed manager
```

### Flujo del agente WhatsApp (FOH)

```
Inbound message ─▶ Meta ─▶ webhook ─▶ enqueue ─▶ worker
                                                    │
                                                    ▼
                                          load Conversation + Flow
                                                    │
                                                    ▼
                                          LLM agent loop con tools
                                          (findReservationSlots, createReservation,
                                           lookupGuest, fetchMenuItem, escalateToHuman)
                                                    │
                                                    ▼
                                          Outbound message ─▶ Meta Graph API ─▶ huésped
```

### Flujo del co-piloto del manager

```
Manager pregunta ─▶ /api/copilot/chat ─▶ agent loop con tools
                                                    │
                                                    ▼
                                          queries vs SalesEvent / Anomaly / KPI
                                          + draft de Recommendation propuesta
                                                    │
                                                    ▼
                                          Respuesta + 1 click "Ejecutar"
                                                    │
                                                    ▼
                                          ActionLog (audit + entrenamiento)
```

## Decisiones arquitectónicas

### Por qué dos Prisma schemas

El core y el agente tienen ciclos de vida distintos: el core va al ritmo de releases de producto; el agente al ritmo del compliance de WhatsApp y del LLM provider. Mezclarlos en un solo schema genera fricción y migraciones acopladas.

Costo: dos clientes Prisma generados, dos `db push`. Beneficio: aislamiento real y posibilidad de escalar las DBs independientemente (la del agente recibe mucho más volumen por mensaje).

### Por qué WhatsApp como canal nativo

LATAM tiene 80%+ de penetración de WhatsApp. Email tiene tasas de apertura del 15–25%; WhatsApp del 70–95% en utility messages. El agente FOH no es feature: es infraestructura.

### Por qué human-in-the-loop por defecto

Reportar "+5–8 pp de margen" exige confianza. Cambiar precios, mandar campañas masivas o overridear el schedule sin supervisión humana puede generar errores caros. Solo después de 90 días de track record positivo en una categoría, el modo autopilot se desbloquea para esa categoría.

### Por qué no construir nuestro propio POS

El mercado POS está consolidado (Toast 120k+ sucursales). Competir desde cero es prohibitivo. La estrategia ganadora es ser la capa de inteligencia que vive arriba — outcomes, no features.

## Stack de observabilidad

- **APM:** Sentry para errores; OpenTelemetry traces.
- **Logs:** structured JSON a CloudWatch / Logflare.
- **Métricas de modelo:** MAPE rolling, aceptación de recomendaciones, drift por feature.
- **Alertas:** Slack channel + PagerDuty para sev1.

## Stack de deploy

- **Frontend:** AWS Amplify o Vercel (ambos casos: `apps/web` y `agent/apps/web`).
- **Backend:** Fly.io o Render para Node services; Cloud Run para el servicio Python.
- **DB:** Supabase (Postgres managed) con read replicas cuando un tenant cruce ~50 sucursales.
- **Storage:** Supabase Storage o S3 para facturas escaneadas, logos, fotos.

## Cumplimiento

- **LFPDPPP (México):** consentimiento explícito en captura de huésped, opt-in obligatorio para WhatsApp, eliminación a petición.
- **GDPR (cuando expandamos a partners europeos):** misma postura + DPO contractual.
- **PCI-DSS:** no procesamos pagos directamente; lectura de Stripe/Mercado Pago para conciliación opera sobre tokens, no PAN.
- **WhatsApp Business Policy:** templates aprobados, ventana de 24h respetada, opt-in registrado por phone con timestamp.
