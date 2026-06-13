---
name: responsive
description: Aplica los 8 patrones canónicos de responsive de Copiloto (mobile/tablet/desktop) y caza los 5 anti-patrones conocidos. Auto-activar cuando se crea o modifica el shell `apps/web/src/components/AppShell.tsx` (antes `AppLayout.tsx`) o `apps/web/src/components/PageScaffold.tsx`, una vista en `apps/web/src/views/*.tsx` (o `agent/apps/web/src/views/`), una page en `apps/web/src/app/**/page.tsx` (o `agent/apps/web/`), un modal con `position: fixed`, un sidebar con ancho fijo (`w-80`/`width: NNNpx`) que no colapsa, una tabla con `<table>` o grid de 4+ columnas, o cuando el usuario reporta "no se ajusta bien en mobile", "se corta en celular", "card más chica que las demás", "no encuentro cómo cerrar", "texto roto en celular", "necesito que sea responsivo".
---

# Skill: Responsive (mobile/tablet/desktop)

Antes de tocar el código, **leer las reglas completas** en
[`.claude/RULES-RESPONSIVE.md`](../../RULES-RESPONSIVE.md). El archivo tiene los 8
patrones canónicos con ejemplos antes/después (adaptados a Tailwind + tokens del
DS), los 5 anti-patrones a cazar, y la convención responsive de copiloto.

Copiloto es **Tailwind-first**: el responsive se expresa con prefijos
(`sm:`/`md:`/`lg:`/`xl:`/`2xl:`) sobre tokens del DS (`bg-canvas`,
`text-on-surface`, `px-margin-desktop`, `gap-gutter`) e íconos Material Symbols
Outlined. NO hay bloques `<style>` globales ni utilidades `pr-*`/`lms-page-x`.
El shell vive en `apps/web/src/components/AppShell.tsx` (no `AppLayout.tsx`) y el
encabezado + card en `apps/web/src/components/PageScaffold.tsx`.

## Diagnóstico rápido (mobile @ 375px)

1. **Texto roto a 1-2 chars por línea** → sidebar fijo no colapsa (Patrón 3) o
   `min-w-0` faltante en grid/flex items (Patrón 2)
2. **Card más estrecha que sus hermanas** → buscar `gridColumn: "span N"` inline
   combinado con `lg:col-span-N` className (Anti-patrón A.1)
3. **No encuentro cómo cerrar el sidebar/modal** → el toggle quedó detrás del
   overlay (Patrón 3 — agregar botón close **dentro** del sidebar)
4. **Tabla cortada a la derecha** → wrap en `overflow-x-auto` + `min-w-[720px]` en
   filas (Patrón 4)
5. **Botones de acción se desbordan** → fila debe stackear verticalmente con
   `flex flex-col md:flex-row` (Patrón 5)
6. **Padding lateral excesivo en mobile** → quitar padding inline; delegar en el
   `<main>` del AppShell o en `PageScaffold` (Patrón 1)
7. **Campana/avatar empujados fuera del header** → buscador icon-only / nav a
   hamburguesa (Patrón 8 — ya resuelto en AppShell, úsalo de referencia)

## Checklist obligatorio antes de declarar "responsive"

- [ ] `document.scrollWidth === window.innerWidth` a 375px y 768px
- [ ] Cero elementos con `right > vw + 5` y `width > 50` (clipping detectado)
- [ ] Sidebar/drawer fijo > 240px tiene overlay + close button accesible
- [ ] Tablas 4+ cols: scroll wrapper o cards stacked
- [ ] Touch targets ≥ 44×44px (`w-11 h-11`) (Apple HIG)
- [ ] La vista nueva queda alcanzable desde el nav (`PRIMARY_NAV`/`MORE_NAV` del
      AppShell — ver skill `nav-discoverability`)
- [ ] `pnpm exec tsc --noEmit` limpio

## Cuándo NO aplicar redesign mobile completo

Vistas admin/operación desktop-first (simulador, editores con drag-and-drop,
dashboards densos de forecast/KPIs): aplicar mínimo viable (paddings responsive +
`overflow-x-auto` en tablas), NO redesignar a mobile-first. Documentar la decisión
en el commit.

## Verificación

No hay `tools/check-responsive.sh` en copiloto. La verificación es:

```bash
pnpm exec tsc --noEmit          # typecheck del workspace tocado
```

Más auditoría visual con Playwright a 3 viewports (375/768/1280) — el typecheck
NO sustituye el browser. Guardar evidencia en `tests/apps/web/screenshots/`.

## Cuándo NO aplicar este skill

- Cambios solo en lógica de negocio (handlers, queries, validaciones) que no
  tocan layout.
- Componentes ya cubiertos por skills más específicas (`forms`, `dialogs`).
- Vistas que ya pasaron un visual audit reciente (< 1 semana) a 375/768/1280px.
