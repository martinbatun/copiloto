# Costos de producción

Estimado de lo que cuesta operar **Copiloto Smart Ops** en producción, dimensionado
para el **lanzamiento con 1 restaurante / 1 sucursal**. Precios verificados en jul-2026;
**cambian con el tiempo** — revisa las páginas oficiales antes de comprometerte.

> TL;DR: **~$60 USD/mes (~$1,200 MXN)** de infraestructura fija, **+ ~4% por
> transacción** de Mercado Pago (sale de cada venta), **+ ~$15–35 USD/año** por el dominio.

---

## 1. Mensual fijo — infraestructura

| Servicio | Plan | USD/mes | ¿Free viable? |
|---|---|---:|---|
| **Render** — API Express (Docker) | Starter (512 MB, no duerme) | 7 | No: el free hace spin-down y perderías webhooks de pago |
| **Vercel** — web Next.js | Pro (1 seat) | 20 | No: Hobby prohíbe uso comercial (ToS) |
| **Supabase** — Postgres + Storage | Pro | 25 | No: el free se pausa por inactividad y no trae backups |
| **Sentry** — monitoreo de errores | Developer (gratis) | 0 | Sí: 5k errores/mes bastan |
| **OpenRouter** — Co-piloto IA | Pago por uso | ~6 | Es por uso (ver §2) |
| | **Subtotal** | **~$52–58** | |

Notas:
- **Render Starter** ($7) va sobre el workspace **Hobby** (gratis). El bandwidth
  (~1–3 GB/mes, API JSON) y los build minutes caben en el free del workspace → $0 extra.
  Si Node se queda sin RAM (OOM en 512 MB), el siguiente escalón es Standard ($25/mes, 2 GB).
- **Vercel Pro** ($20) incluye 1 TB de transferencia y 10M edge requests/mes — a
  escala de 1 restaurante el consumo queda 30–100× por debajo, sin overage.
- **Supabase Pro** ($25) incluye 8 GB DB, 100 GB storage, backups de 7 días y no se
  pausa. La DB de un restaurante (<1 GB) cabe de sobra.

## 2. Co-piloto IA (OpenRouter — por uso)

Modelo `minimax/minimax-m2.7`: **$0.24 / 1M tokens input**, **$0.96 / 1M tokens output**.

Con ~150 chats/día (≈3k tokens de contexto + 600 de salida por chat, 30 días):

| | Tokens/mes | Costo |
|---|---:|---:|
| Input | 13.5M | $3.24 |
| Output | 2.7M | $2.59 |
| **Total** | | **~$6/mes** |

- ⚠️ Ese precio trae etiqueta *"60% off"* (promoción). Si termina, sube a **~$15/mes**.
- El modelo es configurable con `OPENROUTER_MODEL` sin recompilar — se puede bajar de
  modelo si el costo o la latencia importan (minimax-m2.7 tardó ~25s/respuesta en pruebas).
- OpenRouter no cobra markup por token; solo ~5.5% al comprar créditos (Stripe).

## 3. Dominio (anual, ≈ pago único)

| TLD | USD/año | ≈ USD/mes |
|---|---:|---:|
| `.com` | ~15 | ~1.25 |
| `.com.mx` | ~17–25 | ~1.7 |
| `.mx` (corto) | ~30–35 | ~2.9 |

Recomendado: **Cloudflare Registrar** (vende al costo, renovación = registro, sin markup).

## 4. Mercado Pago — costo por transacción (NO es infra)

Checkout Pro México, acreditación inmediata: **3.49% + IVA (16%) = ~4.05% efectivo** por
transacción con tarjeta / SPEI / saldo MP (sin cargo fijo con tarjeta).

- Ticket de **$600 MXN** → comisión **$24.29**, recibes **$575.71**.
- 300 órdenes/mes ≈ **$7,287 MXN/mes** · 1,000 órdenes/mes ≈ **$24,290 MXN/mes**.

Es un costo variable que **sale de cada venta** y escala con el volumen — no un gasto
fijo de infraestructura.

---

## 5. Resumen por escenario (solo infra, sin comisiones de MP)

| Escenario | USD/mes | ≈ MXN/mes* |
|---|---:|---:|
| **Producción recomendada** (pago + IA + dominio amortizado) | ~$60–70 | ~$1,150–1,350 |
| **Mínimo defendible** (Sentry gratis, modelo IA económico) | ~$54 | ~$1,000 |
| Rock-bottom con free tiers (**no recomendado**) | ~$20 | ~$370 |

\* FX aprox. $18.5 MXN/USD (varía).

El **rock-bottom no se recomienda**: implica API que se duerme (pierde webhooks de pago),
Supabase sin backups y que se pausa, y Vercel Hobby violando su ToS comercial. Para un
negocio que cobra dinero, **~$60/mes** es el piso sensato.

## 6. Cómo escala

- **Infra fija** (~$60/mes) es casi plana hasta varios restaurantes; los cuellos de
  botella primeros serían RAM de Render (→ Standard $25) y compute de Supabase.
- **IA** escala lineal con el uso del chat (barato).
- **Mercado Pago** escala con las ventas (≈4% del GMV en línea).
- **Multi-restaurante / multi-tenant**: el modelo de datos ya es multi-tenant; el costo
  marginal por restaurante adicional es bajo hasta saturar las instancias base.

> Fuentes: páginas oficiales de pricing de Render, Vercel, Supabase, OpenRouter,
> Mercado Pago México y Cloudflare/Namecheap (jul-2026). Verifica antes de contratar.
