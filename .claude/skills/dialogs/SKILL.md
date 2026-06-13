---
name: dialogs
description: Aplica las reglas de Copiloto para diálogos / modales anidados. Auto-activar cuando se crea un modal que se abre dentro de otro modal, cuando un modal aparece descentrado o con backdrop incompleto, cuando se usa `position: fixed` dentro de un componente con `backdrop-filter`/`filter`/`transform`/`perspective`/`contain`/`will-change`, o cuando el usuario reporta "el modal sale chico", "el backdrop no cubre toda la pantalla", "subí el z-index y no funciona".
---

# Skill: Modales anidados y containing block

Antes de tocar el código, **leer las reglas completas** en [`.claude/RULES-DIALOGS.md`](../../RULES-DIALOGS.md). El archivo tiene la explicación CSS, ejemplos antes/después y patrones para React.

## Quick checklist

1. **Diagnóstico:** si el modal hijo sale descentrado o el backdrop no cubre la pantalla, **NO es un problema de z-index**. Es containing block.
2. **Causa:** el padre tiene `backdrop-filter`, `filter`, `transform`, `perspective`, `contain` o `will-change` distinto de `none`, lo que ancla los `position: fixed` descendientes al padre y no al viewport.
3. **Solución:** renderizar el modal hijo via `React.createPortal(<Dialog />, document.body)` para sacarlo del subárbol del padre.
4. **Verificar:** el modal hijo cubre toda la pantalla, queda centrado independiente del scroll del padre, ESC y click en backdrop lo cierran.

## Cuándo aplicar

- Modal de confirmación dentro de un modal de edición (caso típico: "Eliminar gasto" dentro del diálogo de detalle).
- Preview de imagen / PDF dentro de otro modal.
- Toast/popover dentro de un sheet con blur.

## Cuándo NO aplicar

- Modal único top-level (no anidado) — sigue las reglas normales de `RULES-FORMS.md`.
- El padre no tiene ninguna propiedad CSS que cree containing block — verificar con DevTools antes de portear.
