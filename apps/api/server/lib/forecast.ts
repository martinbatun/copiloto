// Cliente del servicio de forecasting.
//
// El motor real corre como sidecar Python (LightGBM/XGBoost) en
// FORECAST_SERVICE_URL. Aqui solo exponemos un cliente tipado y un
// modo "stub" para desarrollo local sin tener Python arriba.

export interface ForecastFeatures {
  locationId: string;
  date: string; // YYYY-MM-DD
  daypart: "BREAKFAST" | "BRUNCH" | "LUNCH" | "AFTERNOON" | "DINNER" | "LATE_NIGHT";
  channel: "DINE_IN" | "TAKEOUT" | "DELIVERY" | "PICKUP";
  weather?: {
    tempC: number;
    rainMm: number;
    code: string;
  };
  events?: Array<{ name: string; distanceKm: number }>;
}

export interface ForecastPoint {
  expectedCovers: number;
  expectedRevenueCents: number;
  confidenceLowCents: number;
  confidenceHighCents: number;
  modelVersion: string;
}

export async function predict(features: ForecastFeatures): Promise<ForecastPoint> {
  const url = process.env.FORECAST_SERVICE_URL;
  if (!url) {
    // Modo dev: usa baseline naive (mismo daypart, mismo dia de semana,
    // promedio de las ultimas 4 semanas). Permite que la UI muestre algo
    // antes de que el servicio Python este desplegado.
    return naiveBaseline(features);
  }
  const res = await fetch(`${url}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });
  if (!res.ok) {
    throw new Error(`forecast service error: ${res.status}`);
  }
  return (await res.json()) as ForecastPoint;
}

function naiveBaseline(_features: ForecastFeatures): ForecastPoint {
  // TODO: leer SalesEvent historicos y promediar. Por ahora numero dummy
  // para que la UI no se rompa.
  return {
    expectedCovers: 80,
    expectedRevenueCents: 4500000, // $45,000 MXN
    confidenceLowCents: 3800000,
    confidenceHighCents: 5200000,
    modelVersion: "naive-baseline-0.1",
  };
}
