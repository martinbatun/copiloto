"use client";

import { useQuery } from "@tanstack/react-query";
import type { GuestsResponse } from "@copiloto/shared";
import { api } from "@/lib/api";

/** Base de huéspedes del tenant: resumen, segmentos y listado. */
export function useGuests() {
  return useQuery({
    queryKey: ["guests"],
    queryFn: () => api<GuestsResponse>("/api/guests"),
  });
}
