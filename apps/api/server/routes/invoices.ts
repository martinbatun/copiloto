import { Router } from "express";

const router = Router();

// Facturas. Aprendizaje clave de Supy: la calidad del dato es producto, no
// servicio ad-hoc. El pipeline tiene 4 estados: RECEIVED -> OCR_PENDING ->
// OCR_DONE -> NORMALIZED -> RECONCILED.
//
// TODO: POST   /api/invoices/upload           — multipart, dispara OCR async
// TODO: GET    /api/invoices                  — paginado por location + status
// TODO: GET    /api/invoices/:id              — detalle con lines + OCR raw
// TODO: POST   /api/invoices/:id/normalize    — humano valida/corrige el mapping line -> ingredient
// TODO: POST   /api/invoices/:id/reconcile    — match contra orden de compra (si existe)
// TODO: POST   /api/invoices/webhook/ocr      — callback del provider OCR (Mindee/AWS Textract)

router.get("/__stub", (_req, res) => {
  res.json({ module: "invoices", status: "scaffold" });
});

export default router;
