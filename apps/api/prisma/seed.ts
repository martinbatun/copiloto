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
  // Guard de seguridad: el seed crea datos demo (tenant "Demo CDMX", usuarios
  // con password123, menú de ejemplo). NUNCA debe correr contra producción.
  // Para forzarlo a propósito: SEED_ALLOW_PROD=true.
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "true") {
    console.error(
      "[seed] ABORTADO: NODE_ENV=production. El seed mete datos demo y no debe correr en prod.\n" +
        "        Si de verdad lo necesitas, corre con SEED_ALLOW_PROD=true."
    );
    process.exit(1);
  }

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

  // Staff de Copiloto (rol ADMIN) — accede al panel de plataforma (/admin).
  await prisma.user.upsert({
    where: { email: "soporte@copiloto.mx" },
    update: { role: "ADMIN" },
    create: {
      tenantId: tenant.id,
      email: "soporte@copiloto.mx",
      name: "Soporte Copiloto",
      passwordHash,
      role: "ADMIN",
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

  console.log("[seed] creando menú digital (categorías + platillos)...");
  // Categorías del menú del cliente. Id determinístico para que el upsert sea
  // idempotente entre corridas.
  const categories = [
    { key: "entradas", name: "Entradas", sortKey: 1 },
    { key: "fuertes", name: "Platos Fuertes", sortKey: 2 },
    { key: "bebidas", name: "Bebidas", sortKey: 3 },
    { key: "postres", name: "Postres", sortKey: 4 },
  ];
  const categoryByKey: Record<string, string> = {};
  for (const c of categories) {
    const id = `cat-${tenant.id.slice(0, 8)}-${c.key}`;
    await prisma.menuCategory.upsert({
      where: { id },
      update: { name: c.name, sortKey: c.sortKey },
      create: { id, tenantId: tenant.id, name: c.name, sortKey: c.sortKey },
    });
    categoryByKey[c.key] = id;
  }

  // Platillos basados en el diseño Stitch (imágenes aida-public incluidas).
  const menuItems = [
    {
      sku: "RIBEYE-PASTOR",
      name: "Tacos de Rib-Eye al Pastor",
      description:
        "Rib-eye marinado al pastor, piña tatemada y salsa de la casa. La recomendación de hoy.",
      priceCents: 28500,
      category: "fuertes",
      tags: ["Picante", "Especial"],
      rating: 4.9,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCUiCa2MmdAiYovwCX_OMOtsrf0Vi7utfkMr-3weacGHAgQxffoDUaXd-ZwHpL31U-4WokdQW44nuf-YgxGoOVRRNJ-q4MCqveqk6QY4CfdBkCVS8MEYVTRYygWcvPwLo31ZEb9PcKtohOHwvqxzDgendKMUNA3SSdaAxCcDfz28BhG1h6pJBVLqcnwyelpLY0Mp_XsqNV8H4mJt50kzAkxpAm3rT8D_wWKlpUWN5HpEsQhYRo2l7V4tyqs6_P3MlYqHXBM0z2yh9w",
    },
    {
      sku: "TACOS-PASTOR",
      name: "Tacos al Pastor (Orden de 3)",
      description: "Con piña, cebolla y cilantro.",
      priceCents: 18500,
      category: "fuertes",
      tags: [],
      rating: 4.8,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCUiCa2MmdAiYovwCX_OMOtsrf0Vi7utfkMr-3weacGHAgQxffoDUaXd-ZwHpL31U-4WokdQW44nuf-YgxGoOVRRNJ-q4MCqveqk6QY4CfdBkCVS8MEYVTRYygWcvPwLo31ZEb9PcKtohOHwvqxzDgendKMUNA3SSdaAxCcDfz28BhG1h6pJBVLqcnwyelpLY0Mp_XsqNV8H4mJt50kzAkxpAm3rT8D_wWKlpUWN5HpEsQhYRo2l7V4tyqs6_P3MlYqHXBM0z2yh9w",
    },
    {
      sku: "PIZZA-MARGARITA",
      name: "Margarita Contemporánea",
      description:
        "Salsa de tomate ahumada en casa, mozzarella de búfala y aceite de albahaca fresca.",
      priceCents: 24000,
      category: "fuertes",
      tags: [],
      rating: 4.8,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBmWtMGMbVcc1TSB2r98kSWtbedq7Br8gZXh0L8lRKBKL7jQsjhMSa5b_0QJUP22AHWUxBmVm1z2CKX3iPC1pRUaqjPYc6Px0leD9Tlc57iN8mxuzrGwhO0etCaHMWQRJUMUyr09jvYKDTOEBGhoakI2UI4I3G_Ec2ZJu8yaaTwBzxsEKKKDhr8dE-PV2J8Et1u4LCFc-kA5rk6ldfnuHesicvr_B7d3ZdKAN6dL1V7yAfIJ7cZ5cfhGiaegRL3cL-qvyobKONx234",
    },
    {
      sku: "BOWL-ANCESTRAL",
      name: "Bowl Ancestral",
      description:
        "Quinoa real, aguacate tatemado, garbanzos crujientes y aderezo de tahini y limón.",
      priceCents: 19500,
      category: "fuertes",
      tags: ["Vegano"],
      rating: 4.9,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDv33LzYNDqEyrTsA0lDDlwBLRCPC2HlO1th8K_11eG7x7otHE0jFqlmMc7GtJSZJ-2ri0cvCjt_Uk0PIFcxwHSEc3ND6XUnBBHYC3KiR2VrJh3_YdZDOcLL2fyCnl6BfySsLssRdP3hgKq_vpiXKY5lhWKMF9zJ0jkuXUSEf8KLJO6w-qMA_i3K-YE0GN47Sbo0OIujYP8HXldH6ovGJGPrj7zxi8DS5W-_lr3CWXR9bnzodUhci5iPQo9xN3MQOkQvMalo7dnej4",
    },
    {
      sku: "MEZCALITA-MARACUYA",
      name: "Mezcalita de Maracuyá",
      description:
        "Mezcal joven, pulpa natural de maracuyá, escarcha de sal de gusano y un toque de chile.",
      priceCents: 16000,
      category: "bebidas",
      tags: [],
      rating: 4.7,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDDavIWTtVCLIf97uBt9VNPsTzh3Dy5mjeTy_CX1usSw8UAYOpTNn-k2pRv4fYGzjDR2emcsxkU02txgBKmc0oo2zPGaXUtqs7xNJoh2AW5XNsrDNWe8paASWCK1oy2NRaTV69mvvnleXngsqXOjm7usINa32gmy8NfZ5f2J48N8HHeq9dezaVPj2wWppdF0tIbcrmDmSJAJ_cFSrpSRHT7NmaAOmceQ1X5N26cOoe7IIfikdj90V_RY5zSfzhO6KZl1505e986FFI",
    },
    {
      sku: "AGUA-JAMAICA",
      name: "Agua de Jamaica (L)",
      description: "Infusión natural, 500ml.",
      priceCents: 4500,
      category: "bebidas",
      tags: ["Sin alcohol"],
      rating: 4.6,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCVGLEzJpNp3tpW5zPdpTWjHjIoKZeP06ax98rTBFkcrqIH7ijFUSv2QcBN-0UV9ejWpQgP7AcBQH1yRpyze_LiPjCklfaDFvZ4uC2QQloSlRsJmFFyH6R4-Bttoacr4spHjCM-Bb7y9gg8cbrfpkHdmuu4-ZeomN8rMe7makaOSCqXlCfDxEpEMW09Ieyofzz7QGI3Krk1E9xz9q1wDJbfAMDYBlIKvpqH-9WzL8cnWPbNyW4oovw6zgS7KyJYnbB-GgCTOgphPyM",
    },
    {
      sku: "GUACAMOLE-MOLCAJETE",
      name: "Guacamole en Molcajete",
      description: "Aguacate, jitomate, cebolla morada y chile serrano, con totopos de maíz azul.",
      priceCents: 12500,
      category: "entradas",
      tags: ["Vegano"],
      rating: 4.8,
      imageUrl: null,
    },
    {
      sku: "ESQUITES-TRUFA",
      name: "Esquites con Trufa",
      description: "Elote tatemado, mayonesa de chipotle, queso cotija y aceite de trufa.",
      priceCents: 9500,
      category: "entradas",
      tags: [],
      rating: 4.5,
      imageUrl: null,
    },
    {
      sku: "FLAN-MEZCAL",
      name: "Flan de Mezcal",
      description: "Flan napolitano con caramelo de mezcal y nuez garapiñada.",
      priceCents: 8500,
      category: "postres",
      tags: [],
      rating: 4.7,
      imageUrl: null,
    },
  ];

  for (const mi of menuItems) {
    await prisma.menuItem.upsert({
      where: { tenantId_sku: { tenantId: tenant.id, sku: mi.sku } },
      update: {
        name: mi.name,
        description: mi.description,
        priceCents: mi.priceCents,
        categoryId: categoryByKey[mi.category],
        tags: mi.tags,
        rating: mi.rating,
        imageUrl: mi.imageUrl,
        active: true,
      },
      create: {
        tenantId: tenant.id,
        sku: mi.sku,
        name: mi.name,
        description: mi.description,
        priceCents: mi.priceCents,
        categoryId: categoryByKey[mi.category],
        tags: mi.tags,
        rating: mi.rating,
        imageUrl: mi.imageUrl,
      },
    });
  }

  console.log("[seed] creando CRM (segmentos + huéspedes)...");
  // Segmentos estratégicos (kind = enum GuestSegment). Id determinístico.
  const segmentDefs = [
    { key: "vip", name: "VIPs Embajadores", kind: "VIP" as const, rules: { minVisits: 12 } },
    { key: "foodie", name: "Foodies", kind: "BIG_SPENDER" as const, rules: { minSpendCents: 1500000 } },
    { key: "nuevo", name: "Nuevos", kind: "FIRST_VISIT" as const, rules: { firstVisitWithinDays: 30 } },
    { key: "riesgo", name: "En riesgo", kind: "CHURN_RISK" as const, rules: { lastVisitOverDays: 60 } },
    { key: "habitual", name: "Habituales", kind: "REGULAR" as const, rules: {} },
  ];
  const segmentByKey: Record<string, string> = {};
  for (const s of segmentDefs) {
    const id = `seg-${tenant.id.slice(0, 8)}-${s.key}`;
    await prisma.segment.upsert({
      where: { id },
      update: { name: s.name, kind: s.kind, rules: s.rules },
      create: { id, tenantId: tenant.id, name: s.name, kind: s.kind, rules: s.rules },
    });
    segmentByKey[s.key] = id;
  }

  const daysAgo = (n: number) => {
    const d = new Date(TODAY);
    d.setUTCDate(d.getUTCDate() - n);
    return d;
  };
  const birthdayToday = new Date(Date.UTC(1990, TODAY.getUTCMonth(), TODAY.getUTCDate()));

  const guestDefs = [
    { name: "Lucía Robles", seg: "vip", spend: 5420000, visits: 24, last: 3, bday: true },
    { name: "Daniela Ortiz", seg: "vip", spend: 4125000, visits: 19, last: 6 },
    { name: "Valentina Vega", seg: "vip", spend: 3912000, visits: 17, last: 5 },
    { name: "Sofía Castro", seg: "foodie", spend: 1482000, visits: 8, last: 4 },
    { name: "Ximena Duarte", seg: "foodie", spend: 1895000, visits: 9, last: 7 },
    { name: "Ricardo Mendoza", seg: "habitual", spend: 2215000, visits: 12, last: 8 },
    { name: "Mateo Silva", seg: "habitual", spend: 961000, visits: 11, last: 9 },
    { name: "Alejandro León", seg: "habitual", spend: 1126000, visits: 10, last: 12 },
    { name: "Isabella Gómez", seg: "nuevo", spend: 184000, visits: 1, last: 2 },
    { name: "Gabriel Ruiz", seg: "riesgo", spend: 743000, visits: 6, last: 68 },
    { name: "Mariana Soler", seg: "riesgo", spend: 564000, visits: 5, last: 82 },
    { name: "Sebastián Peña", seg: "habitual", spend: 821000, visits: 13, last: 15 },
  ];
  let gi = 0;
  for (const g of guestDefs) {
    gi += 1;
    const phone = `+52550000${String(gi).padStart(4, "0")}`;
    const email = `${g.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, ".")}@email.com`;
    const guest = await prisma.guest.upsert({
      where: { tenantId_phone: { tenantId: tenant.id, phone } },
      update: {
        name: g.name,
        email,
        totalSpentCents: g.spend,
        visitCount: g.visits,
        lastVisitAt: daysAgo(g.last),
        birthdate: g.bday ? birthdayToday : null,
      },
      create: {
        tenantId: tenant.id,
        name: g.name,
        phone,
        email,
        totalSpentCents: g.spend,
        visitCount: g.visits,
        firstVisitAt: daysAgo(g.last + g.visits * 7),
        lastVisitAt: daysAgo(g.last),
        birthdate: g.bday ? birthdayToday : null,
        marketingOptIn: true,
      },
    });
    await prisma.guestSegmentLink.upsert({
      where: { guestId_segmentId: { guestId: guest.id, segmentId: segmentByKey[g.seg]! } },
      update: {},
      create: { guestId: guest.id, segmentId: segmentByKey[g.seg]! },
    });
  }

  console.log("[seed] creando recetas, facturas, anomalías y recomendaciones...");
  // Lookups sobre lo ya sembrado.
  const ingRows = await prisma.ingredient.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, sku: true, baseUnit: true, costPerUnitCents: true },
  });
  const ingBySku = Object.fromEntries(ingRows.map((i) => [i.sku, i]));
  const menuRows = await prisma.menuItem.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, sku: true },
  });
  const menuBySku = Object.fromEntries(menuRows.map((m) => [m.sku, m]));

  // ─── Recetas + food cost (cost por línea = qty * costPerUnitCents del kg) ───
  const recipeDefs: { sku: string; lines: [string, number][] }[] = [
    { sku: "GUACAMOLE-MOLCAJETE", lines: [["AVO-001", 0.2], ["ONI-014", 0.03], ["CHI-007", 0.01], ["LIM-019", 0.02], ["TOM-002", 0.05]] },
    { sku: "TACOS-PASTOR", lines: [["ARR-001", 0.18], ["TOR-024", 0.15], ["ONI-014", 0.03], ["CHI-007", 0.01]] },
    { sku: "ESQUITES-TRUFA", lines: [["CHE-010", 0.03], ["ONI-014", 0.02], ["CHI-007", 0.01]] },
    { sku: "BOWL-ANCESTRAL", lines: [["AVO-001", 0.1], ["TOM-002", 0.05], ["ONI-014", 0.02]] },
    { sku: "RIBEYE-PASTOR", lines: [["ARR-001", 0.25], ["TOR-024", 0.12], ["ONI-014", 0.03]] },
  ];
  let recipeCount = 0;
  for (const rd of recipeDefs) {
    const mi = menuBySku[rd.sku];
    if (!mi) continue;
    const lines = rd.lines
      .map(([sku, qty]) => {
        const ing = ingBySku[sku];
        if (!ing) return null;
        return { ingredientId: ing.id, qty, unit: ing.baseUnit, cost: Math.round(qty * (ing.costPerUnitCents ?? 0)) };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
    const foodCostCents = lines.reduce((a, l) => a + l.cost, 0);
    const recipe = await prisma.recipe.upsert({
      where: { menuItemId: mi.id },
      update: { foodCostCents },
      create: { tenantId: tenant.id, menuItemId: mi.id, yieldQty: 1, yieldUnit: "pza", foodCostCents },
    });
    await prisma.recipeLine.deleteMany({ where: { recipeId: recipe.id } });
    await prisma.recipeLine.createMany({
      data: lines.map((l) => ({ recipeId: recipe.id, ingredientId: l.ingredientId, qty: l.qty, unit: l.unit })),
    });
    recipeCount += 1;
  }

  // ─── Facturas + líneas (OCR demo) ───
  const supRows = await prisma.supplier.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true } });
  const supByName = Object.fromEntries(supRows.map((s) => [s.name, s.id]));
  const invoiceDefs: {
    ref: string;
    supplier: string;
    daysAgo: number;
    status: "OCR_DONE" | "RECEIVED" | "NORMALIZED";
    lines: [string, number, number][]; // [descripcion, qtyKg, unitCostCents]
  }[] = [
    { ref: "INV-2023-098", supplier: "Sigma Alimentos", daysAgo: 1, status: "OCR_DONE", lines: [["Jamón pechuga de pavo", 20, 18000], ["Aguacate Hass", 30, 6500], ["Cebolla blanca", 15, 3200]] },
    { ref: "LP-8821", supplier: "Lacteos Polanco", daysAgo: 2, status: "RECEIVED", lines: [["Queso Cotija", 10, 12500], ["Crema ácida", 8, 4800]] },
    { ref: "VMX-2299", supplier: "Verduras MX", daysAgo: 3, status: "RECEIVED", lines: [["Tomate Saladette", 25, 2800], ["Chile Serrano", 6, 4200], ["Limón Colima", 12, 3600]] },
    { ref: "FS-0078", supplier: "Frutas Selectas", daysAgo: 4, status: "NORMALIZED", lines: [["Mango Ataulfo", 20, 3900]] },
  ];
  for (const inv of invoiceDefs) {
    const supplierId = supByName[inv.supplier] ?? null;
    if (!supplierId) continue;
    const id = `inv-${tenant.id.slice(0, 8)}-${inv.ref}`;
    const lineData = inv.lines.map(([description, qty, unitCostCents]) => ({
      description,
      qty,
      unit: "kg",
      unitCostCents,
      totalCents: qty * unitCostCents,
    }));
    const totalCents = lineData.reduce((a, l) => a + l.totalCents, 0);
    await prisma.invoice.upsert({
      where: { id },
      update: { totalCents, status: inv.status, invoicedAt: daysAgo(inv.daysAgo) },
      create: {
        id,
        locationId: location.id,
        supplierId,
        fileUrl: `https://example.com/facturas/${inv.ref}.pdf`,
        totalCents,
        invoicedAt: daysAgo(inv.daysAgo),
        status: inv.status,
      },
    });
    await prisma.invoiceLine.deleteMany({ where: { invoiceId: id } });
    await prisma.invoiceLine.createMany({ data: lineData.map((l) => ({ invoiceId: id, ...l })) });
  }

  // ─── Anomalías + Recomendaciones (feed de la vista Anomalías) ───
  const anomalyDefs: { key: string; kind: "VOID_SPIKE" | "DISCOUNT_SPIKE" | "FOOD_COST_DRIFT"; severity: number; payload: object }[] = [
    { key: "voids", kind: "VOID_SPIKE", severity: 5, payload: { table: "Mesa 4", count: 3, windowMin: 15 } },
    { key: "discount", kind: "DISCOUNT_SPIKE", severity: 3, payload: { pct: 22 } },
    { key: "foodcost", kind: "FOOD_COST_DRIFT", severity: 4, payload: { item: "Guacamole", driftPct: 8 } },
  ];
  // detectedAt = hoy (temprano) para que "anomalías de hoy" tenga sentido; el
  // upsert lo re-estampa en cada corrida (si no, quedaría fijo en la 1a).
  const detectedToday = new Date(TODAY);
  detectedToday.setUTCHours(9, 0, 0, 0);
  for (const a of anomalyDefs) {
    const id = `anom-${tenant.id.slice(0, 8)}-${a.key}`;
    await prisma.anomaly.upsert({
      where: { id },
      update: { severity: a.severity, payload: a.payload, detectedAt: detectedToday, resolvedAt: null },
      create: { id, locationId: location.id, kind: a.kind, severity: a.severity, payload: a.payload, detectedAt: detectedToday },
    });
  }

  const in2h = new Date(TODAY);
  in2h.setUTCHours(in2h.getUTCHours() + 2);
  const recDefs: {
    key: string;
    kind: "MENU_PROMOTE" | "ANOMALY_TRIAGE" | "GUEST_CAMPAIGN" | "PAR_LEVEL_ADJUST";
    status: "PENDING" | "EXECUTED";
    title: string;
    rationale: string;
    impact: number | null;
    expiresAt?: Date;
  }[] = [
    { key: "promo", kind: "MENU_PROMOTE", status: "PENDING", title: "Promo flash: agua de tomate cortesía", rationale: "Exceso de inventario de tomate cherry detectado. Incrementa lealtad en mesas de +4 personas.", impact: 284000, expiresAt: in2h },
    { key: "voids", kind: "ANOMALY_TRIAGE", status: "PENDING", title: "Spike de voids en mesa 4", rationale: "3 cancelaciones consecutivas en los últimos 15 min. Posible problema en cocina o error de sistema.", impact: null },
    { key: "churn", kind: "GUEST_CAMPAIGN", status: "PENDING", title: "Huéspedes en riesgo de churn", rationale: "Clientes frecuentes sin visita en más de 21 días. Se sugiere campaña de re-engagement.", impact: 96000 },
    { key: "parlevel", kind: "PAR_LEVEL_ADJUST", status: "EXECUTED", title: "Subir par level aguacate", rationale: "Ajustado a 45kg/día basado en pronóstico de fin de semana largo.", impact: 150000 },
  ];
  for (const r of recDefs) {
    const id = `rec-${tenant.id.slice(0, 8)}-${r.key}`;
    await prisma.recommendation.upsert({
      where: { id },
      update: { status: r.status, estimatedImpactCents: r.impact, title: r.title, rationale: r.rationale },
      create: {
        id,
        tenantId: tenant.id,
        locationId: location.id,
        kind: r.kind,
        status: r.status,
        title: r.title,
        rationale: r.rationale,
        estimatedImpactCents: r.impact,
        expiresAt: r.expiresAt ?? null,
        payload: {},
      },
    });
  }

  console.log("[seed] creando ventas históricas (45 días), forecast y reservas...");
  // RNG determinístico (mulberry32) para que el dataset sea estable entre corridas.
  function rng(seed: number) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const sellable = await prisma.menuItem.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { id: true, priceCents: true, taxRate: true },
  });

  // Limpia ventas previas del seed (cascade borra líneas y pagos) e inserta fresco.
  await prisma.salesEvent.deleteMany({
    where: { locationId: location.id, posExternalId: { startsWith: "seed-sale-" } },
  });

  const DAYS = 45;
  const CHANNELS = ["DINE_IN", "DINE_IN", "DINE_IN", "TAKEOUT", "DELIVERY"] as const;
  const PAY = ["CARD_CREDIT", "CARD_DEBIT", "CASH", "SPEI"];
  let salesCount = 0;
  for (let d = 0; d < DAYS; d++) {
    const day = new Date(TODAY);
    day.setUTCDate(day.getUTCDate() - d);
    const weekday = day.getUTCDay(); // 0=dom .. 6=sáb
    // Más tickets viernes/sábado; menos lunes/martes.
    const weekendBoost = weekday === 5 || weekday === 6 ? 1.6 : weekday === 0 ? 1.2 : 1;
    const rand = rng(d + 1);
    const tickets = Math.round((10 + rand() * 8) * weekendBoost);
    for (let i = 0; i < tickets; i++) {
      const r = rng((d + 1) * 1000 + i);
      const nLines = 1 + Math.floor(r() * 3); // 1..3
      const lines: { menuItemId: string; description: string; qty: number; unitCents: number; totalCents: number }[] = [];
      let subtotal = 0;
      let tax = 0;
      for (let l = 0; l < nLines; l++) {
        const mi = sellable[Math.floor(r() * sellable.length)]!;
        const qty = 1 + Math.floor(r() * 2); // 1..2
        const lineTotal = mi.priceCents * qty;
        subtotal += lineTotal;
        tax += Math.round(lineTotal * Number(mi.taxRate ?? 0.16));
        lines.push({ menuItemId: mi.id, description: "", qty, unitCents: mi.priceCents, totalCents: lineTotal });
      }
      const total = subtotal + tax;
      const hour = 12 + Math.floor(r() * 10); // 12–21h
      const openedAt = new Date(day);
      openedAt.setUTCHours(hour, Math.floor(r() * 60), 0, 0);
      const channel = CHANNELS[Math.floor(r() * CHANNELS.length)]!;
      await prisma.salesEvent.create({
        data: {
          locationId: location.id,
          posExternalId: `seed-sale-${d}-${i}`,
          channel,
          openedAt,
          closedAt: openedAt,
          totalCents: total,
          taxCents: tax,
          tipCents: Math.round(subtotal * 0.1 * r()),
          covers: 1 + Math.floor(r() * 4),
          lines: { create: lines },
          payments: { create: [{ method: PAY[Math.floor(r() * PAY.length)]!, amountCents: total }] },
        },
      });
      salesCount += 1;
    }
  }

  // Forecast de los próximos 7 días por daypart (motor de demanda + tablero).
  const dayparts = ["LUNCH", "AFTERNOON", "DINNER"] as const;
  const baseCovers: Record<string, number> = { LUNCH: 90, AFTERNOON: 40, DINNER: 120 };
  for (let d = 0; d < 7; d++) {
    const fdate = new Date(TODAY);
    fdate.setUTCDate(fdate.getUTCDate() + d);
    const wd = fdate.getUTCDay();
    const boost = wd === 5 || wd === 6 ? 1.5 : wd === 0 ? 1.2 : 1; // finde arriba
    for (const dp of dayparts) {
      const expectedCovers = Math.round(baseCovers[dp]! * boost);
      await prisma.forecastBucket.upsert({
        where: {
          locationId_date_daypart_channel: { locationId: location.id, date: fdate, daypart: dp, channel: "DINE_IN" },
        },
        update: {
          expectedCovers,
          expectedRevenue: expectedCovers * 28500,
          confidenceLow: expectedCovers * 25000,
          confidenceHigh: expectedCovers * 32000,
          mape: 0.084,
        },
        create: {
          locationId: location.id,
          date: fdate,
          daypart: dp,
          channel: "DINE_IN",
          expectedCovers,
          expectedRevenue: expectedCovers * 28500,
          confidenceLow: expectedCovers * 25000,
          confidenceHigh: expectedCovers * 32000,
          mape: 0.084,
          modelVersion: "seed-v1",
        },
      });
    }
  }

  // Reservas de hoy (para el chip "reservas confirmadas").
  await prisma.reservation.deleteMany({
    where: { locationId: location.id, source: "seed" },
  });
  const resGuests = [
    ["Marcela Díaz", 2, 13, 30, "COMPLETED", "+525511100011", "Mesa junto a ventana"],
    ["Grupo Innovatech", 8, 14, 0, "COMPLETED", "+525511100012", "Comida de empresa"],
    ["Raúl Jiménez", 3, 19, 0, "SEATED", "+525511100013", null],
    ["Carlos Slim", 2, 19, 30, "CONFIRMED", "+525511100014", "Cumpleaños"],
    ["Lucía Robles", 6, 20, 0, "CONFIRMED", "+525511100015", "Alergia a nueces"],
    ["Ana Paula", 2, 20, 0, "NO_SHOW", "+525511100016", null],
    ["Marta Gómez", 4, 21, 0, "CONFIRMED", "+525511100017", null],
    ["Gaby Torres", 4, 22, 0, "PENDING", "+525511100018", "Confirmar por WhatsApp"],
    ["Familia Herrera", 5, 21, 30, "WAITLIST", "+525511100019", "Avisar si se libera mesa"],
    ["Diego Nava", 2, 20, 30, "WAITLIST", "+525511100020", null],
  ] as const;
  for (const [name, party, hour, minute, status, phone, notes] of resGuests) {
    const reservedAt = new Date(TODAY);
    reservedAt.setUTCHours(hour as number, minute as number, 0, 0);
    await prisma.reservation.create({
      data: {
        locationId: location.id,
        guestName: name as string,
        guestPhone: phone as string,
        partySize: party as number,
        reservedAt,
        status: status as
          | "CONFIRMED"
          | "SEATED"
          | "NO_SHOW"
          | "PENDING"
          | "COMPLETED"
          | "WAITLIST",
        notes: notes as string | null,
        source: "seed",
      },
    });
  }

  console.log("[seed] creando staffing, campañas y reseñas...");
  // ─── Staffing (Shift) de hoy por daypart × rol ───
  const shiftDefs = [
    { daypart: "LUNCH" as const, role: "mesero", needed: 4, suggested: 4, actual: 4 },
    { daypart: "LUNCH" as const, role: "cocinero_caliente", needed: 3, suggested: 3, actual: 3 },
    { daypart: "LUNCH" as const, role: "bartender", needed: 1, suggested: 1, actual: 1 },
    { daypart: "DINNER" as const, role: "mesero", needed: 6, suggested: 6, actual: 5 },
    { daypart: "DINNER" as const, role: "cocinero_caliente", needed: 4, suggested: 4, actual: 4 },
    { daypart: "DINNER" as const, role: "bartender", needed: 2, suggested: 2, actual: 2 },
    { daypart: "DINNER" as const, role: "lavaloza", needed: 2, suggested: 1, actual: 1 },
  ];
  for (const s of shiftDefs) {
    await prisma.shift.upsert({
      where: {
        locationId_date_daypart_role: { locationId: location.id, date: TODAY, daypart: s.daypart, role: s.role },
      },
      update: { staffNeeded: s.needed, staffSuggested: s.suggested, staffActual: s.actual },
      create: {
        locationId: location.id,
        date: TODAY,
        daypart: s.daypart,
        role: s.role,
        staffNeeded: s.needed,
        staffSuggested: s.suggested,
        staffActual: s.actual,
        source: "forecast",
      },
    });
  }

  // ─── Campañas (Campaign + CampaignSend) ───
  const guestRows = await prisma.guest.findMany({ where: { tenantId: tenant.id }, select: { id: true } });
  const campaignDefs = [
    { key: "birthday", segKey: "vip", template: "birthday_dineout", status: "SENDING" as const, sendCount: 10, readRate: 0.9, respRate: 0.3, convCents: 120000 },
    { key: "newmenu", segKey: "foodie", template: "new_menu_alert", status: "SENT" as const, sendCount: 12, readRate: 0.8, respRate: 0.16, convCents: 210000 },
    { key: "churn", segKey: "riesgo", template: "churn_recover", status: "SCHEDULED" as const, sendCount: 0, readRate: 0, respRate: 0, convCents: 0 },
  ];
  for (const c of campaignDefs) {
    const id = `camp-${tenant.id.slice(0, 8)}-${c.key}`;
    await prisma.campaign.upsert({
      where: { id },
      update: { status: c.status },
      create: {
        id,
        tenantId: tenant.id,
        segmentId: segmentByKey[c.segKey]!,
        channel: "WHATSAPP",
        templateId: c.template,
        status: c.status,
        sentAt: c.status === "SCHEDULED" ? null : daysAgo(1),
      },
    });
    await prisma.campaignSend.deleteMany({ where: { campaignId: id } });
    if (c.sendCount > 0) {
      const sends = guestRows.slice(0, c.sendCount).map((g, i) => {
        const frac = i / c.sendCount;
        const responded = frac < c.respRate;
        return {
          campaignId: id,
          guestId: g.id,
          delivered: true,
          read: frac < c.readRate,
          responded,
          conversionCents: responded ? c.convCents : null,
        };
      });
      await prisma.campaignSend.createMany({ data: sends });
    }
  }

  // ─── Reseñas (Review) ───
  await prisma.review.deleteMany({ where: { locationId: location.id } });
  const reviewDefs = [
    { source: "google", rating: 5, text: "Los tacos al pastor increíbles, servicio rapidísimo.", sentiment: 0.9, topics: ["comida", "servicio"], days: 1 },
    { source: "google", rating: 4, text: "Muy rico todo, aunque tardó un poco la cuenta.", sentiment: 0.4, topics: ["comida", "servicio_lento"], days: 2 },
    { source: "tripadvisor", rating: 5, text: "Ambiente espectacular, la mezcalita de maracuyá es un must.", sentiment: 0.95, topics: ["ambiente", "bebidas"], days: 3 },
    { source: "google", rating: 2, text: "La comida llegó fría y el lugar estaba muy lleno.", sentiment: -0.6, topics: ["comida_fria", "saturacion"], days: 4 },
    { source: "whatsapp", rating: 5, text: "Excelente atención, volveré con la familia.", sentiment: 0.85, topics: ["servicio"], days: 5 },
    { source: "google", rating: 3, text: "Buena comida pero los precios subieron bastante.", sentiment: 0.0, topics: ["precio"], days: 6 },
    { source: "tripadvisor", rating: 4, text: "El guacamole en molcajete vale toda la pena.", sentiment: 0.7, topics: ["comida"], days: 7 },
    { source: "google", rating: 5, text: "Mi lugar favorito en la Roma, siempre consistente.", sentiment: 0.9, topics: ["comida", "ambiente"], days: 9 },
    { source: "google", rating: 1, text: "Esperé 40 minutos por una mesa con reservación.", sentiment: -0.8, topics: ["servicio_lento", "reservas"], days: 11 },
    { source: "whatsapp", rating: 4, text: "Rico y buena porción, repetiré.", sentiment: 0.6, topics: ["comida"], days: 13 },
  ];
  await prisma.review.createMany({
    data: reviewDefs.map((r) => ({
      locationId: location.id,
      source: r.source,
      rating: r.rating,
      text: r.text,
      sentiment: r.sentiment,
      topics: r.topics,
      createdAt: daysAgo(r.days),
    })),
  });

  console.log("[seed] listo. Login: dueno@copiloto.mx / password123");
  console.log(`[seed] tenant slug: ${tenant.slug} · location: ${location.slug}`);
  console.log(`[seed] CRM: ${guestDefs.length} huéspedes en ${segmentDefs.length} segmentos`);
  console.log(`[seed] staffing: ${shiftDefs.length} turnos · campañas: ${campaignDefs.length} · reseñas: ${reviewDefs.length}`);
  console.log(`[seed] recetas: ${recipeCount} · facturas: ${invoiceDefs.length} · recomendaciones: ${recDefs.length}`);
  console.log(`[seed] ventas: ${salesCount} tickets en ${DAYS} días · reservas hoy: ${resGuests.length}`);
  console.log(`[seed] ingredientes: ${ingredients.length} · suppliers: ${suppliers.length}`);
  console.log(`[seed] menú: ${menuItems.length} platillos en ${categories.length} categorías`);
  console.log(`[seed] 🍽️  Menú del cliente: /menu/${location.id}`);
}

main()
  .catch((err) => {
    console.error("[seed] error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
