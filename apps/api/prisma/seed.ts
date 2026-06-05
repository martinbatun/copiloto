// Seed para empezar a demo'r Copiloto contra datos reales.
//
// Tras correr esto la app deberia poder loguear con dueno@copiloto.mx /
// password123 y mostrar /inventory contra una sucursal real (Roma Norte) con
// 10 ingredientes, 5 proveedores y par levels para hoy — incluyendo casos
// "BAJO_PAR", "ALERTA_PAR", "OPTIMO" y "EXCEDENTE" para que el UI muestre los
// 4 estados desde el primer minuto.
//
// El plan futuro es agregar tambien SalesEvent sinteticos (30 dias), 2
// anomalias y 3 recomendaciones pendientes — esto vivira en otro archivo
// invocado desde aqui, una vez que las verticales correspondientes esten
// listas.

import { PrismaClient } from "./generated/client/index.js";
import { hashPassword } from "@copiloto/auth";

const prisma = new PrismaClient();

const TODAY = new Date();
TODAY.setUTCHours(0, 0, 0, 0);

async function main() {
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

  const passwordHash = await hashPassword("password123");

  const owner = await prisma.user.upsert({
    where: { email: "dueno@copiloto.mx" },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "dueno@copiloto.mx",
      name: "Monica Salinas",
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

  console.log("[seed] creando location Roma Norte...");
  const location = await prisma.location.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "roma-norte" } },
    update: {},
    create: {
      tenantId: tenant.id,
      slug: "roma-norte",
      name: "Roma Norte",
      timezone: "America/Mexico_City",
      posProvider: "SOFT_RESTAURANT",
    },
  });

  await prisma.userLocation.upsert({
    where: {
      userId_locationId: { userId: owner.id, locationId: location.id },
    },
    update: {},
    create: { userId: owner.id, locationId: location.id },
  });

  console.log("[seed] creando suppliers...");
  const suppliers = await Promise.all(
    [
      { name: "Sigma Alimentos", rfc: "SAL850101AB1", phone: "+5255111111" },
      { name: "Local Nayarit", rfc: null, phone: "+5255222222" },
      { name: "Frutas Selectas", rfc: "FSE900101CD2", phone: "+5255333333" },
      { name: "Verduras MX", rfc: "VMX880101EF3", phone: "+5255444444" },
      { name: "Lacteos Polanco", rfc: "LPO950101GH4", phone: "+5255555555" },
    ].map((s) =>
      prisma.supplier.upsert({
        where: { id: `supplier-${s.name.toLowerCase().replace(/[^a-z]/g, "")}` },
        update: {},
        create: {
          id: `supplier-${s.name.toLowerCase().replace(/[^a-z]/g, "")}`,
          tenantId: tenant.id,
          ...s,
        },
      })
    )
  );

  const supplierByName = Object.fromEntries(suppliers.map((s) => [s.name, s.id]));

  console.log("[seed] creando ingredientes + par levels...");
  // Cada ingrediente trae:
  //   par: cantidad sugerida por el algoritmo IA (la "meta" del dia)
  //   current: stock fisico hoy → con esto se computa el status en el GET
  //   parPrevious: par anterior (manual o pasado), si difiere de par muestra
  //     el "12kg → 18kg (auto_awesome)"
  //   cost: en centavos por baseUnit
  const ingredients = [
    {
      sku: "AVO-001",
      name: "Aguacate Hass",
      baseUnit: "kg",
      perishable: true,
      shelfLifeDays: 5,
      category: "Perecederos",
      supplier: "Sigma Alimentos",
      cost: 8450,
      par: 18,
      parPrevious: 12,
      current: 10.4,
    },
    {
      sku: "TOR-024",
      name: "Tortilla Nixtamal",
      baseUnit: "kg",
      perishable: false,
      category: "Insumos",
      supplier: "Local Nayarit",
      cost: 1820,
      par: 30,
      parPrevious: null,
      current: 24,
    },
    {
      sku: "MAN-008",
      name: "Mango Ataulfo",
      baseUnit: "kg",
      perishable: true,
      shelfLifeDays: 3,
      category: "Perecederos",
      supplier: "Frutas Selectas",
      cost: 4500,
      par: 15,
      parPrevious: null,
      current: 3.2,
    },
    {
      sku: "ONI-014",
      name: "Cebolla blanca",
      baseUnit: "kg",
      perishable: true,
      shelfLifeDays: 14,
      category: "Perecederos",
      supplier: "Verduras MX",
      cost: 2210,
      par: 40,
      parPrevious: null,
      current: 42,
    },
    {
      sku: "TOM-002",
      name: "Tomate Saladette",
      baseUnit: "kg",
      perishable: true,
      shelfLifeDays: 7,
      category: "Perecederos",
      supplier: "Verduras MX",
      cost: 2800,
      par: 50,
      parPrevious: null,
      current: 56,
    },
    {
      sku: "CHE-010",
      name: "Queso Cotija",
      baseUnit: "kg",
      perishable: true,
      shelfLifeDays: 21,
      category: "Lacteos",
      supplier: "Lacteos Polanco",
      cost: 14500,
      par: 8,
      parPrevious: null,
      current: 7.4,
    },
    {
      sku: "JAM-003",
      name: "Jamón pechuga de pavo",
      baseUnit: "kg",
      perishable: true,
      shelfLifeDays: 14,
      category: "Carnes",
      supplier: "Sigma Alimentos",
      cost: 18000,
      par: 20,
      parPrevious: null,
      current: 18,
    },
    {
      sku: "LIM-019",
      name: "Limón Colima",
      baseUnit: "kg",
      perishable: true,
      shelfLifeDays: 10,
      category: "Perecederos",
      supplier: "Frutas Selectas",
      cost: 3200,
      par: 25,
      parPrevious: null,
      current: 2.5,
    },
    {
      sku: "ARR-001",
      name: "Arrachera Angus",
      baseUnit: "kg",
      perishable: true,
      shelfLifeDays: 5,
      category: "Carnes",
      supplier: "Sigma Alimentos",
      cost: 32000,
      par: 30,
      parPrevious: null,
      current: 8,
    },
    {
      sku: "CHI-007",
      name: "Chile Serrano",
      baseUnit: "kg",
      perishable: true,
      shelfLifeDays: 7,
      category: "Perecederos",
      supplier: "Verduras MX",
      cost: 4200,
      par: 6,
      parPrevious: null,
      current: 5.8,
    },
  ];

  for (const ing of ingredients) {
    const supplierId = supplierByName[ing.supplier] ?? null;
    const ingredient = await prisma.ingredient.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: ing.sku } },
      update: {
        name: ing.name,
        baseUnit: ing.baseUnit,
        perishable: ing.perishable,
        shelfLifeDays: ing.shelfLifeDays ?? null,
        category: ing.category,
        defaultSupplierId: supplierId,
        costPerUnitCents: ing.cost,
      },
      create: {
        tenantId: tenant.id,
        sku: ing.sku,
        name: ing.name,
        baseUnit: ing.baseUnit,
        perishable: ing.perishable,
        shelfLifeDays: ing.shelfLifeDays ?? null,
        category: ing.category,
        defaultSupplierId: supplierId,
        costPerUnitCents: ing.cost,
      },
    });

    await prisma.parLevel.upsert({
      where: {
        locationId_ingredientId_date: {
          locationId: location.id,
          ingredientId: ingredient.id,
          date: TODAY,
        },
      },
      update: {
        suggestedQty: ing.par,
        currentQty: ing.current,
        unit: ing.baseUnit,
      },
      create: {
        locationId: location.id,
        ingredientId: ingredient.id,
        date: TODAY,
        suggestedQty: ing.par,
        currentQty: ing.current,
        unit: ing.baseUnit,
      },
    });

    // Par "anterior" simulando que el algoritmo subio el suggested hoy.
    // Lo guardamos en ayer para que el endpoint pueda comparar.
    if (ing.parPrevious !== null) {
      const yesterday = new Date(TODAY);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      await prisma.parLevel.upsert({
        where: {
          locationId_ingredientId_date: {
            locationId: location.id,
            ingredientId: ingredient.id,
            date: yesterday,
          },
        },
        update: { suggestedQty: ing.parPrevious, unit: ing.baseUnit },
        create: {
          locationId: location.id,
          ingredientId: ingredient.id,
          date: yesterday,
          suggestedQty: ing.parPrevious,
          unit: ing.baseUnit,
        },
      });
    }
  }

  console.log("[seed] listo. Login: dueno@copiloto.mx / password123");
  console.log(`[seed] tenant slug: ${tenant.slug} · location: ${location.slug}`);
  console.log(`[seed] ingredientes: ${ingredients.length} · suppliers: ${suppliers.length}`);
}

main()
  .catch((err) => {
    console.error("[seed] error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
