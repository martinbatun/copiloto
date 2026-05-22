# Copiloto

> Smart Ops Co-pilot — capa de inteligencia operativa con IA para restaurantes en México y LATAM.

Copiloto es una capa de IA que se conecta al POS existente del operador (Soft Restaurant, OneCore, Clip, Square, Toast) y entrega, en cada turno, recomendaciones accionables sobre **staffing**, **inventario**, **menú** y **experiencia del huésped**. No reemplaza el POS ni la contabilidad: vive sobre ellos y compite por **outcomes** (margen, merma, ticket promedio), no por features.

**Promesa medible:** en 90 días, mejora combinada del 5–8% del margen operativo a través de tres palancas (staffing, inventario, mix de menú) sin cambiar el POS actual.

---

## Estado del proyecto

**Scaffold inicial (Fase 0)** — estructura monorepo lista, Prisma schema definido, rutas API como stubs con TODOs anotados, vistas web como placeholders. Ningún módulo está implementado todavía. El plan de implementación está en [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Radix UI, TanStack Query, Recharts |
| **Backend** | Express 5, TypeScript, Prisma 6, Supabase Storage |
| **DB** | PostgreSQL (Supabase) |
| **AI** | OpenRouter (LLM chat + co-piloto agentic) + LightGBM/XGBoost (forecast) |
| **Mensajería** | WhatsApp Business API (FOH agent + co-piloto del manager) |
| **POS connectors** | Soft Restaurant, OneCore, Clip, Square, Toast (conectores propios + webhooks) |
| **Pagos LATAM** | Stripe / Mercado Pago / Clip — solo lectura para conciliación |
| **Build** | pnpm workspaces + Turborepo + esbuild |

### Puertos

| Servicio | Puerto |
|---|---|
| Dashboard del operador (`apps/web`) | **5400** |
| Backend del core (`apps/api`) | **3400** |
| Admin del agente (`agent/apps/web`) | **5500** |
| WhatsApp agent + co-piloto (`agent/apps/api`) | **3500** |

---

## Estructura del monorepo

```
copiloto/
├── apps/
│   ├── api/                       # Express 5 + Prisma — core
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # 20 models + 12 enums
│   │   │   └── seed.ts
│   │   ├── server/
│   │   │   ├── index.ts           # bootstrap
│   │   │   ├── routes.ts          # registration
│   │   │   ├── routes/            # 20 route modules (auth, locations, pos, menu,
│   │   │   │                      #  ingredients, suppliers, invoices, sales,
│   │   │   │                      #  forecast, schedules, inventory, prep,
│   │   │   │                      #  anomalies, recommendations, actions,
│   │   │   │                      #  guests, segments, campaigns, reservations,
│   │   │   │                      #  reviews, kpis, ai, admin)
│   │   │   ├── middleware/auth.ts
│   │   │   └── lib/
│   │   │       ├── ai.ts          # OpenRouter wrapper + agent loop
│   │   │       ├── forecast.ts    # LightGBM/XGBoost service client
│   │   │       └── pos.ts         # Adapter pattern para POS connectors
│   │   └── script/build.ts        # esbuild bundler
│   └── web/
│       ├── src/
│       │   ├── app/               # App Router (dashboard, copilot, forecast,
│       │   │                      #  schedule, inventory, recipes, guests,
│       │   │                      #  campaigns, reservations, anomalies,
│       │   │                      #  locations, admin, login)
│       │   ├── views/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── lib/api.ts
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── postcss.config.mjs
├── agent/                          # Sub-monorepo del agente conversacional
│   ├── apps/
│   │   ├── api/                    # Webhook WhatsApp + agent loop + state machine
│   │   └── web/                    # Admin de flujos, templates y conversaciones
│   └── packages/                   # @copiloto/agent-shared, agent-db, ts-config
├── packages/
│   ├── shared/                     # @copiloto/shared — types + Zod schemas
│   ├── ui/                         # @copiloto/ui — theme.css + primitives
│   ├── utils/                      # @copiloto/utils — money, units, dayparts,
│   │                               #   margin/foodcost, MAPE
│   ├── auth/                       # @copiloto/auth — JWT + bcrypt
│   ├── db/                         # @copiloto/db — Prisma client singleton
│   └── ts-config/                  # @copiloto/ts-config — tsconfig base
├── docs/
│   ├── PRODUCT-BRIEF.md            # Pilares A–F, personas, módulos
│   ├── ROADMAP.md                  # Plan 24 meses (Fase 1/2/3/4/5)
│   ├── ARCHITECTURE.md             # Stack, deps, integraciones externas
│   ├── DATA-MODEL.md               # Esquema Prisma + diagrama ER
│   ├── INTEGRATION-PLAN.md         # POS + WhatsApp + procesadores
│   └── DEPLOYMENT.md
├── dev.sh
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Arranque local

```bash
# Requisitos: Node 22+, pnpm 9+, PostgreSQL accesible (local o Supabase)

pnpm install                        # instala monorepo

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp agent/apps/api/.env.example agent/apps/api/.env
cp agent/apps/web/.env.example agent/apps/web/.env
# edita los .env con tus valores

pnpm db:generate                    # prisma client del core
pnpm db:push                        # crea tablas en tu DB
pnpm db:seed                        # (opcional) crea operador + sucursal demo

pnpm agent:db:generate              # prisma client del agente
pnpm agent:db:push

pnpm dev                            # lanza los 4 servicios
```

**Credenciales demo** (cuando se implemente el seed completo):
- Operador: `dueno@copiloto.mx` / `password123`
- Manager: `manager@copiloto.mx` / `password123`

### Alternativa con `dev.sh`

```bash
./dev.sh web         # solo dashboard
./dev.sh api         # solo core API
./dev.sh core        # web + api del core
./dev.sh agent       # web + api del agente
./dev.sh             # los 4
```

---

## Módulos (visión completa)

| # | Módulo | Pilar | Estado |
|---|---|---|---|
| 1 | Locations + multi-sucursal | Infra | Scaffold |
| 2 | POS connectors (Soft, OneCore, Clip, Square, Toast) | Infra | Scaffold |
| 3 | Menu + categorías + variantes | A | Scaffold |
| 4 | Ingredients + suppliers + invoices (OCR) | E | Scaffold |
| 5 | Sales events (ingesta desde POS) | A | Scaffold |
| 6 | Demand forecast (LightGBM/XGBoost) | A | Scaffold |
| 7 | Staffing + schedules sugeridos | A | Scaffold |
| 8 | Inventory + par levels | A | Scaffold |
| 9 | Prep lists por turno | A | Scaffold |
| 10 | Anomalies (voids, descuentos, mermas) | B | Scaffold |
| 11 | Recommendations (con ROI estimado) | B | Scaffold |
| 12 | Action ledger (aprobado/ejecutado/rechazado) | B | Scaffold |
| 13 | Guests (CRM propio del restaurante) | C | Scaffold |
| 14 | Segments (VIP, churn risk, big spender) | C | Scaffold |
| 15 | Campaigns (WhatsApp/email con guardrails) | C | Scaffold |
| 16 | Reservations + waitlist + no-shows | D | Scaffold |
| 17 | Reviews + sentiment | C | Scaffold |
| 18 | Recetas + costeo dinámico | E | Scaffold |
| 19 | KPIs (margen, food cost, labor %) | Outcomes | Scaffold |
| 20 | Admin + roles + auditoría | Infra | Scaffold |

**Pilares** (definidos en [docs/PRODUCT-BRIEF.md](docs/PRODUCT-BRIEF.md)):

- **A — Motor de demanda unificada:** forecast 7d con MAPE objetivo 90%, output simultáneo de schedule, par levels y prep list.
- **B — Co-piloto de turno:** asistente conversacional con acciones ejecutables y human-in-the-loop.
- **C — CRM propio:** dato del huésped propiedad del restaurante, segmentación y campañas conversacionales.
- **D — Agente FOH:** bot de WhatsApp para reservas, confirmaciones, no-shows y feedback.
- **E — Recetas y costeo dinámico:** food cost actualizado con cada factura OCR'd, alertas y propuestas de reformulación.
- **F — Visión por computadora (fase posterior):** cámaras en estación de basura y prep para identificar desperdicio.

Detalle completo en [docs/PRODUCT-BRIEF.md](docs/PRODUCT-BRIEF.md) y [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Diferenciación competitiva

| Versus | Diferenciación de Copiloto |
|---|---|
| **Toast / ToastIQ** | No atamos POS ni procesador. Operamos sobre el POS existente, en es-MX, con realidades fiscales (CFDI, IVA, propinas). |
| **Restaurant365** | 10x más simple de implementar (días, no meses), 5x más barato, enfocado en acciones operativas — no cierre contable. |
| **7shifts** | El schedule no es nuestro producto: es el output de un motor de demanda que también genera inventario y prep list, integrados. |
| **OpenTable / Resy / SevenRooms** | El dato del huésped es del restaurante. No competimos por demanda agregada; potenciamos canales propios del operador. |
| **Nory / Supy** | Presencia local LATAM, soporte y precios en MX, WhatsApp como canal nativo, onboarding en 72 horas. |

---

## Commit Format

```
<type>(<scope>): <description>
```

**Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`, `style`

**Scopes:**

| Scope | Qué cubre |
|---|---|
| `web` | `apps/web` — dashboard del operador |
| `api` | `apps/api` — core backend |
| `agent-web` | `agent/apps/web` — admin del agente |
| `agent-api` | `agent/apps/api` — WhatsApp bot + agent loop |
| `dashboard` | Páginas y widgets del dashboard del operador |
| `copilot` | Vista conversacional del co-piloto de turno |
| `forecast` | Motor de demanda + pipeline ML |
| `schedule` | Staffing sugerido + ajustes |
| `inventory` | Par levels + ingredients + suppliers |
| `recipes` | Recetas + costeo dinámico + alertas |
| `guests` | CRM, segments, campaigns |
| `reservations` | Reservas, waitlist, no-shows |
| `anomalies` | Detección y triage de eventos atípicos |
| `actions` | Action ledger + guardrails |
| `pos` | POS connectors + adapters |
| `kpis` | Margen, food cost, labor %, dashboards |
| `whatsapp` | Webhook, templates, state machine |
| `ui` | `packages/ui` — primitivas + tokens |
| `db` | Schema Prisma + seed + migraciones |
| `auth` | JWT, bcrypt, sesiones, roles |
| `shared` | Types y Zod schemas compartidos |
| `infra` | `next.config`, `pnpm-workspace`, `turbo.json`, CI, deploy |
| `deps` | Actualizaciones de dependencias |

**Ejemplos:**

```bash
git commit -m "feat(forecast): LightGBM baseline con features de clima y daypart"
git commit -m "feat(pos): adapter de Soft Restaurant con polling cada 5 min"
git commit -m "feat(copilot): action ledger con confirmación human-in-the-loop"
git commit -m "fix(whatsapp): re-envío idempotente cuando timeout de WBA > 15s"
git commit -m "docs(readme): documenta promesa de margen 5–8% en 90 días"
```

---

## Branch Strategy

| Branch | Propósito |
|---|---|
| **`main`** | Producción — solo recibe merges desde `develop` o hotfixes verificados |
| **`develop`** | Rama base de desarrollo — default target de los PRs de features |
| **`staging`** | Entorno de pruebas antes de producción |
| **`feature/*`** | Features — `feature/forecast-baseline`, `feature/whatsapp-foh-bot` |
| **`fix/*`** | Bug fixes no urgentes |
| **`hotfix/*`** | Fixes críticos directos a `main` |
| **`chore/*`** | Mantenimiento y limpieza |

**Reglas:**
- Cada PR contra `develop` necesita build + lint verdes y al menos 1 aprobación.
- Nunca `push --force` a `main`, `develop` o `staging`.
- Conventional commits y scope obligatorio.

---

## Métricas de éxito (KPIs del producto)

El producto se mide por **outcomes para el operador**, no por features lanzadas. KPIs primarios:

- **Margen operativo:** +5–8 pp en 90 días sobre baseline pre-implementación.
- **MAPE del forecast a 7 días:** menor a 10% (precisión objetivo 90%).
- **Tasa de aceptación de recomendaciones:** mayor a 60% por manager activo.
- **Reducción de merma:** -15% en SKUs perecederos en 90 días.
- **Recuperación de no-shows:** mayor a 40% vía WhatsApp.
- **Onboarding:** sucursal productiva en menos de 72 horas desde firma.

---

## Licencia

Privado — © Copiloto Ops 2026.
