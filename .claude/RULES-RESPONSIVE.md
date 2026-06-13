# Copiloto — Reglas de Responsive (Mobile / Tablet)

Esta regla aplica a todo el frontend del monorepo (`apps/web`, `@copiloto/web`,
y por extensión `agent/apps/web`, `@copiloto/agent-web`). Consolida los patrones
canónicos de responsive (mobile/tablet/desktop) y los anti-patrones a cazar. Las
skills y commands que tocan vistas (`responsive`, `nav-discoverability`, etc.)
deben leer este archivo y verificar cumplimiento via typecheck + Playwright a
375/768/1280px.

El shell de navegación vive en `apps/web/src/components/AppShell.tsx` y el
encabezado + card de contenido en `apps/web/src/components/PageScaffold.tsx`.
Copiloto NO usa bloques `<style>` globales ni utilidades `pr-*`/`lms-page-x`: el
responsive se expresa con **prefijos responsive de Tailwind** (`sm:`/`md:`/`lg:`/
`xl:`/`2xl:`) sobre los **tokens del DS** (`bg-canvas`, `text-on-surface`,
`font-body-md`, `px-margin-desktop`, `gap-gutter`…) e **íconos Material Symbols
Outlined**. Los ejemplos de abajo están adaptados a esa convención.

---

## Filosofía

1. **Mobile no es un afterthought.** Diseña para 375px primero; desktop expande.
2. **No hay "responsive con padding".** Hay `min-w-0`, hay layouts que colapsan,
   hay overlays. Padding tight es secundario.
3. **`overflow-x-hidden` es band-aid, no fix.** Detecta y elimina el origen.
4. **Verifica con Playwright + viewport real.** El typecheck y el grep no
   sustituyen abrir el browser a 375px.
5. **Tailwind-first.** Prefiere prefijos responsive (`hidden xl:flex`,
   `grid-cols-1 md:grid-cols-2`) sobre `style` inline + media queries CSS. El
   `style` inline con valores fijos (`width: 320`, `padding: "32px 24px"`) es la
   causa #1 de overflow en mobile.

---

## Los 8 patrones canónicos

### Patrón 1 — Padding horizontal de página: delegar en el shell, no inline

**Problema:** una vista usa un contenedor con padding lateral fijo (inline
`style={{ padding: "32px 24px" }}`). En mobile, sumado al padding del `<main>`
del `AppShell`, queda >40px de margen muerto en cada lado.

**Solución canónica:** el padding lateral de página YA lo resuelve el `<main>`
del `AppShell` con prefijos responsive sobre tokens del DS:

```tsx
// apps/web/src/components/AppShell.tsx
<main className="main-canvas pt-[88px] pb-xl px-4 sm:px-6 lg:px-margin-desktop">
  <div className="max-w-[1280px] mx-auto flex flex-col gap-gutter">
    {children}
  </div>
</main>
```

→ `px-4` (16px) en mobile, `sm:px-6` (24px) en tablet, `lg:px-margin-desktop`
(40px) en desktop. El `max-w-[1280px] mx-auto` centra el contenido.

**Regla:** las vistas (`apps/web/src/views/*.tsx`) y pages
(`apps/web/src/app/**/page.tsx`) **NO** vuelven a aplicar padding lateral fijo;
envuelven su contenido en `PageScaffold` (que ya da el frame correcto) o usan
clases Tailwind responsive. Nada de `style={{ padding: "32px 24px" }}` en el
contenedor outer.

**Anti-patrón (cazar):**
```jsx
<section style={{ padding: "32px 24px" }}>  {/* ❌ 24px lateral fijo en mobile */}
```
**Fix:** quitar el padding lateral inline; dejar que el `<main>` del AppShell o
`PageScaffold` lo manejen, o usar `px-4 sm:px-6`.

---

### Patrón 2 — `min-w-0` en hijos de grid/flex

**Problema:** un hijo de un container `grid` o `flex` con contenido cuyo
min-content > parent-width hace que el contenedor expanda más allá del viewport.
Ejemplos: una tabla embebida, un texto con palabra muy larga, un canvas de
forecast con muchas columnas.

**Solución (Tailwind):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
  <div className="min-w-0">{/* el child puede encoger */}</div>
</div>
```

`min-w-0` le dice al child "puedes encogerte abajo de tu min-content natural" —
los textos hacen wrap o se truncan en lugar de empujar el padre. En el AppShell
el cluster del logo/nav ya usa esta técnica: `<div className="flex items-center
gap-md min-w-0">`.

**Heurística:** todo hijo flex/grid que contenga texto largo, tablas, o gráficas
lleva `min-w-0` (y `truncate` si es una sola línea).

---

### Patrón 3 — Sidebars fijos → overlay full-width en mobile

**Problema:** un sidebar con `width: 320` y `shrink-0` no puede achicar. En 375px
el main content queda con ~55px → texto roto en 1 char por línea.

**Solución (full pattern):**

1. **Default state SSR-safe:** sidebar abierto en desktop, cerrado en mobile

```tsx
const [sidebarOpen, setSidebarOpen] = useState(() => {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(min-width: 768px)").matches;
});
```

2. **Tailwind:** sidebar ancho fijo en desktop, overlay full-width en mobile.
   En copiloto se hace con prefijos responsive (no `style` inline + media query):

```tsx
<aside
  className={cn(
    // mobile: overlay fijo full-width debajo del header (64px) del AppShell
    "fixed inset-x-0 top-[64px] bottom-0 z-[60] w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]",
    // desktop: panel lateral en flujo, ancho fijo
    "lg:static lg:inset-auto lg:top-auto lg:w-80 lg:shadow-none lg:z-auto",
    !sidebarOpen && "hidden lg:block"
  )}
>
```

> Nota: el header del `AppShell` mide `h-[64px]` (`top-[64px]`), no 56px. El
> `<main>` arranca en `pt-[88px]`.

3. **Close button SIEMPRE accesible dentro del overlay** (el toggle del header
   queda detrás del overlay full-width → sin botón interno el usuario queda
   atrapado):

```tsx
<div className="flex items-stretch">
  {tabs.map((t) => (
    <button key={t}>…</button>
  ))}
  <button
    onClick={() => setSidebarOpen(false)}
    aria-label="Cerrar panel"
    className="flex lg:hidden shrink-0 w-11 items-center justify-center border-l border-outline-variant"
  >
    <span className="material-symbols-outlined">close</span>
  </button>
</div>
```

(`w-11` = 44px, touch target mínimo. `flex lg:hidden` → solo en mobile/tablet.)

4. **Bonus:** al seleccionar un item del sidebar, ciérralo automáticamente en
   mobile:

```tsx
onClick={() => {
  selectItem(id);
  if (window.matchMedia("(max-width: 1023px)").matches) setSidebarOpen(false);
}}
```

**NO uses tap-on-backdrop** cuando el sidebar es full-width — no hay backdrop
expuesto para tappear. El close button interno es obligatorio.

---

### Patrón 4 — Tablas densas → horizontal-scroll wrapper interno

**Problema:** una tabla con 5+ columnas (p. ej. en `/orders`, `/inventory`,
`/suppliers`: Pedido / Mesa / Total / Estado / Acciones) no cabe en 375px.
Forzar wrap rompe el formato tabular.

**Solución:** envolver la tabla/grid en un wrapper con `overflow-x-auto` y forzar
`min-w-*` en las filas:

```tsx
<div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
  <div className="grid min-w-[720px] grid-cols-[1fr_1fr_140px_140px_120px]">
    {/* header */}
  </div>
  {rows.map((r) => (
    <div key={r.id} className="grid min-w-[720px] grid-cols-[1fr_1fr_140px_140px_120px]">
      {/* row */}
    </div>
  ))}
</div>
```

En mobile, el usuario hace swipe horizontal dentro del wrapper para ver columnas
ocultas. Patrón estándar de admin tables (matches Stripe, Linear, Notion mobile).

**Cuándo NO usar:** si las filas son "vista de detalle" (un pedido con título +
acciones), conviene transformarlas a **tarjetas stacked** (Patrón 5) en lugar de
scroll horizontal.

---

### Patrón 5 — Row flex → tarjeta stacked en mobile

**Problema:** una fila con thumbnail + título + estadísticas + 4 botones de acción
en un `flex` horizontal no cabe en mobile; los botones se cortan o el título se
trunca a 1 char por línea (típico de un row de pedido en `/orders` o un item de
`/recipes`).

**Solución (Tailwind con `flex` que colapsa a `flex-col` en mobile):**

```tsx
<div className="flex flex-col gap-2.5 p-3.5 md:flex-row md:items-center md:gap-4 md:p-4">
  <div className="h-20 w-full md:h-12 md:w-16 shrink-0">{/* thumbnail */}</div>
  <div className="min-w-0 flex-1">{/* título */}</div>

  {/* cluster de stats: en mobile sub-row con gap; en desktop inline */}
  <div className="flex items-center gap-4 md:gap-3">
    <div>{/* mesas */}</div>
    <div>{/* total */}</div>
    <div>{/* estado */}</div>
  </div>

  {/* acciones: grid compacto en mobile, fila en desktop */}
  <div className="grid grid-cols-[1fr_36px_36px_36px] gap-1.5 md:flex md:gap-2">
    <button className="justify-center">Marcar listo</button>
    <button><span className="material-symbols-outlined">visibility</span></button>
    <button><span className="material-symbols-outlined">edit</span></button>
    <button><span className="material-symbols-outlined">delete</span></button>
  </div>
</div>
```

**Idea clave (`display: contents` opcional):** si necesitas que un wrapper
desaparezca del layout en desktop y se vuelva sub-row en mobile sin tocar el JSX
entre breakpoints, usa `className="contents md:contents max-md:flex"` (Tailwind:
`contents` + `max-md:flex`). El wrapper no existe en el layout desktop y en
mobile agrupa los stats en una sub-fila. **Cero edits a la lógica JSX entre
breakpoints.**

---

### Patrón 6 — Modales: frame tight + sticky header + overrides scoped

**Problema:** un modal con `margin: 40px auto, padding: 24, max-width: 900`
desperdicia ~80px verticales + 48px horizontales en mobile. Y el contenido interno
suele tener layouts desktop que overflow.

> Para reglas completas de diálogos/modales anidados y backdrop, ver
> [`RULES-DIALOGS.md`](./RULES-DIALOGS.md). Este patrón cubre solo el aspecto
> responsive del frame.

**Solución frame (Tailwind):**

```tsx
<div className="fixed inset-0 z-[1000] overflow-auto bg-black/50">
  <div className="mx-2 my-2 min-h-[calc(100vh-16px)] rounded-xl bg-white p-3.5
                  md:mx-auto md:my-10 md:min-h-0 md:max-w-[900px] md:rounded-2xl md:p-6">
    <div className="sticky top-0 flex items-center justify-between bg-white">
      <h2 className="font-display-md text-[16px] md:text-[20px]">Editar pedido</h2>
      <button onClick={close} aria-label="Cerrar">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
    <ChildComponent />
  </div>
</div>
```

→ mobile: `mx-2 my-2 p-3.5 min-h-[calc(100vh-16px)]`; desktop: `md:mx-auto
md:my-10 md:max-w-[900px] md:p-6`. El header es `sticky top-0`.

**Solución contenido interno** (sin tocar el componente hijo): cuando el child es
admin desktop-first o muy grande, neutraliza sus layouts desktop con clases
responsive en el propio child donde puedas, o envuélvelo. Preferentemente arregla
el child con prefijos Tailwind (`flex-wrap`, `grid-cols-1 md:grid-cols-2`,
`w-full md:w-40`) en lugar de overrides CSS por selector. Si el child es
intocable, encierra el modal en un contenedor con clases que apliquen
`[&_.flex]:flex-wrap` etc. como último recurso.

**Por qué no editar el child:** cuando el child es enorme o desktop-first por
diseño, los overrides desde el padre evitan riesgo de regresión y mantienen el
child intacto para sus otros usos.

---

### Patrón 7 — Login split 60/40 → welcome-primero + form en mobile

**Problema:** la pantalla de login (`apps/web/src/views/Login.tsx`) usa un split
de dos paneles (decorativo 60% + form 40%). En mobile NO basta con ocultar el
panel decorativo y mostrar el form: se pierde el branding y queda un form "pelón".
El patrón canónico es mostrar **primero el panel de branding** con un CTA grande,
y al tap pasar al form (con botón Volver).

**Anti-patrón concreto (cazar):** login que en `<1024px` hace
`hidden` directo sobre el panel decorativo y deja el form solo, sin el panel
welcome.

**Solución (toggle de un solo panel a la vez en `<1024px` = breakpoint `lg`):**

```tsx
// Default 'welcome' = primero branding. En desktop el state se ignora
// (ambos paneles conviven via el split 60/40).
const [mobileView, setMobileView] = useState<"welcome" | "form">("welcome");

<div
  className={cn(
    "w-full lg:w-[60%]",
    mobileView !== "welcome" && "hidden lg:block"
  )}
>
  {/* branding + cards decorativas */}
  <button
    className="flex lg:hidden"
    onClick={() => setMobileView("form")}
  >
    Acceder a Copiloto
    <span className="material-symbols-outlined">arrow_forward</span>
  </button>
</div>

<div
  className={cn(
    "w-full lg:w-[40%]",
    mobileView !== "form" && "hidden lg:block"
  )}
>
  <button
    className="inline-flex lg:hidden"
    onClick={() => setMobileView("welcome")}
  >
    <span className="material-symbols-outlined">arrow_back</span> Volver
  </button>
  {/* form */}
</div>
```

**Reglas:**
- Default `mobileView = "welcome"` — el branding va primero, no el form.
- CTA "Acceder a Copiloto" sticky abajo del panel welcome; botón "Volver"
  arriba-izquierda del panel form.
- Breakpoint **`lg` (`<1024px`)** (tablet también ve un panel a la vez).
- En desktop el state se ignora y ambos paneles conviven (split 60/40 intacto).

Implementación de referencia: `apps/web/src/views/Login.tsx`.

---

### Patrón 8 — Navbar / header de app en mobile

**Problema:** el header del `AppShell` (logo + nav horizontal + branch switcher +
buscador + campana + avatar) está pensado para desktop. En mobile el nav no cabe
y el buscador roba ancho → la campana y el avatar quedan empujados fuera de
pantalla.

**Estado actual en copiloto:** el `AppShell` YA implementa este patrón. Úsalo
como referencia canónica antes de reinventarlo:

1. **Nav desktop → hamburguesa + drawer** vía el componente `MobileMenu` interno
   del AppShell. El nav completo se oculta y aparece el botón menú:
   ```tsx
   <nav className="hidden xl:flex items-center gap-base ml-2">  {/* nav desktop */}
   <MobileMenu items={[...PRIMARY_NAV, ...MORE_NAV]} … />        {/* xl:hidden */}
   ```
   Breakpoint **`xl` (`<1280px`)** porque el nav tiene 8 items primarios + "Más".

2. **Buscador → icon-only** debajo de `2xl`:
   ```tsx
   <button className="hidden 2xl:flex …">{/* buscador con label + ⌘K */}</button>
   <button className="2xl:hidden w-10 h-10 …" aria-label="Buscar">
     <span className="material-symbols-outlined">search</span>
   </button>
   ```

3. **Branch switcher** solo en desktop: `hidden lg:block`.

4. **Logout** oculto en mobile estrecho: `hidden sm:flex` (queda en el drawer si
   se necesita; ver `RULES-NAV` si existe).

5. **Logo** siempre `shrink-0` y en una sola línea (no wrap).

Resultado: hamburguesa + logo (1 línea) + 🔍 (icon) + 🔔 + avatar — todo cabe y es
accesible. Referencia: `apps/web/src/components/AppShell.tsx`.

---

## Anti-patrones a cazar

### A.1 — `gridColumn: "span N"` inline + `lg:col-span-N` className

```jsx
<div style={{ gridColumn: "span 2" }}   {/* ❌ aplica SIEMPRE */}
     className="lg:col-span-2">          {/* solo aplica ≥1024 */}
```

En mobile el inline `span 2` fuerza al browser a crear una columna implícita en un
grid `grid-cols-1` → hermanos quedan estrechos con espacio fantasma a la derecha.

**Fix:** eliminar el inline; dejar solo `className="lg:col-span-2"` (o
`col-span-2` si quieres que aplique siempre).

### A.2 — `className="hidden lg:flex"` + `style={{ display: "flex" }}` inline

```jsx
<aside style={{ display: "flex" }}
       className="hidden lg:flex">  {/* ❌ inline gana, sidebar siempre visible */}
```

El `style` inline tiene mayor especificidad que la clase Tailwind → el `hidden`
nunca aplica.

**Fix:** quitar el `display` inline y dejar solo las clases Tailwind
(`hidden lg:flex`). En copiloto **no se mezcla `style` inline de display con
clases responsive** — todo va por clases.

### A.3 — Botones con `whitespace-nowrap` en flex row

Buttons con texto largo + `whitespace-nowrap` empujan el row más allá del
viewport. **Fix mobile:** quitar el `nowrap` para que el texto parta, o convertir
a icon-only debajo de cierto breakpoint (`<span className="hidden md:inline">`
para el label).

### A.4 — `style={{ padding: "Npx Mpx" }}` con M ≥ 24 en contenedor outer

Es la pista de oro de "view aplica padding lateral fijo en vez de delegar en el
shell/PageScaffold" (Patrón 1). Buscar:
```bash
grep -rn 'padding: "[0-9]\+px \(24\|28\|32\|36\|40\|44\|48\)px"' apps/web/src/views apps/web/src/app
```
**Fix:** quitar el padding lateral inline; usar `PageScaffold` o `px-4 sm:px-6`.

### A.5 — Header de página/módulo con muchos elementos no-esenciales

Header con brand + label + divider + progress label + progress bar + % + toggle.
En desktop OK, en mobile choca. Identifica qué es removible (labels decorativos,
dividers) y ocúltalo con `hidden md:flex` / `hidden md:inline`.

---

## Checklist antes de declarar una view "responsive"

Para CADA route/view nueva o modificada:

- [ ] Abrir Playwright/browser a **375px** y navegar a la ruta
- [ ] `document.documentElement.scrollWidth === window.innerWidth` (sin overflow horizontal)
- [ ] Ningún elemento con `right > viewport + 5` y `width > 50` (cero hijos clippeados)
- [ ] Texto legible: ningún título o párrafo con line-break a 1-2 chars
- [ ] Botones de acción visibles y tappeables (mínimo 44×44px touch target)
- [ ] Si hay sidebar/drawer fijo > 240px: implementar Patrón 3 (overlay + close button)
- [ ] Si hay tabla > 3 cols: implementar Patrón 4 (scroll wrapper) o Patrón 5 (cards stacked)
- [ ] Modales: padding/margin tight + sticky header con close (Patrón 6)
- [ ] Repetir a **768px** (iPad portrait) — mismo checklist
- [ ] Repetir a **1280px** (desktop) — verificar cero regresión
- [ ] `pnpm exec tsc --noEmit` limpio en el workspace tocado

---

## Proceso de revisión visual (cómo adaptar una vista 100% a mobile)

El typecheck NO basta: no detecta botones cortados, textos aplastados ni cards
clippeadas. Para dejar una vista **100% bien** hay que hacer un pase visual
view-por-view. Loop por cada ruta (`/dashboard`, `/orders`, `/menu`, `/inventory`,
`/invoices`, `/kpis`, `/forecast`, `/reservations`, `/guests`, `/suppliers`,
`/recipes`, `/campaigns`, `/anomalies`, `/schedule`, `/simulator`, `/admin`,
`/copilot`, `/login`):

1. **Abrir a 375px** en Playwright, login si aplica, navegar a la ruta.
2. **Screenshot + medir overflow** con un `evaluate`:
   ```js
   const vw=innerWidth, sw=document.documentElement.scrollWidth;
   const off=[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.right>vw+3&&r.width>60&&r.width<3000});
   ```
3. **Leer el screenshot** y cazar, en este orden, los problemas típicos:

   | Síntoma visual | Fix Tailwind |
   |---|---|
   | Título aplastado a 2-3 líneas | escalar font: `text-[20px] md:text-[28px]` |
   | Header (título + acciones) se corta | stackear: `flex flex-col md:flex-row` (lo hace `PageScaffold`) |
   | Grupo de botones se sale | envolver: `flex flex-wrap gap-2` |
   | CTA "Nuevo X" muy grande | icon-only: ocultar label con `<span className="hidden md:inline">` |
   | Grid de N columnas clippeado | colapsar: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` |
   | Cards de tablero (kanban) ilegibles | scroll + ancho fijo: `overflow-x-auto` + `min-w-[280px]` por columna |
   | Tabla densa cortada | scroll wrapper + `min-w-[720px]` | (Patrón 4) |
   | Chips/filtros se cortan | scroll horizontal: `flex overflow-x-auto` + `category-scroll` (oculta scrollbar) |
   | Contenido + sidebar apretados | stack: `flex flex-col lg:flex-row` |
   | Padding lateral excesivo | delegar en AppShell/PageScaffold (Patrón 1) |
   | Navbar sin campana/avatar visible | buscador icon-only (Patrón 8 — ya en AppShell) |

4. **Aplicar el fix** con prefijos responsive de Tailwind sobre tokens del DS —
   nunca `style` inline fijo que rompe en mobile.
5. **Recargar y re-screenshot** hasta que: cero overflow, botones tappeables
   (44×44), textos sin cortar, cards completas.
6. **Repetir a 768px** (tablet) y **1280px** (sin regresión).

Regla de oro: **un screenshot por vista, no asumir**. El typecheck no ve lo que el
usuario ve. Guardar evidencia en `tests/apps/web/screenshots/`.

> Existe `.pb-safe` y `.category-scroll` en `globals.css` (`@layer components`)
> para safe-area inset y scrollbar oculto de chips/categorías — reúsalas en vez
> de reinventarlas.

---

## Convención responsive de copiloto (vs. "utilidades pr-*")

Otros DS usan un catálogo de clases `pr-*`/`lms-page-x` con `!important` para
ganar al `style` inline. **Copiloto NO**: se apoya en Tailwind. El mapeo mental:

| Necesidad | En copiloto |
|---|---|
| Escalar título | `text-[20px] md:text-[28px]` |
| CTA icono+texto → icon-only | label en `<span className="hidden md:inline">` |
| Header título+acciones → columna | `PageScaffold` (ya da `flex-col sm:flex-row`) |
| Fila de botones → wrap | `flex flex-wrap gap-2` |
| Flex 2 columnas → stack | `flex flex-col lg:flex-row` |
| Grid 4/3/2 cols → colapsar | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| Tablero → ancho fijo + scroll | `overflow-x-auto` + `min-w-[280px]` |
| Chips → scroll horizontal | `flex overflow-x-auto category-scroll` |
| Buscador navbar → icon-only | ya resuelto en AppShell (`2xl:hidden`) |
| Padding lateral de página | AppShell `<main>` / `PageScaffold` |

Si una vista NO usa el `AppShell` (ej. `Login`), las clases responsive viven en
el propio JSX de la vista (ver Patrón 7).

---

## Cuándo NO toca responsive completo

Algunas vistas son **admin/operación desktop-first** por diseño. Para ellas:

- Editores con drag-and-drop, simulador (`/simulator`), dashboards densos de
  forecast/KPIs con muchas series.
- **Aplicar mínimo viable:** `overflow-x-auto` en tablas, paddings responsive
  (Patrón 1), banner "Esta vista está optimizada para desktop" si conviene.
- **NO redesignar a mobile-first.** El costo no compensa el uso.

Decidir caso por caso, documentar la decisión en el commit/PR.

---

## Implementación canónica en una vista nueva

Cuando creas una vista/page nueva bajo `apps/web/src/app/**/page.tsx` o
`apps/web/src/views/*.tsx`:

1. **Envuelve el contenido en `PageScaffold`** (da header título/descripción +
   card de contenido con padding responsive `p-6 md:p-8` y header que stackea
   `flex-col sm:flex-row`). No reimplementes el header a mano.

2. **Padding lateral lo da el `<main>` del AppShell** (`px-4 sm:px-6
   lg:px-margin-desktop`) — no añadas padding lateral fijo en la vista (Patrón 1).

3. **Grids con prefijos responsive** desde el primer commit:
   `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter`, con `min-w-0` en
   los hijos que lleven texto/tablas (Patrón 2).

4. **Íconos** vía `<span className="material-symbols-outlined">…</span>`.

5. **Tokens del DS** (`bg-canvas`, `text-on-surface`, `font-body-md`,
   `border-outline-variant`, `gap-gutter`) — no colores/medidas hardcodeadas.

6. La vista nueva debe quedar **alcanzable desde el nav** (ver skill
   `nav-discoverability`): agregar el item a `PRIMARY_NAV`/`MORE_NAV` del
   `AppShell`.

---

## Verificación

No hay (todavía) un `tools/check-responsive.sh` en copiloto. La verificación es:

```bash
pnpm exec tsc --noEmit                    # typecheck del workspace tocado
# + auditoría visual con Playwright a 375 / 768 / 1280px
```

El typecheck atrapa errores de tipos pero NO el overflow visual: la única forma
de cazar los patrones/anti-patrones de arriba es abrir el browser a los 3
viewports y medir `scrollWidth` + leer screenshots (ver "Proceso de revisión
visual"). Guardar evidencia en `tests/apps/web/screenshots/`.

Si en el futuro se crea un check estático, debe detectar los anti-patrones A.1–A.5
y la presencia de padding lateral inline en vistas.

---

## Referencias en el repo

| Archivo | Rol |
|---|---|
| `apps/web/src/components/AppShell.tsx` | Shell: header responsive, MobileMenu (Patrón 8), `<main>` con padding responsive (Patrón 1) |
| `apps/web/src/components/PageScaffold.tsx` | Header título/descripción/acciones (`flex-col sm:flex-row`) + card de contenido |
| `apps/web/src/views/Login.tsx` | Patrón 7 (split 60/40 → welcome-primero en mobile) |
| `apps/web/src/app/globals.css` | `.category-scroll`, `.pb-safe`, `.ai-badge` (`@layer components`) |
| `apps/web/tailwind.config.ts` | Tokens del DS (spacing `gutter`/`margin-desktop`, type-scale, colores M3) |
| [`RULES-DIALOGS.md`](./RULES-DIALOGS.md) | Reglas de diálogos/modales anidados + backdrop (complementa Patrón 6) |
| [`RULES-FORMS.md`](./RULES-FORMS.md) | Formularios y confirmaciones |

> Las vistas de `agent/apps/web` (`@copiloto/agent-web`) siguen las mismas reglas
> cuando existan; hoy `agent/apps/web/src/views/` está vacío.
