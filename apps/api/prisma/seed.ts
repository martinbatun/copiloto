// Seed minimo: 1 tenant demo, 1 owner, 1 manager, 1 location en CDMX,
// menu canónico de 5 items con recetas, 10 huespedes, 30 dias de sales
// events sinteticos para que el dashboard tenga algo que dibujar.
//
// Sin esto la primera demo se siente vacia.

import { PrismaClient } from "./generated/client/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("[seed] limpiando datos previos...");
  // TODO: borrar en orden de FKs si se necesita; por ahora asume DB fresca.

  console.log("[seed] creando tenant + usuarios demo...");
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-mx" },
    update: {},
    create: {
      slug: "demo-mx",
      name: "Restaurante Demo CDMX",
      country: "MX",
      currency: "MXN",
      timezone: "America/Mexico_City",
    },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "dueno@copiloto.mx" },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "dueno@copiloto.mx",
      name: "Maria Owner",
      passwordHash,
      role: "OWNER",
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@copiloto.mx" },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "manager@copiloto.mx",
      name: "Jose Manager",
      passwordHash,
      role: "MANAGER",
    },
  });

  // TODO: location, menu items, recipes, ingredients, sales events sinteticos.
  // El plan es generar ~30 dias de SalesEvent con un patron tipico: pico de
  // comida 13–15, dinner suave entre semana, weekend +40%, y meter ~2 anomalias
  // (un void spike el dia 12, un food cost drift en una receta el dia 20) para
  // que el dashboard pueda mostrar el flujo completo desde el primer minuto.

  console.log("[seed] listo. Tenant slug: demo-mx");
}

main()
  .catch((err) => {
    console.error("[seed] error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
