// Monitoreo de errores con Sentry. Opcional: si no hay SENTRY_DSN, no hace
// nada (dev/staging funcionan sin cuenta). Con el DSN puesto, captura errores
// no manejados de la API con stack trace.
import type { Express } from "express";
import * as Sentry from "@sentry/node";

let enabled = false;

/** Inicializa Sentry lo antes posible en el boot (antes de registrar rutas). */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    // Sin tracing por defecto (solo errores); súbelo si quieres performance.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_RATE || "0"),
  });
  enabled = true;
}

export function isSentryEnabled(): boolean {
  return enabled;
}

/** Registra el error handler de Sentry — debe ir DESPUÉS de las rutas. */
export function setupSentryErrorHandler(app: Express): void {
  if (!enabled) return;
  Sentry.setupExpressErrorHandler(app);
}
