# Copiloto — Prompts para IA de Diseno (Stitch / v0 / Lovable)

Ejecutar estos prompts en orden. Cada uno genera una pantalla completa.
El objetivo es obtener un **Smart Ops Co-pilot premium para restaurantes en MX/LATAM** — como si Toast, Restaurant365 y 7shifts tuvieran un hijo latinoamericano con IA conversacional nativa y WhatsApp como canal de operacion.

---

## INSTRUCCIONES PARA STITCH

> **IMPORTANTE:** Cada prompt ya incluye el contexto global. NO necesitas pegar nada extra.
> - Copia el bloque completo dentro de las triples comillas ``` y pegalo directamente en Stitch.
> - Stitch generara UNA pantalla desktop completa por prompt.
> - Despues de cada pantalla, escribe: "Ahora genera la siguiente pantalla:" y pega el siguiente prompt.
> - Si Stitch genera mobile, escribe: "Regenera esto como vista DESKTOP 1440x900, no mobile."

---

## CONTEXTO COMPARTIDO (referencia para ti, no para Stitch)

**Producto:** Copiloto — capa de IA sobre el POS existente que entrega recomendaciones accionables de staffing, inventario, menu y experiencia del huesped.

**Personas:**
- **Don Rodrigo Tamayo** — dueño/operador (3 sucursales)
- **Monica Salinas** — manager de turno (la usuaria diaria)
- **Chef Eduardo Reyes** — cocina y prep
- **Adriana Castillo** — hostess y reservas

**Restaurante demo:** "La Cocina de Doña Mari" — comida mexicana contemporanea, 3 sucursales (Roma Norte, Polanco, Coyoacan).

**Color DNA:**
- Primario: `#D9532A` (terracota — evoca cocina sin gritar rojo)
- Gradient pair: `#B9532A` → `#9A3412`
- Acento: `#F59E0B` (azafran — para "recomendado por IA")
- Fondos: `#F8F6F3` (off-white calido, como talavera) y `#FFFFFF`
- Texto: `#18181B` primario, `#71717A` muted
- Sidebar/header oscuro opcional: `#1F2128`

**Tipografia:**
- Display/headings/numerales: **Lexend** (font-weight 700-900)
- Body/UI: **Inter** (400-600)

**Inspiracion:** Toast, ToastIQ, Restaurant365, 7shifts, Square for Restaurants, Linear (para densidad de datos), Notion (para layout).

---

## Prompt 1 — Login (split-screen "kitchen ops")

```
Layout: CUSTOM (full screen split 58/42, NO wrapper, NO sidebar)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend (display) e Inter (body). Usa Lucide icons via CDN.

Disena la pagina de login para "Copiloto" — Smart Ops Co-pilot para restaurantes en Mexico.
Color primario: #D9532A (terracota calida). Acento: #F59E0B (azafran). Tema LIGHT.
Inspiracion: Toast, Restaurant365, 7shifts pero con identidad LATAM y feeling de "cocina premium".

Layout OBLIGATORIO: split-screen con 2 paneles, height 100vh, overflow hidden, display: flex.

=== PANEL IZQUIERDO (width: 58%) ===
- Background: linear-gradient(135deg, #FBE7DC 0%, #FFFFFF 50%, #F8F6F3 100%)
- Border-right: 1px solid #E7E5E4
- Position: relative

Patron decorativo de talavera (sutil) en background:
- background-image: radial-gradient(circle at 1px 1px, #E7E5E4 1px, transparent 0)
- background-size: 36px 36px, opacity: 0.4

Orbe decorativo terracota:
- position: absolute, top: 14%, right: 12%, width: 320px, height: 320px
- border-radius: 9999px, background: rgba(217,83,42,0.14), filter: blur(96px)

Logo (position: absolute, top: 48px, left: 64px, z-index: 20):
- Cuadrado 46x46, border-radius: 12px, background: linear-gradient(135deg, #D9532A, #9A3412)
- box-shadow: 0 12px 32px rgba(217,83,42,0.32)
- Dentro: icono ChefHat (Lucide) blanco 24px
- Al lado: "Copiloto" Lexend, 24px, font-weight: 800, letter-spacing: -0.03em, color: #18181B
- Tagline mini debajo del nombre: "Smart Ops para Restaurantes" Inter, 11px, color: #71717A

3 cards flotantes glassmorphism (background: rgba(255,255,255,0.78), backdrop-filter: blur(22px), border: 1px solid rgba(255,255,255,0.6), border-radius: 18px):

Card 1 — Forecast del dia (position: absolute, top: 19%, left: 9%, width: 280px, transform: rotate(-4deg), padding: 18px):
- Label uppercase 10px bold rosa-terracota: "DEMANDA HOY · COMIDA"
- Numero gigante: "284 tickets" Lexend 28px 800 color #18181B
- Subtitulo: "+12% vs miercoles pasado" 12px color #10B981 con icono TrendingUp 12px
- Mini chart de barras de 7 dias horizontales con barra del miercoles en terracota destacada, las demas en gris claro
- Footer: badge "MAPE 8.4%" pill bg #FBE7DC color #9A3412 uppercase 9px

Card 2 — Recomendacion del co-piloto (position: absolute, top: 47%, left: 50%, transform: translate(-50%,-50%) scale(1.06), width: 320px, z-index: 10):
- background: rgba(255,255,255,0.92), backdrop-filter: blur(28px), border-radius: 22px
- box-shadow: 0 36px 72px rgba(217,83,42,0.18)
- Header: icono Sparkles azafran 18px + "Recomendacion del co-piloto" 11px bold uppercase color #92400E
- Titulo: "Sube par level de aguacate a 18kg" Lexend 18px 700 color #18181B
- Subtitulo: "Pronostico: 84 ordenes de guacamole entre 13:00-15:00 (cap. actual 12kg insuficiente)" 12px color #71717A
- ROI calculado: "Evitas merma estimada de $480 MXN y 6 platos cancelados" 12px color #18181B
- 2 botones inline: "Aprobar" bg #D9532A color white pill 12px bold + "Modificar" outline pill 12px
- Footer: "Confianza 92%" pequeno con dot verde

Card 3 — KPI margen (position: absolute, bottom: 16%, right: 9%, width: 240px, transform: rotate(5deg), padding: 18px):
- Icono Receipt 16px terracota
- "Margen operativo" Inter 11px uppercase color #71717A
- "34.8%" Lexend 32px 800 color #18181B
- Badge "+2.3 pp vs Q4" pill bg rgba(16,185,129,0.12) color #10B981 11px
- Mini sparkline emerald ascendente 30 dias
- Footer mini: "Roma Norte · L-D" 10px color #71717A

Footer tagline (position: absolute, bottom: 32px, left: 64px):
- Linea horizontal 56px color #D9532A
- "COPILOTO · SMART OPS PARA EL TURNO" Inter 10px uppercase letter-spacing 0.22em color #71717A

=== PANEL DERECHO (width: 42%) ===
- background: #ffffff
- display: flex, flex-direction: column, align-items: center, justify-content: center
- padding: 0 72px, position: relative

Mini logo (position: absolute, top: 32px, left: 48px):
- Cuadrado 28x28, border-radius: 8px, gradient terracota con icono ChefHat blanco 14px
- "Copiloto" Lexend 15px 800 color #18181B

Formulario centrado (max-width: 440px, width: 100%):
- Titulo: "Hola de nuevo, operador" Lexend 38px 700 letter-spacing -0.03em color #18181B
- Subtitulo: "Entra al tablero de tu turno y deja que el co-piloto te asista." Inter 15px color #71717A. Palabra "co-piloto" en color #D9532A font-weight 600.

- Label "CORREO": Inter 11px 700 uppercase letter-spacing 0.08em color #18181B
- Input email: padding: 14px 16px 14px 44px, background: #F8F6F3, border: none, border-radius: 12px, font-size: 14px
  - Prefix icono Mail 16px position absolute left 16px color #71717A
  - Placeholder: "dueno@cocinadonamari.mx"

- Label "CONTRASEÑA": misma tipografia
- Input password: mismo estilo, prefix icono Lock 16px, suffix icono Eye toggle 16px

- Flex justify-between margin-top 8: checkbox "Mantener sesion" + link "Olvide mi contraseña" rosa-terracota

- Boton login: width: 100%, border-radius: 9999px
  - background: linear-gradient(135deg, #D9532A 0%, #B9421E 100%)
  - padding: 16px 0, font-size: 15px, font-weight: 700, Inter, color: white
  - box-shadow: 0 10px 32px rgba(217,83,42,0.32)
  - Texto: "Entrar al tablero" + icono ArrowRight 16px derecha

- Separador: lineas con texto "o continua con" Inter 10px uppercase letter-spacing 0.12em color #71717A

- 2 botones sociales grid 2 cols: "Google Workspace" y "Microsoft 365" bg #F8F6F3 border 1px #E7E5E4 rounded 9999 padding 12px icono 18px + texto 13px

- Link al pie: "Eres mesero o cocinero? Abre la app movil" Inter 13px color #D9532A underline hover

Bottom bar (absolute, bottom: 24px, width: calc(100% - 144px)):
- Izq: "v.2.4.0 · Beta privada"  Der: "Privacidad · Terminos · Soporte"
- Inter 9px color #71717A opacity 0.6

Datos demo visibles en bottom: dueno@copiloto.mx / password123

Debe verse como un producto SaaS premium de $80k+/mes, con feeling calido de cocina pero precision de operacion.
```

---

## Prompt 2 — Dashboard del Operador

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena el dashboard principal de "Copiloto" — Smart Ops para el manager de turno.
Color primario: #D9532A (terracota). Acento: #F59E0B (azafran). Tema LIGHT — fondos #FFFFFF y #F8F6F3.
Inspiracion: Toast, Restaurant365, 7shifts.

=== HEADER DE NAVEGACION (OBLIGATORIO top bar, NO sidebar) ===
Barra horizontal fixed top, height: 64px, width: 100%, z-index: 50.
- background: rgba(255,255,255,0.86), backdrop-filter: blur(24px)
- border-bottom: 1px solid #E7E5E4
- box-shadow: 0 4px 24px rgba(217,83,42,0.05)
- padding: 0 32px, flex justify-between align-center

Izquierda — Logo + selector de sucursal:
- Logo 28x28 rounded 8 gradient terracota (#D9532A → #9A3412) icono ChefHat 14px blanco
- "Copiloto" Lexend 15px 800 color #18181B
- Separator vertical 16px
- Dropdown sucursal: pill bg #F8F6F3 border 1px #E7E5E4 padding 6px 12px rounded 9999
  - Icono MapPin 13px terracota + "Roma Norte" bold 13px + ChevronDown 13px muted
- margin-right: 24px

Centro — Nav pills (8 links): Tablero (activo), Co-piloto, Forecast, Schedule, Inventario, Recetas, Huespedes, KPIs
- Cada pill: padding 6px 14px rounded 9999 font-size 13px gap 6 icono Lucide 15
- Iconos: LayoutDashboard, Bot, TrendingUp, CalendarClock, Package, BookOpen, Users, BarChart3
- Activo: font-weight 600 color #D9532A bg rgba(217,83,42,0.09)
- Inactivo: font-weight 400 color #52525B
- Hover: color #D9532A (sin bg)

Derecha — Acciones:
- Boton buscar pill bg #F8F6F3 border 1px #E7E5E4 rounded 9999 min-width 220px padding 6px 14px
  - Icono Search 14px + "Buscar plato, ingrediente, huesped..." 13px color muted + kbd "⌘K" bg #E7E5E4 rounded 4 padding 2px 6 size 10
- Bell 18px con dot rojo 8px absoluto top-right
- Avatar 38x38 border 2px #FBE7DC con inicial "M" gradient terracota (Monica)
- Logout icono LogOut 16px

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding: 32px 40px) ===

1. HERO SECTION (full width, margin-bottom: 24px):
- Card bg white rounded 20 padding 36 flex justify-between
- Background sutil: linear-gradient(135deg, rgba(217,83,42,0.05), rgba(245,158,11,0.03))
- Izquierda:
  - "Buenos dias, Monica" Lexend 30px 700 color #18181B
  - Subtitulo: "Hoy es miercoles. Pronostico de 284 tickets — 12% arriba del promedio." Inter 15px color #71717A margin-top 8
  - Linea inferior con timestamp: "Sucursal Roma Norte · Turno comida 12:00-17:00" 12px color #71717A icono Clock 12
  - 4 pills accion rapida margin-top 20 flex gap 10:
    - "12 ordenes en cocina" bg white border 1px #E7E5E4 rounded 12 padding 10x16 icono Flame 14 + texto 13
    - "3 recomendaciones del co-piloto" bg rgba(217,83,42,0.09) color #9A3412 con Sparkles 14
    - "2 anomalias detectadas" bg rgba(245,158,11,0.1) color #92400E con AlertTriangle 14
    - "8 reservas confirmadas (cena)" bg rgba(59,130,246,0.09) color #1D4ED8 con Calendar 14
- Derecha (width: 320px):
  - Card mini "Pulso del turno" header bold 13 + 3 KPI inline mini:
    - "Margen vs meta" 11px muted + "37.2% / 35%" bold + dot emerald
    - "Food cost run-rate" 11px + "28.4%" bold + dot amber
    - "Labor % proyectado" 11px + "22.1%" bold + dot emerald
  - Pequena leyenda al fondo: "Actualizado hace 2 min · datos del POS" 10px muted

2. KPI CARDS (grid 4 columnas gap 20 margin-bottom 24):
Cada card bg white rounded 16 padding 24 box-shadow 0 1px 4px rgba(0,0,0,0.06)
- Card 1 "Ventas del dia":
  - Icono Receipt 20px terracota arriba
  - "$48,720 MXN" Lexend 32px 800 color #18181B
  - "Run-rate al cierre" 13px muted
  - Badge "+9% vs forecast" pill emerald 11px
- Card 2 "Ticket promedio":
  - Icono CreditCard 20px, "$284" 32px 800, label "MXN por ticket"
  - Mini sparkline terracota 14 dias ascendente
- Card 3 "Food cost del turno":
  - Icono Salad 20px, "28.4%" 32px 800, label "Cap proyectado: 30%"
  - Ring semicircular mini terracota al 28.4% sobre 30% objetivo
- Card 4 "Labor % proyectado":
  - Icono Users 20px, "22.1%" 32px 800, label "8 staff en piso"
  - Badge "-1.2 pp vs ayer" emerald

3. CO-PILOTO INSIGHT BLOCK (card full width bg gradient suave terracota, border 1px solid rgba(217,83,42,0.25), rounded 20, padding 28, margin-bottom 24):
- Header: icono Sparkles #F59E0B 22px + "Tu co-piloto tiene 3 acciones para ti" Lexend 18px 700 + boton "Abrir co-piloto" outline pill terracota a la derecha icono ArrowRight 14
- 3 acciones como rows (gap 10):
  - Row 1 (border-left 3px solid #D9532A, bg rgba(255,255,255,0.7), rounded 12, padding 14 18):
    - Flex: icono Package 18 terracota + "Sube par level de aguacate a 18kg" bold 13 + Badge "+ $480 MXN evitados" emerald pill 11
    - Subtexto: "Pronostico 84 ordenes de guacamole 13:00-15:00 · capacidad actual insuficiente" 12 muted
    - 3 botones: "Aprobar" bg #D9532A pill blanco 11 bold + "Modificar" outline 11 + "Rechazar" link gris 11
  - Row 2 (border-left amber):
    - "Cierra el plato del dia: ya saliste con 78 ordenes (cap 80)" + "Evita inconsistencia y devoluciones"
    - Boton "Cerrar plato" amber pill + "Posponer 30 min" outline
  - Row 3 (border-left azul):
    - "Llama a Lucia Robles — VIP hoy en mesa 12 (ultima visita hace 3 sem)" + "Es su cumpleaños"
    - Boton "Enviar saludo por WhatsApp" azul + "Marcar visto" outline

4. DOBLE COLUMNA 60/40 (gap: 24px):
Izquierda (bg white rounded 16 padding 24):
- Header: "Pronostico vs Real — comida de hoy" Lexend 16px 700 + dropdown "Hoy · comida"
- Chart de area sobre lineas: pronostico (linea punteada terracota) + real acumulado (linea solida emerald) por 30 minutos desde 12:00 a 17:00
- 3 puntos clave anotados: "13:30 pico esperado", "15:00 valle", "16:30 push de postres"
- Eje X: horas, eje Y: tickets
- Resumen abajo: "Run-rate: 284 tickets · MAPE actual 6.8% · margen proyectado +9% sobre objetivo"

Derecha (bg white rounded 16 padding 24):
- "Agenda del turno" Lexend 16px 700
- Timeline vertical 6 eventos:
  - Cada evento: dot 8px color + linea vertical + icono + titulo bold + subtexto muted + tiempo
  - "12:00 — Apertura · Prep list completado por Chef Eduardo" verde + check
  - "12:45 — Llegan 6 reservas grupales en bloque" azul + Users
  - "13:30 — Pico esperado: 18 mesas en piso" terracota + Flame
  - "14:00 — Recordatorio: rotar staff de bar (Luis tiene break)" amber + Coffee
  - "15:30 — Reposicion ingredientes (auto) si aguacate baja de 4kg" gris + Package
  - "16:30 — Revisa scorecard del turno con cocina" purpura + ClipboardCheck

Debe sentirse como una sala de control de operacion — calmada pero precisa.
```

---

## Prompt 3 — Co-piloto de Turno (pantalla INSIGNIA)

```
Layout: FULL-WIDTH (chat conversacional + panel lateral de contexto, sin restriccion de ancho)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena el co-piloto conversacional de turno para "Copiloto" — pantalla CORAZON del producto.
Color primario: #D9532A (terracota). Acento: #F59E0B (azafran). Tema LIGHT.
Concepto: el manager habla con el co-piloto como con un sous-chef que sabe todo del turno y puede ejecutar acciones con su aprobacion.

=== HEADER DE NAVEGACION (misma barra top 64px del Prompt 2, "Co-piloto" activo) ===

=== SUBHEADER (bg white padding 14px 32px border-bottom 1px solid #E7E5E4) ===
Flex justify-between:
- Izquierda: icono Bot 20px terracota + "Co-piloto del turno · Roma Norte" Lexend 17px 700 + badge pulsante "En vivo" pill bg rgba(16,185,129,0.12) color #10B981 11px con dot
- Centro: tabs pills inline 4 secciones: "Chat" (activo), "Action Ledger", "Recomendaciones", "Logs"
- Derecha: dropdown "Modelo: Claude Sonnet 4.6" pill outline + boton "Limpiar sesion" link muted

=== CONTENIDO (fondo #F8F6F3, padding 24, flex gap 20 full width sin max-width wrapper) ===

Grid 2 cols 64% / 36%, gap: 20px:

PANEL IZQUIERDO — CHAT CONVERSACIONAL (card bg white rounded 20 padding 28 height calc(100vh - 168px) flex column):

Header del chat:
- Avatar bot 44x44 rounded gradient terracota icono Bot blanco
- Info: "Copiloto" Lexend 16px 700 + "Sous-chef digital · contexto: turno comida miercoles" 12 muted
- Boton "?" outline circle 32px derecha

Hilo de mensajes (flex-1 overflow-y, gap 14 vertical):

Mensaje 1 — Bot (alineado izq, max-width 76%):
- Avatar mini 28x28 + bubble bg #F8F6F3 rounded 18px padding 14 18, color #18181B 14px Inter:
- "Buenas tardes Monica. Acabo de revisar el run-rate del turno y tengo 3 cosas que vale la pena mirar contigo."
- "1. **Aguacate** va a quedarte corto entre 13:00-15:00. Sugiero subir par level de 12 a 18kg."
- "2. **Plato del dia** lleva 78 ordenes (limite 80). Te recomiendo cerrarlo antes del proximo rush."
- "3. **Lucia Robles** llego a mesa 12 — es VIP y hoy es su cumpleaños segun nuestro CRM."
- Footer: timestamp 11px muted + iconos Copy 12 / Refresh 12

Mensaje 2 — Usuario (alineado der, max-width 60%):
- Bubble bg #18181B color white rounded 18px padding 12 16 font 14:
- "Cuanto me cuesta la falta de aguacate?"
- Timestamp derecho 11 muted

Mensaje 3 — Bot:
- "Si no subes el par level, mi proyeccion es:"
- Card embedded dentro de la bubble bg white border 1px #E7E5E4 rounded 12 padding 14:
  - Tabla mini 2 cols:
    - "Platos cancelados estimados" — "6 ordenes"
    - "Merma de complemento" — "1.2kg de guacamole preparado tirado"
    - "Costo de oportunidad" — "$840 MXN"
    - "Costo merma" — "$180 MXN"
  - Total destacado: "Impacto neto: -$1,020 MXN" Lexend 17 700 color #B9421E
- "El costo de reponer 6kg ahora es $1,440 MXN — ganas ~$480 MXN evitando la cancelacion."

Mensaje 4 — Usuario:
- "Aprueba la accion de aguacate. Para el plato del dia, recuerdamelo en 30 min."

Mensaje 5 — Bot con CARD DE ACCION EJECUTABLE:
- "Listo, ejecuto:"
- Card destacada bg rgba(217,83,42,0.05) border 2px solid #D9532A rounded 16 padding 20:
  - Header: icono CheckCircle2 emerald 20 + "Accion ejecutada · Aguacate par level 12 → 18kg"
  - Detalles list mini bullets:
    - "Notificado a Chef Eduardo via WhatsApp (entregado 14:22)"
    - "Pedido de reposicion creado a Sigma Alimentos (orden #SA-4827)"
    - "Entrega ETA: 14:45 · costo $1,440 MXN"
    - "Registrado en Action Ledger por Monica Salinas"
  - Mini banner emerald pill: "Aprobado por humano · trazable"
- "Para el plato del dia te aviso 14:35. ¿Algo mas?"

Mensaje 6 — Bot (sugerencia automatica):
- "Mientras tanto: ya que viste el ticket de Lucia Robles, ¿quieres que envie un saludo de cumpleaños con cortesia de postre por WhatsApp?"
- 3 chips de respuesta rapida: "Si, postre cortesia" bg terracota pill + "Si, pero sin postre" outline + "No"

Mensaje en escritura (typing indicator):
- Bubble pequena con 3 dots animados terracota

INPUT FOOTER (sticky bottom, bg white border-top 1px #E7E5E4 padding 18 24):
- Textarea expansible: bg #F8F6F3 rounded 16 padding 14 18 min-height 56 placeholder "Pregunta o pide una accion al co-piloto…"
- Toolbar abajo flex justify-between:
  - Izq: iconos Lucide 16px gap 12 muted (Paperclip, Mic, Image, BarChart3) + tag "Contexto: turno comida"
  - Der: boton "Enviar" gradient terracota pill icono Send 14 + atajo kbd "⌘ ↵" mini
- Sugerencias debajo (chips): "Como va el food cost?", "Genera prep list para cena", "Quien esta tarde con break?"

PANEL DERECHO — CONTEXTO + ACTION LEDGER (stack vertical gap 16):

Card 1 "Contexto del turno" (bg white rounded 16 padding 20):
- Titulo "Lo que el co-piloto sabe" 14 700 + icono Brain 14 terracota
- Lista mini 6 chips wrap:
  - "Sucursal: Roma Norte"
  - "Turno: comida (12:00-17:00)"
  - "Pronostico: 284 tickets"
  - "Run-rate: +9%"
  - "Inventario: 14 alertas"
  - "Reservas cena: 8 confirmadas"
- Link "Editar contexto" rosa-terracota

Card 2 "Action Ledger en vivo" (bg white rounded 16 padding 20 max-height 380 overflow-y):
- Header: "Hoy · 8 acciones" 14 700 + filter pill "Aprobadas" / "Ejecutadas" / "Rechazadas"
- 6 entries con dot color (emerald aprobado / amber pendiente / red rechazado / blue auto):
  - 14:22 ✓ emerald: "Subir par level aguacate 12→18kg · aprobado por Monica · ROI +$480"
  - 14:05 ✓ emerald: "Cerrar promo del lunes (caducada) · aprobado · sin impacto"
  - 13:48 ⏳ amber: "Reasignar staff: mover Luis a barra · esperando aprobacion"
  - 13:30 ✓ emerald: "Subir prep de guacamole 8→14kg · aprobado por Chef Eduardo"
  - 13:12 ✗ red: "Rechazado: ofrecer cortesia a queja online · razon: 'caso ya escalado'"
  - 12:45 ✓ blue (auto): "Auto-renovado pedido semanal de tortillas (Salvador Tortillas)"
- Cada row: dot + timestamp + texto + chevron derecho para drilldown
- Footer: link "Ver historial completo" terracota

Card 3 "Recomendaciones pendientes" (bg white rounded 16 padding 20):
- 3 cards mini stack:
  - Icono TrendingUp + "Pre-comprar mango cuando baje 18%" + chip "Sugerencia"
  - Icono Users + "Reasignar mesa 4 a Adriana (sobrecarga Carmen)" + chip "Operacion"
  - Icono MessageSquare + "Responder review 4.0★ de Yelp Roma" + chip "Reputacion"
- Cada una con boton mini "Abrir" outline pequeño

Debe sentirse como hablar con un sous-chef experto que tambien sabe leer datos. NO debe verse como ChatGPT vacio — TODO mensaje del bot tiene contexto operativo, numeros, y muchas veces una accion ejecutable con guardrails (aprobacion humana visible). Inspiracion: Linear AI, Notion AI con superpoderes de operacion.
```

---

## Prompt 4 — Forecast de Demanda

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de motor de demanda / forecast 7 dias para "Copiloto".
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.
Concepto: la unica pantalla donde el operador entiende el "porque" del pronostico, con drill por daypart y drivers visibles.

=== HEADER DE NAVEGACION (misma top bar 64px, "Forecast" activo) ===

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding 32px 40px) ===

HEADER:
- "Motor de Demanda" Lexend 26px 700
- Subtitulo: "Pronostico 7 dias por sucursal y daypart · MAPE actual 8.4% · objetivo <10%" Inter 14px color #71717A
- Derecha flex: date range "16-22 Mar 2026" + dropdown sucursal "Roma Norte" + boton "Re-entrenar modelo" outline pill terracota + boton "Exportar" outline

KPI HERO STRIP (4 cols grid gap 16 margin-bottom 24):
- Card 1 (bg white rounded 16 padding 22):
  - "MAPE 7d" 11 uppercase muted
  - "8.4%" Lexend 30 800 color #18181B
  - Badge "objetivo <10%" pill emerald 10
- Card 2: "Bias del modelo" + "+1.2%" 30 + badge "leve sobre-estimacion" amber
- Card 3: "Confianza promedio" + "92%" + sparkline mini
- Card 4: "Tickets pronosticados 7d" + "1,968" 30 + "+8% vs semana pasada" emerald

SECCION 1 — VISUALIZACION GRANDE (card bg white rounded 20 padding 32 margin-bottom 24):
- Header flex justify-between:
  - "Pronostico 7 dias · Roma Norte" Lexend 18 700
  - Tabs segmented pill: "Tickets" (activo) | "Revenue" | "Covers"
  - Toggle dayparts: "Todo el dia" / "Desayuno" / "Comida" / "Cena" (segmented control)
- Chart grande area + linea: 7 dias en eje X (Lun 16 → Dom 22)
  - Banda de confianza area gradient terracota suave (alto/bajo)
  - Linea solida terracota: prediccion media
  - Puntos diarios con tooltip mostrando "Mie 18 · 284 tickets ± 22"
  - Eje Y dual: tickets izq, revenue MXN der (lineas finas)
  - Anotaciones inline: "Lun 16 dia escolar" / "Vie 20 quincena (+15% historico)" / "Dom 22 lluvia esperada (-6%)"
- Leyenda inferior: dots y nombres + check toggle "Mostrar IC 80%"

SECCION 2 — DRIVERS DEL FORECAST (card bg white rounded 16 padding 28 margin-bottom 24):
- Titulo: "Que esta moviendo el pronostico" Lexend 16 700 + icono Sparkles azafran
- Grid 2 cols 60/40:

  Izquierda — Drivers ranking (top 6 features con peso):
  - Barra horizontal por driver con valor y signo:
    - "Quincena (vie 20)" barra terracota 92% + "+15%" badge
    - "Lluvia pronosticada (dom)" gris -64% + "-6%" badge red
    - "Promocion mole 2x1 mar 17" amber +48% + "+10%"
    - "Festivo escolar puente" amber +38% + "+8%"
    - "Eventos cercanos (concierto Polanco vie)" +28% + "+5%"
    - "Trend estacional mes" +12%
  - Cada barra: label izq + barra + badge der

  Derecha — Card insight IA (bg gradient suave terracota border 1px solid rgba(217,83,42,0.25) rounded 16 padding 20):
  - icono Sparkles 18 + "Insight del modelo"
  - "El driver mas fuerte esta semana es la quincena del viernes. Te sugiero **subir staff de cocina +1** y **prep de carnes +18%** para el dia 20."
  - 2 botones: "Aplicar al schedule" gradient terracota pill + "Ver detalle" outline

SECCION 3 — BREAKDOWN POR DAYPART (card bg white rounded 16 padding 28 margin-bottom 24):
- Titulo: "Distribucion por daypart" 16 700
- Grid 4 cols: Desayuno, Comida, Cena, Late night
  - Cada col: numero grande Lexend 26 + label uppercase + ring semicircular mostrando share del dia
  - Desayuno: "62 tickets" 22% (terracota claro)
  - Comida: "148 tickets" 52% (terracota oscuro destacado)
  - Cena: "61 tickets" 21%
  - Late night: "13 tickets" 5%
- Debajo: heatmap horizontal 14 dias x 4 dayparts con celdas colored intensity terracota mostrando volumen historico vs pronostico

SECCION 4 — OUTPUT INTEGRADO (card bg white rounded 16 padding 28):
- Titulo flex: "Lo que esto significa para tu operacion" 16 700 + chip "Pilar A: motor de demanda"
- Grid 3 cols cards mini:

  Card "Staffing sugerido":
  - Icono Users 22 terracota
  - "12 personas en piso vie 20" Lexend 18 700
  - Mini breakdown 4 lineas: "Cocina 5", "Meseros 4", "Barra 2", "Hostess 1"
  - Boton "Abrir schedule" outline terracota pill small

  Card "Par levels":
  - Icono Package 22
  - "18 SKUs ajustados" 18 700
  - Lista mini top 3 ajustes: "Aguacate 12→18 kg", "Cebolla 6→8 kg", "Mango 4→7 kg"
  - Boton "Abrir inventario" outline pill small

  Card "Prep list":
  - Icono ClipboardList 22
  - "Prep para 284 covers" 18 700
  - Mini: "Mise en place mole, guacamole en 3 batches, tortillas pre-cortadas"
  - Boton "Abrir prep" outline pill small

Debe verse como un cuadro de mando data-driven, no como un dashboard de KPIs vacios. El forecast es el corazon del sistema — todos los demas modulos dependen de el.
```

---

## Prompt 5 — Schedule de Staffing + Prep List

```
Layout: FULL-WIDTH (timeline horizontal + panel lateral, sin max-width)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de schedule sugerido + prep list para "Copiloto".
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.
Concepto: el forecast genera staffing y prep automaticamente — el manager edita y aprueba.

=== HEADER DE NAVEGACION (misma top bar 64px, "Schedule" activo) ===

=== TOOLBAR (bg white padding 16 32 border-bottom 1px #E7E5E4) ===
- Izquierda: "Schedule de la semana" Lexend 20 700 + badge "Generado por co-piloto" pill terracota pequeno con icono Sparkles 11
- Centro: navegacion fecha (Prev + "Semana 16-22 Mar 2026" 14 bold + Next + "Hoy" outline)
- Derecha: dropdown rol "Todos" + dropdown turno "Comida" + boton "+ Agregar turno manual" outline + boton "Publicar schedule" gradient terracota pill bold

=== CONTENIDO (fondo #F8F6F3 padding 24 flex sin wrapper) ===

Grid 70/30 gap 20:

PANEL IZQUIERDO — TIMELINE DE STAFFING (card bg white rounded 20 padding 24 overflow-x auto):

Header grilla:
- Columna izq sticky 220px lista de personas (avatar + nombre + rol)
- 7 columnas dias (Lun 16 — Dom 22) cada una 140px ancho
- Cada celda muestra turno asignado

Personas (8 filas):
1. Avatar "ER" terracota + "Eduardo Reyes" bold 13 + "Chef ejecutivo" 11 muted
2. Avatar "AS" + "Adriana Castillo" + "Hostess"
3. Avatar "LR" + "Luis Robles" + "Cocinero linea"
4. Avatar "CV" + "Carmen Velasco" + "Mesera senior"
5. Avatar "JN" + "Jose Nuñez" + "Mesero"
6. Avatar "MG" + "Maria Guerrero" + "Bartender"
7. Avatar "RP" + "Ricardo Paz" + "Cocinero prep"
8. Avatar "+ Agregar" dashed border outline

Turnos (rectangulos coloreados por daypart):
- Eduardo Reyes: Lun-Sab 10:00-19:00 (turno largo terracota)
- Adriana Castillo: Mar-Dom 12:00-17:00 (comida) + Vie-Sab 19:00-23:00 (cena)
- Luis Robles: Lun-Vie 11:00-17:00, Sab 17:00-23:00 (subraya badge "REASIGNADO POR IA" amber pill mini)
- Carmen Velasco: Mie-Dom 12:00-17:00 + 19:00-23:00 (doble turno destacado en azul)
- Cada turno: bg color rounded 6 padding 6 8 color blanco font 11 bold + dot color daypart + hover muestra "+1 hora overtime"

Visualizacion adicional debajo de cada dia: barra mini con conteo "8 personas" / "10 personas" segun pronostico vs disponibles, con tinte verde si coincide / amber si gap

Drag indicator visible: turno de "Luis Robles" en estado dragging con scale 1.06 rotate -2 + shadow

DRAWER LATERAL DERECHO (visible 380px abierto):
- Card bg white rounded 16 padding 20
- Header: avatar 64 "LR" terracota + "Luis Robles" Lexend 18 700 + "Cocinero linea · 3 anos" muted
- Tabs: "Detalle del turno" (activo) | "Stats" | "Disponibilidad"
- Detalle:
  - "Sabado 21 Mar · 17:00 - 23:00" bold 14
  - "Sucursal Roma Norte · Estacion: Linea fria" 12 muted
  - Badge "Cambiado por co-piloto" amber pill + "Razon: pronostico de cena +14%"
- Pestañas inferiores mini:
  - "Horas esta semana: 38h" + bar al 95% del max
  - "Costo semanal: $4,920 MXN"
  - "Conflicto: ninguno"
- Botones full: "Aprobar cambio" gradient terracota pill + "Rechazar y reasignar" outline + "Notificar via WhatsApp" outline azul

PANEL DERECHO (stack vertical 20 gap):

Card 1 "Coverage vs pronostico" (bg white rounded 16 padding 22):
- Titulo bold 14 + icono LineChart 14
- Mini chart por dia: barras dobles (pronostico tickets vs personas asignadas)
- Estatus por dia: 5 dias verde "OK", 1 amber "gap 1 persona vie tarde", 1 verde

Card 2 "Costos del schedule" (bg white rounded 16 padding 22):
- Titulo + total grande "$54,820 MXN" Lexend 22 800
- 4 barras horizontales: cocina 38%, meseros 32%, barra 12%, hostess 8%, overtime 10%
- Footer: "Labor % proyectado: 22.4% (cap meta 25%)"

Card 3 "Prep List por dia" (bg white rounded 16 padding 22):
- Titulo + chip "Generada por co-piloto"
- Lista de dias accordion estilo:
  - "Hoy mie 18 — 12 items" expandido:
    - Checkbox + "Mise en place mole · 14 ordenes esperadas · Eduardo"
    - Checkbox + "Cortar 4kg cebolla morada · Ricardo"
    - Checkbox + "Marinar 6kg carne (cochinita) · Eduardo"
    - Checkbox + "Preparar 3 batches guacamole (sin ramper aun) · Luis"
    - Checkbox + "Revisar fermentacion salsa macha · Eduardo"
  - "Jue 19 — 9 items" collapsed
  - "Vie 20 — 18 items (alto volumen)" collapsed con badge amber

Card 4 "WhatsApp staff" (bg white rounded 16 padding 22):
- Titulo + icono MessageCircle verde
- "Cuando publiques, Copiloto enviara cada turno por WhatsApp a cada miembro y registrara confirmacion."
- Boton "Probar envio" outline verde

Debe sentirse como gantt + scheduler, con la sensacion clara de que el sistema sugiere y el humano aprueba.
```

---

## Prompt 6 — Inventario + Par Levels + Mermas

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de inventario y par levels para "Copiloto".
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.

=== HEADER DE NAVEGACION (misma top bar 64px, "Inventario" activo) ===

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding 32px 40px) ===

HEADER:
- "Inventario · Roma Norte" Lexend 26 700
- Subtitulo: "142 SKUs activos · 8 alertas · merma del mes 2.1% (objetivo 2.5%)" 14 muted
- Derecha flex: boton "Conteo fisico" outline + boton "Importar factura" outline con icono Upload + boton "+ SKU" gradient terracota pill

KPI STRIP (4 cards grid 4 gap 20 margin-bottom 24):
- Card "Valor del inventario": "$184,720 MXN" 30 800 + delta "+$12K vs mes pasado" terracota chip
- Card "Merma del mes": "2.1%" 30 800 + sparkline emerald descendente + badge "-0.4 pp vs Q4" emerald
- Card "Stockouts evitados": "14" 30 800 + label "este mes · accion del co-piloto"
- Card "SKUs en alerta": "8" 30 800 + badge "5 par bajo · 3 caducando" amber

BARRA FILTROS (card bg white rounded 16 padding 20 margin-bottom 20):
- Fila 1: input search full + chips status: "Todos (142)" activo / "Bajo par (5)" / "Caducando (3)" / "Excedente (12)" / "OK (122)"
- Fila 2 flex gap 8: dropdown categoria (Proteinas, Verduras, Lacteos...) + dropdown supplier + dropdown "Caduca antes de..." date + chip "Solo alta rotacion"
- Derecha: toggle Grid/Tabla (tabla activa)

TABLA DE INVENTARIO (card bg white rounded 16 overflow hidden):

HEADER tabla (bg #F8F6F3 padding 14 20 font 11 uppercase letter-spacing 0.08 muted):
- Checkbox + SKU + Categoria + Stock actual + Par level (sugerido) + Costo unitario + Supplier + Ultima entrada + Caducidad + Estado + Acciones

12 filas con datos reales:
1. [ ] Aguacate Hass · Verduras · "10.4 kg" + barra 58% terracota + "Par: 12 → 18 kg" badge amber con sparkles · $58/kg · "Sigma Alimentos" · "ayer" · "+5d" verde · badge "BAJO PAR" amber · menu dots
2. [ ] Tortilla maiz amarillo (kg) · Granos · "24 kg" + barra 85% emerald · Par 30 · $14/kg · "Salvador Tortillas" · "hoy 6am" · "+1d" terracota · "OK" verde
3. [ ] Carne cochinita pibil · Proteinas · "8 kg" + barra 88% · Par 9 · $185/kg · "Sigma" · "ayer" · "+3d" · "OK"
4. [ ] Mango ataulfo · Frutas · "3.2 kg" + barra 22% rojo · Par 7 · $42/kg · "Central de Abasto" · "lunes" · "+2d" amber · "BAJO PAR + CADUCA" rojo
5. [ ] Cebolla blanca · Verduras · "14 kg" + barra 78% · Par 18 · $18/kg · "Sigma" · "ayer" · "+7d" · "OK"
6. [ ] Queso oaxaca · Lacteos · "2.8 kg" + barra 14% rojo · Par 8 · $185/kg · "Lacteos Polanco" · "viernes" · "+10d" · "BAJO PAR" amber
7. [ ] Tomate riñon · Verduras · "22 kg" + barra 112% azul · Par 16 · $24/kg · "Central de Abasto" · "ayer" · "+3d" amber · "EXCEDENTE" azul (sugerencia: usar en especiales)
8. [ ] Crema acida 1L · Lacteos · "18 L" + barra 75% · Par 22 · $48/L · "Lacteos Polanco" · "ayer" · "+7d" · "OK"
9. [ ] Chile habanero · Verduras · "1.4 kg" + barra 48% · Par 3 · $96/kg · "Central" · "ayer" · "+5d" · "OK"
10. [ ] Cilantro · Hierbas · "0.8 kg" + barra 32% amber · Par 2 · $32/kg · "Central" · "lunes" · "+2d" amber · "BAJO PAR"

Cada row con etiqueta visual de alerta y boton mini "Pedir" pill terracota cuando aplique
Hover: bg #FAF9F7

Barra seleccion masiva sticky abajo (bg #18181B color white rounded 12 padding 12 20):
- "3 seleccionados" + botones: "Crear pedido a supplier" + "Marcar conteo fisico" + "Ajustar par level" + "Exportar"

SECCION INFERIOR — ALERTAS DEL CO-PILOTO (card bg gradient suave terracota border 1px rgba(217,83,42,0.25) rounded 20 padding 24 margin-top 24):
- Header: icono Sparkles + "El co-piloto vio 4 cosas en tu inventario hoy"
- 4 alertas rows:
  - "Aguacate va a quedarte corto entre 13-15h" + accion "Subir par + crear pedido" terracota pill
  - "Mango caduca en 2 dias y vas al 22% del par — meto promo mango+chamoy en menu del dia?" + accion amber
  - "Tomate al 112% del par — sugiero entrar como especial agua de tomate" + accion azul
  - "Sigma subio precio cebolla 8% sin avisar — comparar con Central de Abasto" + accion gris

Debe verse como un sistema que ve el inventario antes que tu lo veas, no como spreadsheet.
```

---

## Prompt 7 — Facturas OCR + Suppliers

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de captura de facturas OCR + suppliers para "Copiloto".
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.
Concepto: subes la foto/PDF de la factura del proveedor y el co-piloto la lee, valida CFDI, actualiza costos en el sistema.

=== HEADER DE NAVEGACION (misma top bar 64px, "Inventario" activo, subtab "Facturas") ===

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding 32px 40px) ===

Subtabs nav (margin-bottom 20 bg white rounded 12 padding 6 8 inline-flex):
- "SKUs" / "Facturas (5 pendientes)" activo / "Suppliers" / "Pedidos"
- Activo: bg rgba(217,83,42,0.1) color #D9532A bold

HEADER:
- "Facturas y suppliers" Lexend 24 700
- "5 facturas por validar · 12 proveedores activos · costo promedio CFDI 100% al dia" 14 muted
- Derecha: boton "+ Subir factura" gradient terracota pill icono Upload + dropdown "Esta semana"

PANEL IZQ/DER — split 60/40 (grid gap 24):

IZQUIERDA — LISTA DE FACTURAS (card bg white rounded 16 padding 0 overflow hidden):
- Header lista padding 18 24 border-bottom: "5 facturas por revisar" 14 bold + chip "OCR pendiente" amber pequeno

5 facturas cards stack (cada una padding 20 hover bg #FAF9F7 cursor pointer, primera SELECCIONADA con bg rgba(217,83,42,0.05) border-left 3 solid terracota):

Card 1 (seleccionada):
- Flex row: Thumbnail PDF 64x80 placeholder con icono FileText terracota + info
- "Sigma Alimentos — Pedido SA-4827" bold 14
- "Recibido por Eduardo hace 18 min · 14 SKUs detectados" 12 muted
- Badge "OCR completo · revisar" amber pill 11
- Mini stats inline: "$3,820 MXN" + "CFDI 4.0 validado ✓" + "14 SKUs"

Card 2: "Lacteos Polanco — Folio LP-2284" + "Ayer 8:32 am" + "$1,640 MXN" + badge "DUDA EN 2 LINEAS" red
Card 3: "Central de Abasto — Manual" + "Hace 2 dias" + "$2,180 MXN" + badge "FALTA CFDI" amber
Card 4: "Salvador Tortillas — Folio ST-9082" + "Hace 3 dias" + "$840 MXN" + badge "OK · listo" verde
Card 5: "Pesqueria Roma — Folio PR-441" + "Hace 4 dias" + "$2,420 MXN" + badge "VALIDADA" emerald

DERECHA — PANEL DETALLE OCR (card bg white rounded 16 padding 28):
- Header: icono FileText terracota + "Sigma Alimentos · SA-4827" Lexend 18 700 + badge "OCR · 96% confianza" emerald pill mini
- Subtitulo: "Subida por Eduardo · CFDI XML adjunto · IVA 16% incluido" 12 muted

Grid 2 cols: 

  Izq — Preview de factura (thumbnail PDF rendered grande 280x340 con highlights amarillos sobre las lineas detectadas):
  - Esquina logo "Sigma Alimentos"
  - Lineas OCR resaltadas con boxes amarillo translucido
  - Footer: "Pagina 1 de 1 · zoom 100%" + iconos ZoomIn / ZoomOut

  Der — Lineas detectadas (lista editable):
  Titulo: "14 lineas detectadas — revisa diferencias" 14 700
  Lista de items (cada uno card bg #F8F6F3 rounded 10 padding 12):
    - "Aguacate Hass · 18 kg · $58/kg · $1,044 MXN" + icono check emerald 14
      Sub: "Match con SKU 'Aguacate Hass' en sistema (par anterior 12kg)"
    - "Cebolla blanca · 8 kg · $20/kg · $160 MXN" + icono AlertCircle amber 14
      Sub: "Diferencia de precio: en sistema esta $18, factura sube 11% (revisar)"
      Mini botones: "Aceptar nuevo precio" pill amber + "Mantener anterior" outline
    - "Tomate riñon · 14 kg · $24 · $336" + check emerald
    - "Crema acida 1L · 12 L · $48 · $576" + check emerald
    - "Chile habanero · 2 kg · $96 · $192" + check
    - "+ 9 lineas mas..." link expand muted

Mini total destacado:
  - "Subtotal: $3,294 MXN"
  - "IVA 16%: $526.96"
  - "TOTAL: $3,820.96 MXN" Lexend 20 800 color #D9532A

Acciones footer flex justify-between:
  - Izq: "Rechazar" outline rojo + "Pedir aclaracion supplier" outline azul (envia WhatsApp)
  - Der: "Guardar y aprobar" gradient terracota pill bold icono Check

SECCION SUPPLIERS (debajo, card bg white rounded 16 padding 24 margin-top 24):
- Titulo: "Suppliers activos" 16 700 + link "Ver todos"
- Grid 4 cols mini cards proveedores:
  - "Sigma Alimentos" + categoria "Verduras y proteinas" + "14 SKUs · $48K/mes" + estrella rating 4.6 + dot verde "WhatsApp activo"
  - "Lacteos Polanco" + "Lacteos" + "8 SKUs · $12K/mes" + 4.2 + verde
  - "Salvador Tortillas" + "Granos" + "3 SKUs · $4K/mes" + 4.9 + verde
  - "Central de Abasto" + "Frutas y verduras" + "22 SKUs · $32K/mes" + 4.3 + amber (no responde WhatsApp)

Debe verse como un escaneo magico que reemplaza la captura manual.
```

---

## Prompt 8 — Recetas + Costeo Dinamico

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de recetas con costeo dinamico para "Copiloto".
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.
Concepto: cada receta tiene food cost calculado en tiempo real desde las facturas — si sube el aguacate, el guacamole sube y el sistema avisa.

=== HEADER DE NAVEGACION (misma top bar 64px, "Recetas" activo) ===

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding 32px 40px) ===

HEADER:
- "Recetas y costeo dinamico" Lexend 24 700
- "48 platos activos · food cost promedio 28.4% · 3 platos en alerta de margen" 14 muted
- Derecha: boton "+ Nueva receta" gradient terracota pill + boton "Re-calcular todo" outline icono RefreshCw

LAYOUT SPLIT 38/62 (grid gap 24):

IZQUIERDA — LISTA DE RECETAS (card bg white rounded 16 padding 0 overflow hidden max-height 760 overflow-y):

Filtros header padding 18 24:
- Input search "Buscar receta..."
- Chips: "Todas (48)" activo / "Alerta (3)" / "Bestsellers (8)" / "Margen alto (12)"
- Toggle "Solo activas"

Lista con 12 cards stack (cada uno padding 16 20 cursor pointer hover bg #FAF9F7):

Card 1 SELECCIONADA (bg rgba(217,83,42,0.05) border-left 3 solid):
- Thumbnail mini foto 48x48 rounded del platillo
- "Guacamole tradicional" bold 14
- 11 muted: "Entrada · 348 ordenes/mes"
- Mini stats inline:
  - Chip "Food cost 32%" bg rgba(245,158,11,0.12) color #92400E (alerta)
  - Chip "Margen 68%" emerald
- Trend bar mini horizontal

Cards 2-12 (variando):
- "Tacos al pastor (orden 3 pz)" · "Plato fuerte" · FC 26% verde · Margen 74% · 482 ordenes
- "Mole poblano con pollo" · "Plato fuerte" · FC 24% verde · Margen 76% · 218 ordenes
- "Cochinita pibil torta" · FC 30% verde · 142 ordenes
- "Aguachile verde" · FC 38% RED alerta · 84 ordenes (camaron subio 22%)
- "Quesadillas flor de calabaza" · FC 22% verde · 96 ordenes
- "Pozole rojo" · FC 28% verde · 64 ordenes
- "Mezcal artesanal copa" · Bebida · FC 18% verde · 248 copas
- "Margarita clasica" · FC 22% · 168 copas
- "Cafe de olla" · Bebida · FC 12% verde · 412 tazas
- "Flan napolitano" · Postre · FC 18% verde · 96 platos
- "Cheesecake mango" · Postre · FC 28% verde · 64 platos

Cada card con dot color en margen indicador

DERECHA — DETALLE DE RECETA SELECCIONADA (stack vertical cards):

Card 1 — Header del platillo (bg white rounded 20 padding 28):
- Flex row: thumbnail grande 96x96 rounded + info
  - "Guacamole tradicional" Lexend 26 700
  - Badges: "Entrada" pill terracota + "Sin gluten" verde + "Vegetariano" verde
- Stats grid 4 cols margin-top 16:
  - "Precio venta: $148 MXN" 18 700
  - "Costo unitario: $47 MXN" 18 700
  - "Margen unitario: $101 MXN (68%)" emerald 18 700
  - "Ordenes/mes: 348" 18 700

Card 2 — Composicion (bg white rounded 16 padding 24):
- Titulo: "Ingredientes y proporciones" 16 700 + boton mini "Editar" outline
- Tabla mini 5 cols: Ingrediente | Cantidad | Costo unitario | Costo en receta | % del costo total

  Filas (con barra de % visual):
  - "Aguacate Hass" · "180 g" · "$58/kg" · "$10.44" · 22% (barra terracota) + flecha up "↑8% vs mes pasado" mini red badge
  - "Cebolla blanca picada" · "30 g" · "$20/kg" · "$0.60" · 1%
  - "Cilantro fresco" · "5 g" · "$32/kg" · "$0.16" · 0.3%
  - "Chile serrano" · "8 g" · "$45/kg" · "$0.36" · 1%
  - "Limon (jugo)" · "15 ml" · "$32/L" · "$0.48" · 1%
  - "Tomate" · "40 g" · "$24/kg" · "$0.96" · 2%
  - "Totopos premium" · "60 g" · "$98/kg" · "$5.88" · 12%
  - "Mano de obra (8 min cocinero)" · "—" · "—" · "$28.50" · 60% (barra mas larga gris)
  - "Empaque/desperdicio (8%)" · "—" · "—" · "$0.32" · 1%

Total: "Costo total receta: $47.10 MXN" Lexend 20 800

Card 3 — Alerta de costo (bg rgba(245,158,11,0.06) border-left 4 solid amber rounded 16 padding 20):
- Icono AlertTriangle 18 amber + "El food cost subio 4 pp en 30 dias"
- "Causa principal: aguacate subio 18% desde febrero (de $49 a $58 /kg). El costo de receta pasaba de $44.10 a $47.10."
- 3 sugerencias del co-piloto:
  - "Reducir gramaje aguacate de 180g a 160g (mantener perfil) — ahorro $1.16 por orden"
  - "Subir precio venta a $158 MXN (+6%) — competencia local Roma esta entre $145-165"
  - "Cambiar provider: Central de Abasto cotiza $52/kg con minimo 20kg semanal"
- Botones inline: "Aplicar sugerencia 1" outline + "Ver competencia" link + "Reformular" outline terracota

Card 4 — Performance del platillo (bg white rounded 16 padding 24):
- Titulo + chart mini de ordenes ultimas 12 semanas barras terracota + linea margen
- "Conversion en mesa: 38% de mesas ordenan guacamole"
- "Co-ocurrencia top: con mezcal artesanal copa (62% de las veces)"
- "Tiempo prep estimado: 6 min · Eduardo lo prepara en 4 min"

Card 5 — Historial de cambios (bg white rounded 16 padding 24):
- "Cambios de costo y receta" 14 700
- Timeline 4 eventos:
  - "Hace 2 dias · costo subio $0.84 por aguacate +5%" terracota
  - "Hace 14 dias · costo subio $1.20 por aguacate +8%" amber
  - "Hace 1 mes · precio venta $138 → $148 (+7%)" emerald
  - "Hace 3 meses · cambio cebolla blanca → morada (rejection)" gris

Debe sentirse como un libro de recetas inteligente, no como una calculadora.
```

---

## Prompt 9 — CRM de Huespedes + Segments

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de CRM de huespedes para "Copiloto".
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.
Concepto: el dato del huesped es del restaurante. NO competimos con OpenTable — potenciamos canales propios del operador.

=== HEADER DE NAVEGACION (misma top bar 64px, "Huespedes" activo) ===

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding 32px 40px) ===

HEADER:
- "Huespedes" Lexend 24 700
- "1,842 huespedes en CRM · 412 VIP · 184 en riesgo de churn · LTV promedio $4,820" 14 muted
- Derecha flex: boton "Importar contactos" outline + boton "+ Nuevo huesped" gradient terracota pill + boton "Crear campaña" outline azafran

KPI STRIP 4 cols margin-bottom 24:
- Card "VIPs activos": "412" Lexend 30 800 + "+24 este mes" emerald chip
- Card "En riesgo de churn": "184" 30 + "Sin visita >60 dias" amber
- Card "Frecuencia promedio": "2.4 visitas/mes" 30 + sparkline emerald
- Card "Ticket promedio VIP": "$682 MXN" 30 + "2.4x el promedio general"

SECCION SEGMENTS (card bg white rounded 16 padding 24 margin-bottom 24):
- Titulo: "Segmentos automaticos" 16 700 + chip "Calculado por co-piloto"
- Grid 4 cols cards segmentos (cada una clickeable hover):

  Segment 1 (bg gradient terracota suave, rounded 14, padding 20):
  - Icono Crown 20 terracota + "VIPs Embajadores" 14 700
  - "84 huespedes" 24 800
  - "Visita >3x/mes · LTV >$8K · NPS 9+"
  - "Sugerencia: cortesia postre proxima visita"

  Segment 2 (bg gradient suave azafran):
  - Icono UserPlus + "Nuevos prometedores" + "162 huespedes"
  - "1-2 visitas, ticket alto"
  - "Sugerencia: invitar a brunch sabado"

  Segment 3 (bg gradient rojo suave):
  - Icono AlertCircle + "En riesgo de churn" + "184"
  - "Sin visita 60-90 dias"
  - "Sugerencia: recover con 20% off cena"

  Segment 4 (bg gradient azul suave):
  - Icono Heart + "Foodies del fin de semana" + "96"
  - "Solo visita vie-dom · ticket alto"
  - "Sugerencia: pre-venta cata mezcal"

BARRA FILTROS + TABLA (card bg white rounded 16 padding 0 overflow hidden):

Header padding 20 24 flex:
- Izq: input search "Buscar nombre, email, telefono..." + filtros pill chips "Segmento" / "Frecuencia" / "Ultima visita" / "Canal" / "Source"
- Der: sort "Mas frecuentes" + toggle vista tabla/cards (tabla activa)

Tabla:
- Header (bg #F8F6F3 padding 12 20 font 11 uppercase letter-spacing 0.08 muted):
  Checkbox + Huesped + Segmento + Visitas (12m) + LTV · ticket prom · Ultima visita · Preferencias · Acciones

12 filas con datos:
1. [ ] Avatar "LR" terracota + "Lucia Robles" bold + "+52 55 8284 1248 · lucia.robles@email.com" 11 muted | Badge "VIP" terracota | "28 visitas" | "$18,420 · $658 promedio" | "Hoy (mesa 12)" emerald dot pulsante | chips "Vegetariana · Sin gluten" | menu dots
2. [ ] "Ricardo Mendoza" · "+52 55..." | "Foodie weekend" | "14 · $9,820 · $702" | "Hace 5 dias" | "Mezcal artesanal" | dots
3. [ ] "Andrea Toledo" · | "Nuevo prometedor" | "2 · $1,420 · $710" | "Hace 8 dias" | "—" | dots
4. [ ] "Jose Maria Pacheco" · | "VIP Embajador" | "34 · $24,180 · $712" | "Hace 12 dias" | "Cumple 18 Abr · ama cochinita" | dots
5. [ ] "Sofia Rangel" · | "Churn riesgo" | "8 · $4,620 · $578" | "Hace 84 dias" amber | "Sin gluten" | dots
6. [ ] "Carlos Velez" · | "VIP" | "22 · $14,820" | "Hace 18 dias" | "Mole · sin picante" | dots
7. [ ] "Maria Esther Lugo" · | "Churn riesgo" | "6 · $3,240" | "Hace 96 dias" red | "Vegetariana" | dots
8. [ ] "Daniel Saavedra" · | "Foodie weekend" | "18 · $11,280" | "Hace 6 dias" | "Cervezas artesanales" | dots
9. [ ] "Patricia Cano" · | "Nuevo" | "1 · $580" | "Hace 4 dias" | "—" | dots
10. [ ] "Luis Treviño" · | "VIP Embajador" | "42 · $28,920" | "Hace 8 dias" | "Aniversario 12 May" | dots

Cada row hover bg #FAF9F7. Click → drawer perfil 360.

DRAWER LATERAL DERECHO (visible 460 abierto sobre la tabla, position fixed right):

Drawer "Lucia Robles" (overlay):
- Boton X + header avatar 88x88 + "Lucia Robles" Lexend 22 700 + badge "VIP Embajadora" terracota + "Cumple HOY 🎉" amber pill
- Subtitulo: "Cliente desde 2024 · 28 visitas · LTV $18,420"
- Tabs: "Resumen" (activo) · "Visitas" · "Preferencias" · "Comunicacion" · "Notas"

Tab Resumen:
- Stats grid 2x2:
  - "$658 ticket promedio" + barra del avg
  - "Frecuencia: 2.3 visitas/mes" + dot emerald
  - "Vegetariana confirmada" + "Sin gluten"
  - "NPS dado: 9/10" + 5 stars
- Mini timeline ultimas 5 visitas con mini fechas y montos
- Recomendaciones del co-piloto card terracota suave:
  - "🎂 Hoy es su cumple, esta en mesa 12. Enviar saludo + cortesia postre vegano (flan napolitano variante)?"
  - 2 botones: "Enviar saludo WhatsApp" verde + "Marcar visto" outline
- Card "Plato favorito": "Mole poblano (vegetariano)" + "Ordeno 14 veces"

Debe sentirse como CRM Apple Cards-style — no como una tabla de Excel.
```

---

## Prompt 10 — Campañas WhatsApp con Guardrails

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de campañas WhatsApp con guardrails para "Copiloto".
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.
Concepto: el restaurante envia campañas a sus huespedes con plantillas pre-aprobadas y limites estrictos para no quemar el canal.

=== HEADER DE NAVEGACION (misma top bar 64px, "Huespedes" activo, subtab "Campañas") ===

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding 32px 40px) ===

Subtabs nav inline: "Huespedes" / "Segments" / "Campañas (3 activas)" activo / "Reviews"

HEADER:
- "Campañas WhatsApp" Lexend 24 700
- "3 activas · 12 enviadas este mes · 38% tasa de apertura · 12% recover de no-show" 14 muted
- Derecha: boton "Plantillas WBA" outline + boton "+ Nueva campaña" gradient terracota pill

CARD GUARDRAILS (bg white rounded 16 padding 24 margin-bottom 24 border 1px solid #E7E5E4):
- Header: icono ShieldCheck terracota 20 + "Limites activos · proteccion del canal" 14 700
- Grid 4 cols:
  - "Frecuencia max por huesped: **1 mensaje / 7 dias**" + barra "uso esta semana 38%"
  - "Horario permitido: 10:00-20:00 · Lun-Sab" + dot verde
  - "Opt-out automatico si responde 'stop'" + check
  - "Plantillas WBA aprobadas: 6" + chip verde
- Mini insight: "El co-piloto bloqueo 12 envios la semana pasada por exceso de frecuencia"

KPI STRIP 4 cols margin-bottom 24:
- "Mensajes enviados (mes)": "1,420" 30 800
- "Tasa de apertura": "38%" 30 + sparkline emerald
- "Tasa de respuesta": "14%" 30 + label "industria 8%"
- "Revenue atribuido": "$48,720 MXN" 30 800 azul

CAMPAÑAS ACTIVAS (cards stack gap 16):

CARD 1 (bg white rounded 16 padding 24 border-left 4 solid terracota — campaña en curso):
- Header flex justify-between:
  - Izq: badge "EN CURSO" pulsante terracota pill + "Cumpleañeros · 18 Mar" Lexend 17 700
  - Der: dropdown "Acciones" + boton "Pausar" outline mini
- Subtitulo: "Saludos personalizados + cortesia postre para 24 huespedes con cumpleaños esta semana"
- Grid 4 cols stats:
  - "Audiencia: 24 huespedes" 18 700
  - "Enviados hoy: 18 / 24" + bar 75%
  - "Apertura: 88% (16 leidos)"
  - "Respondieron: 6 (4 ya confirmaron mesa)"
- Preview de mensaje (bubble verde WhatsApp style mini bg #DCF8C6 padding 12 rounded 18 max-width 380):
  - "🎂 Hola Lucia! Hoy es tu dia y queremos celebrarlo contigo. Pasate por **La Cocina de Doña Mari Roma Norte** y nuestro chef te tendra un flan napolitano de cortesia. Te apartamos mesa para hoy a las 14:30?"
  - "Doña Mari · 12:14 · ✓✓ leido"
- Footer flex: link "Ver respuestas (6)" + link "Personalizar plantilla" + chip "Plantilla WBA: birthday_dineout v3"

CARD 2 (border-left amber, OPT-IN PENDIENTE):
- Badge "SCHEDULED" amber pill + "Recover churn — 60d sin visita"
- "Audiencia: 184 huespedes · sale el sab 22 Mar 11:00"
- Mini preview: "Hola Maria, te extrañamos! Esta semana sacamos un pozole nuevo que creemos que te va a gustar — ¿reservamos mesa? 20% off para ti."
- "El co-piloto revisara antes de enviar — confirmacion solicitada a Monica"
- Botones: "Revisar campaña" outline + "Aprobar envio" gradient terracota pill

CARD 3 (border-left azul, COMPLETADA):
- Badge "COMPLETADA" azul + "Aniversario fundacion · 1 Mar"
- "412 enviados · 86% apertura · 24 reservas atribuidas · +$18,420 MXN revenue"
- Boton "Ver reporte completo" outline

PANEL LATERAL — PLANTILLAS WBA APROBADAS (card bg white rounded 16 padding 24 margin-top 24):
- Titulo: "Plantillas Meta WBA aprobadas" 16 700 + boton "+ Solicitar nueva" outline mini
- Tabla mini 5 plantillas:
  - "birthday_dineout v3" · Marketing · Aprobada 2 Feb · Idioma: es_MX · "Uso: 248 envios"
  - "churn_recover_v2" · Marketing · "Uso: 184 esperados"
  - "reservation_confirm_v5" · Utility · "Uso: 1,242 envios" + chip "automatica del agente"
  - "noshow_recover_v1" · Utility · "Uso: 38 envios"
  - "review_request_v2" · Marketing · "Uso: 412 envios"
- Cada row con badges "Approved" emerald + "Auto-rate-limited" amber + "Multi-idioma" gris

Debe sentirse como una herramienta seria — no spam barato — con limites visibles que protegen la relacion con el huesped.
```

---

## Prompt 11 — Reservaciones + Waitlist + No-shows

```
Layout: FULL-WIDTH (timeline reservas + panel waitlist, sin max-width)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de reservaciones para "Copiloto" — incluye no-shows con recover via WhatsApp.
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.

=== HEADER DE NAVEGACION (misma top bar 64px, "Reservaciones" — agregalo a la nav de Prompt 2) ===

=== TOOLBAR (bg white padding 14 32 border-bottom 1px #E7E5E4) ===
- Izquierda: "Reservaciones — Roma Norte" Lexend 20 700 + badge "8 confirmadas + 3 waitlist hoy" pill terracota mini
- Centro: navegacion fecha (Prev + "Miercoles 18 Mar 2026 · CENA" bold 14 + Next + "Hoy" outline)
- Derecha: toggle vista "Hoy" / "Semana" / "Mapa de mesas" + dropdown sucursal + boton "+ Nueva reserva" gradient terracota pill

=== CONTENIDO (fondo #F8F6F3 padding 24 flex sin wrapper) ===

Grid 65/35 gap 20:

PANEL IZQUIERDO — TIMELINE DE LA NOCHE (card bg white rounded 20 padding 24 overflow auto):

Header: "Cena · 19:00 - 23:30" 16 700 + filtros pill mini "Todas" "VIP" "Grupos" "Nuevos"

Timeline horizontal de slots cada 30 min (19:00, 19:30, 20:00... hasta 23:30):
- Eje horizontal con hora arriba
- Filas: cada mesa del restaurante (Mesa 1, 2, 4, 6, 8, 12, etc., 14 mesas en total)
- Bloques de reservacion sobre el timeline (rectangulos color):

Reservaciones (12 visibles):
- 19:00-21:00 Mesa 4: "Ricardo Mendoza · 2 personas · Foodie weekend" bg terracota pill rounded 8
- 19:30-21:30 Mesa 12: "Lucia Robles · 4 personas · VIP · CUMPLEAÑOS HOY" bg gradient terracota destacado + icono Crown azafran 14 + badge "🎂"
- 20:00-22:00 Mesa 6: "Andrea Toledo · 2 personas · NUEVO" bg azul claro
- 20:00-22:30 Mesa 8: "Familia Saavedra · 6 personas · Grupo" bg purpura
- 20:30-22:00 Mesa 1: "Carlos Velez · 2 personas" bg gris
- 21:00-23:00 Mesa 14: "Patricia Cano · 8 personas · Cumpleaños · Grupo" bg amber + icono PartyPopper
- 21:00-22:30 Mesa 2: "Walk-in expected" outline dashed gris (slot bloqueado)
- 21:30-23:30 Mesa 10: "Daniel Saavedra · 4 · VIP" bg terracota
- 22:00-23:30 Mesa 4: (segunda vuelta) "Sin reservar — disponible" outline verde dashed

Indicadores especiales:
- Mesa con cumpleaños tiene un icono PartyPopper amber inline
- Reservas VIP con border 2 solid azafran
- Grupos grandes (>5) con badge "GRUPO 6+" amber pill

Stats footer del timeline:
- "Ocupacion proyectada: 84% (12 mesas en uso vs 14 totales)"
- "Covers totales noche: 44 personas"
- "Revenue proyectado: $32,480 MXN (basado en ticket promedio $738)"
- "No-shows historicos jueves: 8% (estimado: ~3-4 no-shows)"

DERECHA — STACK VERTICAL:

Card 1 — Waitlist + walk-ins (bg white rounded 16 padding 22):
- Header: "Waitlist · 3 esperando" 16 700 + boton "+ Agregar" outline mini
- 3 items con timer countdown:
  - Avatar inicial + "Sebastian Lopez · 2 personas" bold + "Espera 14 min" badge amber con icono Clock
  - Mini: "Pidio mesa para fumadores · al telefono 4 min" 11 muted + boton mini "Sentar mesa 4" terracota pill
  - "Andrea Pizano · 4 personas" + "Espera 6 min" + "Hostess Adriana anoto"
  - "Walk-in pareja" + "Espera 2 min" + chip "sin telefono"
- ETA promedio: "Tiempo proximo cupo: 12 min en mesa 1"

Card 2 — No-shows + Recovery (bg white rounded 16 padding 22):
- Header: icono UserMinus 18 amber + "No-shows recientes" 16 700
- Mini stats: "Esta semana: 4 no-shows · 1 recuperado (25% recover)"
- Lista 3 items:
  - "Pablo Garrido · jueves cena · 2 personas · Sin aviso" badge red "NO-SHOW"
    - Mini accion: "Enviado WhatsApp 'Te esperabamos, te invitamos copa la proxima' · sin respuesta hace 22h" muted
  - "Familia Reyes · sabado · 5 personas" badge red
    - "Recuperado: confirmo nueva fecha sabado proximo via WhatsApp" emerald check
  - "Andrea Mireles · domingo · 3 personas · Cancelo 2 hr antes" badge amber "CANCEL"

Card 3 — Bot FOH (agent) — Reservas entrantes (bg white rounded 16 padding 22):
- Header: icono Bot 18 verde + "Agente WhatsApp · ultimas conversaciones"
- 4 mini chats:
  - "Adriana Hidalgo: 'Hola, mesa para 4 vie 20'" → "Bot: confirmado vie 20 20:30 mesa 6 ✓"
  - "Roberto N: 'Tienen menu vegano?'" → bot respondio + envio menu PDF
  - "Anonimo: 'Cuanto cuesta el aguachile?'" → bot $245 + foto
  - "Carla L: 'Cancelo la de hoy 21:30'" → bot procesa cancelacion + ofrece reagendar

Footer: link "Ver todas las conversaciones del agente" + chip "382 reservas via bot este mes (+22%)"

Card 4 — KPIs de la noche (bg white rounded 16 padding 22):
- Title 14 700
- Mini grid 2x2:
  - "Tasa de no-show: 6%" + delta "-2pp vs mes pasado" emerald
  - "Mesa-turn promedio: 1.6" + delta "+0.2 vs Q4"
  - "Ticket reserva vs walk-in: $738 vs $412"
  - "Tiempo confirmacion bot: 38 seg"

Debe verse como Resy + 7rooms + Toast pero con feeling de hostess que conoce a sus clientes.
```

---

## Prompt 12 — Anomalias + Recomendaciones (Action Ledger)

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de anomalias y recomendaciones con ROI estimado para "Copiloto".
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.
Concepto: el sistema detecta lo raro y propone acciones — el operador aprueba con un click.

=== HEADER DE NAVEGACION (misma top bar 64px, "Co-piloto" activo, subtab "Recomendaciones") ===

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding 32px 40px) ===

HEADER:
- "Anomalias y recomendaciones" Lexend 24 700
- "12 anomalias detectadas hoy · 8 recomendaciones activas · ROI estimado mes: $18,420 MXN" 14 muted
- Derecha: dropdown date "Hoy" + dropdown severidad "Todas" + boton "Exportar reporte" outline

KPI STRIP 4 cols margin-bottom 24:
- "Anomalias hoy": "12" 30 + breakdown mini "4 voids · 3 descuentos · 5 mermas"
- "ROI ejecutado mes": "$18,420 MXN" 30 + delta emerald
- "Tasa aprobacion": "78%" 30 + label "vs 60% objetivo"
- "Tiempo promedio aprobacion": "8 min" 30 + sparkline descendente

PESTAÑAS pills inline margin-bottom 20:
- "Anomalias (12)" / "Recomendaciones (8)" activo / "Action Ledger (24)" / "Bloqueadas (3)"

LISTA DE RECOMENDACIONES (cards stack gap 16):

CARD 1 (bg white rounded 16 padding 24 border-left 4 solid terracota — alta prioridad):
- Header flex:
  - Izq: badge "PRIORIDAD ALTA" pulsante terracota pill + chip "Pilar A — Demanda" muted + chip "Generada 14:22"
  - Der: ROI badge bold "+$2,840 MXN" emerald large pill + Time-to-act "Vence en 38 min" amber
- Titulo: "Promo flash: agua de tomate cortesia · 19:00-21:30 cena" Lexend 17 700
- Subtitulo del co-piloto:
  - "Tienes 22kg de tomate al 112% del par level. Caduca en 3 dias. Sugiero entregar agua de tomate cortesia a las primeras 60 mesas de la cena para mover stock antes de que se rampe la merma."
- Grid 4 cols stats:
  - "Costo accion: $360 MXN (60 vasos)" 14 700
  - "Stock a mover: 8 kg de tomate"
  - "Merma evitada: ~$1,920 MXN"
  - "Goodwill estimado: +$1,280 MXN (uplift ticket promedio +4%)"
- Mini reasoning box bg #F8F6F3 rounded 10 padding 12:
  - "Razonamiento: tu ratio de excedente/merma sube 18% cuando un SKU pasa el 110% del par. Liberacion por cortesia tiene 3.2x ROI historico vs descuento equivalente."
- Botones: "Aprobar y ejecutar" gradient terracota pill bold + "Modificar parametros" outline + "Rechazar con motivo" link gris

CARD 2 (border-left amber — anomalia):
- Badge "ANOMALIA DETECTADA" amber + chip "Pilar B" + "11:48"
- Titulo: "Spike de voids en mesa 4 — Jose Nuñez (mesero)"
- "En las ultimas 2 horas, mesa 4 acumulo **7 voids** ($1,420 MXN) — promedio mesero es 1 void / 4 horas."
- Mini visual: barra mostrando 7 voids vs benchmark de 2
- "Posibles causas:" lista bullets:
  - "Plato saliendo mal (cocina)"
  - "Mesero ingresando ordenes erroneas"
  - "Cliente cambiando orden"
- 2 sub-recomendaciones:
  - "Asignar Adriana a verificar la mesa 4" boton mini terracota
  - "Revisar grabacion del POS" boton outline azul
- ROI: "Si fuera mesero: ahorro $4,800/mes en voids · si fuera cocina: $2,400 en quejas evitadas"

CARD 3 (border-left azul — operacion):
- Badge "OPORTUNIDAD" azul + chip "Pilar C — CRM"
- "Tienes 184 huespedes en riesgo de churn. La campaña de recover historica tiene 14% conversion. Lanzar?"
- ROI: "+$8,420 MXN proyectado (26 reservas recovery)"
- Botones: "Lanzar campaña ahora" terracota + "Programar para sabado" outline

CARD 4 (border-left gris — informativo):
- Badge "OBSERVACION" gris + chip "Pilar E"
- "Sigma Alimentos subio precios 8% este mes sin avisar. Central de Abasto cotiza 4% menos en aguacate."
- "No requiere accion inmediata. Considerar negociacion al siguiente pedido grande."
- Boton "Solicitar contrapropuesta a Sigma" outline azul (envia WhatsApp)

CARD 5 (border-left red — bloqueada):
- Badge "BLOQUEADA POR GUARDRAIL" red + chip "Pilar C"
- "Sugerencia rechazada: enviar segundo WhatsApp a 84 huespedes hoy"
- "Motivo: excede limite de frecuencia (1 mensaje / 7 dias) para 62 de ellos"
- Boton "Ver politicas" outline + "Solicitar excepcion al dueño" outline amber

CARD 6 (border-left emerald — ya ejecutada):
- Badge "EJECUTADA · resultado en 4 horas" emerald + chip "Pilar A"
- "Subir par level aguacate 12→18 kg" ejecutada 14:22 por Monica
- Resultado: "0 stockouts · 0 platos cancelados · merma 0.8 kg (vs 6 platos esperados sin la accion)"
- "Beneficio realizado: $480 MXN ✓"
- Boton "Ver en Action Ledger" link terracota

SECCION INFERIOR — VISUALIZACION DEL ACTION LEDGER (card bg white rounded 16 padding 28 margin-top 24):
- Header: "Action Ledger · ultimos 30 dias" 16 700 + boton "Exportar CSV" outline
- Grid 2 cols 60/40:
  - Izq: barras horizontales por tipo de accion:
    - "Ajuste par level (24)" terracota
    - "Reasignacion staff (18)" azul
    - "Cierre plato dia (12)" amber
    - "Promo flash (8)" verde
    - "Recover churn (6)" purpura
    - "Cobertura review (4)" gris
    Cada barra con "% aprobacion · $ROI"
  - Der: scatter plot — eje X tiempo de aprobacion / eje Y ROI
    - Puntos coloreados por pilar
    - Cuadrante "rapido + alto ROI" destacado

Debe verse como un quirofano de operacion — claro, accionable, con responsabilidad clara.
```

---

## Prompt 13 — KPIs Ejecutivos / Reportes

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de KPIs ejecutivos para "Copiloto" — la vista del dueño Don Rodrigo.
Color primario: #D9532A. Acento: #F59E0B. Tema LIGHT.
Concepto: los datos cuentan la historia del negocio, no solo muestran numeros.

=== HEADER DE NAVEGACION (misma top bar 64px, "KPIs" activo) ===

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding 32px 40px) ===

HEADER:
- "Tablero ejecutivo" Lexend 26 700
- Subtitulo: "Q1 2026 · 3 sucursales · vista del operador" 14 muted
- Derecha: date range picker "Ene-Mar 2026" + dropdown sucursal "Todas (3)" + boton "Exportar PDF" outline + boton "Programar reporte" outline

SECCION 1 — "La promesa de Copiloto" (card hero bg white rounded 20 padding 40 margin-bottom 24):
Background: linear-gradient(135deg, rgba(217,83,42,0.06), rgba(245,158,11,0.04))

Grid 2 cols 60/40:
- Izquierda:
  - "+6.4 puntos" Lexend 64 800 color #D9532A letter-spacing -0.03
  - "de mejora en margen operativo en 90 dias" 18 muted
  - Barra progress horizontal con marca: "Objetivo 5-8 pp" badge mini emerald al fondo
  - 3 stats inline gap 24 margin-top 20:
    - "$184,720 MXN" + label "margen recuperado Q1"
    - "84 acciones del co-piloto" + label "aprobadas"
    - "94% trust score" + label "tu equipo confia"
- Derecha:
  - Donut chart de la mejora desglosada:
    - Staffing eficiente 38% (terracota)
    - Reduccion merma 24% (azafran)
    - Mix de menu optimizado 18% (azul)
    - Recover churn 12% (purpura)
    - WhatsApp FOH (no-show recover) 8% (verde)
  - Leyenda con porcentajes y montos $

SECCION 2 — KPIs PRIMARIOS (grid 3 cols cards grandes gap 20 margin-bottom 24):

Card 1 "Margen operativo":
- bg white rounded 16 padding 28
- "Margen operativo" Inter 12 700 uppercase muted
- "37.2%" Lexend 48 800 color #18181B
- "objetivo: 35%" 13 muted
- Barra dual mostrando actual vs meta vs baseline pre-implementacion (33%)
- Line chart pequeño 6 meses ascendente terracota
- Footer: "+4.2 pp vs Q4 · meta cumplida 106%" emerald

Card 2 "Food cost %":
- "Food cost" + "28.4%" 48 + "objetivo: <30%"
- Mini chart de barras por categoria: proteinas 12% · vegetales 6% · lacteos 4% · otros 6.4%
- "-2.1 pp vs baseline" emerald

Card 3 "Labor %":
- "Labor cost" + "22.1%" 48 + "objetivo: <25%"
- Heatmap mini de labor por dia x daypart (12 celdas)
- "-1.8 pp vs baseline" emerald

SECCION 3 — FORECAST ACCURACY (card bg white rounded 16 padding 32 margin-bottom 24):
- Header: "Precision del motor de demanda" 18 700 + chip "Pilar A"
- Grid 2 cols:
  - Izq: gauge gigante semicircular SVG con "MAPE 8.4%" al centro + zona verde 0-10% + zona amber 10-15% + zona red >15%
    - Label: "Objetivo <10% · alcanzado en mes 2"
  - Der: linea evolutiva MAPE por semana ultimas 12:
    - MAPE comienza en 18% baja a 8.4% con linea suave
    - Anotacion en sem 6: "Re-entrenamiento con datos de Polanco"
    - Anotacion sem 10: "Modelo XGBoost v2 desplegado"

SECCION 4 — ROI DEL CO-PILOTO (card full width bg white rounded 16 padding 32 margin-bottom 24):
Grid 2 cols:
- Izq: stacked bar chart por sucursal (Roma Norte / Polanco / Coyoacan) mostrando ROI capturado por pilar
- Der: tabla mini ranking:
  - "Roma Norte" · 38 acciones · $84,200 · 92% aprobacion
  - "Polanco" · 28 acciones · $62,100 · 86% aprobacion
  - "Coyoacan" · 18 acciones · $38,420 · 78% aprobacion
  Insight inferior: "Polanco tiene gran potencial sin explotar — su tasa de aprobacion sube cuando Monica esta de turno"

SECCION 5 — KPIs SECUNDARIOS (grid 4 cols gap 20 margin-bottom 24):
4 cards mini:
- Card "Merma %": "2.1%" 28 + "objetivo 2.5%" + sparkline descendente verde
- Card "NPS de huesped": "78" 28 + "objetivo 70+" + 5 stars rating
- Card "Recover no-shows WhatsApp": "42%" 28 + "objetivo 40%" + chip emerald
- Card "Onboarding sucursal Coyoacan": "Dia 68 de 72h objetivo" 14 + bar al 95% + chip "On track"

SECCION 6 — INSIGHTS NARRATIVOS (card bg gradient suave terracota rounded 16 padding 28 margin-bottom 24):
- Header: icono Sparkles azafran + "El co-piloto te quiere contar 3 cosas"
- 3 insights como texto narrativo (no bullets):
  - Insight 1: "**Roma Norte ya cumplio el objetivo de margen.** En 90 dias subio 6.8 pp, ligeramente arriba del promedio. La palanca dominante fue staffing (38%), porque Monica adopto el schedule sugerido como default."
  - Insight 2: "**Polanco esta 3 semanas detras.** El equipo aprueba 86% pero pide 'modificacion' antes de aplicar — sugiere que el contexto de pronostico necesita afinarse. Recomiendo correr un re-training con datos exclusivos de Polanco."
  - Insight 3: "**Coyoacan tiene una fuga silenciosa.** Sus voids por mesero son 18% mas altos que el resto. El co-piloto sugiere revisar el proceso de toma de orden y considerar capacitacion."
- Boton al fondo: "Generar reporte ejecutivo PDF para mi inversionista" gradient terracota pill

Debe verse como un C-suite dashboard que cuenta una historia, no como un grid de numeros sueltos. Inspiracion: Stripe Atlas dashboard, Notion analytics, Toast HQ.
```

---

## Prompt 14 — Admin del Agente FOH (WhatsApp Bot)

```
Layout: ESTANDAR (contenido centrado, max-width 1280px, padding 32px 40px)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena la pantalla de admin del agente WhatsApp FOH (Front-of-House bot) para "Copiloto" — sub-app separada del core.
Color primario: #D9532A. Acento: #F59E0B. Verde WhatsApp #25D366 como secundario funcional. Tema LIGHT.
Concepto: configuracion y monitoreo del bot que atiende reservas, dudas, no-shows por WhatsApp 24/7.

=== HEADER ESPECIFICO DEL AGENTE (diferente al core — bar dark) ===
height 64 bg #1F2128 padding 0 32 flex justify-between color white:
- Izq: logo 28x28 rounded gradient terracota + "Copiloto Agent" Lexend 15 800 + chip mini "FOH · WhatsApp" bg rgba(37,211,102,0.18) color #25D366
- Centro: nav pills (bg transparente, hover bg rgba(255,255,255,0.08)):
  "Conversaciones (24 activas)" activo / "Flows" / "Plantillas" / "Knowledge base" / "Pruebas" / "Analytics"
- Derecha: status del bot dot pulsante verde + "Bot activo" 13 + dropdown sucursal "Roma Norte" + avatar mini "M"

=== CONTENIDO (padding-top: 64px, fondo #F8F6F3, max-width 1280px centrado, padding 32px 40px) ===

KPI STRIP 4 cols margin-bottom 24:
- "Conversaciones hoy": "84" 30 + breakdown "62 resueltas · 18 escaladas · 4 activas"
- "Tiempo respuesta bot": "1.8 seg" 30 + sparkline emerald estable
- "Reservas creadas via bot": "248 mes" 30 + "+22% vs Q4"
- "Tasa de escalamiento a humano": "12%" 30 + label "objetivo <20%"

LAYOUT SPLIT 38/62 (grid gap 20):

PANEL IZQUIERDO — LISTA DE CONVERSACIONES (card bg white rounded 16 padding 0 overflow hidden height 760):

Header (padding 18 24):
- "Conversaciones · ultimas 24h" 14 700
- Filtros chips: "Todas (84)" activo / "Activas (4)" / "Escaladas (18)" / "Resueltas (62)" / "Stop opt-out (0)"
- Input search "Buscar por telefono o palabra clave"

Lista (cada conversacion como row 80px padding 14 20 hover bg #FAF9F7 cursor pointer, primera SELECCIONADA):

1. SELECCIONADA bg rgba(217,83,42,0.05) border-left 3 solid:
- Avatar inicial "AH" + dot verde pulsante (en linea)
- "Adriana Hidalgo · +52 55 4128 2845" bold 14
- "Reserva 4 personas viernes 20 cena" 12 muted
- Mini ultimo mensaje preview: "Bot: ✓ Te aparte mesa 6 vie 20 20:30..."
- Badge "EN CURSO" verde pill 10 + timestamp "hace 4 min"

2. "Roberto Najera · +52 33 8284 2440" + "Pregunta menu vegano" + "Resuelta · bot envio PDF" badge resuelta gris + "hace 18 min"
3. "Carla Lozano · CDMX" + "Cancelo reserva hoy 21:30 · pidio reagendar" + "ESCALADA A HOSTESS" amber + "hace 32 min"
4. "Numero desconocido" + "Spam · 'comprame productos'" + "AUTO-CERRADA por bot" gris + "hace 1h"
5. "Lucia Robles · VIP" + "🎂 saludo cumpleaños + cortesia · respondio 'gracias!'" + "Resuelta" + "hace 2h"
6. "Daniel Saavedra · VIP" + "Reagendar reserva sabado" + "Resuelta · auto-confirmacion" + "hace 4h"
7. "Patricia Cano" + "Grupo 8 personas confirmacion vie 20" + "Resuelta" + "hace 5h"
8. "Ana Rivero" + "Reclamo: 'Servicio lento ayer'" + "ESCALADA A MONICA" amber + "hace 8h"
9. "Pablo Garrido" + "No-show recover · sin respuesta" + "Sin respuesta · pending" amber + "hace 12h"
10. "Maria Esther Lugo" + "Churn recover campaña · respondio 'me da pena pero ya no estoy en CDMX'" + "Opt-out" gris + "hace 18h"

Cada item con icono Lucide diferenciador (Calendar, Question, AlertCircle, Heart)

PANEL DERECHO — DETALLE DE CONVERSACION SELECCIONADA (card bg white rounded 16 padding 0 overflow hidden):

Header (padding 18 24 border-bottom):
- Avatar 48 + "Adriana Hidalgo" 16 700 + "+52 55 4128 2845" 12 muted + badge VIP terracota pill
- Derecha: botones outline mini "Marcar como resuelta" verde + "Escalar a humano" amber + menu dots

Tabs subhead: "Conversacion" activo · "Contexto del cliente" · "Acciones tomadas"

Hilo de chat (padding 18 24 overflow-y, estilo WhatsApp con bubbles):

- Mensaje cliente (izq bg #ECEFF1 rounded 18 padding 10 14 max-width 75%):
  "Hola buenas tardes, mesa para 4 personas el viernes para cenar?"
  Timestamp 11 muted

- Mensaje bot (der bg #DCF8C6 verde WhatsApp rounded 18):
  "Hola Adriana 👋 Te ayudo con la reserva. Para cuantas personas dijiste?"

- Cliente: "4 personas, mi esposo y otra pareja"

- Bot: "Perfecto. Tengo disponible para viernes 20 de marzo a estas horas para 4 personas:
  • 19:30
  • 20:30
  • 21:30
  
  Cual te queda mejor?"

- Cliente: "20:30 esta bien"

- Bot: "Excelente! Una pregunta — tu o tu acompañante tienen alguna restriccion alimentaria? Tenemos opciones sin gluten y vegetarianas."

- Cliente: "Mi amiga es vegana"

- Bot (con typing indicator simulado animado): "Anote 1 vegana en la reserva. Le aviso al chef para que prepare opcion. 
  
  ✓ Confirmado:
  📅 Viernes 20 Marzo
  🕗 20:30
  👥 4 personas (1 vegana)
  📍 La Cocina de Doña Mari - Roma Norte
  
  Te llega tu confirmacion al correo si quieres compartirlo conmigo, sino solo dame tu nombre completo para apartarte la mesa."

- Cliente: "Adriana Hidalgo, gracias!"

- Bot: "Perfecto Adriana, mesa 6 reservada ✓. El dia anterior te mando recordatorio. Si necesitas cancelar o cambiar, solo escribeme aqui."

Input footer mostrando: "[ Bot escribiendo... ]" + boton "Tomar control" amber + boton "Ver flow ejecutado" link

SIDEBAR DENTRO DEL DETALLE (card secundario padding 18 24 bg #F8F6F3 rounded 12 dentro del panel der):
- "Acciones que tomo el bot en esta conversacion" 12 700
- Lista bullets check verde:
  - "Identifico cliente nuevo (no en CRM)"
  - "Verifico disponibilidad mesa 6 viernes 20"
  - "Creo reserva en Copiloto core (ID: RSV-4827)"
  - "Anoto restriccion vegana en nota cocina"
  - "Programo recordatorio 24h antes"
  - "Agendo follow-up post-visita lunes 23"

Footer del detalle (sticky bottom):
- "Conversacion ejecutada con plantilla: reservation_flow_v5"
- "Costo IA: $0.018 USD · Tiempo total: 4 min 28 seg · Sin escalamiento humano"

PANEL DEBAJO — FLOW VISUAL (card bg white rounded 16 padding 24 margin-top 24):
- Titulo: "Flow ejecutado: reservation_flow_v5" 16 700 + boton "Editar flow" outline mini
- Visualizacion horizontal del flow con 7 nodos conectados:
  - Greeting → Identify guest → Check availability → Confirm slot → Capture dietary → Create reservation → Schedule reminder
  - Cada nodo: cuadrito 100x60 bg white border 1px rounded 10 + icono + label
  - Flechas conectoras con tags "OK", "fail", "branch"
  - Indicador "Camino tomado" linea solida terracota en los 7 nodos
  - Tooltips: "Cliente nuevo? si → branch a 'capturar nombre'"

Debe verse como Intercom + Twilio + Linear — admin profesional de un agente conversacional 24/7.
```

---

## Prompt 15 — Navegacion Top Bar + Command Palette

```
Layout: CUSTOM (componente navigation aislado, demo con placeholder content)
IMPORTANTE: Genera una vista DESKTOP a 1440x900 pixels. NO generes mobile. Usa HTML + Tailwind CSS.
Incluye Google Fonts: Lexend e Inter. Usa Lucide icons via CDN.

Disena el componente de navegacion header de "Copiloto" sobre fondo #F8F6F3 con contenido placeholder, mas el command palette abierto.
Color primario: #D9532A (terracota). Acento: #F59E0B (azafran). Tema LIGHT.

HEADER BAR (fixed top, 100% width):
- position: fixed, top: 0, width: 100%, height: 64px, z-index: 50
- background: rgba(255,255,255,0.86), backdrop-filter: blur(24px)
- border-bottom: 1px solid #E7E5E4
- box-shadow: 0 4px 24px rgba(217,83,42,0.05)
- padding: 0 32px, flex justify-between align-center

IZQUIERDA — Logo + sucursal (gap 24):
- div 28x28 rounded 8 background linear-gradient(135deg, #D9532A, #9A3412)
- Icono ChefHat 14px blanco dentro
- "Copiloto" Lexend 15 800 color #18181B letter-spacing -0.02
- Separator vertical 1px x 16h color #E7E5E4
- Pill selector sucursal:
  - bg #F8F6F3 border 1px #E7E5E4 rounded 9999 padding 6px 14
  - icono MapPin 13 color #D9532A + "Roma Norte" 13 bold + ChevronDown 13 muted
  - hover: bg white shadow xs

CENTRO — Nav pills (flex 1 padding left 16 gap 4):
- 8 pills: Tablero, Co-piloto, Forecast, Schedule, Inventario, Recetas, Huespedes, KPIs
- Cada pill: padding 6 14 rounded 9999 font 13 flex align-center gap 6
- Iconos Lucide 15:
  - Tablero → LayoutDashboard
  - Co-piloto → Bot
  - Forecast → TrendingUp
  - Schedule → CalendarClock
  - Inventario → Package
  - Recetas → BookOpen
  - Huespedes → Users
  - KPIs → BarChart3
- ACTIVO (Tablero): font-weight 600 color #D9532A background rgba(217,83,42,0.09)
- INACTIVO: font-weight 400 color #52525B
- HOVER inactivo: color #D9532A (sin bg)

DERECHA (gap 8):
1. Buscar: button pill min-width 220 padding 6 14 bg #F8F6F3 border 1px #E7E5E4 rounded 9999 flex gap 8
   - Icono Search 14 color #71717A
   - "Buscar plato, ingrediente, huesped..." Inter 13 color #71717A
   - kbd "⌘K" font 10 bg #E4E4E7 rounded 4 padding 2 6 color #52525B margin-left auto
2. Notificaciones: button rounded 9999 padding 8
   - Icono Bell 18 color #71717A
   - dot 8x8 bg #EF4444 rounded 9999 absolute top 6 right 6 border 2 white
   - hover bg rgba(217,83,42,0.08)
3. Avatar 38x38 rounded 9999 border 2 #FBE7DC
   - Fondo linear-gradient(135deg, #D9532A, #9A3412) inicial "M" bold blanco centrado
4. Logout button padding 6 rounded 9999
   - icono LogOut 16 color #71717A
   - hover bg rgba(239,68,68,0.08) color #EF4444

DEBAJO DEL HEADER (main content placeholder padding-top 64):
- Fondo #F8F6F3
- 3 KPI cards placeholder bg white rounded 16 padding 24 width 320 height 160 alineadas margin 24 32 con sombra leve
- Para demostrar el efecto de glassmorphism y blur del header

COMMAND PALETTE abierta (modal fijo sobre todo):
- Backdrop: rgba(0,0,0,0.32), backdrop-filter blur(4)
- Panel: max-width 580 margin 80 auto 0 bg white rounded 18 box-shadow 0 24px 56px rgba(0,0,0,0.28)
- Input grande: "Buscar comandos, platos, huespedes, recomendaciones..." padding 22 26 font 15 border-bottom 1px #F1F1F1 + icono Search izq + kbd "ESC" derecha

Grupo "RECOMENDACIONES DEL CO-PILOTO" label 10 uppercase muted padding 12 24 6:
- 3 items con icono Sparkles azafran:
  - "Aprobar subir par level aguacate +6kg" + chevron + "+$480 MXN"
  - "Cerrar plato del dia (78/80 ordenes)" + chevron
  - "Enviar saludo cumple a Lucia Robles (VIP en mesa 12)" + chevron

Grupo "HUESPEDES":
- Avatar + "Lucia Robles · VIP · cumple hoy" + chevron + "$18,420 LTV"
- "Ricardo Mendoza · Foodie weekend · ultima 5d" + chevron
- "Pablo Garrido · No-show jueves · pendiente recover" + chevron

Grupo "VACANTES DEL TURNO" — uy perdon, "ALERTAS DEL TURNO":
- Icono AlertTriangle amber + "Mango caduca en 2 dias · stock 22%" + chevron
- "Tomate al 112% del par · sugerir promo agua" + chevron

Grupo "ACCIONES":
- Icono Plus + "Crear nueva reserva" + kbd "⌘ R"
- Icono Calendar + "Abrir agenda del bot WhatsApp" + kbd "⌘ W"
- Icono FileText + "Subir factura nueva (OCR)" + kbd "⌘ F"
- Icono RefreshCw + "Re-correr forecast de cena" + kbd "⌘ Shift F"

Footer modal: "↑↓ navegar · ↵ seleccionar · esc cerrar · ⌘K abrir" font 11 muted padding 14

Debe verse premium como el command palette de Linear / Notion / Raycast, pero con feel calido de cocina por el color terracota.
```

---

## Notas para el diseñador

1. **Cada prompt genera UNA pantalla completa DESKTOP** — no fragments, no mobile.
2. **Si Stitch genera mobile**: escribir "Regenera como DESKTOP 1440x900, no mobile."
3. **Si no incluye el header**: escribir "Agrega el header de navegacion como barra horizontal top con logo, nav pills y acciones."
4. **Para continuar**: escribir "Ahora genera la siguiente pantalla:" y pegar el siguiente prompt.
5. **Co-piloto conversacional como pieza insignia**: el Prompt 3 (Co-piloto de Turno) es el corazon del producto — darle prioridad visual. Si Stitch lo genera plano como ChatGPT, escribir "Cada mensaje del bot debe tener contexto operativo, numeros calculados y muchas veces una accion ejecutable con boton de aprobacion."
6. **Personas como protagonistas**: nombres mexicanos siempre (Lucia, Monica, Eduardo, Adriana, Don Rodrigo, Carmen, Luis, Ricardo). Sucursal demo "La Cocina de Doña Mari" en Roma Norte / Polanco / Coyoacan.
7. **IA visible pero util**: badges del co-piloto, recomendaciones con ROI cuantificado, alertas con accion ejecutable — nunca un "wow" vacio, siempre con numero y boton.
8. **Tema LIGHT obligatorio**: fondos #FFFFFF y #F8F6F3 (off-white calido tipo talavera), cards blancas, sombras suaves. El header del agente WhatsApp (Prompt 14) es la unica excepcion — bar oscuro #1F2128 para diferenciarlo del core.
9. **Terracota #D9532A como DNA**: gradientes con #B9421E o #9A3412, badges activos, botones primarios, links. Acento azafran #F59E0B SOLO para iconos de IA (Sparkles), bordes de recomendaciones, badges de cumple/VIP/cortesia.
10. **Tipografia obligatoria**: Lexend para headings, numerales grandes, logo (font-weight 700-900). Inter para todo body, labels, chips, UI (400-600).
11. **Action Ledger visible siempre**: cada accion del co-piloto debe ser trazable — quien aprobo, cuando, ROI esperado, ROI realizado. Esto es lo que diferencia Copiloto de un dashboard mas.
12. **WhatsApp como canal de primera clase**: aparece en reservaciones, campañas, no-show recover, comunicacion con suppliers, notificacion al staff. Cuando un boton dispara un WhatsApp, debe verse el bubble verde estilo WhatsApp (#DCF8C6).
13. **CFDI, MXN, daypart en español**: realidad fiscal y de operacion mexicana. Precios en $MXN, no $USD. Daypart como "desayuno/comida/cena" no "lunch/dinner".
14. **Pedir variantes**: "genera 2 variantes con diferente layout para esta misma pantalla."
15. **Responsive**: despues de aprobar desktop, pedir "version tablet (768) y mobile (375)."

---

## Orden sugerido para Stitch (priorizado por valor del demo)

1. **Prompt 2** — Dashboard del Operador (vista que el operador ve primero)
2. **Prompt 3** — Co-piloto de Turno (pantalla insignia · diferenciador)
3. **Prompt 4** — Forecast (motor central · justifica el modelo de negocio)
4. **Prompt 6** — Inventario (touchpoint diario del manager)
5. **Prompt 1** — Login (primera impresion · brand)
6. **Prompt 13** — KPIs Ejecutivos (vista del dueño · cierre comercial)
7. **Prompt 12** — Anomalias + Recomendaciones (Pilar B · accion ledger)
8. **Prompt 9** — CRM Huespedes (Pilar C · CRM propio)
9. **Prompt 11** — Reservaciones + Waitlist (Pilar D · agente FOH visible)
10. **Prompt 8** — Recetas + Costeo (Pilar E · food cost dinamico)
11. **Prompt 14** — Admin del Agente WhatsApp (sub-app)
12. **Prompt 5** — Schedule (output del forecast)
13. **Prompt 10** — Campañas WhatsApp (Pilar C output)
14. **Prompt 7** — Facturas OCR (Pilar E input)
15. **Prompt 15** — Nav + Command Palette (componente)
