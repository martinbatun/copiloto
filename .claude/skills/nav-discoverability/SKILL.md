---
name: nav-discoverability
description: Asegura que toda ruta nueva o existente del frontend Next.js App Router de Copiloto sea alcanzable desde la navegación (no quede huérfana solo accesible escribiendo la URL). Aplica a ambos frontends del mono-repo: `apps/web/src/app/**/page.tsx` y `agent/apps/web/src/app/**/page.tsx`. Auto-activar cuando se crea un archivo nuevo `app/**/page.tsx`, cuando se hace refactor de una ruta existente, cuando el usuario pregunta "cómo se llega a X", "no sé cómo acceder a X", "está esta vista en algún nav", "está la ruta alcanzable", "cómo entro a tal página", o cuando se planea agregar una sección/módulo nuevo.
---

# Skill: Discoverability de rutas

Toda ruta `app/**/page.tsx` tiene que ser alcanzable desde la UI. Si solo se entra escribiendo la URL, está rota desde la perspectiva del usuario.

En Copiloto la navegación principal vive en `apps/web/src/components/AppShell.tsx` (y su análogo en `agent/apps/web/src/components/`), en los arrays `PRIMARY_NAV` y `MORE_NAV` (items `{ href, label, icon }`, donde `icon` es un nombre de Material Symbol).

Antes de cerrar la tarea, **leer la sección "DISCOVERABILITY" en [`.claude/RULES-NAV.md`](../../RULES-NAV.md)** y correr la verificación manual.

## Cuándo aplicar

- Creé un `page.tsx` nuevo (cualquier ruta, en `apps/web` o `agent/apps/web`).
- Renombré / moví una ruta existente (el `href` viejo apunta a archivo inexistente).
- Agregué un módulo nuevo (orders, inventory, settings, reports, wizard).
- El usuario pregunta "cómo accedo a X" o "está esta vista en el nav".

## Workflow

1. **Identificar la ruta nueva** y su jerarquía:
   - ¿Es módulo top-level (`/orders`, `/inventory`) o sub-página (`/admin/users`)?
   - ¿Es detalle de un listado (`/orders/[id]`)?
   - ¿Es un wizard o acción (`/orders/new`)?
   - ¿Es URL pública compartible (`/menu/[locationSlug]`, share-link por token)?

2. **Agregar el entry point apropiado:**

   | Jerarquía | Lugar para agregar el link |
   |---|---|
   | Módulo top-level | `apps/web/src/components/AppShell.tsx` — array `PRIMARY_NAV` (o `MORE_NAV` si ya hay ~8 visibles) |
   | Sub de hub | sidebar/sub-nav del hub (ej. dentro de `/admin`) |
   | Detalle desde listado | `<Link href={\`/orders/${item.id}\`}>` en la fila |
   | Acción / wizard | botón "Nuevo" en el listado |
   | Tab dentro de detalle | tab bar en el `layout.tsx` del detalle |
   | URL pública compartible | NO agregar al nav — el path se entrega al cliente vía link/QR |

   > Si la ruta es del sub-monorepo agent, el shell equivalente está en `agent/apps/web/src/components/`.

3. **Si es URL pública intencional** (token-based, share-link): agregar comentario en el `page.tsx`:
   ```ts
   // orphan-ok: URL pública compartible — el token se genera al crear el recurso
   ```

4. **Verificar manualmente** (Copiloto aún no tiene script dedicado). Sobre el frontend correspondiente:
   ```bash
   APP=apps/web/src/app    # o: agent/apps/web/src/app
   SRC=apps/web/src        # o: agent/apps/web/src

   # Rutas declaradas (normalizadas a URL, sin route groups / @slots / intercepting)
   find "$APP" -name page.tsx -type f \
     | sed "s|$APP||;s|/page.tsx||" \
     | grep -v '/@' | grep -vE '/\(\.\.?\.?\)' \
     | sed -E 's|/\([^)]+\)||g' | sed 's|^$|/|' | sort -u

   # Referencias de navegación en el código (href/to + sumar router.push/replace/prefetch, redirect(), pathname===)
   grep -rohE '([a-zA-Z]*[Hh]ref|to)[[:space:]]*[=:][[:space:]]*\{?[[:space:]]*["'"'"'`]/[^"'"'"'`[:space:]]*' "$SRC" \
     --include='*.tsx' --include='*.ts' \
     | sed -E 's/.*["'"'"'`](\/[^"'"'"'`]*)$/\1/' | sort -u
   ```
   Cada ruta del primer set debe estar cubierta por alguna referencia del segundo (rutas dinámicas `[id]`/`[...slug]` matchean por prefijo). Correr en **ambos** frontends si tocaste los dos.

5. **No declarar la tarea terminada** si quedó una huérfana que vos creaste sin link ni `orphan-ok`.

## Anti-patrones (no hacer)

- Crear un `page.tsx` y pasar a otro tema sin agregar nav (a `PRIMARY_NAV`/`MORE_NAV`, sidebar de hub, o fila de listado).
- Asumir que "como yo conozco la URL, otros también la van a conocer".
- Marcar `orphan-ok` para evitar la verificación sin justificación real.

## Limitaciones de la detección

Si la ruta se llega por:
- `window.location.href = "/..."`  (anti-patrón en Next.js — preferir `router.push`)
- Server action que hace `redirect()` desde otra ruta
- Middleware que reescribe la URL

…el grep puede no detectar el link. En esos casos, agrega `// orphan-ok: <razón>` con la explicación en el `page.tsx`.
