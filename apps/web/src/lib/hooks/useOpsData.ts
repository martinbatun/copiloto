"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  InvoicesResponse,
  KpiSummaryResponse,
  RecipesResponse,
  RecommendationsFeedResponse,
} from "@copiloto/shared";
import { api } from "@/lib/api";

/** Resumen de KPIs del tablero (ventas, ticket, tendencia, menu-mix, conteos). */
export function useKpiSummary(locationId: string | undefined) {
  return useQuery({
    queryKey: ["kpi-summary", locationId],
    queryFn: () => api<KpiSummaryResponse>(`/api/kpis/${locationId}/summary`),
    enabled: Boolean(locationId),
  });
}

/** Recetas del tenant con food cost calculado. */
export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: () => api<RecipesResponse>("/api/recipes"),
  });
}

/** Facturas (con líneas) de las sucursales del tenant. */
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => api<InvoicesResponse>("/api/invoices"),
  });
}

/** Feed de recomendaciones + resumen de anomalías de una sucursal. */
export function useRecommendationsFeed(locationId: string | undefined) {
  return useQuery({
    queryKey: ["recommendations-feed", locationId],
    queryFn: () =>
      api<RecommendationsFeedResponse>(`/api/recommendations/feed/${locationId}`),
    enabled: Boolean(locationId),
  });
}
