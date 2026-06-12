"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MeResponse } from "@copiloto/shared";
import {
  api,
  ApiError,
  clearToken,
  getSavedLocationId,
  getToken,
  saveLocationId,
} from "@/lib/api";

type Location = MeResponse["locations"][number];

interface AuthContextValue {
  user: MeResponse["user"] | null;
  tenant: MeResponse["tenant"] | null;
  locations: Location[];
  currentLocation: Location | null;
  setCurrentLocationId: (id: string) => void;
  /** Re-lee el token de localStorage y reinicia el query de /me.
   *  Para llamar inmediatamente despues de saveToken() en el flujo de login. */
  refreshAuth: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Rutas que son accesibles sin sesion. Cualquier otra ruta dentro del
// AppShell asume que ya hay user y arranca una redireccion a /login si no.
const PUBLIC_ROUTES = new Set(["/", "/login", "/demo"]);
// Prefijos públicos: superficies del cliente final (menú digital / QR en mesa)
// que viven fuera del AppShell y nunca deben redirigir a /login.
const PUBLIC_PREFIXES = ["/menu"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // El token solo se conoce en el cliente. Evitamos hidratar antes del primer
  // render para no provocar mismatch SSR/CSR.
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  useEffect(() => {
    setHasToken(Boolean(getToken()));
  }, []);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api<MeResponse>("/api/auth/me"),
    enabled: hasToken === true,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isPublic =
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Redirect a /login cuando: (a) no hay token en una ruta privada, o (b) el
  // /me regreso 401 (token invalido/expirado).
  useEffect(() => {
    if (hasToken === null) return; // todavia hidratando
    if (isPublic) return;
    if (hasToken === false) {
      router.replace("/login");
      return;
    }
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401) {
      clearToken();
      queryClient.clear();
      router.replace("/login");
    }
  }, [hasToken, isPublic, meQuery.error, router, queryClient]);

  // Seleccion de location: prefiere la guardada en localStorage; si esa ya no
  // existe en la respuesta, cae a la primera.
  const [currentLocationId, setCurrentLocationIdState] = useState<string | null>(null);
  useEffect(() => {
    if (!meQuery.data) return;
    const saved = getSavedLocationId();
    const exists = meQuery.data.locations.find((l) => l.id === saved);
    const next = exists?.id ?? meQuery.data.locations[0]?.id ?? null;
    if (next) {
      setCurrentLocationIdState(next);
      saveLocationId(next);
    } else {
      setCurrentLocationIdState(null);
    }
  }, [meQuery.data]);

  function setCurrentLocationId(id: string): void {
    setCurrentLocationIdState(id);
    saveLocationId(id);
  }

  function refreshAuth(): void {
    setHasToken(Boolean(getToken()));
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }

  function logout(): void {
    clearToken();
    setHasToken(false);
    queryClient.clear();
    router.replace("/login");
  }

  const value = useMemo<AuthContextValue>(() => {
    const locations = meQuery.data?.locations ?? [];
    const currentLocation =
      locations.find((l) => l.id === currentLocationId) ?? null;
    return {
      user: meQuery.data?.user ?? null,
      tenant: meQuery.data?.tenant ?? null,
      locations,
      currentLocation,
      setCurrentLocationId,
      refreshAuth,
      logout,
      // Loading mientras hidratamos el token O mientras /me esta fetcheando
      // un token presente. Si no hay token, ya no estamos cargando — el
      // useEffect de redirect se encarga.
      isLoading:
        hasToken === null || (hasToken === true && meQuery.isLoading),
    };
  }, [meQuery.data, meQuery.isLoading, currentLocationId, hasToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
