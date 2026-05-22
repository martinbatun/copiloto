import { Router } from "express";

const router = Router();

// CRM propio del restaurante. Dato del huesped vive en NUESTRA DB,
// no en OpenTable/Resy/SevenRooms. Punto diferenciador.
//
// TODO: GET    /api/guests                          — paginado + filtros (segmento, ultima visita, ticket)
// TODO: GET    /api/guests/:id                      — perfil unificado (visitas, ticket promedio, sentiment)
// TODO: POST   /api/guests                          — alta manual
// TODO: PATCH  /api/guests/:id                      — edicion + opt-in marketing
// TODO: POST   /api/guests/unify                    — merge cuando el mismo telefono aparece como 2 guests
// TODO: POST   /api/guests/from-sale/:saleId        — derivar guest desde SalesEvent.guestExternalId

router.get("/__stub", (_req, res) => {
  res.json({ module: "guests", status: "scaffold" });
});

export default router;
