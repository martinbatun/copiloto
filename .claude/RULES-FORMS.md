# Copiloto — Reglas de Formularios, Validaciones y Diálogos de Confirmación

> **Nota técnica**: si tu modal/dialog se abre **dentro de otro modal padre** que use `backdrop-filter`, `filter`, `transform` o `perspective`, debes renderizarlo vía `React.createPortal` para evitar problemas de centrado. Ver [`RULES-DIALOGS.md`](RULES-DIALOGS.md) para el patrón completo.

---

## 1. DIÁLOGOS DE CONFIRMACIÓN

### Prohibido
- `window.confirm()` — NUNCA usar. Es feo, no se puede personalizar y no sigue el diseño del sistema.
- `window.alert()` — NUNCA usar. Usar toasts o banners inline.
- `window.prompt()` — NUNCA usar.

### Obligatorio
Todo botón destructivo (eliminar, cancelar, rechazar, revocar) debe abrir un **modal de confirmación personalizado**.

### Estructura del modal

```
┌──────────────────────────────────────────┐
│  [Ícono 48×48]  Título                   │
│                 Subtítulo (ej: folio)     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Explicación de lo que pasará       │  │
│  │ con texto en **negrita** para      │  │
│  │ las palabras clave.                │  │
│  └────────────────────────────────────┘  │
│                                          │
│              [Cancelar]  [Sí, Acción]    │
└──────────────────────────────────────────┘
```

### Código de referencia

```tsx
const [showConfirm, setShowConfirm] = useState(false);

// Trigger
<button onClick={() => setShowConfirm(true)}>Eliminar</button>

// Modal
{showConfirm && (
  <div
    onClick={() => setShowConfirm(false)}
    style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: "#fff", borderRadius: 16, padding: 32, width: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}
    >
      {/* Header: Ícono + Título */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "{iconBg}", // #fef2f2 para eliminar, #fff7ed para advertencia
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: "{iconColor}" }}>
            {/* delete_forever, warning, cancel, block */}
          </span>
        </div>
        <div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>
            {título}
          </h3>
          <p style={{ fontSize: 12, color: "#6c7a72", margin: "2px 0 0" }}>{subtítulo}</p>
        </div>
      </div>

      {/* Explicación */}
      <div style={{ padding: 16, background: "#f8f9fa", borderRadius: 10, marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#3c4a42", margin: 0, lineHeight: 1.6 }}>
          {mensaje con <strong>palabras clave</strong> en negrita}
        </p>
      </div>

      {/* Botones */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={() => setShowConfirm(false)} style={cancelBtnStyle}>
          Cancelar
        </button>
        <button onClick={handleAction} style={confirmBtnStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{ícono}</span>
          Sí, {acción}
        </button>
      </div>
    </div>
  </div>
)}
```

### Colores por tipo de acción

| Acción | Ícono | iconBg | iconColor | Botón confirmar |
|--------|-------|--------|-----------|-----------------|
| Eliminar permanente | `delete_forever` | `#fef2f2` | `#ba1a1a` | `background: #ba1a1a` |
| Cancelar (reversible) | `warning` | `#fff7ed` | `#f59e0b` | `background: #f59e0b` |
| Rechazar | `block` | `#fef2f2` | `#ba1a1a` | `background: #ba1a1a` |
| Despublicar | `unpublished` | `#fff7ed` | `#f59e0b` | `background: #f59e0b` |
| Archivar | `archive` | `#f0f4ff` | `#6366f1` | `background: #6366f1` |
| Cerrar sesión | `logout` | `#f8f9fa` | `#6c7a72` | `background: #6c7a72` |

### Botón Cancelar (siempre igual)
```tsx
style={{
  padding: "10px 20px", fontSize: 14, fontWeight: 600,
  background: "transparent", color: "#3c4a42",
  border: "1px solid #bbcac0", borderRadius: 10, cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
}}
```

### Texto del botón de confirmación
Siempre inicia con "Sí, " seguido del verbo:
- "Sí, Eliminar"
- "Sí, Cancelar"
- "Sí, Rechazar"
- "Sí, Cerrar Sesión"

### Comportamiento post-acción (OBLIGATORIO)

Después de ejecutar una acción destructiva exitosa, se DEBE:

1. **Invalidar el cache del listado** antes de navegar:
```tsx
const deleteMutation = useMutation({
  mutationFn: () => apiDelete(`/api/{resource}/${id}`),
  onSuccess: (res) => {
    // 1. Invalidar listado para que se refresque
    queryClient.invalidateQueries({ queryKey: ["{resource}s"] });

    // 2. Si se eliminó permanentemente → navegar al listado
    if (res?.deleted) {
      router.push("/{resource}s");
    } else {
      // 3. Si solo cambió status → refrescar el detalle
      queryClient.invalidateQueries({ queryKey: ["{resource}", id] });
    }
  },
});
```

2. **Cerrar el modal** de confirmación:
```tsx
onClick={() => { deleteMutation.mutate(); setShowConfirm(false); }}
```

3. **Mostrar feedback** — toast o banner confirmando la acción:
```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["invoices"] });
  toast({ title: "Factura eliminada", description: "Se eliminó permanentemente" });
  router.push("/invoices");
},
```

### Reglas de invalidación de cache

| Acción | Invalidar | Navegar |
|--------|-----------|---------|
| Eliminar permanente | `queryKey: ["{listado}"]` | `router.push("/{listado}")` |
| Cancelar/Rechazar | `queryKey: ["{listado}"]` + `queryKey: ["{detalle}", id]` | Quedarse en el detalle |
| Crear nuevo | `queryKey: ["{listado}"]` | `router.push("/{listado}/{newId}")` o `router.push("/{listado}")` |
| Editar | `queryKey: ["{listado}"]` + `queryKey: ["{detalle}", id]` | Quedarse en el detalle |

> **NUNCA** navegar a un listado sin invalidar su cache primero.
> El usuario verá datos desactualizados si el cache no se refresca.

---

## 2. VALIDACIÓN DE FORMULARIOS

### Principios
1. **Validar antes de enviar** — nunca enviar datos inválidos al backend
2. **Feedback visual inmediato** — el input inválido se marca en rojo
3. **Mensaje de error específico** — debajo del campo, no genérico
4. **Limpiar error al corregir** — el error desaparece cuando el usuario escribe

### Estados de un input

| Estado | Border | Background | Color texto |
|--------|--------|------------|-------------|
| Normal | `none` o `1px solid {outline}` | `#f3f4f5` | `#191c1d` |
| Focus | `2px solid {primary}` | `#ffffff` | `#191c1d` |
| Error | `2px solid #ba1a1a` | `#fef2f2` | `#ba1a1a` |
| Disabled | `none` | `#e7e8e9` | `#9ca3af` |

### Estilos de referencia

```tsx
const [errors, setErrors] = useState<Record<string, string>>({});

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#f3f4f5",
  border: "none",
  borderRadius: 8,
  padding: 12,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif",
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: "2px solid #ba1a1a",
  background: "#fef2f2",
};

// En el input:
<input
  style={errors.fieldName ? inputErrorStyle : inputStyle}
  onChange={(e) => {
    setValue(e.target.value);
    if (errors.fieldName) {
      setErrors(prev => { const { fieldName, ...rest } = prev; return rest; });
    }
  }}
/>
{errors.fieldName && (
  <p style={{ color: "#ba1a1a", fontSize: 11, margin: "4px 0 0", fontWeight: 600 }}>
    {errors.fieldName}
  </p>
)}
```

### Función de validación

```tsx
const validate = (): boolean => {
  const errs: Record<string, string> = {};

  if (!requiredField.trim()) errs.requiredField = "Este campo es requerido";
  if (numericField <= 0) errs.numericField = "El valor debe ser mayor a 0";
  if (!emailField.includes("@")) errs.emailField = "Email inválido";

  setErrors(errs);
  return Object.keys(errs).length === 0;
};

const handleSubmit = () => {
  if (validate()) mutation.mutate(buildPayload());
};
```

### Banner de error general
Cuando hay múltiples errores o un error de sección completa:

```tsx
{errors.general && (
  <p style={{
    color: "#ba1a1a", fontSize: 12, fontWeight: 600,
    margin: "0 0 12px",
    padding: "8px 16px",
    background: "#fef2f2",
    borderRadius: 8,
  }}>
    {errors.general}
  </p>
)}
```

### Campos requeridos
Indicar campos requeridos con asterisco rojo en el label:
```tsx
<label style={labelStyle}>
  Nombre <span style={{ color: "#ba1a1a" }}>*</span>
</label>
```

---

## 3. SELECTORES

### Prohibido
- `<select>` nativo del browser — NUNCA usar. El dropdown nativo no se puede personalizar y se ve diferente en cada OS/browser.

### Obligatorio
Usar **siempre** el componente compartido `Select` de `@copiloto/ui`. Este componente renderiza un dropdown custom con:
- Opciones con colores y checkmark en el seleccionado
- Búsqueda automática cuando hay más de 7 opciones
- Diseño consistente entre plataformas
- Soporte para `disabled`

> **Estado actual:** `@copiloto/ui` (`packages/ui/src/components/`) hoy solo expone `Button.tsx` y `Card.tsx`. El `Select` compartido es el patrón a implementar ahí — al crearlo, agregarlo a `packages/ui/src/components/Select.tsx` y exportarlo desde el índice del paquete. No asumas que el archivo ya existe; verificá con `ls packages/ui/src/components/`.

**Import:** `import Select from "@/components/Select";` (wrapper local de la app, NO directamente de `@copiloto/ui`)

### Wrapper local por app (OBLIGATORIO)

Cada app (`apps/web`, `agent/apps/web`) debe crear un wrapper local que aplique los colores del módulo/sección. Los colores del Select deben coincidir con los colores del **item activo del navbar**:

**Archivo:** `apps/web/src/components/Select.tsx` (y, si aplica, `agent/apps/web/src/components/Select.tsx`)

```tsx
"use client";

import BaseSelect from "@copiloto/ui/Select";
import { type ComponentProps } from "react";

type SelectProps = Omit<ComponentProps<typeof BaseSelect>, "primaryColor" | "primaryFixedColor">;

export default function Select(props: SelectProps) {
  return <BaseSelect {...props} primaryColor="{navActiveColor}" primaryFixedColor="{navActiveBg}" />;
}
```

### Colores por módulo (deben coincidir con el navbar)

Definí `primaryColor`/`primaryFixedColor` por módulo, tomando el color del item activo del navbar de ese módulo. Ejemplos de módulos de Copiloto:

| Módulo | primaryColor (texto activo nav) | primaryFixedColor (fondo activo nav) |
|-----|------|------|
| Orders | `#006c4b` | `rgba(0,108,75,0.08)` |
| Menu | `#006782` | `rgba(0,103,130,0.08)` |
| Reservations | `#7c3aed` | `rgba(124,58,237,0.08)` |
| Suppliers | `#16a34a` | `rgba(22,163,74,0.08)` |
| Agent | `#be185d` | `rgba(190,24,93,0.08)` |

### Uso en páginas

```tsx
// Importar SIEMPRE desde el wrapper local
import Select from "@/components/Select";

<Select
  value={selectedValue}
  onChange={setSelectedValue}
  options={[
    { value: "opt1", label: "Opción 1" },
    { value: "opt2", label: "Opción 2" },
  ]}
  placeholder="Seleccionar..."
  width={200}
/>
```

### Variantes por contexto

#### Select de formulario (dentro de modales/forms)
- Con `<label>` encima
- `width: "100%"`
- Padding: `10px 12px`
- Background: `#f3f4f5`
- Incluir opción vacía como placeholder: `<option value="">Seleccionar...</option>`

```tsx
<div>
  <label style={labelStyle}>Categoría <span style={{ color: "#ba1a1a" }}>*</span></label>
  <Select
    value={category}
    onChange={setCategory}
    options={categoryOptions}
    placeholder="Seleccionar categoría..."
    width="100%"
  />
  {errors.category && <p style={errorMsgStyle}>{errors.category}</p>}
</div>
```

#### Select de filtro (en headers de tabla/listado)
- Sin label (el contexto lo explica)
- Ancho fijo: `width: 160-200px`
- Más compacto: padding `8px 12px`, fontSize `13px`
- Background: `#ffffff` con borde sutil
- Incluir opción "Todos" como default

```tsx
<Select
  value={statusFilter}
  onChange={setStatusFilter}
  options={[
    { value: "", label: "Todos los estatus" },
    { value: "PAID", label: "Pagadas" },
    { value: "DRAFT", label: "Borradores" },
    { value: "CANCELLED", label: "Canceladas" },
  ]}
  width={180}
/>
```

#### Select inline (dentro de tablas/rows)
- Sin borde, background transparente
- fontSize: `12-13px`
- Cambia valor directamente (sin modal)

```tsx
<Select
  value={row.status}
  onChange={(v) => updateRow(row.id, { status: v })}
  options={statusOptions}
  width={120}
/>
```

### Interfaz del componente

```tsx
interface SelectOption {
  value: string;
  label: string;
  icon?: string;   // emoji o texto corto que se muestra antes del label
  color?: string;   // dot de color antes del label (ej: "#10b981" para verde)
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;  // NOTA: recibe el value, NO un event
  options: SelectOption[];
  placeholder?: string;
  width?: number | string;
  disabled?: boolean;
}
```

### Conversión de `<select>` nativo a `@copiloto/ui/Select`

```tsx
// ❌ ANTES (nativo — PROHIBIDO)
<select value={status} onChange={(e) => setStatus(e.target.value)}>
  <option value="">Todos</option>
  <option value="APPROVED">Aprobado</option>
</select>

// ✅ DESPUÉS (componente compartido — OBLIGATORIO)
<Select
  value={status}
  onChange={(v) => setStatus(v)}  // onChange recibe string, NO event
  options={[
    { value: "", label: "Todos" },
    { value: "APPROVED", label: "Aprobado", color: "#10b981" },
  ]}
  placeholder="Todos"
  width="100%"
/>
```

### Colores recomendados para opciones de status

| Status | Color |
|--------|-------|
| Activo / Aprobado / Pagado | `#10b981` (verde) |
| Pendiente / En proceso | `#f59e0b` (ámbar) |
| Rechazado / Cancelado / Error | `#ef4444` (rojo) |
| Borrador / Inactivo | `#9ca3af` (gris) |
| Timbrado / Enviado | `#006782` (teal) |
| Crítico / Urgente | `#ba1a1a` (rojo oscuro) |

---

## 4. DATE PICKERS / SELECTORES DE FECHA

### Prohibido
- `<input type="date">` nativo del browser — NUNCA usar. El picker nativo varía radicalmente entre Chrome/Safari/Firefox/iOS/Android, no respeta la paleta de la app, no soporta locales en español, y rompe la consistencia visual.
- `<input type="datetime-local">` — NUNCA usar (mismo problema).
- `<input type="month">` — NUNCA usar.

### Obligatorio
Usar **siempre** el componente compartido `DatePicker` de `@copiloto/ui`. Este componente renderiza un calendario custom con:
- Input enmascarado `dd/mm/aaaa` (auto-inserta los `/`)
- Calendario portal con `react-dom/createPortal` (no se corta por overflow del padre)
- Locale `es` (Lu/Ma/Mi/Ju/Vi/Sá/Do, "Mayo 2026", botón "Hoy")
- Posicionamiento auto: abre arriba o abajo según espacio disponible
- Min/max date para restringir rango
- Soporta `disabled`, `error`, `compact` (36px) o default (42px)
- Cierra con click-outside o tecla `Escape`
- Botón ✕ inline para limpiar el valor

> **Estado actual:** igual que `Select`, el `DatePicker` compartido es el patrón a implementar en `@copiloto/ui` (`packages/ui/src/components/`) — hoy ese paquete solo expone `Button.tsx` y `Card.tsx`. No asumas que el archivo ya existe; verificá con `ls packages/ui/src/components/`.

**Import:** `import DatePicker from "@/components/DatePicker";` (wrapper local de la app, NO directamente de `@copiloto/ui`)

### Wrapper local por app (OBLIGATORIO)

Cada app (`apps/web`, `agent/apps/web`) debe crear un wrapper local que aplique los colores del módulo — exactamente el mismo patrón que `Select`. Los colores deben coincidir con el **item activo del navbar**.

**Archivo:** `apps/web/src/components/DatePicker.tsx` (y, si aplica, `agent/apps/web/src/components/DatePicker.tsx`)

```tsx
"use client";

import { DatePicker as BaseDatePicker, type DatePickerProps as BaseProps } from "@copiloto/ui";

type DatePickerProps = Omit<BaseProps, "primaryColor" | "primaryFixedColor">;

export default function DatePicker(props: DatePickerProps) {
  return (
    <BaseDatePicker
      {...props}
      primaryColor="{navActiveColor}"
      primaryFixedColor="{navActiveBg}"
    />
  );
}
```

### Uso en páginas

```tsx
import DatePicker from "@/components/DatePicker";

const [dateFrom, setDateFrom] = useState("");

<DatePicker
  value={dateFrom}                  // formato ISO "YYYY-MM-DD" o ""
  onChange={(value) => setDateFrom(value)}  // recibe string ISO, NO un event
  placeholder="dd/mm/aaaa"
  width="170px"
/>
```

### Variantes por contexto

#### Filtro en header de tabla/listado
- Sin label (placeholder explica)
- `width: 160-180px`
- `placeholder: "Desde"` / `"Hasta"` para rangos

```tsx
<DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Desde" width="160px" />
<DatePicker value={dateTo}   onChange={setDateTo}   placeholder="Hasta" width="160px" />
```

#### Campo de formulario (con label)
- Con `<label>` arriba
- `width: "100%"` o `width="220px"` si está en grid

```tsx
<div>
  <label style={labelStyle}>
    Fecha de expiración <span style={{ color: "#ba1a1a" }}>*</span>
  </label>
  <DatePicker
    value={expiresAt}
    onChange={setExpiresAt}
    placeholder="dd/mm/aaaa"
    min={new Date().toISOString().slice(0, 10)}  // no fechas pasadas
    width="100%"
  />
  {errors.expiresAt && <p style={errorMsgStyle}>{errors.expiresAt}</p>}
</div>
```

#### Restricción min/max

```tsx
// Solo fechas futuras (vencimiento de documento)
<DatePicker value={expiresAt} onChange={setExpiresAt} min="2026-01-01" />

// Solo fechas pasadas (fecha de nacimiento)
<DatePicker value={birthdate} onChange={setBirthdate} max={new Date().toISOString().slice(0,10)} />

// Rango ligado (Hasta no antes de Desde)
<DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Desde" />
<DatePicker value={dateTo}   onChange={setDateTo}   placeholder="Hasta" min={dateFrom} />
```

### Interfaz del componente

```tsx
interface DatePickerProps {
  value: string;                      // "YYYY-MM-DD" o ""
  onChange: (v: string) => void;      // recibe string ISO, NO un event
  placeholder?: string;               // default "dd/mm/aaaa"
  disabled?: boolean;
  error?: boolean;
  compact?: boolean;                  // false=42px (default), true=36px
  min?: string;                       // "YYYY-MM-DD" — bloquea anteriores
  max?: string;                       // "YYYY-MM-DD" — bloquea posteriores
  width?: number | string;            // default "100%"
}
```

### Conversión de `<input type="date">` nativo a `DatePicker`

```tsx
// ❌ ANTES (nativo — PROHIBIDO)
<input
  type="date"
  value={dateFrom}
  onChange={(e) => setDateFrom(e.target.value)}
  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd" }}
/>

// ✅ DESPUÉS (componente compartido — OBLIGATORIO)
<DatePicker
  value={dateFrom}
  onChange={(value) => setDateFrom(value)}  // string ISO, NO event
  placeholder="Desde"
  width="160px"
/>
```

### Para campos datetime (fecha + hora)

Usar `DateTimePicker` de `@copiloto/ui` (mismo patrón, mismo wrapper, mismo `primaryColor`). API casi idéntica pero el value es ISO `"YYYY-MM-DDTHH:mm"`.

### Verificación (greppeable)

```bash
# Cero resultados esperados:
grep -rn 'type="date"\|type="datetime-local"\|type="month"' apps/web/src agent/apps/web/src --include="*.tsx"
```

Si hay coincidencias → migrarlas al wrapper local antes de marcar la app como compliant.

---

## 5. BOTONES

### Tipos de botón

| Tipo | Uso | Estilo |
|------|-----|--------|
| **Primary** | Acción principal (Guardar, Crear, Timbrar) | `background: {primary}, color: #fff, fontWeight: 700` |
| **Secondary/Outline** | Acción secundaria (Cancelar, Exportar) | `background: transparent, border: 1px solid {outline}, color: {onSurface}` |
| **Destructive** | Acción destructiva (Eliminar, Rechazar) | `background: transparent, border: 2px solid rgba(186,26,26,0.2), color: #ba1a1a` |
| **Ghost** | Acción terciaria (Ver más, Limpiar) | `background: none, border: none, color: {primary}` |

### Estilos comunes de todos los botones
```tsx
fontFamily: "'Inter', sans-serif",
fontSize: 14,
fontWeight: 600, // 700 para Primary
borderRadius: 10, // o 12 para botones grandes
cursor: "pointer",
display: "flex",
alignItems: "center",
gap: 8,
transition: "all 0.15s",
```

### Loading state
```tsx
<button disabled={mutation.isPending} style={{ opacity: mutation.isPending ? 0.6 : 1 }}>
  {mutation.isPending ? "Guardando..." : "Guardar"}
</button>
```

### Con ícono
Siempre usar Material Symbols a la izquierda del texto:
```tsx
<button>
  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
  Nueva Factura
</button>
```

---

## 6. TOASTS / NOTIFICACIONES INLINE

### Para feedback de acciones exitosas
```tsx
// Inline banner (en la misma página)
<div style={{ padding: 16, background: "#ecfdf5", borderRadius: 8, color: "#047857", fontSize: 14, fontWeight: 500 }}>
  ✓ Factura creada exitosamente.
</div>
```

### Para errores de API
```tsx
<div style={{ padding: 16, background: "#fef2f2", borderRadius: 8, color: "#ba1a1a", fontSize: 14, fontWeight: 500 }}>
  Error al crear la factura. Por favor intente de nuevo.
</div>
```

### Si la app tiene `useToast`:
```tsx
const { toast } = useToast();

// Éxito
toast({ title: "Factura creada", description: "Folio F-2026-001" });

// Error
toast({ title: "Error", description: "No se pudo crear la factura", variant: "destructive" });
```

---

## 7. CHECKLIST DE VERIFICACIÓN

Al crear o revisar una app, verificar:

- [ ] Ningún `window.confirm`, `window.alert` o `window.prompt` en el código
- [ ] Todo botón destructivo tiene modal de confirmación personalizado
- [ ] Todos los formularios validan antes de enviar
- [ ] Los inputs inválidos se marcan en rojo con mensaje específico
- [ ] Los errores se limpian al corregir el campo
- [ ] Los botones muestran loading state durante mutaciones
- [ ] Los selectores usan `@copiloto/ui/Select` (vía wrapper local) — cero `<select>` nativo
- [ ] Los pickers de fecha usan `@copiloto/ui` `DatePicker` (vía wrapper local) — cero `<input type="date">` nativo
- [ ] Los botones tienen ícono Material Symbols a la izquierda
- [ ] Los campos requeridos tienen asterisco rojo
- [ ] Las acciones exitosas muestran feedback (toast o banner)
- [ ] Las acciones fallidas muestran error (toast o banner)

### Comandos de verificación rápida

```bash
# Frontends del mono-repo (cubre web y agent-web):
ROOTS="apps/web/src agent/apps/web/src"

# Cero resultados en cada uno:
grep -rn "window\.confirm\|window\.alert\|window\.prompt" $ROOTS
grep -rn "<select" $ROOTS --include="*.tsx"
grep -rn 'type="date"\|type="datetime-local"\|type="month"' $ROOTS --include="*.tsx"

# Existencia de wrappers locales (debe retornar el archivo):
ls apps/web/src/components/Select.tsx
ls apps/web/src/components/DatePicker.tsx
```
