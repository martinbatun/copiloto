import { Router } from "express";
import { PrismaClient } from "../db.js";
import { hashPassword, verifyPassword, signJwt } from "@copiloto/auth";
import { LoginSchema, type MeResponse } from "@copiloto/shared";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/login — email + password → JWT.
 *
 * El JWT trae { sub, tenantId, role, email }. El frontend lo guarda en
 * localStorage y lo manda como Bearer. No usamos cookies para simplificar
 * cross-origin (web del operador en 5400, agente admin en 5500).
 */
router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      res.status(401).json({ error: "Credenciales invalidas" });
      return;
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Credenciales invalidas" });
      return;
    }
    const token = signJwt(
      { sub: user.id, tenantId: user.tenantId, role: user.role, email: user.email },
      process.env.JWT_SECRET!
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Error interno" });
  }
});

/**
 * GET /api/auth/me — quien soy + tenant + sucursales accesibles.
 *
 * Una sola query al boot del web para hidratar el AuthProvider. Si el JWT
 * esta expirado o invalido, requireAuth devuelve 401 antes de llegar aqui
 * — el frontend interpreta ese 401 como "haz logout y redirige a /login".
 */
router.get("/me", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        locationAccess: {
          include: {
            location: {
              select: { id: true, name: true, slug: true, timezone: true, active: true },
            },
          },
        },
      },
    });
    if (!user || !user.active) {
      res.status(401).json({ error: "Sesion invalida" });
      return;
    }
    // Si el user no tiene UserLocation explicito (e.g. el OWNER), devolvemos
    // todas las sucursales activas del tenant. Esto evita que un dueno se quede
    // sin sucursales por accidente cuando todavia no hay asignaciones.
    const locations =
      user.locationAccess.length > 0
        ? user.locationAccess
            .filter((ul) => ul.location.active)
            .map((ul) => ({
              id: ul.location.id,
              name: ul.location.name,
              slug: ul.location.slug,
              timezone: ul.location.timezone,
            }))
        : (
            await prisma.location.findMany({
              where: { tenantId: user.tenantId, active: true },
              select: { id: true, name: true, slug: true, timezone: true },
              orderBy: { name: "asc" },
            })
          );
    const payload: MeResponse = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        country: user.tenant.country,
        currency: user.tenant.currency,
        timezone: user.tenant.timezone,
      },
      locations,
    };
    res.json(payload);
  } catch (err) {
    console.error("[auth/me]", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// TODO: POST /api/auth/register             — solo durante onboarding, gated
// TODO: POST /api/auth/forgot-password      — manda link por email (Resend)
// TODO: POST /api/auth/reset-password       — token de reset

// Hint para que el bundler no llore por export no usado.
void hashPassword;

export default router;
