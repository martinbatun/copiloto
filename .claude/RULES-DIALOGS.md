# Copiloto — Reglas de Diálogos / Modales Anidados

Complementa a [`RULES-FORMS.md`](RULES-FORMS.md).

---

## El problema (containing block + position: fixed)

Cuando un modal "secundario" se abre **dentro** de otro modal "padre" y el padre usa `backdrop-filter`, `filter`, `transform`, `perspective`, `contain` o `will-change` distinto de `none`, el modal secundario se rompe visualmente:

- Aparece **descentrado** (anclado al modal padre con scroll, no al viewport)
- El backdrop **no cubre toda la pantalla** (solo cubre el modal padre)
- Subir el `z-index` **NO arregla el problema** — es un problema de containing block, no de orden visual

### Causa técnica

[CSS spec — containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block):

> If the position property is `fixed`, the containing block is established by the nearest ancestor with `transform`, `perspective`, `filter`, `backdrop-filter`, `contain`, or `will-change` set to a value other than `none`. If no such ancestor exists, the containing block is the viewport.

Es decir, **`backdrop-filter: blur(4px)` en el padre captura todos los `position: fixed` de los descendientes**, anclándolos al padre en vez del viewport.

### Cómo reproducirlo

1. Modal padre con `backdrop-filter: blur(4px)` y `overflow: auto`
2. Dentro del padre, un editor largo que requiere scroll
3. Click en un botón que abre un modal secundario con `position: fixed; inset: 0`
4. El secundario aparece arriba a la izquierda (top del padre scrolleado), no centrado en pantalla

---

## La solución obligatoria: `createPortal`

**Renderizar todo modal/dialog/popover con `position: fixed` vía `React.createPortal` directo a `document.body`.**

`document.body` no tiene ningún ancestor con propiedades que creen containing blocks, así que `position: fixed` se ancla al viewport como debe.

### Patrón correcto

```tsx
"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function MyComponent() {
  const [open, setOpen] = useState(false);

  // mounted: necesario para evitar acceder a document en SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>

      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-background rounded-lg shadow-xl max-w-md w-full p-5"
            onClick={e => e.stopPropagation()}
          >
            {/* contenido del dialog */}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
```

### Patrón anti-patrón (NO HACER)

```tsx
// ❌ MAL — renderiza en el árbol del componente
{open && (
  <div className="fixed inset-0 z-50 ...">
    {/* dialog */}
  </div>
)}
```

Aunque parezca funcionar en la página principal, **se rompe cuando el componente se renderiza dentro de un modal padre con `backdrop-filter`**.

---

## Checklist de cumplimiento

Para **cada modal/dialog/popover/menú flotante** del proyecto:

- [ ] ¿Usa `position: fixed` (sea inline style o `className="fixed"`)? → debe estar dentro de `createPortal`
- [ ] ¿Está renderizado vía `createPortal(..., document.body)`?
- [ ] ¿Tiene guard `mounted` para SSR safety (Next.js)?
- [ ] ¿`z-index >= 1000` para evitar conflicts con modales padre comunes?
- [ ] ¿El backdrop tiene `onClick={() => setOpen(false)}`?
- [ ] ¿El contenido tiene `onClick={e => e.stopPropagation()}` para que click dentro no cierre?

### z-index recomendados

| Capa | z-index | Cuándo |
|---|---|---|
| Modal/dialog principal de página | 1000 | Confirmación destructiva, formulario CRUD |
| Toast / notification | 1200 | sonner default |
| Tooltip / popover | 100-300 | hover, dropdown menus |

---

## Excepciones permitidas

- **Inputs/Selects** que abren menús con `position: absolute` relativos al input — no necesitan portal porque NO son `fixed`.

---

## Detección automática

### Grep de candidatos

```bash
# Encuentra todos los divs con className "fixed" que probablemente son modales
grep -rE 'className=".*\bfixed\b' apps/web/src agent/apps/web/src | \
  grep -vE 'createPortal|fixed bottom|fixed top-' | \
  head
```

### Compliance check (futuro C.11)

```bash
# Si existe un componente con className="fixed inset-0" pero NO usa createPortal en el mismo archivo → ❌
for f in $(grep -rl 'className=".*fixed inset-0' apps/web/src agent/apps/web/src); do
  if ! grep -q 'createPortal' "$f"; then
    echo "VIOLATION: $f tiene 'fixed inset-0' sin createPortal"
  fi
done
```

---

## Cuándo aplicar esta regla

- Al crear un nuevo modal/dialog en cualquier app
- Al revisar PRs que agreguen modales
- Cuando un dialog reportado se ve "torcido" o "no centrado"
- Antes de mergear cualquier feature con UI flotante encima de un editor o catálogo
