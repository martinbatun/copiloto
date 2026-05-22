# ROADMAP — Copiloto

Roadmap de 24 meses dividido en cinco fases. Las dos primeras prueban la promesa de margen. Las siguientes amplían moat y propiedad del dato.

> Las fechas son relativas al kickoff. El kickoff queda definido cuando se cierre la seed.

## Fase 0 — Scaffold (mes 0)

Estado actual del repo. Estructura monorepo lista, Prisma schemas escritos, rutas API como stubs con TODOs, vistas web como placeholders.

**Salida:** repo navegable, decisiones de stack documentadas, listo para incorporar el primer ML engineer + 2 full-stacks.

## Fase 1 — Motor de demanda (mes 1–3)

**Objetivo:** demostrar la promesa de margen en 5 sucursales piloto.

Trabajo:
- Conector POS Soft Restaurant (mayor base instalada MX).
- Ingesta + normalización de SalesEvent con backfill de 12 meses.
- Baseline naive de forecast (mismo daypart, dia de semana, promedio 4 semanas).
- Servicio Python con LightGBM. MAPE objetivo 12% al cierre de fase.
- Sugerencia de schedule + par levels + prep list.
- Dashboard del operador (Resumen + Forecast + Staffing + Inventario).

**Salida:** 5 sucursales piloto con forecast diario operando, primer KPI de MAPE publicado.

## Fase 2 — Co-piloto de turno (mes 3–6)

**Objetivo:** que el manager use el co-piloto al menos 1 vez por turno.

Trabajo:
- Detector de anomalías (reglas en v1): VOID_SPIKE, DISCOUNT_SPIKE, FOOD_COST_DRIFT, LABOR_OVERSHOOT.
- Motor de recomendaciones con ROI estimado.
- Action ledger con approval flow (PENDING → APPROVED → EXECUTED).
- Co-piloto conversacional web (chat con tools).
- Métrica primaria: % de aceptación de recomendaciones por manager.

**Salida:** track record inicial de qué recomendaciones funcionan; gate hacia modo autopilot futuro.

## Fase 3 — CRM + WhatsApp FOH (mes 6–12)

**Objetivo:** propiedad del dato del huésped + canal conversacional para reservas.

Trabajo:
- Modelo Guest unificado con merge por phone E.164.
- Segmentación automática (VIP, CHURN_RISK, FIRST_VISIT) recalculada diaria.
- Agente WhatsApp para reservas, confirmación y recuperación de no-shows.
- Templates Meta aprobados (utility + marketing).
- Campañas conversacionales con guardrails.
- Inbox para handoff a humano.

**Salida:** >40% de no-shows recuperados vía WhatsApp en cohorte piloto.

## Fase 4 — Recetas y costeo dinámico (mes 12–18)

**Objetivo:** food cost en tiempo real, alertas accionables.

Trabajo:
- Pipeline OCR de facturas (Mindee o AWS Textract).
- Mapping ingredientes (LLM + embeddings) con validación humana.
- Recalculo de food cost por receta en cada factura.
- Alertas cuando el food cost de un plato cruza el umbral (32/36/40%).
- Propuestas de reformulación o ajuste de precio con timing inteligente.
- Validación de precios de proveedor vs mercado.

**Salida:** -15% de merma en perecederos por cohorte piloto.

## Fase 5 — Visión + multi-país + autopilot (mes 18–24)

**Objetivo:** ampliar moat con visión, escalar a más países de LATAM, habilitar modo autopilot por categoría.

Trabajo:
- Módulo de visión: cámaras en estación de basura + prep, detección de desperdicios.
- Conectores POS adicionales: OneCore, Clip, Square, Toast.
- Soporte multi-país (Colombia, Perú, Chile) — fiscalidad local, moneda, timezone.
- Modo autopilot por categoría desbloqueado después de 90 días de track record positivo (PAR_LEVEL_ADJUST primero, MENU_REPRICE último).
- Programa de partners (POS distribuidores, consultores gastronómicos).

**Salida:** operación rentable en 3 países, >50% de tenants con al menos 1 categoría en autopilot.

---

## Dependencias críticas entre fases

```
Fase 1 (forecast) ────────► Fase 2 (anomalies + reco)
        │                            │
        ▼                            ▼
Fase 4 (recetas/OCR) ─────► Fase 5 (autopilot)
                                     ▲
Fase 3 (CRM + WhatsApp) ─────────────┘
```

## KPIs por fase

| Fase | KPI primario | Target |
|---|---|---|
| 1 | MAPE forecast 7d | < 12% |
| 2 | % aceptación de recos | > 60% |
| 3 | No-shows recuperados | > 40% |
| 4 | Reducción de merma | -15% |
| 5 | Tenants en autopilot ≥1 cat | > 50% |

## Hitos comerciales

- **Mes 3:** 5 pilotos firmados, primer track record publicable.
- **Mes 6:** 25 sucursales pagando.
- **Mes 12:** 150 sucursales, expansion fuera de CDMX (Monterrey, Guadalajara, Mérida).
- **Mes 18:** Serie A.
- **Mes 24:** 1,000 sucursales en 3 países.
