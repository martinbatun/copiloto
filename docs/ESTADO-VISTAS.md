# Estado de las vistas — data-driven (15/15)

Estado final de la iniciativa "sacar todo lo hardcodeado del front y consumirlo
desde endpoints reales, con datos sembrados en la DB". **Las 15 vistas del panel
consumen datos reales.**

Patrón aplicado en cada vista (vertical slice):

```
seed (apps/api/prisma/seed.ts)
  → endpoint Express (auth + tenant/location scope)
    → tipo compartido (packages/shared/src/types)
      → hook React Query (apps/web/src/lib/hooks)
        → página con skeleton / error / empty
```

Última actualización: 2026-07-12.

---

## Credenciales demo

| Usuario | Password | Rol | Acceso |
|---|---|---|---|
| `dueno@copiloto.mx` | `password123` | OWNER | Todo el panel del tenant |
| `manager@copiloto.mx` | `password123` | MANAGER | Panel del tenant |
| `soporte@copiloto.mx` | `password123` | ADMIN | Panel de plataforma (`/admin`) |

- Tenant demo: `demo-mx` (Restaurante Demo CDMX)
- Sucursal demo: `roma-norte` — id `e66a1c85-047a-4fc0-8222-c5a3d5aba5a2`
- Menú público del cliente: `/menu/e66a1c85-047a-4fc0-8222-c5a3d5aba5a2`

---

## Panel de operaciones (tras login)

| # | Vista | Ruta | Endpoint principal | Fuente de datos | Estado |
|---|---|---|---|---|---|
| 1 | Tablero | `/dashboard` | `GET /api/kpis/:locationId/summary` | SalesEvent, Recipe, ForecastBucket, Order, Anomaly | ✅ |
| 2 | Pedidos | `/orders` | `GET /api/orders/location/:locationId` · `PATCH /api/orders/:id` | Order, OrderItem | ✅ |
| 3 | Co-piloto | `/copilot` | `POST /api/copilot/chat` | snapshot de todos los modelos (solo lectura) + OpenRouter | ✅ (requiere `OPENROUTER_API_KEY`) |
| 4 | Forecast | `/forecast` | `GET /api/forecast/:locationId` | ForecastBucket | ✅ |
| 5 | Schedule | `/schedule` | `GET /api/schedules/:locationId` | Shift | ✅ |
| 6 | Inventario | `/inventory` | `GET /api/inventory/:locationId` | ParLevel, Ingredient | ✅ |
| 7 | Recetas | `/recipes` | `GET /api/recipes` | Recipe, RecipeLine, Ingredient | ✅ |
| 8 | KPIs | `/kpis` | `GET /api/kpis/:locationId/summary` | SalesEvent, Recipe, ForecastBucket | ✅ |
| 9 | Carta | `/admin/menu` | `GET /api/menu/admin/:locationId` + CRUD | MenuItem, MenuCategory | ✅ |
| 10 | QR Mesas | `/admin/qr` | — (genera QR → `/menu/:locationId`) | — | ✅ |
| 11 | Anomalías | `/anomalies` | `GET /api/recommendations/feed/:locationId` | Anomaly, Recommendation | ✅ |
| 12 | Huéspedes | `/guests` | `GET /api/guests` | Guest, Segment, GuestSegmentLink | ✅ |
| 13 | Reservas | `/reservations` | `GET /api/reservations/:locationId` | Reservation | ✅ |
| 14 | Campañas | `/campaigns` | `GET /api/campaigns` | Campaign, CampaignSend | ✅ |
| 15 | Reseñas | `/reviews` | `GET /api/reviews/:locationId` | Review | ✅ |
| — | Facturas | `/invoices` | `GET /api/invoices` | Invoice, InvoiceLine | ✅ |
| — | Proveedores | `/suppliers` | `GET /api/suppliers` | Supplier, Ingredient | ✅ |
| — | Simulador | `/simulator` | `GET /api/kpis/:locationId/summary` (baseline) | SalesEvent, Recipe | ✅ |
| — | Admin | `/admin` | `GET /api/admin/tenants` (rol ADMIN) | Tenant, Location, User, SalesEvent, Order | ✅ |

> Todos los endpoints del panel usan `requireAuth` y están tenant/location-scoped,
> excepto `/api/admin/*` que es cross-tenant y usa `requireRole("ADMIN")`.

---

## Superficie pública del cliente (sin login, QR en mesa)

| Vista | Ruta | Endpoint | Estado |
|---|---|---|---|
| Menú digital | `/menu/[locationId]` | `GET /api/menu/public/:locationId` | ✅ |
| Mi pedido / pago | `/menu/[locationId]/pedido` | `POST /api/orders/public` | ✅ |
| Confirmación | `/menu/[locationId]/confirmacion/[orderId]` | `GET /api/orders/public/:orderId` | ✅ |
| Asistencia | `/menu/[locationId]/asistencia` | — (sin modelo `HelpRequest` aún) | ⚠️ pendiente |

El pago (`POST /api/orders/public`) recalcula precios en el server (nunca confía
en montos del cliente). Mercado Pago Checkout Pro está integrado; el webhook es
`POST /api/orders/webhook/mp`.

---

## Detalle del Co-piloto (v1, solo lectura)

- Chat **stateless** fundamentado: el backend arma un snapshot compacto de datos
  reales (`apps/api/server/lib/copilot-context.ts`) — ventas hoy vs ayer, food
  cost, menú-mix 30d, pronóstico 7d, anomalías abiertas, recomendaciones e
  inventario bajo par — y lo inyecta como system prompt.
- Proveedor: **OpenRouter** (`apps/api/server/lib/ai.ts`). Sin `OPENROUTER_API_KEY`
  el endpoint responde `503 COPILOT_NOT_CONFIGURED` y el front muestra un banner.
- **Futuro:** tool-calling agentic con acciones + human-in-the-loop + Action
  Ledger + persistencia de threads (documentado en `routes/copilot.ts`).

---

## Pendientes de infraestructura (lado del usuario, no código)

Para correr al 100% en producción:

- [ ] **CORS en Render** — setear `CORS_ORIGIN=https://copiloto-web.vercel.app`
      (desbloquea el login en prod; el código ya está listo).
- [ ] **Co-piloto** — `OPENROUTER_API_KEY` en el env de la API (local: `apps/api/.env`;
      prod: dashboard de Render). Modelo por defecto `anthropic/claude-3.5-sonnet`,
      configurable con `OPENROUTER_MODEL`.
- [ ] **Mercado Pago** — `MERCADO_PAGO_TOKEN` + webhook secret + registrar el
      webhook (`/api/orders/webhook/mp`). Ver `docs/PAGOS-MERCADOPAGO.md`.
- [ ] **Sentry** — `SENTRY_DSN` para monitoreo de errores.
- [ ] **DB de producción separada** de la de staging/local.
- [ ] **Dominio custom** + generación de QR por mesa apuntando al menú público.
- [ ] **Asistencia del cliente** — crear modelo `HelpRequest` para hacer real la
      vista `/menu/[locationId]/asistencia`.

---

## Cómo correr localmente

```bash
# 1. Migrar el esquema y sembrar datos demo
pnpm db:push
pnpm db:seed        # crea tenant, sucursal, 3 usuarios, ventas 45d, menú, etc.

# 2. Levantar API (:3400) y web (:5400)
pnpm dev

# 3. Panel: http://localhost:5400  ·  Menú cliente: /menu/<locationId>
```

> El seed es idempotente (upserts + deleteMany por prefijo). Re-córrelo si la
> fecha "hoy" rueda de día (las vistas de hoy dependen de `SalesEvent`/`Anomaly`
> del día en curso).
