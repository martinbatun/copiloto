"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminMenuResponse,
  MenuItemUpsertInput,
  MenuCategoryUpsertInput,
  UploadResponse,
} from "@copiloto/shared";
import { api, apiUpload } from "@/lib/api";

/** Carta completa (categorías + items incl. inactivos) para el editor. */
export function useAdminMenu(locationId: string | undefined) {
  return useQuery({
    queryKey: ["admin-menu", locationId],
    queryFn: () => api<AdminMenuResponse>(`/api/menu/admin/${locationId}`),
    enabled: Boolean(locationId),
  });
}

function useInvalidate(locationId: string | undefined) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["admin-menu", locationId] });
}

type UpsertResult = { id?: string; ok?: boolean };

/** Crea o actualiza un platillo (id → PATCH, sin id → POST). */
export function useUpsertMenuItem(locationId: string | undefined) {
  const invalidate = useInvalidate(locationId);
  return useMutation({
    mutationFn: ({ id, ...body }: { id?: string } & Partial<MenuItemUpsertInput>): Promise<UpsertResult> =>
      id
        ? api<UpsertResult>(`/api/menu/items/${id}`, {
            method: "PATCH",
            body: JSON.stringify(body),
          })
        : api<UpsertResult>(`/api/menu/items`, {
            method: "POST",
            body: JSON.stringify(body),
          }),
    onSuccess: invalidate,
  });
}

export function useDeleteMenuItem(locationId: string | undefined) {
  const invalidate = useInvalidate(locationId);
  return useMutation({
    mutationFn: (id: string) => api(`/api/menu/items/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

export function useUpsertCategory(locationId: string | undefined) {
  const invalidate = useInvalidate(locationId);
  return useMutation({
    mutationFn: ({ id, ...body }: { id?: string } & Partial<MenuCategoryUpsertInput>): Promise<UpsertResult> =>
      id
        ? api<UpsertResult>(`/api/menu/categories/${id}`, { method: "PATCH", body: JSON.stringify(body) })
        : api<UpsertResult>(`/api/menu/categories`, {
            method: "POST",
            body: JSON.stringify(body),
          }),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory(locationId: string | undefined) {
  const invalidate = useInvalidate(locationId);
  return useMutation({
    mutationFn: (id: string) => api(`/api/menu/categories/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
}

/** Sube una imagen de platillo y devuelve su URL absoluta (Supabase Storage). */
export function useUploadMenuImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return apiUpload<UploadResponse>("/api/menu/upload", fd);
    },
  });
}
