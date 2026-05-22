// Helpers de dinero. Internamente todo se guarda en centavos (entero) para
// evitar imprecisiones de float; aqui van las conversiones a string formateado.

export type Currency = "MXN" | "USD" | "COP" | "CLP" | "PEN" | "ARS";

const FORMATTERS: Record<Currency, Intl.NumberFormat> = {
  MXN: new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }),
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  COP: new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }),
  CLP: new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }),
  PEN: new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }),
  ARS: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }),
};

export function fromCents(cents: number): number {
  return cents / 100;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatMoney(cents: number, currency: Currency = "MXN"): string {
  return FORMATTERS[currency].format(fromCents(cents));
}
