---
name: secure-code
description: Aplica las reglas de Código Seguro de Copiloto (OWASP Top 10) cuando se trabaja en zonas sensibles. Auto-activar cuando se edita lógica de autenticación, JWT, sesiones, password hashing, autorización por rol, manejo de pagos, datos personales (PII), input validation en endpoints, file upload, integración con APIs externas, queries SQL/Prisma con input de usuario, o cualquier handler en `apps/api/server/routes/` o `agent/apps/api/server/routes/`. Aplica las reglas en tiempo de escritura; a futuro puede complementarse con un command `/secure-code-review` (auditoría post-facto) aún no implementado.
---

# Skill: Código seguro (in-flight)

Antes de tocar el código, **leer las reglas completas** en [`.claude/RULES-SECURE-CODE.md`](../../RULES-SECURE-CODE.md). El archivo cubre OWASP Top 10 mapeado al stack Copiloto (Express, Prisma, JWT, multer, etc.).

## Cuándo se aplica vs. auditoría post-facto

- **Esta skill** → se carga automáticamente cuando tocás código sensible, para que apliques las reglas al **escribir**. Es el mecanismo activo hoy.
- **Auditoría post-facto** → el protocolo completo (Fases 0–5 del archivo de reglas) puede correrse como revisión a fondo antes de merge a `main` o antes de demos a clientes regulados. A futuro podría exponerse como command `/secure-code-review`; por ahora se ejecuta siguiendo manualmente las fases del `RULES-SECURE-CODE.md`.

## Quick checklist (red flags al escribir)

1. **Input validation en boundaries:** todo `req.body`, `req.query`, `req.params` se valida con un schema (zod/yup) antes de pegarle a Prisma. Nunca pasar `req.body` crudo a `prisma.x.create`.
2. **AuthN:** middleware `requireAuth` en todo router admin. Verificar `req.user` antes de leer/escribir datos del usuario.
3. **AuthZ:** además de "está logueado", verificar que el recurso pertenece al usuario / tiene el rol. Ej. `prisma.invoice.findFirst({ where: { id, customerId: req.user.id } })` — nunca `findUnique({ where: { id } })` sin filtrar por owner.
4. **Secretos en env, nunca en código:** `OPENROUTER_API_KEY`, `JWT_SECRET`, `DATABASE_URL` siempre via `process.env.*` o `getEnv()`.
5. **File upload:** validar `mimetype` contra allowlist (no blocklist), limitar tamaño (multer `limits.fileSize`), generar filename con UUID, NUNCA usar el filename original del cliente.
6. **SQL/Prisma injection:** usar parameters, no string concat. `prisma.$queryRawUnsafe` está prohibido.
7. **Errores:** no devolver stack traces ni mensajes de Prisma al cliente. `res.status(500).json({ error: "Algo salió mal" })`.
8. **Tokens en respuestas:** nunca devolver `passwordHash`, `portalToken`, `apiKey` en JSON. Usar `select` explícito en Prisma.
9. **CORS:** restringir origin en producción a los dominios conocidos.
10. **Rate limiting:** en endpoints públicos (portal cliente, login) y endpoints caros (IA, OCR).

## Cuándo NO aplicar

- Cambios cosméticos (CSS, copy, ordering).
- Refactor interno sin tocar input/auth/DB.
- Tests (donde se inyectan datos a propósito).
