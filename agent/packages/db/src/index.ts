// Re-export del cliente Prisma del agente, generado en
// agent/apps/api/prisma/generated/client.
//
// Misma logica que packages/db del core: cada Prisma schema en su carpeta
// para que ambos clientes coexistan sin pisarse.

export type { PrismaClient } from "../../../apps/api/prisma/generated/client";
