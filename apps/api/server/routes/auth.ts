import { Router } from "express";
import { PrismaClient } from "../db.js";
import { hashPassword, verifyPassword, signJwt } from "@copiloto/auth";
import { LoginSchema } from "@copiloto/shared";

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

// TODO: POST /api/auth/register             — solo durante onboarding, gated
// TODO: POST /api/auth/forgot-password      — manda link por email (Resend)
// TODO: POST /api/auth/reset-password       — token de reset
// TODO: GET  /api/auth/me                   — devuelve el usuario actual

router.get("/__stub", (_req, res) => {
  res.json({ module: "auth", status: "scaffold" });
});

// Hint para que el bundler no llore por export no usado.
void hashPassword;

export default router;
