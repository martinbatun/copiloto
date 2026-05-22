import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/locations — lista las sucursales del tenant del usuario.
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { tenantId: req.user!.tenantId, active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        timezone: true,
        posProvider: true,
      },
    });
    res.json({ locations });
  } catch (err) {
    console.error("[locations]", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// TODO: POST   /api/locations               — crear sucursal (OWNER/ADMIN)
// TODO: PATCH  /api/locations/:id           — actualizar
// TODO: DELETE /api/locations/:id           — soft delete (active=false)
// TODO: POST   /api/locations/:id/users     — invitar/asignar usuario a sucursal

export default router;
