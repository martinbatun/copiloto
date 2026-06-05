"use client";

import { useQuery } from "@tanstack/react-query";
import type { InventoryListResponse } from "@copiloto/shared";
import { api } from "@/lib/api";

export function useInventory(locationId: string | undefined, date?: string) {
  const qs = date ? `?date=${date}` : "";
  return useQuery({
    queryKey: ["inventory", locationId, date ?? "today"],
    queryFn: () => api<InventoryListResponse>(`/api/inventory/${locationId}${qs}`),
    enabled: Boolean(locationId),
  });
}
