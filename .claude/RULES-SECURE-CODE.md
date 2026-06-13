# RULES-SECURE-CODE — Protocolo de revision de codigo seguro (Copiloto)

Reglas para auditar que el codigo de un modulo cumple con los lineamientos de
**Codigo Seguro** de Copiloto y el **OWASP Top 10**. Aplicable a cualquier
modulo del backend (`apps/api`, `agent/apps/api`) o del frontend (`apps/web`,
`agent/apps/web`): auth, orders, menu, inventory, invoices, copilot,
reservations, pos, etc.

Este protocolo lo aplica la skill `secure-code` en tiempo de escritura. A
futuro puede complementarse con un command explicito `/secure-code-review`
(auditoria post-facto), aun no implementado en este repo. Aqui cubrimos
**seguridad**, no funcionalidad.

---

## CUANDO APLICAR

- Antes de un merge a `main` con cambios en backend/auth/handlers
- Cuando el usuario pregunta: "¿este modulo es seguro?" / "revisa seguridad"
- En modulos que manejen: autenticacion, pagos, datos personales,
  archivos subidos por usuario, integraciones con APIs externas
- Al terminar la implementacion de un feature con acceso a BD
- Antes de preparar una demo para un cliente de sector regulado (salud,
  financiero, pagos)

---

## FASE 0 — MODELADO DE AMENAZAS (thread modeling)

Antes de los checks automaticos, responder por escrito 4 preguntas del
modulo/feature bajo revision:

1. **Entradas** ¿Que inputs recibe del usuario, APIs externas, BD, storage?
2. **Actores** ¿Quienes pueden llamar esto? (anonimo, autenticado, admin,
   servicio externo)
3. **Abuso** Por cada entrada: ¿como podria un atacante abusarla?
4. **Mitigacion** ¿Que control tenemos hoy para ese abuso?

Si alguna entrada no tiene control, es un **hallazgo critico** aunque todas
las demas fases pasen.

---

## FASE 1 — LINEAMIENTOS DE CODIGO (6 checks del video)

### 1.1 No confiar en input del usuario

**Prohibido:**
- String concatenation en queries SQL crudas (`\`SELECT * FROM x WHERE id=${id}\``)
- Ejecutar `eval()`, `new Function()`, `exec()` con input del usuario
- Renderizar HTML crudo del usuario (`dangerouslySetInnerHTML={{__html: userInput}}`)

**Obligatorio:**
- Toda entrada validada con schema (zod / joi / yup) antes de procesarse
- Queries a BD usan Prisma / ORM o prepared statements
- Sanitizacion de HTML en outputs que aceptan markdown/rich text

```bash
# Buscar patrones peligrosos:
grep -rn "dangerouslySetInnerHTML\|eval(\|new Function(\|exec(" apps/web/src/ agent/apps/web/src/
grep -rn '\$\{.*\}.*WHERE\|\$\{.*\}.*FROM' apps/api/server/ agent/apps/api/server/
```

### 1.2 Suposiciones explicitas

**Regla:** Si una funcion asume que X es cierto, debe **fallar explicitamente**
si X no se cumple. Nada de fallback silencioso.

**Prohibido:**
- `as any`, `as unknown` sin comentario justificando
- `if (user)` sin validar que sea el user correcto (rol, org, tenant)
- Campos opcionales tratados como requeridos sin throw/guard

**Obligatorio:**
- TypeScript `strict: true` en `tsconfig.json`
- Precondiciones hacen `throw new Error(...)` si se violan
- Type guards explicitos (`if (!user) throw new Unauthorized()`)

### 1.3 Autenticacion y autorizacion

**Prohibido:**
- Endpoints mutantes (POST/PUT/DELETE) sin middleware de auth
- Verificar solo `req.user` sin validar rol/permiso del recurso
- Confiar en un `user_id` que viene del body o query (siempre del JWT)

**Obligatorio:**
- Todos los endpoints protegidos declaran middleware de auth
- Verificacion de ownership/rol antes de retornar/mutar recursos
- MFA **considerado** (documentado como follow-up si no implementado) para:
  - Borrado masivo / soft delete de tenant
  - Cambios de rol
  - Pagos / transferencias
  - Exportacion de datos sensibles

```bash
# Listar rutas sin middleware de auth evidente:
grep -rn "router\.\(post\|put\|delete\|patch\)" apps/api/server/routes/ agent/apps/api/server/routes/ | \
  grep -v "authMiddleware\|requireAuth\|protect"
```

### 1.4 Analisis estatico

**Obligatorio en el repo:**
- `tsconfig.json` con `strict: true`, `noUncheckedIndexedAccess: true`
- ESLint corriendo en CI (si hay CI) o al menos en pre-commit
- `npm audit` / `pnpm audit` sin vulnerabilidades **high** o **critical**
  no atendidas (documentar excepciones)

```bash
pnpm audit --audit-level=high
```

### 1.5 Logging seguro

**Prohibido loguear:**
- Passwords, hashes, salts
- Tokens (JWT, API keys, refresh tokens)
- Headers de autenticacion (`Authorization`, `Cookie`)
- PII innecesaria (email, telefono, direccion) fuera de auditoria legitima
- Numeros de tarjeta, CVVs, datos bancarios
- Objetos `req` / `request` completos

**Obligatorio:**
- Logs estructurados con campos explicitos (nunca `console.log(req)`)
- Errores muestran mensaje + stack solo en dev; en prod mensaje generico al
  cliente y stack en logs del servidor

```bash
# Buscar logueo peligroso:
grep -rn "console\.log(req\b\|console\.log(.*password\|console\.log(.*token\|console\.log(.*authorization" \
  apps/web/src/ apps/api/server/ agent/apps/web/src/ agent/apps/api/server/
grep -rn "logger\.\(info\|debug\|warn\|error\)(.*password\|.*token\|.*secret" \
  apps/api/server/ agent/apps/api/server/
```

### 1.6 Criptografia

**Prohibido:**
- Implementaciones propias de hash/cifrado ("rolling our own crypto")
- Hash de passwords con MD5, SHA-1, SHA-256 puro
- Secrets hardcoded en el codigo
- JWT secrets por defecto (`"secret"`, `"changeme"`)

**Obligatorio:**
- Passwords con bcrypt (`$2b$12$`), argon2id, o scrypt
- Secrets en `.env` y **fuera** de git (verificar `.gitignore`)
- JWT firmados con secret real (>32 chars aleatorios)
- TLS en produccion (documentado, aunque no validable desde el repo)

```bash
# Buscar secrets posiblemente hardcoded:
grep -rn "secret\s*=\s*['\"].\{4,\}['\"]\|apiKey\s*=\s*['\"].\{8,\}['\"]\|password\s*=\s*['\"]" \
  apps/web/src/ apps/api/server/ agent/apps/web/src/ agent/apps/api/server/ | grep -v "\.env\|process\.env"
# Buscar hash debil:
grep -rn "createHash('md5')\|createHash('sha1')" apps/api/server/ agent/apps/api/server/
```

---

## FASE 2 — PRINCIPIOS ADICIONALES

### 2.1 KISS (Keep It Simple)

- Funciones < 50 lineas donde sea razonable
- Sin abstracciones prematuras (patrones de diseno impuestos sin necesidad)
- Sin capas de "middleware" que esconden validaciones

### 2.2 Secure defaults (deny by default)

**Prohibido:**
- CORS con `origin: "*"` en endpoints autenticados
- Rutas nuevas que asumen acceso publico por omision
- Configuraciones de dev (debug, consola de errores detallada) activas en
  `NODE_ENV=production`

**Obligatorio:**
- Rutas protegidas por default; publicas son la excepcion explicita
- Cookies con `httpOnly`, `secure`, `sameSite: "lax"` o stricter
- Headers de seguridad (helmet / headers equivalentes en Next.js):
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security`
  - `Content-Security-Policy` (al menos basica)

### 2.3 Least privilege

- Tokens de BD con permisos minimos (no usar el `postgres` root en app)
- Roles de usuario con permisos granulares, no "admin puede todo" si se
  puede separar
- Servicios externos (S3, email provider) con API keys scoped al minimo

---

## FASE 3 — OWASP TOP 10

Revisar cada categoria y reportar estado. Si una no aplica al modulo,
documentarlo (ej: "A10 SSRF: N/A, el modulo no hace fetch a URLs externas").

### A01 — Broken Access Control
- [ ] Middleware de autorizacion en rutas protegidas
- [ ] Verificacion de ownership (el user solo ve/modifica sus recursos)
- [ ] Rate limiting en endpoints sensibles (login, reset password, export)
- [ ] Fallos de autorizacion se loguean (no silenciosos)

### A02 — Cryptographic Failures
- [ ] Passwords con bcrypt/argon2 (ver 1.6)
- [ ] Data sensible cifrada at rest cuando aplique (ej: tokens OAuth guardados)
- [ ] TLS documentado para produccion

### A03 — Injection
- [ ] ORM / prepared statements (ver 1.1)
- [ ] Escape de HTML en renders
- [ ] Headers CSP configurados (ver 2.2)
- [ ] Validacion de inputs con schema (ver 1.1)

### A04 — Insecure Design
- [ ] Modelado de amenazas completado (Fase 0)
- [ ] Secure defaults aplicados (Fase 2.2)

### A05 — Security Misconfiguration
- [ ] Sin debug/stack traces al cliente en prod
- [ ] Headers de seguridad presentes
- [ ] `.env` fuera de git (`cat .gitignore | grep .env`)
- [ ] Credenciales default cambiadas (no `admin/admin`)

### A06 — Vulnerable Components
- [ ] `pnpm audit` sin high/critical sin atender
- [ ] Dependencias no abandonadas (ultimo release < 2 anos)
- [ ] Lockfiles commiteados (`pnpm-lock.yaml`)

### A07 — Broken Authentication
- [ ] Password policy razonable (min 8 chars en frontend y backend)
- [ ] Rate limiting en login
- [ ] Session expira / JWT tiene `exp`
- [ ] MFA disponible o documentado como follow-up

### A08 — Software and Data Integrity Failures
- [ ] Lockfiles commiteados (previene supply chain)
- [ ] Dependencias desde fuentes confiables (npm oficial, no forks random)
- [ ] CI/CD no ejecuta codigo de PRs no confiables sin review

### A09 — Logging and Monitoring Failures
- [ ] Logs de eventos de auth (login exitoso, fallido, logout)
- [ ] Logs de eventos de authz (accesos denegados)
- [ ] Logs estructurados (json / pino / winston) — no solo console.log
- [ ] Sin datos sensibles en logs (ver 1.5)

### A10 — SSRF (Server-Side Request Forgery)
- [ ] Si el backend hace `fetch()` a URLs que pueden venir del cliente,
      validar contra whitelist de dominios
- [ ] Sin proxy ciego (endpoint tipo `/proxy?url={X}`) sin validacion
- [ ] Separar redes / no fetch a IPs privadas (127.0.0.1, 169.254.x, 10.x)

---

## FASE 4 — SECTOR-SPECIFIC (si aplica)

Preguntar al usuario por el sector del cliente objetivo. Si aplica:

### 4.1 PA-DSS / PCI-DSS (pagos, tarjetas)
- [ ] No almacenamos PAN (numero de tarjeta completo) en BD propia
- [ ] Integracion con procesador (Stripe, Conekta) usa tokenizacion
- [ ] Logs no contienen numeros de tarjeta ni CVV

### 4.2 HIPAA (salud, datos medicos)
- [ ] Datos medicos cifrados at rest
- [ ] Audit log de accesos a registros medicos
- [ ] Consentimiento documentado en el flujo

### 4.3 LFPDPPP / GDPR (datos personales MX/EU)
- [ ] Aviso de privacidad accesible
- [ ] Mecanismo para que usuario exporte/borre sus datos
- [ ] No se recolectan datos mas alla de lo necesario

### 4.4 Separacion de credenciales por entorno
- [ ] Credenciales de BD/servicios **distintas** por entorno (dev/staging/prod)
- [ ] No reusar el mismo admin token entre `apps/api` y `agent/apps/api`
- [ ] Documentado quien tiene acceso a cada entorno

---

## FASE 5 — REPORTE FINAL

Generar archivo `SECURITY-AUDIT-{MODULO}-{FECHA}.md` en la raiz del
proyecto o en `docs/audits/` si existe, con este formato:

```markdown
# Security Audit — {modulo} — {fecha}

## Fase 0 — Thread model
- Entradas: {lista}
- Actores: {lista}
- Abusos identificados: {lista con mitigacion}

## Resumen ejecutivo
- ✅ Pasan: N checks
- ⚠️ Warnings: N checks
- ❌ Fallas: N checks (M criticas)

## Hallazgos por severidad

### Critical
| ID | Categoria | Archivo:Linea | Descripcion | Remediacion |
|---|---|---|---|---|
| C-01 | A03 Injection | apps/api/server/routes/orders.ts:42 | Query con string concat | Usar Prisma |

### High
{misma tabla}

### Medium / Low
{misma tabla}

## Checklist completo

### Fase 1 — Lineamientos
| Check | Estado | Notas |
|---|---|---|
| 1.1 No trust input | ✅ | Zod en todos los endpoints |
| 1.2 Suposiciones explicitas | ⚠️ | 3 usos de `as any` sin comentario |
| ... |

### Fase 2 — Principios
{tabla}

### Fase 3 — OWASP Top 10
{tabla A01-A10}

### Fase 4 — Sector-specific
{tabla o "N/A"}

## Fixes aplicados en esta sesion
- {archivo:linea} — {descripcion del fix}

## Follow-ups (fuera de scope de esta sesion)
- {descripcion} — {prioridad} — {owner sugerido}
```

---

## REGLAS ABSOLUTAS

1. **NUNCA** marcar un modulo como "seguro" sin haber ejecutado las 5 fases
2. **SIEMPRE** completar Fase 0 (thread model) antes de los checks automaticos;
   los checks sin contexto de amenazas pierden valor
3. **SIEMPRE** reportar hallazgos con `file:line` — no vale "hay problemas
   con el logging", si hay, apuntar al archivo
4. **NUNCA** commitear secrets encontrados durante la auditoria; si se
   encuentra uno hardcoded, **rotarlo** y mover a `.env` antes de cerrar
5. **SIEMPRE** clasificar hallazgos por severidad (Critical / High /
   Medium / Low); un hallazgo sin severidad no sirve para priorizar
6. **NUNCA** aceptar "lo arreglamos despues" para criticos — se arreglan
   en la misma sesion o no se mergea
7. **SIEMPRE** documentar los follow-ups reales (MFA, rotacion de secrets,
   auditoria de roles, etc.) para que no se pierdan
8. **NUNCA** asumir que una libreria es segura solo porque es popular —
   `pnpm audit` + review del changelog de versiones mayores
9. **SIEMPRE** preguntar el sector del cliente antes de ejecutar Fase 4;
   si el cliente es de salud/pagos y no se aplicaron los checks, el reporte
   esta incompleto
10. El reporte final debe ser **accionable**: cada hallazgo debe decir
    donde esta, por que importa, y como arreglarlo

---

*Creado: 2026-04-22 — Referencia: video de entrenamiento Codigo Seguro Copiloto
+ OWASP Top 10 2021.*
