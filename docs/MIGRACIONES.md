# Migraciones de base de datos (Prisma)

Hasta ahora el esquema se aplicaba con `prisma db push` (sin historial). Este
repo ya tiene **migraciones versionadas**: hay una migración baseline en
`apps/api/prisma/migrations/0_init/` que representa el esquema actual completo
(35 tablas, 18 enums, 54 FKs).

Beneficios: historial auditable, rollback, y `migrate deploy` reproducible en
cada entorno (sin drift entre local/staging/prod).

---

## Prerequisito: DIRECT_URL debe ser conexión directa

Prisma corre las migraciones por `DIRECT_URL`, **no** por `DATABASE_URL`. En
Supabase:

- `DATABASE_URL` → **pooler** (puerto `6543`, `?pgbouncer=true`) — runtime de la app.
- `DIRECT_URL` → **conexión directa** (puerto `5432`, host `db.<ref>.supabase.co`) — migraciones.

El pooler (pgbouncer) **no** soporta el advisory lock ni el DDL que Prisma usa
para migrar. Si `DIRECT_URL` apunta al pooler, `migrate` falla o se cuelga.
Consíguela en Supabase → Project Settings → Database → *Connection string* →
**Direct connection**.

---

## Baseline (UNA sola vez por cada DB que ya existe)

Las DBs actuales (local, staging, prod) ya tienen las tablas creadas con
`db push`. Hay que decirle a Prisma que la migración `0_init` **ya está
aplicada**, sin volver a ejecutarla (si no, `migrate deploy` intenta crear
tablas que ya existen y falla con `P3005`).

Con el `.env` apuntando a la DB objetivo:

```bash
pnpm --filter @copiloto/api db:migrate:baseline
# = prisma migrate resolve --applied 0_init
```

Esto solo inserta un registro en la tabla `_prisma_migrations`. No altera datos
ni esquema. Repítelo apuntando a cada DB existente (local, staging, prod).

> Para una DB **nueva y vacía** (p.ej. cuando separes la DB de producción) NO
> hagas baseline: corre `pnpm --filter @copiloto/api db:migrate:deploy` y Prisma
> crea todo desde `0_init`.

---

## Flujo de aquí en adelante

**Desarrollo** — cuando cambies `schema.prisma`:

```bash
pnpm --filter @copiloto/api db:migrate   # prisma migrate dev
# te pide un nombre; genera prisma/migrations/<timestamp>_<nombre>/ y lo aplica
```

Commitea la carpeta de la nueva migración junto con el cambio de schema.

**Deploy** — aplicar migraciones pendientes en el entorno destino:

```bash
pnpm --filter @copiloto/api db:migrate:deploy   # prisma migrate deploy
```

Para automatizarlo en Render, descomenta el `preDeployCommand` en
[`render.yaml`](../render.yaml) **después** de haber hecho el baseline en esa DB:

```yaml
preDeployCommand: pnpm --filter @copiloto/api exec prisma migrate deploy
```

`db push` sigue disponible (`db:push`) para prototipado rápido en local, pero no
lo uses contra staging/prod una vez adoptadas las migraciones (causa drift).

---

## Checklist de adopción

- [ ] Poner `DIRECT_URL` como conexión directa (5432) en local, staging y prod.
- [ ] `db:migrate:baseline` en cada DB existente (local, staging, prod).
- [ ] Verificar `db:migrate:deploy` (no debe hacer nada: todo aplicado).
- [ ] Descomentar `preDeployCommand` en `render.yaml`.
