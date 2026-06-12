"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  CreateOrderInput,
  OrderSummaryDTO,
  PublicMenuResponse,
} from "@copiloto/shared";
import { api } from "@/lib/api";

/** Menú público de una sucursal (para el QR del cliente). */
export function usePublicMenu(locationId: string) {
  return useQuery({
    queryKey: ["public-menu", locationId],
    queryFn: () => api<PublicMenuResponse>(`/api/menu/public/${locationId}`),
    enabled: Boolean(locationId),
  });
}

/** Crea un pedido. El server recalcula precios — el body solo manda ids+qty. */
export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      api<OrderSummaryDTO>("/api/orders/public", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

/** Estado de un pedido (pantalla de confirmación / seguimiento). */
export function useOrderStatus(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api<OrderSummaryDTO>(`/api/orders/public/${orderId}`),
    enabled: Boolean(orderId),
  });
}
