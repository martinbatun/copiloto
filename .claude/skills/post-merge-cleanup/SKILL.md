---
name: post-merge-cleanup
description: Después de que el usuario confirma "ya mergeé el PR" / "ya hice merge" / "todo mergeado" / variantes, sincroniza el repo mono-repo de Copiloto — pull de `main`, borra branches locales que ya quedaron mergeadas con `git branch -d` (modo seguro, nunca `-D`), y reporta el estado final. NO lo invoques antes del merge ni si el usuario solo dice "creé el PR" — debe ser explícito que el merge sucedió.
---

# post-merge-cleanup

Sincroniza el repo `copiloto` después de que el PR se mergeó, y limpia las branches locales que quedaron huérfanas. Copiloto es un **mono-repo** (un solo repo, rama base `main`).

## Cuándo invocar

Activá esta skill cuando el usuario diga cualquier variante de:
- "ya mergeé el PR" / "ya mergeé los PRs"
- "ya hice merge"
- "mezclaste todo / mezclé todo"
- "PR mergeado / aprobado"
- "todo en main"
- "limpiar branches viejas"
- "regresar a main / rama base"

**No invocar si:**
- El usuario solo creó/abrió el PR (sin merge).
- Hay cambios sin commitear (avisa y aborta).
- El usuario está en medio de un rebase/merge conflict.

## Pasos

### 1. Diagnóstico inicial

```bash
git status -s && git branch --show-current
```

**Abort if dirty:** Si `status -s` tiene output, informá al usuario qué archivos cambiaron sin commitear y pregunta si:
- (a) los commitea antes de cleanup
- (b) los stashea
- (c) los descarta (peligroso, pedí confirmación explícita)

No avances hasta resolverlo. Nunca corras `git stash` o `git restore` automáticamente sin pedirlo.

### 2. Confirmar la rama base

La rama base de copiloto es `main` (verificá, no asumas — el repo no usa `develop`):

```bash
git branch -r | grep -E "origin/(main|master)$"
```

Si el remote usa `master` en vez de `main`, usá esa. No asumas la existencia de `develop`.

### 3. Switch + pull --ff-only

```bash
git checkout main
git pull --ff-only origin main
```

**Errores que pueden pasar:**
- `pull --ff-only` falla → `main` local divergió de origin. Reportá al usuario y NO hagas merge ni reset automático. Sugerí `git pull --rebase` o investigación manual.
- Checkout falla → working tree no limpio (debió detectarse en paso 1).

### 4. Preview de branches a borrar

Listá lo que SE VA A BORRAR antes de borrar:

```bash
git branch --merged main | grep -v -E "^\*|main$|master$"
```

Mostrá al usuario la lista de branches candidatas. **Si esta es la primera invocación del skill en la sesión, pedí confirmación.** Si el usuario ya dijo "sí" en este mismo turno (frase compuesta como "ya mergeé, limpiá"), procedé directo.

### 5. Borrar con `-d` (modo seguro)

```bash
git branch --merged main | grep -v -E "^\*|main$|master$" | xargs -r git branch -d
```

**Reglas inmovibles:**
- Usá `-d` (lowercase), nunca `-D` (uppercase). `-d` solo borra si la branch está mergeada. Si no lo está, falla y no destruye nada — eso ES el comportamiento deseado, no un error a arreglar.
- Nunca borres `main` / `master` ni la rama actual (los grep filters ya lo cubren).
- Nunca borres branches remotas (`git push origin :branch` o `git branch -d -r`). Solo locales.
- Si una branch falla por no estar mergeada, déjala. Reportala como "no-mergeada, conservada". NO sugieras `-D` por defecto — preguntá si quiere investigar o forzar.

### 6. Reporte final

Estructura del reporte (en español MX, conciso):

```
Limpieza completa. **N branches mergeadas eliminadas**:
- <lista>

**Branches sin mergear que quedaron** (intencional — `-d` no las toca):
| Branch | Último commit |
|---|---|

Working tree limpio en `main`, al día con origin.
```

Si hay branches sin mergear, incluí `git log <branch> --oneline -1` para que el usuario sepa qué hay ahí (puede ser trabajo en curso).

### 7. Ofertas post-cleanup

Al final, ofrecé acciones de seguimiento solo si tienen sentido:
- Si hay branches sin mergear con commits viejos (>30 días), preguntá si quiere revisarlas con `git log <branch>`.
- Si el repo está limpio sin branches no-mergeadas, no ofrezcas nada — termina.

## Reglas estrictas (no romper)

- **Nunca usar `-D` (force delete)** sin confirmación explícita del usuario diciendo "fuerza" o "borra sin importar".
- **Nunca usar `git reset --hard`, `git clean -fd`, ni `git push --force`** en este flujo. Si `main` no se puede fast-forward, ABORTA y pide instrucciones.
- **Nunca borrar branches remotas** en este skill. Solo locales.
- **Nunca borrar `main` / `master`** — los grep filters lo cubren, pero es defensa en profundidad.
- **Si hay cambios sin commitear**, NO hacer stash automático. Pedir explícitamente.
- **Si pull --ff-only falla**, reportar y parar. No intentar merge/rebase automático.
- **No correr este skill si el usuario solo creó el PR** (sin merge). Confirmá el merge en el mensaje.

## Ejemplo de invocación

```
Usuario: "Ya mergeé el PR de menú-cliente"
Asistente: [invoca post-merge-cleanup]
  1. Verifica status limpio ✓
  2. Switch a main, pull --ff-only
  3. Preview: 2 branches mergeadas para eliminar
  4. Borra con -d
  5. Reporta: 2 eliminadas (feat/menu-cliente-y-pedidos, fix/orders-port), 1 conservada (feat/copilot-wip)
```

## Output esperado del reporte

| Campo | Detalle |
|---|---|
| Repo sincronizado | `copiloto` (mono-repo) |
| Rama base | `main` (verificado, no asumido) |
| Branches eliminadas | Lista con `-d` (modo seguro) |
| Branches conservadas | Sin mergear; mostrar último commit para contexto |
| Working tree final | Limpio en `main`, al día con origin |
