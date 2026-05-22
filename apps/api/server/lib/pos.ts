// Adapter pattern para conectar POS heterogeneos.
//
// Cada provider (Soft Restaurant, OneCore, Clip, Square, Toast) implementa
// la interfaz PosAdapter. El core no sabe del wire format: solo pide
// "dame ventas desde X" y recibe SalesEvent[] normalizados.
//
// Idempotencia: SalesEvent.posExternalId + locationId es @@unique en
// Prisma, asi que reingestar el mismo dia no duplica filas.

import type { Channel, DeliveryProvider, PosProvider } from "@copiloto/shared";

export interface NormalizedSale {
  posExternalId: string;
  channel: Channel;
  deliveryProvider?: DeliveryProvider;
  openedAt: Date;
  closedAt: Date | null;
  totalCents: number;
  taxCents: number;
  tipCents: number;
  discountCents: number;
  voidedCents: number;
  covers: number;
  guestExternalId?: string;
  lines: Array<{
    posLineId: string;
    posMenuId: string;
    description: string;
    qty: number;
    unitCents: number;
    totalCents: number;
    voided: boolean;
    discountCents: number;
  }>;
  payments: Array<{
    method: string;
    amountCents: number;
    processor?: string;
  }>;
  raw: unknown;
}

export interface PosAdapter {
  provider: PosProvider;
  fetchSales(params: {
    apiKey?: string;
    apiSecret?: string;
    storeId?: string;
    from: Date;
    to: Date;
  }): Promise<NormalizedSale[]>;
  // verifySignature opcional — los providers con webhook lo implementan.
  verifySignature?(headers: Record<string, string>, body: string, secret: string): boolean;
}

// TODO: implementar uno por uno. La prioridad para MVP MX es:
//   1. Soft Restaurant (mayor base instalada en restaurantes independientes MX)
//   2. OneCore
//   3. Manual CSV (fallback para operadores con POS no soportado)
//   4. Clip (mid-market)
//   5. Square / Toast (cuando expandamos a operadores en US o con presencia dual)
export const adapters: Partial<Record<PosProvider, PosAdapter>> = {};
