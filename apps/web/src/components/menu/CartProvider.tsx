"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MenuItemPublic } from "@copiloto/shared";

// Línea del carrito: snapshot mínimo del platillo + cantidad. Guardamos el
// snapshot para poder pintar el pedido sin re-fetch del menú; el server de
// todas formas recalcula precios al confirmar.
export interface CartLine {
  menuItemId: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  qtyOf: (menuItemId: string) => number;
  add: (item: MenuItemPublic, qty?: number) => void;
  setQty: (menuItemId: string, qty: number) => void;
  remove: (menuItemId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(locationId: string) {
  return `copiloto:cart:${locationId}`;
}

export function CartProvider({
  locationId,
  children,
}: {
  locationId: string;
  children: React.ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata desde localStorage una vez montado (evita mismatch SSR).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(locationId));
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* carrito corrupto → arranca vacío */
    }
    setHydrated(true);
  }, [locationId]);

  // Persiste en cada cambio (solo tras hidratar, para no pisar con []).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey(locationId), JSON.stringify(lines));
    } catch {
      /* storage lleno / bloqueado → ignoramos */
    }
  }, [lines, locationId, hydrated]);

  const add = useCallback((item: MenuItemPublic, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.menuItemId === item.id);
      if (existing) {
        return prev.map((l) =>
          l.menuItemId === item.id ? { ...l, qty: l.qty + qty } : l
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          priceCents: item.priceCents,
          imageUrl: item.imageUrl,
          qty,
        },
      ];
    });
  }, []);

  const setQty = useCallback((menuItemId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.menuItemId !== menuItemId)
        : prev.map((l) => (l.menuItemId === menuItemId ? { ...l, qty } : l))
    );
  }, []);

  const remove = useCallback((menuItemId: string) => {
    setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((acc, l) => acc + l.qty, 0);
    const subtotalCents = lines.reduce((acc, l) => acc + l.priceCents * l.qty, 0);
    return {
      lines,
      count,
      subtotalCents,
      qtyOf: (id) => lines.find((l) => l.menuItemId === id)?.qty ?? 0,
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
