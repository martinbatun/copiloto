"use client";

import { useQuery } from "@tanstack/react-query";
import type { SuppliersResponse } from "@copiloto/shared";
import { api } from "@/lib/api";

/** Proveedores + catálogo de ingredientes del tenant (comparador de precios). */
export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api<SuppliersResponse>("/api/suppliers"),
  });
}
