// Seed minimo del agente: templates aprobados de ejemplo + flows base.
// El tenant referenciado debe existir en el core (mismo uuid).

import { PrismaClient } from "./generated/client/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("[seed:agent] arrancando...");

  // TODO: crear templates de ejemplo:
  //   - "reservation_confirm_v1" — utility — "Hola {{nombre}}, confirmamos tu reserva..."
  //   - "no_show_recovery_v1"    — marketing — "Te extranamos, te dejamos cupon..."
  //   - "post_visit_feedback_v1" — utility — "¿Como estuvo tu visita?"

  // TODO: crear flows base:
  //   - RESERVATION_NEW
  //   - RESERVATION_CONFIRM
  //   - NO_SHOW_RECOVERY
  //   - POST_VISIT_FEEDBACK

  console.log("[seed:agent] listo.");
}

main()
  .catch((e) => {
    console.error("[seed:agent]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
