"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateOrderInput,
  CreateOrderResponse,
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

/** Crea un pedido. El server recalcula precios — el body solo manda ids+qty.
 *  Para pago móvil con pasarela activa, la respuesta trae `checkoutUrl`. */
export function useCreateOrder() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      api<CreateOrderResponse>("/api/orders/public", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

/** Estado de un pedido (confirmación / seguimiento). Hace polling para captar
 *  la confirmación del pago en línea cuando llega el webhook de la pasarela. */
export function useOrderStatus(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api<OrderSummaryDTO>(`/api/orders/public/${orderId}`),
    enabled: Boolean(orderId),
    refetchInterval: (query) =>
      query.state.data?.status === "AWAITING_PAYMENT" ? 3000 : false,
  });
}

/** Cancela un pedido con pago en línea pendiente (self-service del comensal). */
export function useCancelOrder(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<OrderSummaryDTO>(`/api/orders/public/${orderId}/cancel`, { method: "POST" }),
    onSuccess: (order) => qc.setQueryData(["order", orderId], order),
  });
}
