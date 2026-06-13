---
name: generate-pr
description: Genera los detalles del PR (título + body Markdown) con el formato estándar de Copiloto cuando el usuario pide "los detalles del PR", "generar PR", "body del PR" o variantes. Copiloto es un mono-repo (rama base `main`, GitHub): produce UN solo bloque de PR para el branch actual, lee el diff real (no inventa archivos ni líneas), arma título convencional ≤70 chars y body con secciones Resumen / Motivación / Cambios / Compatibilidad / Test plan en español MX, y pushea el feature branch automáticamente (solo `feature/*`/`feat/*`, nunca `main`).
---

# generate-pr

Genera los detalles de PR (título + body) para los commits actuales del branch o el alcance indicado por el usuario, y pushea el feature branch como paso final. Copiloto es un **mono-repo** (un solo repo `copiloto`, rama base `main`, GitHub) — un PR por branch, sin flujo cross-repo ni snapshots de readiness.

## Cuándo invocar

Activá esta skill cuando el usuario pide cualquier variante de:
- "generar los detalles del PR"
- "darme el body del PR"
- "preparar el PR"
- "formato del PR" / "PR description"
- Después de un commit+push, si el usuario pregunta "qué le pongo al PR".

Esta skill hace dos cosas en orden:
1. **Genera el texto del PR** (título + body) a partir del diff real del branch vs `main`.
2. **Pushea el feature branch** automáticamente (solo `feature/*` / `feat/*`, nunca `main`) para que solo reste abrir el PR desde el enlace.

No la uses para crear branches feature ni para abrir/mergear el PR en sí — para eso ya hay flujo manual o `gh` directo. La skill **sí pushea automáticamente** el feature branch como paso final, pero no abre ni mergea el PR.

## Pasos

### 0. Pre-flight: sync del branch vs `main` (PRE-CONFLICT CHECK)

**Hacé esto SIEMPRE primero.** El objetivo es detectar branches viejas con conflictos antes de invertir esfuerzo en el body.

```bash
# 1. Fetch latest base (cheap, solo refs)
git fetch origin main

# 2. Cuántos commits de origin/main NO están en HEAD (= cuán atrás está el branch)
behind=$(git rev-list --count HEAD..origin/main)

# 3. Si behind > 0, simular el merge SIN modificar el working tree
if [ "$behind" -gt 0 ]; then
  merge_base=$(git merge-base HEAD origin/main)
  conflict_files=$(git merge-tree --name-only --merge-base="$merge_base" HEAD origin/main 2>/dev/null || true)
  if [ -z "$conflict_files" ]; then
    echo "STATE: behind-clean"
  else
    echo "STATE: behind-conflict"
    echo "$conflict_files"
  fi
fi

# 4. Detectar caso especial "ya mergeado con SHA distinto":
applied_check=$(git log HEAD --not origin/main --format="%H" | \
  while read sha; do
    git log origin/main --grep="$(git log -1 --format=%s $sha)" --oneline | head -1
  done)
```

**Reacción según el estado:**

| Estado | Acción |
|---|---|
| `up-to-date` (behind=0) | ✓ Continuar al paso 1 sin mencionar el check |
| `behind-clean` | Avisar: "Tu branch X está N commits behind origin/main. ¿Sincronizo con `git merge origin/main` o `git rebase` antes de seguir?" Esperar respuesta. |
| `behind-conflict` | **Detener el flujo.** Reportar archivos en conflicto y pedir resolución manual. NO continúes con el body. |
| `already-applied` | Avisar: "El commit `<sha>` ya está en origin/main con SHA distinto. Recomiendo cerrar el PR como duplicado." |

**Reglas estrictas del paso 0:**
- NUNCA ejecutar `git merge` / `git rebase` / `git reset` sin "sí" explícito del usuario en este turno.
- NUNCA ejecutar `git push` en el paso 0 (es solo simulación). El push del feature branch ocurre recién en el paso 4, y SOLO sobre `feature/*` / `feat/*` (nunca `main`); `git push --force` siempre requiere "sí" explícito.
- Si el working tree está dirty, abortar el paso 0 y pedir commit/stash primero.
- Si `git merge-tree` falla (git < 2.38), caer al fallback `git merge --no-commit --no-ff origin/main` + `git merge --abort`. Si tampoco funciona, proceder sin pre-flight con un aviso.

### 1. Identificar el alcance

```bash
git branch --show-current
git status -s
git log origin/main..HEAD --oneline
git diff origin/main...HEAD --stat
git diff origin/main...HEAD     # solo si el stat es chico
```

Marcá qué cambió. Si hay cambios sin commitear, avisá al inicio y preguntá si entran al PR o quedan fuera. No inventes archivos: el bloque del PR solo lista lo que aparece en el diff real.

El mono-repo `copiloto` toca tres zonas que conviene identificar en el diff para el scope del título:
- **Frontend**: `apps/web/src/**` (o `agent/apps/web/src/**`) → `@copiloto/web` / `@copiloto/agent-web`.
- **Backend**: `apps/api/server/**`, `apps/api/prisma/**` (o `agent/apps/api/**`) → `@copiloto/api` / `@copiloto/agent-api`.
- **Paquetes compartidos**: `packages/**` → `@copiloto/{auth,db,shared,ui,utils,ts-config}`.

### 2. Formato exacto del bloque de PR

Generá **un solo bloque** (un PR por branch).

```
## PR — `copiloto`

**Branch:** `<feature-branch>` → `main`

**Título (≤70 chars):**
\`\`\`
<type>(<scope>): <descripción imperativa>
\`\`\`

**Body:**
\`\`\`markdown
## Resumen
- <bullet 1>
- <bullet 2>

## Motivación
<1-2 párrafos del "por qué" — solo si no es obvio. Si es trivial, omitir esta sección entera>

## Cambios
- `path/al/archivo.ts:LINEA` — qué cambió y por qué (frase corta).
- <siguiente archivo> — ...

## Compatibilidad
- <solo cuando hay riesgo de romper consumidores: contrato FE↔BE, schema/migración Prisma, API pública de un paquete>.

## Test plan
- [ ] <paso ejecutable con expectativa concreta>
- [ ] <otro paso>
\`\`\`

**Link para abrir PR:**
<URL completa al "new pull request" del remote — ver paso 5>
```

### 3. Reglas de contenido (críticas para consistencia)

**Título**
- Tipo convencional: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `perf`.
- Scope entre paréntesis: el módulo afectado del producto (`orders`, `menu`, `inventory`, `copilot`, `dashboard`, `invoices`, `reservations`, etc.), el lado (`web`, `api`, `agent-web`, `agent-api`) o el paquete (`ui`, `auth`, `db`) cuando aplica.
- Descripción en imperativo, español, sin punto final, máximo 70 caracteres.
- Antes de inventar el scope, mirá `git log --oneline -10` y seguí la convención del repo (los commits recientes usan `feat:`, `fix(deploy):`, `chore(deploy):`, etc.).

**Resumen**
- 2-4 bullets. El primer bullet es "qué hace este PR" en una oración.
- Bullets siguientes: matices importantes (cambio de comportamiento, fallback, decisión de diseño).

**Motivación**
- Omitila si el cambio es trivial.
- Inclúila cuando hay decisión no obvia: bug que se evita, trade-off, requisito de negocio, incidente previo.

**Cambios**
- Lista con paths y, cuando ayuda, número de línea (`apps/api/server/routes/orders.ts:87`).
- Frases que describan el efecto, no el diff textual.

**Compatibilidad** *(opcional)*
- Inclúila si: API pública de un paquete cambia, hay migración de datos / schema Prisma, el contrato frontend↔backend cambia, o removiste código público.

**Test plan**
- Checklist ejecutable con expectativa concreta.
- ❌ Mal: `- [ ] Probar el listado`.
- ✅ Bien: `- [ ] Crear un pedido desde /menu → aparece en /orders con estado PLACED`.
- Si corriste `pnpm exec tsc --noEmit` o `pnpm build` localmente y pasó, agregalo como item ya marcado.
- Mínimo 2 checkboxes, idealmente 3-5.

### 4. Push automático del feature branch

Después de generar el bloque (paso 2), pusheá automáticamente el branch actual. Esto es modo auto — no pidas confirmación.

**Guard obligatorio antes del push** (no romper):

```bash
branch=$(git branch --show-current)
# 1. NUNCA pushear main — abortar y avisar.
case "$branch" in
  main|master) echo "SKIP: branch protegido '$branch'"; exit ;;
esac
# 2. Solo branches feature/* o feat/*.
git push -u origin "$branch"
```

**Reglas del push:**
- **Solo `git push` simple** (con `-u` si el branch es nuevo en el remote). NUNCA `--force` / `--force-with-lease` sin "sí" explícito.
- **NUNCA pushear `main` / `master`.** Verificá el branch actual antes (guard de arriba) y confiá en el hook `.claude/hooks/guard-bash.sh` como segunda barrera si existe. Si por error el branch es protegido, saltá el push y avisá.
- Si el push falla (rechazo del remote, hook, auth), reportá el error y seguí — el body del PR ya quedó generado.
- Si el paso 0 detectó `behind-clean` / `behind-conflict` y no se resolvió, NO pushees.

Reportá el resultado: `feat/x → origin/feat/x (abc123..def456)`.

### 5. Cierre estándar

El bloque del paso 2 incluye su `**Link para abrir PR:**`. Para construir la URL, detectá el remote:

```bash
git remote -v
```

Formato de la URL (GitHub):
- `https://github.com/<org>/copiloto/pull/new/<branch>`
- Adicionalmente ofrecé el comando CLI: `gh pr create --base main --title "<title>" --body "<body>"`.

**Reglas del link:**
- Encodear el branch con `%2F` solo si contiene caracteres especiales — slashes normales (`feat/x`) no necesitan escape en GitHub.
- Si el push del paso 4 falló, en lugar del link poné: `**Link para abrir PR:** (push falló — ver error arriba; reintentar antes de abrir el PR)`.

Termina con:
> El branch ya está pusheado — el bloque tiene su link para abrir el PR. ¿Te abro el PR directo con `gh` o lo creas manual desde el enlace? (La skill pushea pero no abre ni mergea el PR.)

## Idioma y tono

- Español MX, tono informal del repo.
- Sin emojis salvo que el repo los use convencionalmente en commits.
- Sin `Co-Authored-By` en el body del PR — eso va solo en el mensaje de commit cuando el usuario lo pide.
- Identificadores en código en ASCII si la convención del repo lo respeta; texto narrativo con acentos correctos.

## Reglas estrictas (no romper)

- **Paso 0 SIEMPRE primero.** Si el branch tiene conflictos con `main`, detené el flujo entero (no generes el body) y pedí resolución.
- **Nunca corras `git merge` / `git rebase` / `git reset` / `git push --force` sin "sí" explícito del usuario.** El paso 0 solo simula.
- **El `git push` simple del feature branch SÍ es automático (paso 4).** Pero SOLO sobre branches `feature/*` / `feat/*` — **NUNCA `main` / `master`**. Verificá el branch antes (guard del paso 4) y confiá en el hook `guard-bash.sh` como segunda barrera. `--force`/`--force-with-lease` siguen requiriendo "sí" explícito.
- **No inventes archivos ni líneas.** Si no leíste el diff, no fabriques referencias.
- **No marques checkboxes del Test plan como hechos** salvo verificación en la conversación actual.
- **Si hay cambios sin commitear al inicio del paso 1**, avisalo y preguntá si entran al PR antes de seguir.

## Ejemplo de salida correcta

```
Detecté en el diff:
- `apps/web/src/app/menu/[locationId]/page.tsx` — nuevo menú digital del cliente.
- `apps/api/server/routes/orders.ts` — endpoint para crear pedido desde el menú.

## PR — `copiloto`

**Branch:** `feat/menu-cliente-y-pedidos` → `main`

**Título (≤70 chars):**
\`\`\`
feat(menu): menu digital del cliente + pedidos en operaciones
\`\`\`

**Body:**
\`\`\`markdown
## Resumen
- El cliente abre `/menu/:locationId` y arma un pedido sin login.
- El pedido entra al panel de operaciones en `/orders` con estado PLACED.

## Cambios
- `apps/web/src/app/menu/[locationId]/page.tsx` — vista pública del menú con carrito.
- `apps/api/server/routes/orders.ts` — `POST /api/orders` valida payload con Zod y persiste vía Prisma.

## Test plan
- [ ] Abrir /menu/<id> sin sesión → se ve el menú de esa sucursal.
- [ ] Crear un pedido → aparece en /orders con estado PLACED.
- [x] pnpm exec tsc --noEmit limpio ✓
\`\`\`

**Link para abrir PR:**
https://github.com/<org>/copiloto/pull/new/feat/menu-cliente-y-pedidos

---

✓ Branch pusheado: feat/menu-cliente-y-pedidos → origin (a1b2c3d..e4f5g6h)

El branch ya está pusheado — el bloque tiene su link para abrir el PR. ¿Te abro el PR directo con gh o lo creas manual desde el enlace? (La skill pushea pero no abre ni mergea el PR.)
```
