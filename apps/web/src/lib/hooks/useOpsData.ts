"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  AdminTenantsResponse,
  CampaignsResponse,
  ForecastResponse,
  InvoicesResponse,
  KpiSummaryResponse,
  RecipesResponse,
  RecommendationsFeedResponse,
  ReservationsResponse,
  ReviewsResponse,
  ScheduleResponse,
} from "@copiloto/shared";
import { api } from "@/lib/api";

/** Staffing del día de una sucursal (por daypart × rol). */
export function useSchedule(locationId: string | undefined) {
  return useQuery({
    queryKey: ["schedule", locationId],
    queryFn: () => api<ScheduleResponse>(`/api/schedules/${locationId}`),
    enabled: Boolean(locationId),
  });
}

/** Campañas del tenant con métricas. */
export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api<CampaignsResponse>("/api/campaigns"),
  });
}

/** Panel de plataforma (rol ADMIN): tenants con métricas. 403 si no es ADMIN. */
export function useAdminTenants() {
  return useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => api<AdminTenantsResponse>("/api/admin/tenants"),
    retry: false, // no reintentar el 403
  });
}

/** Agenda de reservas del día de una sucursal (+ lista de espera). */
export function useReservations(locationId: string | undefined) {
  return useQuery({
    queryKey: ["reservations", locationId],
    queryFn: () => api<ReservationsResponse>(`/api/reservations/${locationId}`),
    enabled: Boolean(locationId),
  });
}

/** Reseñas de una sucursal + resumen. */
export function useReviews(locationId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", locationId],
    queryFn: () => api<ReviewsResponse>(`/api/reviews/${locationId}`),
    enabled: Boolean(locationId),
  });
}

/** Pronóstico de demanda (7 días) de una sucursal. */
export function useForecast(locationId: string | undefined) {
  return useQuery({
    queryKey: ["forecast", locationId],
    queryFn: () => api<ForecastResponse>(`/api/forecast/${locationId}`),
    enabled: Boolean(locationId),
  });
}

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
