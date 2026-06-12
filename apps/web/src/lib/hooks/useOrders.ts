"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderSummaryDTO, UpdateOrderInput } from "@copiloto/shared";
import { api } from "@/lib/api";

interface OrdersListResponse {
  orders: OrderSummaryDTO[];
}

/**
 * Pedidos activos de una sucursal para el board de cocina/caja. Hace polling
 * cada 8s para que el tablero se sienta "en vivo" sin websockets.
 */
export function useOpsOrders(locationId: string | undefined) {
  return useQuery({
    queryKey: ["ops-orders", locationId],
    queryFn: () => api<OrdersListResponse>(`/api/orders/location/${locationId}`),
    enabled: Boolean(locationId),
    refetchInterval: 8000,
  });
}

/**
 * Historial del día: pedidos SERVED/CANCELLED creados desde el inicio del día
 * local. Refresca cada 30s (no necesita ser tan "vivo" como el board).
 */
export function useOrderHistory(locationId: string | undefined) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const since = startOfDay.toISOString();
  return useQuery({
    queryKey: ["order-history", locationId, since.slice(0, 10)],
    queryFn: () =>
      api<OrdersListResponse>(
        `/api/orders/location/${locationId}?status=SERVED,CANCELLED&order=desc&since=${encodeURIComponent(since)}`
      ),
    enabled: Boolean(locationId),
    refetchInterval: 30000,
  });
}

/** Avanza status / marca pago. Invalida board e historial al terminar. */
export function useUpdateOrder(locationId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & UpdateOrderInput) =>
      api<OrderSummaryDTO>(`/api/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ops-orders", locationId] });
      qc.invalidateQueries({ queryKey: ["order-history", locationId] });
    },
  });
}
