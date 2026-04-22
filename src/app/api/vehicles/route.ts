import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/* ── GET /api/vehicles — listar com filtros ── */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const brand       = searchParams.get("brand")        ?? undefined;
  const fuel        = searchParams.get("fuel")         ?? undefined;
  const body        = searchParams.get("body")         ?? undefined;
  const transmission = searchParams.get("transmission") ?? undefined;
  const color       = searchParams.get("color")        ?? undefined;
  const state       = searchParams.get("state")        ?? undefined;
  const condition   = searchParams.get("condition")    ?? undefined;
  const armored     = searchParams.get("armored")      === "true" ? true : undefined;
  const auction     = searchParams.get("auction")      === "true" ? true : undefined;
  const priceMin    = searchParams.get("priceMin")     ? Number(searchParams.get("priceMin"))  : undefined;
  const priceMax    = searchParams.get("priceMax")     ? Number(searchParams.get("priceMax"))  : undefined;
  const kmMin       = searchParams.get("kmMin")        ? Number(searchParams.get("kmMin"))     : undefined;
  const kmMax       = searchParams.get("kmMax")        ? Number(searchParams.get("kmMax"))     : undefined;
  const yearMin     = searchParams.get("yearMin")      ? Number(searchParams.get("yearMin"))   : undefined;
  const yearMax     = searchParams.get("yearMax")      ? Number(searchParams.get("yearMax"))   : undefined;
  const q           = searchParams.get("q")            ?? undefined;
  const vehicleType    = searchParams.get("vehicleType")    ?? undefined;
  const motoType       = searchParams.get("motoType")       ?? undefined;
  const cylinderccMin  = searchParams.get("cylinderccMin")  ? Number(searchParams.get("cylinderccMin"))  : undefined;
  const cylinderccMax  = searchParams.get("cylinderccMax")  ? Number(searchParams.get("cylinderccMax"))  : undefined;
  const sort        = searchParams.get("sort")         ?? "createdAt_desc";
  const page        = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit       = Math.min(48, Number(searchParams.get("limit") ?? 24));
  const skip        = (page - 1) * limit;

  const now = new Date();

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    ...(brand        && { brand }),
    ...(fuel         && { fuel }),
    ...(body         && { bodyType: body }),
    ...(transmission && { transmission }),
    ...(color        && { color }),
    ...(state        && { state }),
    ...(armored      && { armored }),
    ...(auction      && { auction }),
    ...(condition === "Novo"  && { condition: "NEW" }),
    ...(condition === "Usado" && { condition: "USED" }),
    ...(vehicleType && { vehicleType }),
    ...(motoType    && { motoType }),
    ...(cylinderccMin !== undefined || cylinderccMax !== undefined
      ? { cylindercc: { ...(cylinderccMin !== undefined && { gte: cylinderccMin }), ...(cylinderccMax !== undefined && { lte: cylinderccMax }) } }
      : {}),
    ...(priceMin !== undefined || priceMax !== undefined
      ? { price: { ...(priceMin !== undefined && { gte: priceMin }), ...(priceMax !== undefined && { lte: priceMax }) } }
      : {}),
    ...(kmMin !== undefined || kmMax !== undefined
      ? { km: { ...(kmMin !== undefined && { gte: kmMin }), ...(kmMax !== undefined && { lte: kmMax }) } }
      : {}),
    ...(yearMin !== undefined || yearMax !== undefined
      ? { yearModel: { ...(yearMin !== undefined && { gte: yearMin }), ...(yearMax !== undefined && { lte: yearMax }) } }
      : {}),
    ...(q && {
      OR: [
        { brand: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
        { version: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const userOrderBy =
    sort === "price_asc"  ? { price: "asc"  as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    sort === "km_asc"     ? { km:    "asc"  as const } :
                            { createdAt: "desc" as const };

  try {
  // Fetch boosted vehicles first (ELITE → DESTAQUE/PUSH), then regular
  const [boostedElite, boostedDestaque, regular, total] = await Promise.all([
    prisma.vehicle.findMany({
      where: { ...where, boostLevel: "ELITE", boostTopUntil: { gte: now } },
      orderBy: userOrderBy,
      include: {
        photos: { where: { isCover: true }, take: 1 },
        user:   { select: { id: true, name: true, avatarUrl: true, plan: true } },
      },
    }),
    prisma.vehicle.findMany({
      where: { ...where, boostLevel: "DESTAQUE", boostTopUntil: { gte: now } },
      orderBy: userOrderBy,
      include: {
        photos: { where: { isCover: true }, take: 1 },
        user:   { select: { id: true, name: true, avatarUrl: true, plan: true } },
      },
    }),
    prisma.vehicle.findMany({
      where: {
        ...where,
        OR: [
          { boostTopUntil: null },
          { boostTopUntil: { lt: now } },
        ],
      },
      orderBy: userOrderBy,
      skip,
      take: limit,
      include: {
        photos: { where: { isCover: true }, take: 1 },
        user:   { select: { id: true, name: true, avatarUrl: true, plan: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  // Shuffle each boost tier independently so no vendor holds a permanent top position
  const shuffle = <T,>(arr: T[]) => arr.map(v => ({ v, r: Math.random() })).sort((a, b) => a.r - b.r).map(x => x.v);

  type VehicleRow = (typeof boostedElite)[number];
  const boosted: VehicleRow[] = [...shuffle(boostedElite), ...shuffle(boostedDestaque)];
  const boostedIds = new Set(boosted.map(v => v.id));
  const regularFiltered = regular.filter((v: VehicleRow) => !boostedIds.has(v.id));

  // On page 1 show boosted at top; on subsequent pages skip them
  const vehicles = page === 1
    ? [...boosted, ...regularFiltered].slice(0, limit)
    : regularFiltered;

  return NextResponse.json({ vehicles, total, page, pages: Math.ceil(total / limit), boostedCount: boosted.length });
  } catch (err) {
    console.error("[vehicles GET]", err);
    return NextResponse.json({ error: "Erro ao buscar veículos." }, { status: 500 });
  }
}

/* ── POST /api/vehicles — criar anúncio ── */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  // Limite por tipo de conta
  const u = user as any;
  const limit = u.accountType === "PJ" ? 20 : user.plan === "PREMIUM" ? 20 : 3;
  const activeCount = await prisma.vehicle.count({
    where: { userId: user.id, status: { in: ["ACTIVE", "DRAFT", "PAUSED"] } },
  });
  if (activeCount >= limit)
    return NextResponse.json(
      { error: `Limite de ${limit} anúncios atingido para o seu plano.` },
      { status: 403 }
    );

  try {
    const body = await req.json();

    const vehicle = await (prisma.vehicle.create as any)({
      data: {
        userId:       user.id,
        status:       "DRAFT",
        brand:        body.brand        || "",
        model:        body.model        || "",
        version:      body.version      || null,
        bodyType:     body.bodyType     || null,
        yearFab:      Number(body.yearFab)   || 0,
        yearModel:    Number(body.yearModel) || 0,
        km:           Number(body.km)        || 0,
        fuel:         body.fuel         || "",
        transmission: body.transmission || "",
        color:        body.color        || null,
        doors:        body.doors ? Number(body.doors) : null,
        price:        Number(body.price) || 0,
        acceptTrade:  Boolean(body.acceptTrade),
        financing:    Boolean(body.financing),
        armored:      Boolean(body.armored),
        auction:      Boolean(body.auction),
        condition:    body.condition === "Novo" ? "NEW" : "USED",
        description:  body.description  || null,
        city:         body.city  ?? user.city  ?? "",
        state:        body.state ?? user.state ?? "",
        vehicleType:  body.vehicleType  ?? "CAR",
        motoType:     body.motoType     || null,
        cylindercc:   body.cylindercc   ? Number(body.cylindercc) : null,
        fipeBrandCode: body.fipeBrandCode ?? null,
        fipeModelCode: body.fipeModelCode ?? null,
        fipeYearCode:  body.fipeYearCode  ?? null,
        features: body.features?.length
          ? { create: body.features.map((name: string) => ({ name })) }
          : undefined,
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (err) {
    console.error("[vehicles POST]", err);
    return NextResponse.json({ error: "Erro ao criar anúncio." }, { status: 500 });
  }
}
