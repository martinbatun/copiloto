# Roadmap — Vertical de Pedidos del Cliente a Producción

> Objetivo: llevar el flujo **menú → pedido → pago → tablero de operaciones** (el diseño Stitch ya construido) a **100% productivo**. Cubre los 4 pilares elegidos: **pago real**, **dominio + QR por mesa**, **onboarding del menú**, **seguridad/monitoreo/CI**.

## Estado actual (lo que YA funciona)

- **Cliente** (`apps/web/src/app/menu/[locationId]/`): menú público por sucursal, carrito en localStorage, pedido/pago (simulado), confirmación con código.
- **Operaciones** (`apps/web/src/app/orders/`): tablero kanban en vivo (polling 8s), sonido + toast + badge de pedidos nuevos, historial del día.
- **API** (`apps/api/server/routes/`): `menu.ts` (GET público), `orders.ts` (POST/GET públicos con recálculo de precios server-side + GET por sucursal y PATCH autenticados, tenant-scoped).
- **Datos**: modelos `Order`/`OrderItem`, `MenuItem` con `imageUrl/tags/rating`, seed de menú.
- **Deploy**: web en Vercel, API en Render (`render.yaml`) + respaldo Fly (`fly.toml`), DB Supabase.

## Gaps para producción (auditados)

| Área | Estado hoy | Falta |
|---|---|---|
| Pago | Simulado (`MOBILE`→`PAID`) | Pasarela real + webhook de confirmación |
| Menú | Viene del seed | CRUD desde el panel + carga de imágenes a Storage |
| QR / mesa | Ruta `/menu/[locationId]` sin mesa | Mesa en la URL + generador de QR |
| Seguridad | Solo CORS + JSON limit | rate-limit, helmet, CORS por entorno, abuse-guard en endpoints públicos |
| Monitoreo | Solo `/api/health` | Error tracking (Sentry), logs estructurados, alertas |
| CI | No existe (`.github/` ausente) | Workflow: typecheck + build + tests en cada PR |
| Tests | Ninguno | E2E del flujo + tests de API (precios/seguridad) |
| Datos | DB compartida local/staging con seed demo | DB prod aparte, sin usuarios `password123` |

---

## Plan por fases

### Fase 0 — Higiene de lanzamiento (bloqueadores) · ~0.5–1 día
Cerrar lo que ya está casi listo y separar entornos.

- **CORS por entorno + previews de Vercel**: en `apps/api/server/index.ts`, aceptar lista de orígenes (prod + previews `*.vercel.app`) en vez de un solo `CORS_ORIGIN`.
- **DB de producción separada**: proyecto Supabase prod propio; `prisma db push` con sus URLs; **sin** `db:seed` (nada de tenant/usuarios demo `password123`).
- **Rotar `JWT_SECRET`** en prod; quitar credenciales demo.
- **Healthcheck ya cubierto** (`/api/health`) — verificado en Render.

### Fase 1 — Onboarding del menú (panel) · ~2–3 días
Que el restaurante cargue su propio menú (hoy depende del seed).

- **API admin** en `menu.ts` (autenticado, tenant-scoped):
  - `GET /api/menu/admin/:locationId` (incluye inactivos), `POST /api/menu/items`, `PATCH /api/menu/items/:id`, `DELETE` (soft `active=false`).
  - `POST/PATCH/DELETE /api/menu/categories`.
- **Carga de imágenes**: endpoint que sube a **Supabase Storage** y devuelve URL absoluta (seguir `.claude/RULES-STORAGE.md` — nunca al filesystem del contenedor). Setear `SUPABASE_BUCKET` para fotos de menú.
- **Panel web**: página `/menu-admin` (o sección en operaciones) con CRUD de categorías/platillos, toggle activo, precio, tags, imagen. Seguir skills `forms` y `nav-discoverability` (que sea alcanzable desde el nav).
- **Validación** con Zod en shared (`MenuItemUpsertSchema`).

### Fase 2 — Pago real · ~3–4 días
Convertir "Pagar desde el móvil" en cobro real; "Enviar a caja" se queda como está.

- **Pasarela**: Mercado Pago (MX, ya hay `MERCADO_PAGO_TOKEN`) o Stripe (`STRIPE_SECRET`). Recomendado **Mercado Pago** por mercado MX.
- **Flujo**: `POST /api/orders/public` con `paymentMethod=MOBILE` → crea `Order` en estado `paymentStatus=PENDING` + crea preferencia de pago → el cliente paga → **webhook** `POST /api/orders/webhook/payment` marca `PAID` y confirma a cocina.
- **Idempotencia + verificación de firma** del webhook (seguir skill `secure-code`). Nunca confiar en el cliente para marcar pagado.
- **UI**: pantalla de pago/redirect + estados (pendiente/pagado/fallido) en confirmación, que ya hace polling de `useOrderStatus`.
- **Reconciliación**: guardar `paymentRef`/`providerId` en `Order` (nueva columna).

### Fase 3 — Dominio + QR por mesa · ~1–2 días
- **Dominio propio**: web (Vercel custom domain) + API (Render custom domain). Actualizar `NEXT_PUBLIC_API_URL` y `CORS_ORIGIN`.
- **Mesa en la URL**: soportar `/menu/[locationId]?mesa=12` (o `/menu/[locationId]/[mesa]`) → prellenar `tableLabel` en el pedido (el modelo ya tiene `tableLabel`).
- **Generador de QR**: página/endpoint que genere un QR por sucursal+mesa apuntando a esa URL (lib `qrcode`), descargable para imprimir.

### Fase 4 — Seguridad, monitoreo y CI · ~2–3 días
- **Hardening API** (`apps/api/server/index.ts`): `helmet`, `express-rate-limit` (estricto en endpoints públicos `POST /api/orders/public`), límites de body por ruta, validación Zod ya presente.
- **Abuse-guard** en pedidos públicos: rate-limit por IP + tope de items/monto; opcional captcha si hay spam.
- **Observabilidad**: Sentry (API + web), logs estructurados (pino/morgan), alerta si `/api/health` cae o si suben los 5xx.
- **CI** (`.github/workflows/ci.yml`): en cada PR → `pnpm install` + `turbo run lint typecheck build`. En `main` → (opcional) trigger de deploy.
- **Tests**: E2E Playwright del flujo (menú→pedido→pago simulado→tablero) + tests de API (recálculo de precios, rechazo de `menuItemId` ajeno, auth en endpoints de ops).

### Fase 5 — Pulido productivo · ~1–2 días
- Estados de error/vacío y reintentos en el cliente (red caída, sucursal inactiva).
- i18n de moneda/impuestos por tenant (ya hay `currency` y `taxRate` por item).
- Accesibilidad y responsive final (skill `responsive`).
- Cancelación/edición de pedido por el cliente antes de cocina.
- Runbook corto de operación (qué hacer si Render duerme, si la DB se pausa, etc.).

---

## Definición de "listo para producción" (checklist de salida)

- [ ] DB prod separada, migrada, sin datos demo.
- [ ] Pago real funcionando con webhook idempotente y verificación de firma.
- [ ] Menú gestionable desde el panel (sin depender del seed) con imágenes en Storage.
- [ ] QR por sucursal/mesa imprimibles que abren el menú con la mesa prellenada.
- [ ] Dominio propio en web y API; CORS restringido a orígenes reales.
- [ ] rate-limit + helmet + Sentry activos; alertas básicas.
- [ ] CI verde en cada PR (typecheck + build + tests); E2E del flujo pasando.
- [ ] Render en plan `starter` (sin cold starts) o equivalente.

## Estimación total
**~10–15 días** de trabajo enfocado (1 dev), secuenciable. Orden sugerido por valor/riesgo: **Fase 0 → 2 (pago) → 1 (onboarding) → 3 (QR/dominio) → 4 (seguridad/CI) → 5 (pulido)**. Pago y onboarding son los que más mueven la aguja para usar esto con un restaurante real.

## Dependencias / decisiones abiertas
- Elegir pasarela: **Mercado Pago** (recomendado MX) vs Stripe.
- ¿Multi-mesa con sesión compartida (varios comensales en una mesa) o un pedido por dispositivo? (afecta Fase 3).
- Dominio definitivo y certificados.
