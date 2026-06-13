---
name: forms
description: Aplica las reglas de Copiloto para formularios, validaciones y diálogos de confirmación. Auto-activar cuando se crea o modifica un formulario (`<form>`, react-hook-form, useState para inputs), se agrega validación de campos, se reemplaza `window.confirm/alert/prompt`, se diseña un modal de confirmación de acción destructiva (eliminar, rechazar, cancelar, revocar), o se trabaja en cualquier archivo de los frontends (`apps/web/src/**` o `agent/apps/web/src/**`) que contenga inputs o submit handlers.
---

# Skill: Formularios, validaciones y diálogos de confirmación

Antes de tocar el código, **leer las reglas completas** en [`.claude/RULES-FORMS.md`](../../RULES-FORMS.md). Lo de abajo es solo el resumen — el archivo tiene los detalles, ejemplos y excepciones.

## Quick checklist (validar después de implementar)

1. **Prohibido:** `window.confirm()`, `window.alert()`, `window.prompt()`. Reemplazar por modal personalizado o toast.
2. **Toda acción destructiva** (eliminar, cancelar, rechazar, revocar) abre un modal de confirmación con:
   - Ícono 48×48 + título + subtítulo de contexto (folio/nombre del recurso)
   - Botón primario (destructivo) + secundario (cancelar)
   - Click en backdrop o ESC cierran sin ejecutar
3. **Validación de inputs:** mostrar errores inline, no en toast. Validar en `onBlur` + `onSubmit`.
4. **Estado del submit:** botón deshabilitado durante mutation pending, label "Guardando…".
5. **Modal anidado en otro modal con `backdrop-filter`/`filter`/`transform`:** usar `React.createPortal` (ver `RULES-DIALOGS.md`).
6. **Mensajes en es-MX**, sin tecnicismos. "Folio inválido" mejor que "Validation error".

## Cuándo NO aplicar

- Cambios cosméticos sin tocar inputs/submit.
- Tests unitarios o de integración (los formularios de prueba pueden simplificar).
- Archivos generados (Prisma, OpenAPI, etc.).
