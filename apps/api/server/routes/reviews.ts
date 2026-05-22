import { Router } from "express";

const router = Router();

// Reviews + analisis de sentiment. Ingesta desde Google, Tripadvisor (cuando hay
// API/scraping legal), WhatsApp post-visita, y feedback directo.
//
// TODO: GET    /api/reviews                     — paginado por location + source + sentiment
// TODO: POST   /api/reviews/ingest              — bulk insert desde scrapers
// TODO: POST   /api/reviews/:id/analyze         — LLM extrae topics + sentiment
// TODO: GET    /api/reviews/topics/:locationId  — agregados ("servicio_lento" x12 en ultimo mes)

router.get("/__stub", (_req, res) => {
  res.json({ module: "reviews", status: "scaffold" });
});

export default router;
