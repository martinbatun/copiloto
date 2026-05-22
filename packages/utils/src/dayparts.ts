// Buckets de horario por daypart. Los rangos son aproximados y configurables
// por sucursal (porque un brunch en CDMX != brunch en Buenos Aires).

export type Daypart =
  | "BREAKFAST"
  | "BRUNCH"
  | "LUNCH"
  | "AFTERNOON"
  | "DINNER"
  | "LATE_NIGHT";

const DEFAULT_DAYPART_HOURS: Record<Daypart, [number, number]> = {
  BREAKFAST: [6, 11],
  BRUNCH: [10, 13],
  LUNCH: [12, 16],
  AFTERNOON: [15, 18],
  DINNER: [18, 23],
  LATE_NIGHT: [22, 3],
};

export function daypartForHour(
  hour: number,
  override?: Partial<Record<Daypart, [number, number]>>
): Daypart {
  const ranges = { ...DEFAULT_DAYPART_HOURS, ...(override ?? {}) };
  // Para LATE_NIGHT (22-3) tratamos wrap-around: si la hora es 22+ o <3, cae aqui.
  if (hour >= 22 || hour < 3) return "LATE_NIGHT";
  for (const dp of ["BREAKFAST", "BRUNCH", "LUNCH", "AFTERNOON", "DINNER"] as const) {
    const [start, end] = ranges[dp];
    if (hour >= start && hour < end) return dp;
  }
  return "AFTERNOON";
}
