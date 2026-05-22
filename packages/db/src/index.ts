// Re-export del cliente Prisma del core (apps/api/prisma/generated).
//
// El cliente se genera por-app (cada Prisma schema en su carpeta) para evitar
// que el output global pise el del agente. Quien necesite el tipo, lo importa
// desde @copiloto/db en su propia app — pero el binding real al cliente debe
// hacerse desde la app que tiene los engines de Prisma (apps/api), no aqui.
//
// Este paquete existe principalmente para exponer types y el singleton wrapper
// que apps/api crea. Ver apps/api/server/db.ts para el singleton concreto.

export type { PrismaClient } from "../../../apps/api/prisma/generated/client";
