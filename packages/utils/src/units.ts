// Normalizacion de unidades de inventario y recetas. Las facturas vienen
// con unidades inconsistentes (kg, g, lt, ml, pieza, caja...) y el costeo
// de receta exige convertir todo a una unidad base por ingrediente.

export type UnitFamily = "MASS" | "VOLUME" | "COUNT";

export type Unit =
  | "g"
  | "kg"
  | "mg"
  | "lb"
  | "oz"
  | "ml"
  | "lt"
  | "gal"
  | "pza"
  | "doz"
  | "caja";

const TO_BASE: Record<Unit, { family: UnitFamily; factor: number }> = {
  g: { family: "MASS", factor: 1 },
  kg: { family: "MASS", factor: 1000 },
  mg: { family: "MASS", factor: 0.001 },
  lb: { family: "MASS", factor: 453.592 },
  oz: { family: "MASS", factor: 28.3495 },
  ml: { family: "VOLUME", factor: 1 },
  lt: { family: "VOLUME", factor: 1000 },
  gal: { family: "VOLUME", factor: 3785.41 },
  pza: { family: "COUNT", factor: 1 },
  doz: { family: "COUNT", factor: 12 },
  caja: { family: "COUNT", factor: 1 }, // requiere config: cuantas pzas por caja
};

export function convert(value: number, from: Unit, to: Unit): number {
  const f = TO_BASE[from];
  const t = TO_BASE[to];
  if (f.family !== t.family) {
    throw new Error(
      `convert: cannot mix unit families (${f.family} -> ${t.family})`
    );
  }
  const inBase = value * f.factor;
  return inBase / t.factor;
}
