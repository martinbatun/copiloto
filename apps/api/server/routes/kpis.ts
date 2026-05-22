import { Router } from "express";

const router = Router();

// KPIs operativos. Esto es lo que el duenio ve en el dashboard cuando abre
// la app. Todo agregado a partir de SalesEvent, Shift, ParLevel, etc.
//
// TODO: GET /api/kpis/:locationId/today           — ticket promedio, covers, revenue, margen
// TODO: GET /api/kpis/:locationId/trend           — serie tiempo (default 30d) por KPI
// TODO: GET /api/kpis/:locationId/food-cost       — food cost % overall + top 10 ofensores
// TODO: GET /api/kpis/:locationId/labor           — labor % vs revenue
// TODO: GET /api/kpis/:locationId/menu-mix        — items ranked por contribucion marginal
// TODO: GET /api/kpis/:locationId/channel-mix     — DINE_IN vs DELIVERY vs TAKEOUT (volumen + margen)
// TODO: GET /api/kpis/tenant/overview             — multi-location side-by-side (gerente de operaciones)

router.get("/__stub", (_req, res) => {
  res.json({ module: "kpis", status: "scaffold" });
});

export default router;
