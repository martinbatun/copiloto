# Desplegar la API (apps/api)

El **web** vive en Vercel. La **API** es un Express de larga duración
(`node dist/index.mjs`) que **no corre como proyecto normal de Vercel**, así que
va en un host de servicios Node. Esta guía usa **Render** (Git-based, el camino
más corto). Fly funciona igual con el mismo `Dockerfile`.

## 1. Crear el servicio en Render

1. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**.
2. Conecta el repo `martinbatun/copiloto`. Render detecta [`render.yaml`](../render.yaml)
   y propone el servicio `copiloto-api` (Docker, build desde `apps/api/Dockerfile`).
3. **Apply**.

## 2. Variables de entorno (en el dashboard de Render)

Las marcadas `sync:false` en `render.yaml` se llenan a mano (son secretos).
Cópialas de tu `apps/api/.env` actual:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Supabase pooler (puerto `6543`, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase directo (puerto `5432`) |
| `JWT_SECRET` | **el mismo** que tu API actual (si cambia, invalida sesiones) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET` | de tu `.env` |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` | de tu `.env` |
| `CORS_ORIGIN` | ya viene = `https://copiloto-web.vercel.app` (ajústalo si cambia el dominio) |

> `NODE_ENV` y `PORT`: no los toques. Render inyecta `PORT` y el server lo lee solo.

## 3. Apuntar el web a la API

Cuando Render termine te da una URL (ej. `https://copiloto-api.onrender.com`).
En **Vercel → proyecto `copiloto-web` → Settings → Environment Variables**:

```
NEXT_PUBLIC_API_URL = https://copiloto-api.onrender.com
```

Luego **Redeploy** del web (Deployments → ⋯ → Redeploy) para que tome la variable.

## 4. Verificar

```bash
curl https://copiloto-api.onrender.com/api/health
# {"status":"ok",...}

curl https://copiloto-api.onrender.com/api/menu/public/<locationId>
# JSON del menú (ya no "Cannot GET")
```

Abre `https://copiloto-web.vercel.app/menu/<locationId>` → el menú carga.

## Notas

- **Plan `free`**: el servicio **duerme** tras ~15 min sin tráfico (cold start
  ~30–60s). Para staging/demo está bien; sube a `starter` para always-on.
- **DB migrada**: las tablas ya existen si compartes la DB con local. En una DB
  nueva, corre una vez `npx prisma db push` con `DATABASE_URL`/`DIRECT_URL` de
  ese entorno (nunca `db:seed` en prod).
- **Supabase free tier**: si la DB se pausó por inactividad, las queries fallan
  con `Tenant or user not found` → reactívala desde el dashboard de Supabase.
- **autoDeploy**: cada push a `main` redepliega la API automáticamente.
