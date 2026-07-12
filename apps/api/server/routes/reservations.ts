import { Router } from "express";
import { PrismaClient } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import type {
  ReservationDTO,
  ReservationsResponse,
  ReservationStatus,
} from "@copiloto/shared";

const router = Router();
const prisma = new PrismaClient();

// Formatea la hora en UTC (HH:mm) — el seed agenda con setUTCHours, así que
// mostrar en UTC mantiene coherencia entre lo sembrado y lo desplegado.
function hhmm(d: Date): string {
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function toDTO(r: {
  id: string;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedAt: Date;
  status: ReservationStatus;
  notes: string | null;
  source: string;
}): ReservationDTO {
  return {
    id: r.id,
    guestName: r.guestName,
    guestPhone: r.guestPhone,
    partySize: r.partySize,
    reservedAt: r.reservedAt.toISOString(),
    time: hhmm(r.reservedAt),
    status: r.status,
    notes: r.notes,
    source: r.source,
  };
}

/**
 * GET /api/reservations/:locationId — agenda del día de la sucursal.
 * Query opcional ?date=YYYY-MM-DD (default: hoy, límites en UTC).
 * Separa reservas agendadas de la lista de espera (WAITLIST) y agrega un
 * resumen por estado. Auth + tenant-scoped.
 */
router.get("/:locationId", requireAuth, async (req, res) => {
  const tenantId = req.user!.tenantId;
  const locationId = String(req.params.locationId);
  const location = await prisma.location.findFirst({
    where: { id: locationId, tenantId },
    select: { id: true, name: true },
  });
  if (!location) {
    res.status(404).json({ error: "Sucursal no encontrada para este tenant" });
    return;
  }

  // Rango del día pedido (o hoy), en UTC.
  const dateParam = typeof req.query.date === "string" ? req.query.date : undefined;
  const dayStart = dateParam ? new Date(`${dateParam}T00:00:00.000Z`) : new Date();
  if (Number.isNaN(dayStart.getTime())) {
    res.status(400).json({ error: "Parámetro date inválido (usa YYYY-MM-DD)" });
    return;
  }
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const rows = await prisma.reservation.findMany({
    where: { locationId, reservedAt: { gte: dayStart, lt: dayEnd } },
    orderBy: { reservedAt: "asc" },
    select: {
      id: true,
      guestName: true,
      guestPhone: true,
      partySize: true,
      reservedAt: true,
      status: true,
      notes: true,
      source: true,
    },
  });

  const waitlist = rows.filter((r) => r.status === "WAITLIST");
  const scheduled = rows.filter((r) => r.status !== "WAITLIST");

  const by = (s: ReservationStatus) => rows.filter((r) => r.status === s).length;
  const covers = scheduled
    .filter((r) => r.status === "CONFIRMED" || r.status === "SEATED" || r.status === "COMPLETED")
    .reduce((a, r) => a + r.partySize, 0);

  const payload: ReservationsResponse = {
    date: dayStart.toISOString().slice(0, 10),
    locationName: location.name,
    summary: {
      total: scheduled.length,
      covers,
      confirmed: by("CONFIRMED"),
      seated: by("SEATED"),
      completed: by("COMPLETED"),
      pending: by("PENDING"),
      noShow: by("NO_SHOW"),
      waitlist: waitlist.length,
    },
    reservations: scheduled.map(toDTO),
    waitlist: waitlist.map(toDTO),
  };
  res.json(payload);
});

export default router;
