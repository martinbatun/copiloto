# DEPLOYMENT — Copiloto

## Topología productiva

```
[CDN / WAF]
    │
    ├── app.copiloto.mx          → Amplify/Vercel (apps/web :5400)
    │       │
    │       ├── /api/*           → ALB → Fly app (apps/api :3400)
    │       ├── /agent           → Amplify/Vercel (agent/apps/web :5500, basePath /agent)
    │       └── /agent-api/*     → ALB → Fly app (agent/apps/api :3500)
    │
    └── ml.copiloto.internal     → Cloud Run (servicio Python forecast)

[Supabase Postgres]
    ├── copiloto_core (DB del core)
    └── copiloto_agent (DB del agente)

[Supabase Storage] — facturas OCR, logos, fotos.
[S3 backup] — replicación nocturna de critical buckets.
```

## Ambientes

| Ambiente | URL | Branch | DB | Propósito |
|---|---|---|---|---|
| **Production** | app.copiloto.mx | `main` | Supabase prod | Operadores activos |
| **Staging** | staging.copiloto.mx | `staging` | Supabase staging | QA + demos a prospectos |
| **Develop** | dev.copiloto.mx | `develop` | Supabase dev | Integración continua |
| **Local** | localhost:5400 | `feature/*` | Postgres local o Supabase dev | Desarrollo |

## Pipeline CI/CD

### GitHub Actions workflow

```
push a feature/* → lint + typecheck + tests
push a develop  → ↑ + deploy a dev
push a staging  → ↑ + deploy a staging + smoke tests
push a main     → ↑ + deploy a prod (con approval manual del release manager)
```

### Pasos del deploy del core (`apps/api`)

1. Build: `pnpm --filter @copiloto/api build` (esbuild → `dist/index.mjs`).
2. `prisma migrate deploy` contra la DB del ambiente.
3. `fly deploy` con el Dockerfile correspondiente.
4. Smoke test: `GET /api/health` debe responder en < 500ms.

### Pasos del deploy del agente (`agent/apps/api`)

Idéntico al core pero contra `copiloto-agent` Fly app y su propia DB.

### Pasos del deploy del frontend (`apps/web` y `agent/apps/web`)

Amplify (o Vercel) corre el build de Next.js y publica. La proxy `next.config.ts` apunta a las URLs del backend del ambiente.

## Variables de entorno por ambiente

Cada ambiente tiene su set en el secret manager (AWS Secrets Manager o GitHub Encrypted Secrets):

```
PROD/JWT_SECRET            (rotado anualmente)
PROD/DATABASE_URL          (Supabase prod, lectura/escritura)
PROD/DIRECT_URL            (Supabase prod, conexión directa para migrations)
PROD/SUPABASE_URL          (público — frontend)
PROD/SUPABASE_SERVICE_KEY  (privado — backend only)
PROD/OPENROUTER_API_KEY
PROD/WBA_TOKEN             (System User token)
PROD/WBA_VERIFY_TOKEN
PROD/CORE_API_KEY          (shared secret entre core y agent)
PROD/SOFT_RESTAURANT_API_KEY (por tenant — DB encrypted)
... etc
```

## Migraciones de schema

### Política

- Una migración por PR. No se mezclan cambios de schema con cambios de código que dependen de ellos en el mismo deploy.
- Despliegue en 2 fases para cambios destructivos (drop column):
  1. Deploy del código que ya no usa la columna.
  2. Deploy de la migración que la dropea.

### Locking y secret management

- `prisma migrate deploy` corre con un advisory lock para evitar races con paralelismo de pods.
- Backup automático pre-migration (Supabase lo hace por default; verificamos antes de deploy a prod).

## Observabilidad

### Métricas críticas (alarmas activas)

- **Latency p95** de `/api/*` > 1.5s por 5 min → page sev2.
- **Latency p95** del webhook WhatsApp > 800ms por 1 min → page sev1 (Meta retira el webhook si tarda).
- **Forecast MAPE rolling 7d** > 15% → ticket al ML engineer.
- **% de mensajes WhatsApp con status FAILED** > 5% → page sev2.
- **POS sync errors** por sucursal > 10 en 1 hora → notificación al cliente success.

### Dashboards (Grafana)

- Operativos: ingesta POS por sucursal, errores por adapter, lag de sync.
- ML: MAPE por tenant, drift de feature distributions, % de recomendaciones aceptadas.
- Negocio: sucursales activas, mensajes WhatsApp/día, recomendaciones generadas vs ejecutadas.

## Backup y disaster recovery

- **DB:** Supabase backup diario + point-in-time recovery 7 días.
- **Storage:** réplica nocturna a S3 us-east-1.
- **RTO objetivo:** 4 horas para recuperación completa de prod.
- **RPO objetivo:** 15 minutos.
- **Runbook:** `docs/runbooks/disaster-recovery.md` (pendiente).

## Seguridad operacional

- Acceso a producción solo desde IPs allowlisted (VPN corporativa).
- Cero credentials hard-coded; todo via secret manager.
- Logs scrubados de PII antes de enviar a logging providers.
- Auditoría de acceso a la consola Supabase mensual.
- Rotación de tokens externos (Meta, OpenRouter, POS APIs) trimestral.

## Cost estimates (orden de magnitud)

Operación a 100 sucursales pagando:

| Item | Costo mensual (USD) |
|---|---|
| Supabase Pro (DBs + storage) | ~600 |
| Fly Machines (4 servicios × 2 réplicas) | ~400 |
| Cloud Run (forecast service) | ~150 |
| OpenRouter (LLM) | ~800 |
| WhatsApp Business (marketing messages) | ~300 |
| Amplify/Vercel | ~200 |
| Sentry + observability | ~250 |
| **Total** | **~2,700** |

A 1,000 sucursales: estimación lineal sin optimización ~$15–18k/mes; con caching agresivo de LLM y particionado de DB ~$10–12k/mes.
