/**
 * Seed: 3 DEMO lojista accounts (Starter / Pro / Elite)
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-demo.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo@shopmotor2025";

const BRANDS_MODELS = [
  { brand: "Toyota",    model: "Corolla",    version: "XEi 2.0 Flex",       fuel: "Flex",    body: "Sedan",    price: 89900  },
  { brand: "Honda",     model: "Civic",      version: "EXL 1.5 Turbo",      fuel: "Gasolina",body: "Sedan",    price: 119900 },
  { brand: "Volkswagen",model: "T-Cross",    version: "Highline TSI",        fuel: "Gasolina",body: "SUV",      price: 135000 },
  { brand: "Chevrolet", model: "Onix",       version: "LTZ Turbo AT",        fuel: "Flex",    body: "Hatch",    price: 78500  },
  { brand: "Hyundai",   model: "HB20",       version: "Diamond Plus",        fuel: "Flex",    body: "Hatch",    price: 72000  },
  { brand: "Jeep",      model: "Compass",    version: "Limited 2.0 Diesel",  fuel: "Diesel",  body: "SUV",      price: 195000 },
  { brand: "Ford",      model: "Ranger",     version: "XLS 2.2 Diesel",      fuel: "Diesel",  body: "Picape",   price: 215000 },
  { brand: "Nissan",    model: "Kicks",      version: "Advance CVT",         fuel: "Gasolina",body: "SUV",      price: 109000 },
  { brand: "Renault",   model: "Kwid",       version: "Intense 1.0",         fuel: "Flex",    body: "Hatch",    price: 62000  },
  { brand: "Fiat",      model: "Strada",     version: "Volcano CD 1.3",      fuel: "Flex",    body: "Picape",   price: 115000 },
  { brand: "Toyota",    model: "Hilux",      version: "SRX Diesel 4x4 AT",   fuel: "Diesel",  body: "Picape",   price: 295000 },
  { brand: "BMW",       model: "320i",       version: "Sport GP 2.0 Turbo",  fuel: "Gasolina",body: "Sedan",    price: 249000 },
  { brand: "Mercedes",  model: "C 180",      version: "Avantgarde 1.6 Turbo",fuel: "Gasolina",body: "Sedan",    price: 219000 },
  { brand: "Volkswagen",model: "Polo",       version: "Highline 200 TSI",    fuel: "Gasolina",body: "Hatch",    price: 88000  },
  { brand: "Chevrolet", model: "S10",        version: "High Country CD",     fuel: "Diesel",  body: "Picape",   price: 258000 },
  { brand: "Honda",     model: "HR-V",       version: "EXL CVT",             fuel: "Gasolina",body: "SUV",      price: 139000 },
  { brand: "Hyundai",   model: "Tucson",     version: "GLS 1.6 Turbo DCT",  fuel: "Gasolina",body: "SUV",      price: 175000 },
  { brand: "Fiat",      model: "Pulse",      version: "Impetus T200 AT6",    fuel: "Gasolina",body: "SUV",      price: 115000 },
  { brand: "Volkswagen",model: "Nivus",      version: "Highline 200 TSI",    fuel: "Gasolina",body: "SUV",      price: 119000 },
  { brand: "Toyota",    model: "SW4",        version: "SRX 2.8 Diesel 4x4",  fuel: "Diesel",  body: "SUV",      price: 399000 },
  { brand: "Jeep",      model: "Renegade",   version: "Longitude T270 AT9",  fuel: "Gasolina",body: "SUV",      price: 125000 },
  { brand: "Chevrolet", model: "Tracker",    version: "LT Turbo AT",         fuel: "Gasolina",body: "SUV",      price: 114000 },
  { brand: "BMW",       model: "X1",         version: "sDrive20i GP Sport",  fuel: "Gasolina",body: "SUV",      price: 349000 },
  { brand: "Audi",      model: "A3",         version: "Sedan 1.4 TFSI S-Tr", fuel: "Gasolina",body: "Sedan",    price: 179000 },
  { brand: "Ford",      model: "Bronco Sport",version: "Big Bend AWD AT8",   fuel: "Gasolina",body: "SUV",      price: 199000 },
  { brand: "Volkswagen",model: "Virtus",     version: "GTS 250 TSI AT",      fuel: "Gasolina",body: "Sedan",    price: 105000 },
  { brand: "Honda",     model: "WR-V",       version: "EXL CVT",             fuel: "Gasolina",body: "SUV",      price: 107000 },
  { brand: "Renault",   model: "Duster",     version: "Iconic 1.3 TCe CVT",  fuel: "Gasolina",body: "SUV",      price: 109000 },
  { brand: "Toyota",    model: "RAV4",       version: "SX Hybrid AWD",       fuel: "Híbrido", body: "SUV",      price: 349000 },
  { brand: "Mercedes",  model: "GLA 200",    version: "Enduro 1.3 Turbo",    fuel: "Gasolina",body: "SUV",      price: 279000 },
  { brand: "Fiat",      model: "Toro",       version: "Ranch 2.0 Diesel AT9",fuel: "Diesel",  body: "Picape",   price: 199000 },
  { brand: "Nissan",    model: "Frontier",   version: "PRO-4X Diesel AT",    fuel: "Diesel",  body: "Picape",   price: 289000 },
  { brand: "Porsche",   model: "Cayenne",    version: "3.0 V6 Tiptronic S",  fuel: "Gasolina",body: "SUV",      price: 699000 },
  { brand: "Land Rover",model: "Discovery Sport",version: "SE R-Dynamic",   fuel: "Gasolina",body: "SUV",      price: 449000 },
  { brand: "Chevrolet", model: "Equinox",    version: "Premier AWD 2.0 T",   fuel: "Gasolina",body: "SUV",      price: 199000 },
  { brand: "Toyota",    model: "Yaris",      version: "XLS Connect CVT",     fuel: "Gasolina",body: "Sedan",    price: 89000  },
  { brand: "Honda",     model: "City",       version: "Touring CVT Turbo",   fuel: "Gasolina",body: "Sedan",    price: 119000 },
  { brand: "Volvo",     model: "XC60",       version: "T6 Inscription AWD",  fuel: "Gasolina",body: "SUV",      price: 499000 },
  { brand: "Audi",      model: "Q3",         version: "1.4 TFSI S-Tronic",   fuel: "Gasolina",body: "SUV",      price: 279000 },
  { brand: "BMW",       model: "X3",         version: "xDrive30i M Sport",   fuel: "Gasolina",body: "SUV",      price: 399000 },
  { brand: "Mercedes",  model: "GLC 300",    version: "Coupé 4MATIC AT",     fuel: "Gasolina",body: "SUV",      price: 499000 },
  { brand: "Volkswagen",model: "Amarok",     version: "V6 Extreme 3.0 TDI",  fuel: "Diesel",  body: "Picape",   price: 399000 },
  { brand: "Toyota",    model: "Land Cruiser",version: "ZX V8 4.5 TT Diesel",fuel: "Diesel",  body: "SUV",      price: 999000 },
  { brand: "Lamborghini",model: "Urus",      version: "4.0 V8 Biturbo AT",   fuel: "Gasolina",body: "SUV",      price: 3499000},
  { brand: "Ferrari",   model: "Roma",       version: "3.9 V8 Biturbo DCT",  fuel: "Gasolina",body: "Coupe",    price: 3999000},
  { brand: "Porsche",   model: "911",        version: "Carrera S 3.0 PDK",   fuel: "Gasolina",body: "Coupe",    price: 999000 },
  { brand: "Lexus",     model: "RX 350",     version: "F Sport AWD CVT",     fuel: "Gasolina",body: "SUV",      price: 499000 },
  { brand: "Jaguar",    model: "F-PACE",     version: "R-Sport 2.0 AWD AT",  fuel: "Gasolina",body: "SUV",      price: 459000 },
  { brand: "Range Rover",model: "Evoque",    version: "P300 R-Dynamic SE",   fuel: "Gasolina",body: "SUV",      price: 499000 },
  { brand: "Maserati",  model: "Ghibli",     version: "GranSport 3.0 V6 T",  fuel: "Gasolina",body: "Sedan",    price: 799000 },
];

const COVER_URLS: Record<string, string> = {
  SUV:    "https://images.unsplash.com/photo-1669215420018-3d91fc2baf9e?w=800&q=80",
  Sedan:  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  Hatch:  "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
  Picape: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80",
  Coupe:  "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
};

function coverFor(body: string) {
  return COVER_URLS[body] ?? COVER_URLS.Sedan;
}

function randomKm() {
  return Math.floor(Math.random() * 120000) + 5000;
}

function randomYear() {
  return 2018 + Math.floor(Math.random() * 7); // 2018–2024
}

function pastDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function futureDate(daysAhead: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d;
}

async function upsertDemoUser(data: {
  email: string;
  name: string;
  tradeName: string;
  companyName: string;
  cnpj: string;
  storeSlug: string;
  storeDescription: string;
  city: string;
  state: string;
  phone: string;
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: data.email },
    create: {
      ...data,
      passwordHash,
      role: "SELLER",
      plan: "FREE",
      accountType: "PJ",
      isDemo: true,
      emailVerified: true,
      sharePhone: true,
    },
    update: {
      ...data,
      isDemo: true,
      accountType: "PJ",
      role: "SELLER",
    },
  });
}

async function seedSubscription(userId: string, plan: string, amount: number) {
  // Remove any old demo subscription for this user
  await (prisma as any).storeSubscription.deleteMany({ where: { userId } });
  return (prisma as any).storeSubscription.create({
    data: {
      userId,
      plan,
      status: "active",
      amount,
      startsAt: pastDate(5),
      endsAt: futureDate(25),
    },
  });
}

async function seedVehicles(userId: string, count: number, pool: typeof BRANDS_MODELS) {
  // Delete previous demo vehicles
  await prisma.vehiclePhoto.deleteMany({
    where: { vehicle: { userId } },
  });
  await prisma.vehicle.deleteMany({ where: { userId } });

  const slice = pool.slice(0, count);
  for (let i = 0; i < slice.length; i++) {
    const v = slice[i];
    const year = randomYear();
    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        status: "ACTIVE",
        brand: v.brand,
        model: v.model,
        version: v.version,
        bodyType: v.body,
        yearFab: year,
        yearModel: year + 1,
        km: randomKm(),
        fuel: v.fuel,
        transmission: i % 3 === 0 ? "Manual" : "Automático",
        color: ["Branco", "Preto", "Prata", "Cinza", "Vermelho"][i % 5],
        doors: v.body === "Picape" ? 4 : [2, 4][i % 2],
        price: v.price,
        acceptTrade: i % 3 === 0,
        financing: i % 2 === 0,
        condition: "USED",
        description: `${v.brand} ${v.model} ${v.version} em excelente estado de conservação. Único dono, revisões em dia na concessionária.`,
        city: "São Paulo",
        state: "SP",
        vehicleType: "CAR",
        expiresAt: futureDate(25 - (i % 10)),
        renewalCount: 0,
        createdAt: pastDate(count - i),
      },
    });

    await prisma.vehiclePhoto.create({
      data: {
        vehicleId: vehicle.id,
        url: coverFor(v.body),
        filename: `cover-${vehicle.id}.jpg`,
        order: 0,
        isCover: true,
      },
    });
  }
}

async function main() {
  console.log("🌱 Seeding DEMO accounts...");

  // ── STARTER (10 vehicles) ─────────────────────────────────────────────────
  const starter = await upsertDemoUser({
    email: "demo.starter@shopmotor.com.br",
    name: "Demo Lojista Starter",
    tradeName: "AutoShop Starter Demo",
    companyName: "AutoShop Starter Ltda",
    cnpj: "00.000.001/0001-01",
    storeSlug: "demo-starter",
    storeDescription: "Loja demonstração plano Starter. Especializada em veículos populares e compactos com ótimo custo-benefício.",
    city: "São Paulo",
    state: "SP",
    phone: "11900000001",
  });
  console.log("  ✓ Starter user:", starter.id);
  await seedSubscription(starter.id, "STARTER", 297);
  await seedVehicles(starter.id, 10, BRANDS_MODELS);
  console.log("  ✓ Starter: 10 vehicles seeded");

  // ── PRO (25 vehicles) ─────────────────────────────────────────────────────
  const pro = await upsertDemoUser({
    email: "demo.pro@shopmotor.com.br",
    name: "Demo Lojista Pro",
    tradeName: "Mega Motors Pro Demo",
    companyName: "Mega Motors Pro Ltda",
    cnpj: "00.000.002/0001-02",
    storeSlug: "demo-pro",
    storeDescription: "Loja demonstração plano Pro. Amplo estoque de veículos seminovos com garantia e procedência verificada.",
    city: "Campinas",
    state: "SP",
    phone: "11900000002",
  });
  console.log("  ✓ Pro user:", pro.id);
  await seedSubscription(pro.id, "PRO", 697);
  await seedVehicles(pro.id, 25, BRANDS_MODELS);
  console.log("  ✓ Pro: 25 vehicles seeded");

  // ── ELITE (50 vehicles) ───────────────────────────────────────────────────
  const elite = await upsertDemoUser({
    email: "demo.elite@shopmotor.com.br",
    name: "Demo Lojista Elite",
    tradeName: "Premium Motors Elite Demo",
    companyName: "Premium Motors Elite Ltda",
    cnpj: "00.000.003/0001-03",
    storeSlug: "demo-elite",
    storeDescription: "Loja demonstração plano Elite. O mais completo estoque de veículos de luxo e alta performance com financiamento integrado.",
    city: "Rio de Janeiro",
    state: "RJ",
    phone: "11900000003",
  });
  console.log("  ✓ Elite user:", elite.id);
  await seedSubscription(elite.id, "ELITE", 1197);
  await seedVehicles(elite.id, 50, BRANDS_MODELS);
  console.log("  ✓ Elite: 50 vehicles seeded");

  console.log("\n✅ DEMO seed complete!");
  console.log("   Passwords:", DEMO_PASSWORD);
  console.log("   Stores: /loja/demo-starter | /loja/demo-pro | /loja/demo-elite");
  console.log("   NOTE: isDemo=true — hidden from all public listings");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
