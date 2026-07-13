import { Router } from "express";

const router = Router();

// Action ledger: cada decision queda registrada (audit + entrenamiento del modelo
// de "que recomendaciones de hecho funcionan").
//
// TODO: GET  /api/actions                       — paginado por location + user + decision
// TODO: POST /api/actions/:id/measure-impact    — cron que mide el impacto real N dias despues

export default router;
