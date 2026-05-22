import { Router } from "express";

const router = Router();

// Reservas. Source primario: WhatsApp via agent. Source secundario: web del operador,
// walkin, integracion futura con OpenTable.
//
// TODO: GET    /api/reservations                       — por location + fecha + status
// TODO: POST   /api/reservations                       — body: ReservationSchema
// TODO: PATCH  /api/reservations/:id/status            — CONFIRMED, SEATED, NO_SHOW, COMPLETED
// TODO: POST   /api/reservations/:id/confirm           — re-trigger confirmacion via WhatsApp
// TODO: POST   /api/reservations/:id/recover           — flow de recuperacion de no-show (cupon + WhatsApp)
// TODO: GET    /api/reservations/waitlist/:locationId  — lista de espera con tiempo estimado

router.get("/__stub", (_req, res) => {
  res.json({ module: "reservations", status: "scaffold" });
});

export default router;
