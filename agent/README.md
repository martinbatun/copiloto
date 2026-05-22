# Copiloto Agent

> Sub-monorepo del agente conversacional: WhatsApp bot (FOH para huéspedes + co-piloto del manager por mensaje) y admin para gestionar flujos, templates y conversaciones.

El `agent/` se separa del core (`apps/api`, `apps/web`) por tres razones:

1. **Modelo de datos distinto.** Conversaciones, sesiones, templates aprobados por WhatsApp y mensajes inbound/outbound viven en su propio Prisma schema.
2. **Escalabilidad independiente.** El webhook de WhatsApp recibe ráfagas (decenas de mensajes por segundo en una promo) que no deben presionar al core API.
3. **Compliance.** El cumplimiento de WhatsApp Business API (templates, opt-in, ventana de 24h) tiene su propia capa de validación y rate-limiting.

El agent se comunica con el core via HTTP (`AGENT_API_KEY` interno) cuando necesita: crear/leer reservas, consultar disponibilidad, recuperar perfil del huésped, registrar acciones del co-piloto.

---

## Estructura

```
agent/
├── apps/
│   ├── api/        # Express :3500 — webhook WBA + state machine + agent loop
│   │   ├── prisma/schema.prisma
│   │   └── server/
│   │       ├── index.ts
│   │       ├── routes.ts
│   │       └── routes/ (webhook, conversations, templates, broadcasts, agent)
│   └── web/        # Next.js :5500 — admin de flujos / templates / inbox
└── packages/
    ├── shared/     # @copiloto/agent-shared — types específicos del agente
    ├── db/         # @copiloto/agent-db — Prisma client del agente
    └── ts-config/  # @copiloto/agent-ts-config
```

## Modelos principales (Prisma — `apps/api/prisma/schema.prisma`)

- **Conversation** — hilo por (locationId, phoneE164). Estado de la state machine.
- **Message** — inbound y outbound. Trae mediaType, templateId si aplica, status (queued/sent/delivered/read/failed).
- **Template** — aprobados por Meta + variables locales.
- **Flow** — máquina de estados nombrada (`reserva_nueva`, `confirmar`, `recuperar_no_show`).
- **Broadcast** — envío masivo coordinado con `Campaign` del core.

## Puerto y env

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `3500` | Puerto del Express |
| `WBA_PHONE_NUMBER_ID` | — | ID del número WhatsApp Business |
| `WBA_TOKEN` | — | Permanent token de Meta |
| `WBA_VERIFY_TOKEN` | — | Verify token del webhook |
| `CORE_API_URL` | `http://localhost:3400` | URL del core |
| `CORE_API_KEY` | — | API key interna para llamar al core |

Ver `apps/api/.env.example` y `apps/web/.env.example` para el set completo.
