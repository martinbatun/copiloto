# PRODUCT BRIEF — Copiloto

> Smart Ops Co-pilot — capa de inteligencia operativa con IA para restaurantes en MX y LATAM.

## 1. Tesis

Los operadores de restaurante ya no necesitan más dashboards. Necesitan una IA que les diga **qué hacer en los próximos 30 minutos** y que ejecute en un clic cuando ellos aprueban. Copiloto se conecta al POS existente (no lo reemplaza) y entrega recomendaciones accionables sobre **staffing**, **inventario**, **menú** y **experiencia del huésped**.

Promesa medible: **+5–8 puntos de margen operativo en 90 días** sin cambiar de POS.

## 2. Personas objetivo

| # | Persona | Perfil | Dolor primario |
|---|---|---|---|
| 1 | **Dueño-operador** (1–5 sucursales) | Casual o full-service, USD 15–40 ticket promedio. Usa Soft Restaurant / Clip / hojas de cálculo. | No tiene tiempo de mirar reportes; decide por intuición. |
| 2 | **Gerente de operaciones de cadena emergente** (5–25 sucursales) | Ya invirtió en R365 / Crunchtime y siente que el ROI no llegó. | Visibilidad fragmentada entre sucursales; dependencia del manager-héroe. |
| 3 | **Chef o jefe de cocina** | Responsable de food cost y menú. | Pares de inventario basados en intuición; merma invisible hasta el cierre de mes. |

## 3. Seis pilares funcionales

### Pilar A — Motor de demanda unificada
Un único modelo de forecast (LightGBM/XGBoost) que integra ventas históricas, dayparts, clima, eventos locales (conciertos, partidos, festivos regionales) e historial por canal. Output simultáneo:
- Schedule sugerido por daypart + rol.
- Par levels por SKU de inventario.
- Prep list para cocina.

Precisión objetivo: **MAPE 10% a 7 días**.

### Pilar B — Co-piloto de turno
Asistente conversacional accesible en web app y WhatsApp. Capacidades:
- Q&A en lenguaje natural sobre KPIs ("¿por qué bajó mi ticket promedio?").
- Detección de anomalías (voids, descuentos atípicos, drift de food cost) con triage.
- Recomendaciones de acción con contexto, impacto estimado y botón de ejecutar.
- Action ledger: cada decisión queda registrada para entrenar el modelo de qué recomendaciones de hecho funcionan.

Guardrail: human-in-the-loop por defecto en acciones de alto impacto. Modo autopilot disponible solo después de 90 días de track record por categoría.

### Pilar C — CRM propio del restaurante
Perfil unificado del huésped a partir de reservas, pedidos, WhatsApp y reseñas. Segmentación automática:
- VIP, BIG_SPENDER, REGULAR, FIRST_VISIT, CHURN_RISK, LAPSED.

Campañas conversacionales en WhatsApp con guardrails (opt-in obligatorio, rate-limit por tenant, sólo templates aprobados). **El dato del huésped es propiedad del restaurante**, no de un marketplace.

### Pilar D — Agente conversacional FOH
Bot de WhatsApp Business API que:
- Toma reservas y maneja lista de espera.
- Confirma 24h antes y mide tasa de confirmación.
- Recupera no-shows con cupón + mensaje 2h después del slot perdido.
- Responde preguntas de menú, horarios y disponibilidad.
- Pide feedback post-visita.

Diferenciador regional crítico: WhatsApp es el canal de comunicación primario en LATAM.

### Pilar E — Recetas y costeo dinámico
- Recetas con ingredientes + unidades normalizadas.
- Food cost por plato recalculado automáticamente con cada factura OCR'd.
- Alertas cuando un plato cruza el umbral (32% target, 36% warn, 40% alarm).
- Propuesta de reformulación o ajuste de precio cuando el food cost drift sostenido lo justifica.

Conectado al motor de demanda para escoger el momento óptimo de cambio (evitar repricing en semana fuerte).

### Pilar F — Visión por computadora (Fase 4+)
Módulo opcional con cámaras en estación de basura y línea de prep que identifican desperdicios y los conectan al motor de pares. Add-on premium para operadores de mayor escala.

## 4. Diferenciación competitiva

| Versus | Diferenciación |
|---|---|
| Toast / ToastIQ | No atamos POS ni procesador. Operamos en es-MX con realidades fiscales (CFDI, IVA, propinas). |
| Restaurant365 | 10x más simple de implementar, 5x más barato, enfocado en acciones — no cierre contable. |
| 7shifts | El schedule no es nuestro producto: es el output de un motor que también genera inventario y prep. |
| OpenTable / Resy / SevenRooms | El dato del huésped es del restaurante. Potenciamos canales propios, no agregamos demanda externa. |
| Nory / Supy | Presencia LATAM, WhatsApp nativo, onboarding en 72 horas. |

## 5. Outcomes que el producto debe mover

- **Margen operativo**: +5–8 pp en 90 días sobre baseline pre-implementación.
- **MAPE forecast 7d**: < 10%.
- **Tasa de aceptación de recomendaciones**: > 60% por manager activo.
- **Reducción de merma**: -15% en SKUs perecederos en 90 días.
- **Recuperación de no-shows**: > 40% vía WhatsApp.
- **Onboarding**: sucursal productiva en < 72 horas.

## 6. Lo que el producto NO es

- No es un POS.
- No es un ERP ni reemplaza la contabilidad.
- No es un marketplace de delivery.
- No es un dashboard de BI.
- No agrega demanda externa al restaurante.

Si un comprador pide alguna de estas cosas, no es nuestro cliente — todavía.
