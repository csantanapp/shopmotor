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
  const sort        = searchParams.get("sort")         ?? "createdAt_desc";
  const page        = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit       = Math.min(48, Number(searchParams.get("limit") ?? 24));
  const skip        = (page - 1) * limit;

  const where: Record<string, unknown> = {
    status: "ACTIVE",
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

  const orderBy =
    sort === "price_asc"  ? { price: "asc"  as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    sort === "km_asc"     ? { km:    "asc"  as const } :
                            { createdAt: "desc" as const };

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        photos:   { where: { isCover: true }, take: 1 },
        user:     { select: { id: true, name: true, avatarUrl: true, plan: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return NextResponse.json({ vehicles, total, page, pages: Math.ceil(total / limit) });
}

/* ── POST /api/vehicles — criar anúncio ── */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();

    const vehicle = await prisma.vehicle.create({
      data: {
        userId:       user.id,
        status:       "DRAFT",
        brand:        body.brand,
        model:        body.model,
        version:      body.version,
        bodyType:     body.bodyType,
        yearFab:      Number(body.yearFab),
        yearModel:    Number(body.yearModel),
        km:           Number(body.km),
        fuel:         body.fuel,
        transmission: body.transmission,
        color:        body.color,
        doors:        body.doors ? Number(body.doors) : null,
        price:        Number(body.price),
        acceptTrade:  Boolean(body.acceptTrade),
        financing:    Boolean(body.financing),
        armored:      Boolean(body.armored),
        auction:      Boolean(body.auction),
        condition:    body.condition === "Novo" ? "NEW" : "USED",
        description:  body.description,
        city:         body.city ?? user.city ?? "",
        state:        body.state ?? user.state ?? "",
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
