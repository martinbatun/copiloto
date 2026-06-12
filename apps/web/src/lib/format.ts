// Formato de dinero para el web. Todo se guarda en centavos (entero); aquí
// convertimos a string MXN. Helper local — replica el patrón de inventory para
// evitar el import cross-package de @copiloto/utils en el bundle del cliente.

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
