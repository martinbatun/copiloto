// Metricas de calidad del forecast — MAPE, sMAPE, bias.
//
// MAPE (Mean Absolute Percentage Error) es la metrica principal porque el
// operador entiende "10% de error". Para SKUs con baja venta puede saltar a
// sMAPE para evitar division por cero.

export function mape(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) {
    throw new Error("mape: arrays must be same non-zero length");
  }
  let sum = 0;
  let count = 0;
  for (let i = 0; i < actual.length; i++) {
    const a = actual[i]!;
    const p = predicted[i]!;
    if (a === 0) continue; // saltamos para evitar inf
    sum += Math.abs((a - p) / a);
    count++;
  }
  return count === 0 ? 0 : sum / count;
}

export function smape(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) {
    throw new Error("smape: arrays must be same non-zero length");
  }
  let sum = 0;
  for (let i = 0; i < actual.length; i++) {
    const a = actual[i]!;
    const p = predicted[i]!;
    const denom = (Math.abs(a) + Math.abs(p)) / 2;
    if (denom === 0) continue;
    sum += Math.abs(a - p) / denom;
  }
  return sum / actual.length;
}

export function bias(actual: number[], predicted: number[]): number {
  if (actual.length !== predicted.length || actual.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < actual.length; i++) {
    sum += predicted[i]! - actual[i]!;
  }
  return sum / actual.length;
}
