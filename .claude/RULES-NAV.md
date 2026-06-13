# Copiloto — Reglas de Navegación (Header)

Estas reglas definen la estructura EXACTA del header de navegación para TODOS los módulos del producto.
El header debe ser idéntico en estructura, tamaños y proporciones — solo cambian colores, links y textos.

> Copiloto es un mono-repo. El header vive en un único shell compartido: `apps/web/src/components/AppShell.tsx` (y su análogo en el sub-monorepo `agent/apps/web/src/components/`). Los "módulos" (dashboard, orders, menu, inventory, …) NO son apps separadas: son rutas bajo `apps/web/src/app/<modulo>/`. El sistema de íconos es **Material Symbols Outlined** (string en el campo `icon`), NO Lucide. El estilado es **Tailwind con tokens custom**; los bloques de estilos inline de este documento son la especificación canónica de medidas/proporciones — al implementar, exprésalos con clases Tailwind equivalentes.

---

## ESTRUCTURA

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [🔶28] Copiloto   Link  Link  Link  Más▾        🔍Buscar(⌘K) 🔔 [👤38] ⎋  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## HEADER CONTAINER

```tsx
<header style={{
  position: "fixed",
  top: 0, left: 0, right: 0,
  zIndex: 50,
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingLeft: 32,
  paddingRight: 32,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  borderBottom: `1px solid {outlineVariant}`,
  boxShadow: "0 4px 24px rgba({primary-rgb},0.06)",
}}>
```

- `position: fixed` (NO sticky)
- `height: 64`
- Glass blur: `rgba(255,255,255,0.85)` + `blur(24px)`
- Shadow sutil con tinte del primary
- Padding: `0 32px`

En copiloto esto se expresa con clases Tailwind: `fixed top-0 left-0 right-0 h-[64px] z-50 glass-nav px-4 lg:px-margin-desktop flex items-center justify-between`. La utilidad `glass-nav` encapsula el glass blur + border + shadow.

### Main content compensación:
```tsx
<main style={{ paddingTop: 64, minHeight: "100vh" }}>
  <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px" }}>
    {children}
  </div>
</main>
```

Equivalente Tailwind en AppShell: `main` con `pt-[88px] pb-xl px-4 sm:px-6 lg:px-margin-desktop` y wrapper interno `max-w-[1280px] mx-auto`.

---

## CONTENT WRAPPER (Layout de página)

El AppShell provee un wrapper interno con ancho consistente. Las páginas **NO deben duplicar** maxWidth ni padding — el shell lo maneja.

### Tipos de layout por pantalla

| Tipo | maxWidth | padding | Cuándo aplica |
|------|----------|---------|---------------|
| **Estándar** | `1280px` | `32px 40px` | Dashboards, listados, detalles, reportes, settings, perfiles |
| **Full-width** | `100%` (sin maxWidth) | `32px 40px` | Pantallas con **2+ paneles side-by-side**: Kanban (columnas), board de pedidos (lista + detalle), Inbox/Chat (lista + conversación), Schedule (timeline + lista) |
| **Narrow** | `896px` | `32px 40px` | Wizards paso a paso, formularios centrados, planners IA |

### Regla para determinar el tipo

```
¿La pantalla tiene 2+ paneles lado a lado que se dividen el espacio horizontal?
  → SÍ: Full-width (sin maxWidth, el contenido ocupa todo el viewport)
  → NO:
    ¿Es un formulario centrado, wizard, o planner?
      → SÍ: Narrow (maxWidth 896)
      → NO: Estándar (maxWidth 1280)
```

### Implementación

**Estándar** (viene del AppShell — no tocar en la página):
```tsx
// AppShell.tsx — wrapper interno
<div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px" }}>
  {children}
</div>
```

**Full-width** (la página sobreescribe el wrapper):
```tsx
// En la página que necesita 100%
<div style={{ margin: "-32px -40px", padding: "32px 40px" }}>
  {/* El margin negativo cancela el padding del wrapper */}
  {/* O mejor: el AppShell detecta una prop/clase para no aplicar maxWidth */}
</div>
```

**Narrow** (la página agrega su propio maxWidth interno):
```tsx
<div style={{ maxWidth: 896, margin: "0 auto" }}>
  {/* Wizard o form centrado */}
</div>
```

### Regla para Design Prompts (Stitch, v0, Lovable)

Cada prompt de diseño DEBE indicar el tipo de layout en su sección de layout:

```
Layout: ESTÁNDAR (contenido centrado, max-width 1280px, padding 32px 40px)
```
```
Layout: FULL-WIDTH (2 paneles side-by-side, sin restricción de ancho)
```
```
Layout: NARROW (formulario centrado, max-width 896px)
```

Esto asegura que los diseños generados externamente respeten el mismo sistema de anchos.

### Ejemplos por módulo

| Módulo | Estándar | Full-width | Narrow |
|--------|----------|------------|--------|
| **Dashboard** | KPIs, listados, reportes | — | — |
| **Orders** | Listado de pedidos, detalle | Board de pedidos (lista + detalle/tickets) | Nuevo pedido |
| **Inventory** | Insumos, stock, movimientos | — | Alta de insumo |
| **Copilot** | — | Chat IA (historial + conversación) | — |
| **Schedule** | Turnos, empleados | Timeline + lista de turnos | — |
| **Invoices** | Facturas, detalle | Conciliación | Nueva factura |

---

## LOGO

```tsx
<Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginRight: 32 }}>
  <div style={{
    width: 28, height: 28, borderRadius: 8,
    background: `linear-gradient(135deg, {primary}, {primaryContainer})`,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#fff", fontVariationSettings: "'FILL' 1" }}>cooking</span>
  </div>
  <span style={{
    fontWeight: 700, fontSize: 15, color: "{primary}",
    letterSpacing: "-0.01em", fontFamily: "'Inter', sans-serif",
  }}>
    Copiloto
  </span>
</Link>
```

| Propiedad | Valor |
|-----------|-------|
| Icono | 28×28, borderRadius 8, gradient primary→primaryContainer |
| Icono inner | Material Symbols Outlined (`cooking`), size 14, color white, `FILL 1` |
| Texto | 15px, weight 700, Inter, -0.01em tracking, color `{primary}` |
| Texto contenido | **Siempre "Copiloto"** (sin sufijo de módulo — es un solo producto) |
| Gap icono-texto | 8px |
| Margin right | 32px (separación con nav links) |
| Destino | `/dashboard` (NO `/`) |

---

## NAV LINKS

Los links del nav se declaran en `AppShell.tsx` como dos arrays de `NavItem` (`{ href, label, icon }`, donde `icon` es el nombre de un Material Symbol):

```tsx
type NavItem = { href: string; label: string; icon: string };

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Tablero",   icon: "dashboard" },
  { href: "/orders",    label: "Pedidos",   icon: "room_service" },
  { href: "/copilot",   label: "Co-piloto", icon: "auto_awesome" },
  // … hasta ~8 items visibles
];

const MORE_NAV: NavItem[] = [
  { href: "/anomalies", label: "Anomalías", icon: "warning" },
  { href: "/admin",     label: "Admin",     icon: "settings" },
  // … el resto, dentro del dropdown "Más"
];
```

Render de cada link:

```tsx
<nav style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
  {PRIMARY_NAV.map(item => {
    const active = isActive(item.href);
    return (
      <Link key={item.href} href={item.href} style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 14px",
        borderRadius: 9999,          // ← pill completo
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? "{primary}" : "{onSurfaceVariant}",
        background: active ? "rgba({primary-rgb},0.08)" : "transparent",  // ← tono suave
        textDecoration: "none",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{item.icon}</span>
        {item.label}
      </Link>
    );
  })}
</nav>
```

En la implementación real (Tailwind) el estado activo usa la clase `tab-active` y el inactivo `text-on-surface-variant hover:bg-surface-container-low`.

| Propiedad | Valor |
|-----------|-------|
| Font size | 13px |
| Font weight | 400 normal, 600 active |
| Border radius | **9999** (pill completo) |
| Active bg | `rgba({primary},0.08)` (clase `tab-active`) |
| Active color | `{primary}` |
| Inactive color | `text-on-surface-variant` |
| Hover | `bg-surface-container-low` |
| Padding | 6px 14px (`px-2.5 py-1.5`) |
| Gap entre links | 4px |
| Texto | sentence case (NO uppercase, NO textTransform) |
| Iconos | **Material Symbols Outlined**, size 15, mismo color que texto |
| Primer link | **Siempre "Tablero"** con icono `dashboard`, href `/dashboard` |
| Max links desktop | **12** (estricto). Más → reagrupar en el dropdown "Más" (`MORE_NAV`) o mover al avatar dropdown. Preferido ≤10 para holgura visual en 1280px. |

### Detección de active-state

`AppShell` calcula el activo con:

```tsx
const pathname = usePathname();
const isActive = (href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
```

### Items prohibidos en main nav (van al avatar dropdown)

Estos items NO deben aparecer en `PRIMARY_NAV` ni `MORE_NAV` — el usuario los accede via el dropdown del avatar:

- `/profile` (Mi perfil)
- `/settings` o `/config` (Configuración global del producto)
- Cerrar sesión (no es un href; vive como item/acción en el dropdown)

Si un módulo necesita "settings" granulares (ej. settings dentro de `/admin`), esos sí pueden estar en el nav, pero el `/settings` raíz del producto vive en el avatar.

### Dropdown "Más" (`MoreMenu`)

Cuando hay más de ~8 módulos, los excedentes van a `MORE_NAV`, renderizados en un dropdown "Más" (`more_horiz` + "Más" + `expand_more`). El dropdown se cierra con click-outside (listener `mousedown` sobre un `ref`). Sus items cuentan como navegables igual que los del nav principal.

---

## BUSCADOR

```tsx
<button
  onClick={() => {/* abrir command palette o search modal */}}
  style={{
    display: "flex", alignItems: "center", gap: 8,
    padding: "6px 14px",
    borderRadius: 9999,
    background: "{surfaceLow}",
    border: `1px solid {outlineVariant}`,
    cursor: "pointer",
    fontSize: 13,
    color: "{outline}",
    transition: "all 0.2s",
    minWidth: 180,
  }}
>
  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
  <span style={{ flex: 1, textAlign: "left" }}>Buscar…</span>
  <kbd style={{
    fontSize: 10, fontWeight: 600,
    padding: "2px 6px", borderRadius: 4,
    background: "{surfaceContainer}",
    color: "{onSurfaceVariant}",
    border: `1px solid {outlineVariant}`,
  }}>
    ⌘K
  </kbd>
</button>
```

| Propiedad | Valor |
|-----------|-------|
| Tipo | **Button** (no input) — abre modal/palette |
| Border radius | 9999 (pill) |
| Background | `bg-canvas` |
| Border | `1px solid {outlineVariant}` |
| Min width | 180px |
| Hint | `⌘K` en kbd badge (`fontSize: 10`, font-mono) |
| Icono | Material Symbols `search`, size 18 |
| Font size | **13px** (igual que nav links) |
| Text color | muted (`text-on-surface-variant`) |
| Hover | `border-primary` |
| Mobile / tablet | A ancho reducido, colapsa a solo el ícono (sin texto ni `⌘K`); el botón abre el SearchPanel full-screen |

---

## COMMAND PALETTE (SearchPanel)

El botón ⌘K abre un Command Palette modal. El producto DEBE tener un `SearchPanel` funcional.

### Estructura visual

```
┌──────────────────────────────────────────────┐  ← backdrop fixed, rgba(0,0,0,0.3), blur(4px)
│                                              │
│   ┌──────────────────────────────────────┐   │  ← panel white, borderRadius 16, maxWidth 560
│   │ 🔍  Buscar…                      ESC │   │     marginTop 80, centered
│   ├──────────────────────────────────────┤   │
│   │ GRUPO 1                              │   │  ← header #6d797f uppercase 10px 700
│   │  📁 Resultado 1          BADGE       │   │  ← item #191c1e 13px, hover #f8f9fa
│   │  📁 Resultado 2          BADGE       │   │
│   ├──────────────────────────────────────┤   │
│   │ GRUPO 2                              │   │
│   │  👤 Resultado 3                      │   │
│   └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

### Dimensiones exactas

| Elemento | Estilo |
|----------|--------|
| **Backdrop** | `position: fixed, inset: 0, zIndex: 200, background: rgba(0,0,0,0.3), backdropFilter: blur(4px)` |
| **Panel** | `maxWidth: 560, marginTop: 80, background: #ffffff, border: 1px solid {outlineVariant}, borderRadius: 16, boxShadow: 0 16px 48px rgba(0,0,0,0.15), overflow: hidden` |
| **Input row** | `padding: 12px 16px, borderBottom: 1px solid {outlineVariant}, display: flex, alignItems: center, gap: 12` |
| **Input** | `fontSize: 14, color: {onSurface}, background: transparent, border: none, outline: none, flex: 1` |
| **Input placeholder** | muted |
| **ESC badge** | `fontSize: 10, padding: 2px 8px, borderRadius: 4` |
| **Results container** | `maxHeight: 320, overflowY: auto` |
| **Group header** | `fontSize: 10, fontWeight: 700, textTransform: uppercase, letterSpacing: 0.1em, padding: 8px 16px` |
| **Result item** | `fontSize: 13, padding: 10px 16px, cursor: pointer, display: flex, alignItems: center, gap: 12` |
| **Item hover** | `onMouseEnter → background: {surfaceContainerLow}`, `onMouseLeave → transparent` |
| **Item subtitle** | `fontSize: 11, muted` |
| **Status badge** | `fontSize: 10, fontWeight: 600, padding: 2px 8px, borderRadius: 9999` |
| **Empty state** | `fontSize: 13, muted, textAlign: center, padding: 32px` |
| **Min query** | Mínimo 2 caracteres, mensaje: "Escribe al menos 2 caracteres" |

### Funcionalidad obligatoria

```tsx
function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dq, setDq] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  // Autofocus
  useEffect(() => { ref.current?.focus(); }, []);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDq(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Queries por grupo (varían por módulo)
  const { data } = useQuery({
    queryKey: ["/api/{recurso}", { search: dq }],
    queryFn: () => apiGet(`/api/{recurso}?search=${encodeURIComponent(dq)}&limit=5`),
    enabled: dq.length >= 2,
  });

  const go = (href: string) => { router.push(href); onClose(); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }} onClick={onClose}>
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }} />
      {/* Panel */}
      <div style={{ position: "relative", maxWidth: 560, margin: "80px auto 0", ... }} onClick={e => e.stopPropagation()}>
        {/* Input + Results */}
      </div>
    </div>
  );
}
```

### Keyboard shortcuts (en el AppShell)

```tsx
// En AppShell.tsx, agregar useEffect:
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setShowSearch(v => !v);
    }
    if (e.key === "Escape") setShowSearch(false);
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

### Endpoints de búsqueda por módulo

| Módulo | Endpoint 1 | Grupo 1 | Endpoint 2 | Grupo 2 |
|--------|-----------|---------|-----------|---------|
| **Orders** | `GET /api/orders?search=&limit=5` | Pedidos (folio + mesa + estado) | `GET /api/menu/items?search=` | Platillos (nombre) |
| **Inventory** | `GET /api/inventory?search=` | Insumos (nombre + categoría) | `GET /api/suppliers?search=` | Proveedores (nombre) |
| **Invoices** | `GET /api/invoices?search=&limit=5` | Facturas (folio + total) | — | — |
| **Guests** | `GET /api/guests?search=` | Huéspedes (nombre + email) | — | — |

> Los endpoints viven en `apps/api/server/routes/` (y `agent/apps/api/server/routes/`). Para módulos nuevos: agregar el endpoint que soporte `?search=` y mapearlo a grupos en el SearchPanel.

---

## NOTIFICACIONES

```tsx
<div style={{ position: "relative" }}>
  <button
    onClick={() => setShowNotifs(!showNotifs)}
    style={{
      position: "relative",
      padding: 8,
      borderRadius: 9999,
      background: showNotifs ? "rgba({primary-rgb},0.08)" : "transparent",
      border: "none",
      cursor: "pointer",
      color: showNotifs ? "{primary}" : "{outline}",
      transition: "all 0.2s",
    }}
  >
    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
    {hasNotifs && (
      <span style={{
        position: "absolute", top: 6, right: 6,
        width: 8, height: 8, borderRadius: 9999,
        backgroundColor: "{error}",                 {/* ← rojo */}
      }} />
    )}
  </button>

  {/* Dropdown */}
  {showNotifs && (
    <div style={{
      position: "absolute", top: 44, right: 0,
      width: 320, maxHeight: 400, overflow: "auto",
      background: "{surface}",
      border: `1px solid {outlineVariant}`,
      borderRadius: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      zIndex: 100, padding: 12,
    }}>
      {/* Header */}
      <div style={{
        fontSize: 12, fontWeight: 700, color: "{onSurface}",
        marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em",
      }}>
        Notificaciones ({count})
      </div>
      {/* Items */}
      {items.map(item => (
        <div style={{
          padding: "8px 10px", borderRadius: 8, cursor: "pointer",
          marginBottom: 4, fontSize: 13, background: "{bg}",
        }}>
          ...
        </div>
      ))}
    </div>
  )}
</div>
```

| Propiedad | Valor |
|-----------|-------|
| Icono | Material Symbols `notifications`, **20×20** |
| Button | `w-10 h-10`, **borderRadius 9999** (circular, NO cuadrado) |
| Active bg | `rgba({primary},0.08)` |
| Badge dot | 8×8, rojo `{error}` |
| Dropdown | 320px wide, borderRadius 12, boxShadow |
| Dropdown items | Card con bg `{bg}`, borderRadius 8, fontSize 13 |

### Cierre del dropdown (obligatorio)

Todo dropdown del header (notificaciones, "Más", branch switcher, search overlay, cualquier panel flotante) debe cerrarse con los **3 disparadores estándar**:

1. **Click-outside** — click en cualquier punto fuera del wrapper del dropdown.
2. **`Escape`** — tecla Esc.
3. **Click en un item del dropdown** — antes de ejecutar la acción (navegar, marcar como leído, etc.), el panel cierra.

Implementación canónica en copiloto: listener `mousedown` sobre un `ref` del wrapper, exactamente como ya lo hacen `MoreMenu`, `BranchSwitcher` y `MobileMenu` en `AppShell.tsx`:

```tsx
const notifsRef = useRef<HTMLDivElement | null>(null);
const [showNotifs, setShowNotifs] = useState(false);

useEffect(() => {
  function handler(e: MouseEvent) {
    if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
      setShowNotifs(false);
    }
  }
  if (showNotifs) document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, [showNotifs]);

return (
  <div ref={notifsRef} style={{ position: "relative" }}>
    <button onClick={() => setShowNotifs(v => !v)}>
      <span className="material-symbols-outlined text-[20px]">notifications</span>
    </button>
    {showNotifs && (
      <div style={{ position: "absolute", top: 44, right: 0, /* ... */ }}>
        {/* items — cada item llama setShowNotifs(false) antes de navegar */}
      </div>
    )}
  </div>
);
```

> Si más adelante se extrae un hook compartido (p. ej. `useDismissable` en `@copiloto/ui`), centralizar ahí la convención. Hoy `@copiloto/ui` solo exporta `cn`; el patrón vive inline en `AppShell.tsx`.

Anti-pattern (NO hacer): que el dropdown solo cierre con click en el botón trigger, ni que dependa de `blur` (el blur falla cuando el panel tiene scroll o focus interno).

---

## AVATAR (DROPDOWN TRIGGER)

El avatar debe ser un **botón** que abre un dropdown menu. **NO** un `<Link href="/profile">` directo. El acceso a `/profile` sigue siendo desde aquí, pero a través del menú.

> Estado actual en `AppShell.tsx`: el avatar es un `<div>` con las iniciales del usuario (`user.name`) y un botón de logout suelto al lado. La convención objetivo (abajo) es convertirlo en botón con dropdown y mover el logout adentro. No existe un componente `AvatarMenu` compartido en `@copiloto/ui` todavía — implementar el dropdown inline en AppShell con el mismo patrón de click-outside que `MoreMenu`.

### Avatar (botón)

| Propiedad | Valor |
|-----------|-------|
| Size | **38×38** (`w-[38px] h-[38px]`) |
| Border / ring | `ring-2 ring-white shadow-sm` |
| Background | `bg-primary-fixed` |
| Fallback | Iniciales del usuario (`user.name` → 1-2 letras) |
| Font fallback | 14px, 700, color `{primary}` |
| Imagen | `user.avatarUrl` si existe |
| Tipo | `<button>` (NO `<Link>`) |
| ARIA | `aria-haspopup="menu"`, `aria-expanded={open}` |

### Dropdown panel

| Propiedad | Valor |
|-----------|-------|
| Position | `absolute`, top 48px, right 0 (desktop); top 56px, right 8px (mobile) |
| Width | 240px (desktop) / `min(280px, 90vw)` (mobile) |
| Background | white |
| Border | `1px solid {outlineVariant}` |
| Border radius | 14px |
| Box shadow | `0 12px 40px -12px rgba(15,23,42,0.18)` |
| z-index | 100 |

### Contenido del dropdown (orden fijo)

1. **Header** (border-bottom, padding `14px 16px`):
   - `user.name` → 13px, 700
   - `user.email` → 11px, 400, muted, margin-top 2px
2. **Mi perfil** → `<Link href="/profile">` con icon `person` (14px). 13px.
3. **Configuración** (opcional) → `<Link href="/settings">` con icon `settings` (14px). Mismo estilo que "Mi perfil".
4. **Cerrar sesión** → `<button onClick={logout}>` con icon `logout` (14px). 13px, color `{error}` (rojo).

### Cierre del dropdown

- Click-outside → cierra.
- `Escape` → cierra.
- Click en cualquier item → cierra (luego ejecuta la acción).

### LOGOUT

El logout debe vivir **solo** dentro del dropdown del avatar. **NO** debe existir un botón logout suelto en el header (el botón `logout` actual al lado del avatar es transitorio y se elimina al implementar el dropdown).

---

## ORDEN DE ELEMENTOS RIGHT SIDE

```
Buscador(⌘K) → IA (si aplica) → Notificaciones(🔔) → Avatar(👤 con dropdown)
```

Gap entre elementos: **8px** (`gap-3` en AppShell ≈ 12px; mantener consistente).

El logout no es un elemento independiente del orden (vive dentro del avatar dropdown).

> Nota: copiloto tiene además un **botón flotante de IA** ("Solicitar IA Insight") fijo en `bottom-8 right-8`. No es parte del header right-side — es un FAB separado.

---

## RESPONSIVE — MOBILE / TABLET

El nav principal se oculta hasta el breakpoint `xl`. Por debajo, todos los links (`PRIMARY_NAV` + `MORE_NAV`) se colapsan en un botón hamburguesa.

### Main nav links → hamburguesa

Bajo `xl`, el botón hamburguesa (`menu` icon, en un `w-10 h-10` circular) vive como **primer elemento del left-side**, a la izquierda del logo.

Click → abre `MobileMenu`: dropdown con todos los nav links (la lista combinada `[...PRIMARY_NAV, ...MORE_NAV]`). Implementado inline en `AppShell.tsx`:

```tsx
<MobileMenu
  items={[...PRIMARY_NAV, ...MORE_NAV]}
  isActive={isActive}
  badges={navBadges}
/>
```

### Drawer / dropdown spec

`MobileMenu` actual es un dropdown anclado (no un drawer full-height). Spec:

| Propiedad | Valor |
|-----------|-------|
| Position | `absolute`, `left-0 top-full mt-2` |
| Width | `w-64` (`min(280px, 85vw)` si se migra a drawer) |
| Background | white |
| Border | `1px solid {outlineVariant}`, `rounded-xl` |
| Box shadow | `shadow-lg` |
| Max height | `max-h-[80vh] overflow-y-auto` |
| z-index | 50 |

### Cierre del menú mobile

- Click en el backdrop / fuera del wrapper → cierra (listener `mousedown` sobre el `ref`).
- Click en un nav link → cierra (luego navega).
- (Recomendado) `Escape` → cierra.

### Right-side en mobile / tablet

- **Buscador** → bajo `2xl` colapsa a solo icono (sin texto ni `⌘K`). Click abre el SearchPanel.
- **Notificaciones** → se mantiene como ícono.
- **Avatar** → se mantiene. El botón logout suelto se oculta bajo `sm` (`hidden sm:flex`).

### Visibilidad

La hamburguesa **solo** se ve bajo `xl` (`xl:hidden`). El nav principal **solo** se ve en `xl+` (`hidden xl:flex`). No hay duplicación visible.

### Badges en el nav

El AppShell muestra un `NavBadge` (pastilla de conteo) en el link de Pedidos (`/orders`) con la cantidad de pedidos en estado `PLACED`. En el `MobileMenu`, los badges se reagrupan en un dot agregado sobre el botón hamburguesa. Los badges NO afectan la discoverability (el link sigue contando como navegable).

---

## FOOTER (opcional)

```tsx
<footer style={{
  padding: "20px 32px",
  borderTop: `1px solid {outlineVariant}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}}>
  <span style={{ fontSize: 12, color: "{onSurfaceVariant}" }}>
    Copiloto · © 2026
  </span>
  <div style={{ display: "flex", gap: 16 }}>
    <a style={{ fontSize: 11, color: "{outline}", textDecoration: "none" }}>Soporte</a>
    <a style={{ fontSize: 11, color: "{outline}", textDecoration: "none" }}>Privacidad</a>
    <a style={{ fontSize: 11, color: "{outline}", textDecoration: "none" }}>Términos</a>
  </div>
</footer>
```

---

## LO QUE CAMBIA POR MÓDULO

| Elemento | Qué ajustar |
|----------|-------------|
| Nav links | Agregar `{ href, label, icon }` a `PRIMARY_NAV` o `MORE_NAV` en `AppShell.tsx` |
| Buscador placeholder | `"Buscar…"` (genérico) |
| Notif data source | queryKey y endpoint específico |
| Search endpoints | endpoint `?search=` del módulo en `SearchPanel` |

El logo, branding ("Copiloto"), paleta y avatar son **globales** — no cambian por módulo.

---

## TIPOGRAFÍA

| Uso | Fuente | Ejemplo |
|-----|--------|---------|
| **Body / root container** | `'Inter', sans-serif` | Nav links, labels, párrafos, inputs |
| **Logo text** | `'Inter', sans-serif` | "Copiloto" |
| **Avatar inicial** | `'Inter', sans-serif` | "MB", "A" dentro del avatar circle |
| **Badges / números** | `'Inter', sans-serif` | contadores de pedidos, KPIs |
| **Notification header** | Inter (hereda del body) | "Notificaciones (3)" |
| **Footer** | Inter (hereda del body) | "© 2026 Copiloto" |

**Root container SIEMPRE:**
```tsx
<div style={{ fontFamily: "'Inter', sans-serif", color: "{onSurface}" }}>
```

**Inter destacado SOLO para:**
- Logo text (15px, 700)
- Avatar inicial (14px, 700)
- Badges/counters con números destacados

---

## ÍCONOS

Copiloto usa **Material Symbols Outlined** (no Lucide). Cada ícono se referencia por su nombre en string:

```tsx
<span className="material-symbols-outlined text-[15px]">dashboard</span>
```

- En los arrays `NavItem`, el campo `icon` es el nombre del símbolo (`"dashboard"`, `"room_service"`, `"auto_awesome"`, …).
- Para íconos rellenos usar `style={{ fontVariationSettings: "'FILL' 1" }}` (p. ej. el logo y el FAB de IA).
- La hoja de Material Symbols se carga globalmente (`globals.css` / `layout.tsx`).

---

## ANTI-PATTERNS (no hacer)

- ❌ Sidebar lateral como navegación principal
- ❌ Hamburger menu en desktop (`xl+`)
- ❌ Links en UPPERCASE o textTransform uppercase (usar **sentence case**: "Tablero", "Pedidos", "Reportes")
- ❌ Labels en ALLCAPS en los arrays `NAV_ITEMS` (escribir "Pedidos" no "PEDIDOS")
- ❌ Más de 8 links visibles sin reagrupar en el dropdown "Más"
- ❌ Header sticky (usar **fixed**)
- ❌ **Lucide** u otra librería de íconos (usar **Material Symbols Outlined**)
- ❌ Distinta altura de header (siempre **64px**)
- ❌ Input de búsqueda (usar **button** que abre modal)
- ❌ Avatar pequeño (usar **38×38**)
- ❌ Botón logout suelto en el header (vive en el dropdown del avatar)
- ❌ Sufijo de módulo en el logo (siempre solo "Copiloto")

---

## DISCOVERABILITY — toda ruta debe ser alcanzable

Toda ruta `apps/web/src/app/**/page.tsx` (y `agent/apps/web/src/app/**/page.tsx`) debe estar referenciada **al menos una vez** en el código vía:

- `href="/..."`, `href: "/..."`, `href={\`/...\`}` (atributo JSX o property de objeto — incluye los items de `PRIMARY_NAV`/`MORE_NAV`)
- `<Link href="/...">`
- `router.push("/...")`, `router.replace`, `router.prefetch`
- `redirect("/...")` (server actions)
- `pathname === "/..."` o `pathname.startsWith("/...")` (chequeo de active-state implica que la ruta es navegable)

**No cuenta como navegable:**
- Escribir la URL manualmente en la barra del navegador.
- Hardcodear el path en un comentario / docstring.

### Patrones recomendados según jerarquía

- **Módulo top-level** (`/dashboard`, `/orders`, `/inventory`) → entry en `PRIMARY_NAV` o `MORE_NAV` de `apps/web/src/components/AppShell.tsx`.
- **Sub-página de un hub** (`/admin/users`, `/admin/settings`) → entry en la sidebar/sub-nav del hub.
- **Vista de detalle desde un listado** (`/orders/[id]`, `/invoices/[id]`) → `<Link href={\`/orders/${o.id}\`}>` en la fila del listado.
- **Acción/wizard** (`/orders/new`) → botón "Nuevo" visible en el listado correspondiente.
- **Tabs dentro de un detalle** (`/orders/[id]/{tickets,timeline,...}`) → tab bar en el `layout.tsx` del detalle.
- **URL pública compartible** (`/menu/[locationSlug]`, share-link por token) → el path se genera y se comparte por link/QR, no aparece en el nav admin. **Documentarlo en el `page.tsx`** con `// orphan-ok: URL pública compartible — se genera al crear el recurso`.

### Verificación

Copiloto aún no tiene un script dedicado. Detección manual con shell sobre cada frontend (`apps/web` y `agent/apps/web`):

```bash
# 1) Rutas declaradas en el filesystem (App Router), normalizadas a URL.
#    Excluye route groups (grupo), parallel @slots e intercepting routes.
APP=apps/web/src/app   # o: agent/apps/web/src/app
find "$APP" -name page.tsx -type f \
  | sed "s|$APP||;s|/page.tsx||" \
  | grep -v '/@' \
  | grep -vE '/\(\.\.?\.?\)' \
  | sed -E 's|/\([^)]+\)||g' \
  | sed 's|^$|/|' | sort -u

# 2) Referencias de navegación en el código del mismo frontend.
SRC=apps/web/src       # o: agent/apps/web/src
grep -rohE '([a-zA-Z]*[Hh]ref|to)[[:space:]]*[=:][[:space:]]*\{?[[:space:]]*["'"'"'`]/[^"'"'"'`[:space:]]*' "$SRC" \
  --include='*.tsx' --include='*.ts' \
  | sed -E 's/.*["'"'"'`](\/[^"'"'"'`]*)$/\1/' | sort -u
# (sumar también router.push/replace/prefetch, redirect(), pathname === "/...")
```

Comparar el set (1) contra (2): cada ruta de (1) debe estar cubierta por alguna referencia de (2). Las dinámicas (`[id]` → `[^/]+`, `[...slug]` → `.*`) matchean por prefijo. Recordar correr la verificación en **ambos** frontends (`apps/web` y `agent/apps/web`).

Una huérfana detectada **bloquea la auditoría** hasta que se agregue el link (típicamente a `PRIMARY_NAV`/`MORE_NAV` en `AppShell.tsx`, a una sidebar de hub, o a la fila de un listado) o se marque con `// orphan-ok: <razón>` en el `page.tsx`.

---

*Estándar unificado para el header de Copiloto (mono-repo: `apps/web` + `agent/apps/web`).*
*Discoverability check obligatorio en auditorías.*
