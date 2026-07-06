# Plan — Hacer 100% funcionales las vistas del panel (data-driven)

> Objetivo: que **ninguna vista dependa de datos hardcodeados en el front**. Cada
> pantalla mock debe consumir un endpoint real que lea de la DB, sembrada con un
> dataset demo coherente. Esencialmente: prender con datos reales las ~15 vistas
> que hoy son "cascarón".

## Contexto

Auditoría actual:
- **Funcionan end-to-end:** Pedidos, Carta, QR, Inventario, Menú cliente, Login.
- **Mock (UI lista, sin backend):** Tablero, Co-piloto, Forecast, Schedule, Recetas, KPIs, Anomalías, Huéspedes, Reservas, Campañas, Facturas, Proveedores, Simulador, Admin, Asistencia.

**Hallazgo clave:** el `schema.prisma` **ya tiene los modelos** de casi todos estos módulos (Guest, Segment, Campaign, CampaignSend, Reservation, Review, Invoice/InvoiceLine, Supplier, Ingredient, Anomaly, Recommendation, ActionLog, ForecastBucket, Shift, Recipe/RecipeLine, SalesEvent/SalesLine/SalesPayment). No hay que rediseñar DB — solo **sembrar + exponer + consumir**.

## El patrón (rebanada vertical por módulo)

Cada módulo se prende con los mismos 5 pasos, siguiendo lo que ya hicimos en **inventory** y **orders** (usar como plantilla):

1. **Seed** — datos demo del módulo en `apps/api/prisma/seed/*.ts` (tenant/location del seed actual). Idempotente, guardado por el guard de prod ya existente.
2. **API** — implementar el/los `GET` en el router stub correspondiente (`apps/api/server/routes/<mod>.ts`), con `requireAuth` + scoping por `tenantId`/`locationId` (patrón de `inventory.ts`).
3. **Shared** — tipos de respuesta en `packages/shared/src/types` + query zod si aplica.
4. **Hook** — `apps/web/src/lib/hooks/use<Mod>.ts` con React Query (patrón de `useInventory`).
5. **Front** — reemplazar el array hardcodeado de la página por el hook, con **loading (skeleton) / error / empty** (patrón de `inventory/page.tsx`). El nav y el layout ya existen.

**Definición de "hecho" por módulo:** la página no tiene constantes de datos; carga desde el EP; muestra skeleton al cargar, banner al fallar, vacío si no hay datos; respeta la sucursal activa (`useAuth().currentLocation`).

---

## Fase A — Dataset semilla coherente (cimiento de todo) · ~1.5–2 días

Ampliar el seed (dividir en `apps/api/prisma/seed/` importados desde `seed.ts`) con un dataset demo **cruzado** sobre el tenant `demo-mx` / location `roma-norte`:

- **Ventas históricas:** 30–60 días de `SalesEvent` + `SalesLine` + `SalesPayment` (alimenta Tablero, KPIs, Forecast, Simulador). Es el dato más importante y el que más módulos desbloquea.
- **Forecast:** `ForecastBucket` para los próximos 7–14 días por daypart/canal.
- **Staffing:** `Shift` para hoy/semana (sugerido vs actual).
- **Recetas/costeo:** `Recipe` + `RecipeLine` para los `MenuItem` ya sembrados (food cost real).
- **Compras:** `Invoice` + `InvoiceLine` (2–3 facturas OCR demo) sobre los `Supplier` ya sembrados.
- **CRM:** `Guest` (10–15, con `Segment` + `GuestSegmentLink`), `Campaign` + `CampaignSend`, `Review` (con sentiment/topics).
- **Reservas:** `Reservation` de hoy + waitlist + no-shows.
- **Inteligencia:** 2–3 `Anomaly` + varias `Recommendation` (PENDING) + `ActionLog` (para el track record del co-piloto y los insights del tablero).

> Nota: hoy el seed vive en un solo `seed.ts`. Recomendado partirlo en módulos (`seed/sales.ts`, `seed/crm.ts`, etc.) invocados desde `main()` para no volverlo inmanejable.

---

## Fase B — Módulos de lectura simple (tabla → lista) · ~4–6 días

Mapean una tabla a una vista de lista. Bajo esfuerzo c/u (~0.5 día con el patrón).

| Módulo / Ruta | Modelo(s) | Endpoint a implementar |
|---|---|---|
| **Proveedores** `/suppliers` | Supplier, Ingredient | `GET /api/suppliers` (+ precios/rating por ingrediente) |
| **Huéspedes** `/guests` | Guest, GuestSegmentLink | `GET /api/guests?locationId=` (con segmentos) |
| **Reservas** `/reservations` | Reservation | `GET /api/reservations/:locationId?date=` + waitlist |
| **Campañas** `/campaigns` | Campaign, CampaignSend | `GET /api/campaigns` + stats por envío |
| **Facturas** `/invoices` | Invoice, InvoiceLine | `GET /api/invoices?locationId=` + `GET /:id` (detalle OCR) |
| **Anomalías** `/anomalies` | Anomaly | `GET /api/anomalies?locationId=` |
| **Recomendaciones** *(feed del Tablero)* | Recommendation | `GET /api/recommendations/feed/:locationId` |
| **Recetas** `/recipes` | Recipe, RecipeLine, MenuItem, Ingredient | `GET /api/recipes` (con food cost calculado) — router nuevo o bajo `/api/menu` |
| **Schedule** `/schedule` | Shift | `GET /api/schedules/:locationId?date=` |
| **Reseñas** *(si se agrega vista)* | Review | `GET /api/reviews/:locationId` + topics |
| **Segmentos** *(usados por Campañas)* | Segment | `GET /api/segments` |

Todos: `requireAuth`, scoping por tenant/location, tipos en shared, hook + wiring con estados de carga/error.

---

## Fase C — Módulos de agregación (calculan sobre ventas) · ~3–4 días

Necesitan lógica de agregación sobre `SalesEvent`/`ForecastBucket` (más que un simple find). Dependen de la Fase A (ventas sembradas).

| Módulo / Ruta | Endpoint | Cálculo |
|---|---|---|
| **KPIs** `/kpis` | `GET /api/kpis/:locationId/today`, `/trend`, `/food-cost`, `/menu-mix` | Agregados de SalesEvent (ticket, covers, revenue, margen) |
| **Tablero** `/dashboard` | `GET /api/kpis/:locationId/today` + `recommendations/feed` | Reúso de KPIs + insights de Recommendation |
| **Forecast** `/forecast` | `GET /api/forecast/:locationId` | Lee ForecastBucket sembrado (motor `predict()` real es fase futura) |
| **Simulador** `/simulator` | `POST /api/simulator/:locationId` | What-if: aplica deltas de precio/costo sobre baseline de ventas |

> El **motor de forecast real** (ML) queda fuera de este plan; aquí solo servimos los `ForecastBucket` sembrados para que la vista deje de ser mock. Igual el Simulador hace proyección aritmética sobre el baseline, no ML.

---

## Fase D — Co-piloto conversacional (IA real) · ~2–3 días

Distinto a lo demás: requiere LLM.
- `POST /api/copilot/chat` (OpenRouter, ya hay `OPENROUTER_API_KEY`/`OPENROUTER_MODEL` en env) con contexto del tenant + tool calls hacia los endpoints ya vivos.
- `GET /api/copilot/threads` / `:id` para historial (modelo de threads nuevo, o efímero por ahora).
- El **ledger** del co-piloto (decisiones) sí puede prenderse ya con `Recommendation` + `ActionLog` (Fase B).

> Si se quiere avanzar sin LLM: el ledger + recomendaciones (Fase B) ya quitan la parte más mock de esta vista; el chat se deja para el final.

---

## Admin y Asistencia (aparte)

- **Admin** `/admin`: `GET /api/admin/tenants`, `/usage/:tenantId`. Solo rol ADMIN. Baja prioridad (herramienta interna).
- **Asistencia** (cliente): "llamar mesero / pedir cuenta" necesita un modelo nuevo (`HelpRequest` o similar) + notificación al tablero. Pequeño pero requiere schema nuevo — se puede sumar al vertical de pedidos.

---

## Orden recomendado y esfuerzo

**Total ~10–15 días.** Secuencia por valor/dependencia:

1. **Fase A** (dataset) — desbloquea todo. Empezar aquí sí o sí.
2. **Fase B** (lecturas simples) — victorias rápidas, muchas vistas prendidas por día.
3. **Fase C** (agregación) — Tablero/KPIs son los de más impacto visual para demo.
4. **Fase D** (co-piloto IA) — el más caro; al final.

Se puede ir **mergeando por módulo** (un PR por vista o por grupo pequeño), y como el CI ya corre typecheck+build+tests en cada PR, nada rompe lo que ya funciona.

## Convenciones a respetar (ya establecidas)
- `requireAuth` + scoping por `tenantId`/`locationId` en todo endpoint autenticado.
- Tipos en `@copiloto/shared`; validación con zod.
- Hooks React Query en `apps/web/src/lib/hooks/`.
- Estados loading/error/empty en cada página (plantilla: `inventory/page.tsx`).
- Seed idempotente + guard de prod (`NODE_ENV=production` aborta) ya existente.
