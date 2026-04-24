import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/* ── GET /api/vehicles/[id] ── */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      photos:   { orderBy: { order: "asc" } },
      features: true,
      user:     { select: { id: true, name: true, nickname: true, tradeName: true, avatarUrl: true, phone: true, plan: true, city: true, state: true, createdAt: true, lastSeenAt: true, accountType: true, storeSlug: true } },
    },
  });

  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });

  // Incrementar views (fire-and-forget, não bloqueia a resposta)
  prisma.vehicle.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => null);

  try {
    const now = new Date();
    const [similar, listingsCount, totalListings, activeSub] = await Promise.all([
      prisma.vehicle.aggregate({
        where: { brand: vehicle.brand, model: vehicle.model, status: "ACTIVE" },
        _avg: { price: true },
        _count: true,
      }),
      prisma.vehicle.count({ where: { userId: vehicle.userId, status: "ACTIVE" } }),
      prisma.vehicle.count({ where: { userId: vehicle.userId } }),
      (prisma as any).storeSubscription.findFirst({
        where: { userId: vehicle.userId, status: "active", endsAt: { gt: now } },
        orderBy: { endsAt: "desc" },
        select: { plan: true },
      }),
    ]);

    return NextResponse.json({
      vehicle: { ...vehicle, user: { ...vehicle.user, listingsCount, salesCount: totalListings, subPlan: activeSub?.plan ?? null } },
      priceComparison: {
        shopMotorAvg: similar._avg.price,
        shopMotorCount: similar._count,
      },
    });
  } catch {
    return NextResponse.json({ vehicle: { ...vehicle, user: { ...vehicle.user, subPlan: null } }, priceComparison: null });
  }
}

/* ── PATCH /api/vehicles/[id] ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  if (vehicle.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await req.json();

  // Calcular expiresAt ao ativar o anúncio
  let expiresAt: Date | undefined;
  if (body.status === "ACTIVE" && vehicle.status !== "ACTIVE") {
    const u = user as any;
    const days = u.accountType === "PJ" ? 60 : 30;
    expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  try {
    const updated = await (prisma.vehicle.update as any)({
      where: { id },
      data: {
        ...(expiresAt !== undefined && { expiresAt }),
        ...(body.brand        !== undefined && { brand:        body.brand }),
        ...(body.model        !== undefined && { model:        body.model }),
        ...(body.version      !== undefined && { version:      body.version }),
        ...(body.price !== undefined && (() => {
          const newPrice = Number(body.price);
          const priceData: Record<string, number> = { price: newPrice };
          if (newPrice < vehicle.price) priceData.previousPrice = vehicle.price;
          return priceData;
        })()),
        ...(body.km           !== undefined && { km:           Number(body.km) }),
        ...(body.description  !== undefined && { description:  body.description }),
        ...(body.status       !== undefined && { status:       body.status }),
        ...(body.color        !== undefined && { color:        body.color }),
        ...(body.fuel         !== undefined && { fuel:         body.fuel }),
        ...(body.transmission !== undefined && { transmission: body.transmission }),
        ...(body.acceptTrade  !== undefined && { acceptTrade:  Boolean(body.acceptTrade) }),
        ...(body.financing    !== undefined && { financing:    Boolean(body.financing) }),
        ...(body.armored      !== undefined && { armored:      Boolean(body.armored) }),
        ...(body.auction      !== undefined && { auction:      Boolean(body.auction) }),
        ...(body.yearFab      !== undefined && { yearFab:      Number(body.yearFab) }),
        ...(body.yearModel    !== undefined && { yearModel:    Number(body.yearModel) }),
        ...(body.bodyType     !== undefined && { bodyType:     body.bodyType }),
        ...(body.doors        !== undefined && { doors:        body.doors ? Number(body.doors) : null }),
        ...(body.condition    !== undefined && { condition:    body.condition }),
        ...(body.city          !== undefined && { city:          body.city }),
        ...(body.state         !== undefined && { state:         body.state }),
        ...(body.fipeBrandCode !== undefined && { fipeBrandCode: body.fipeBrandCode }),
        ...(body.fipeModelCode !== undefined && { fipeModelCode: body.fipeModelCode }),
        ...(body.fipeYearCode  !== undefined && { fipeYearCode:  body.fipeYearCode }),
        ...(body.motoType      !== undefined && { motoType:      body.motoType || null }),
        ...(body.cylindercc    !== undefined && { cylindercc:    body.cylindercc ? Number(body.cylindercc) : null }),
      },
    });
    return NextResponse.json({ vehicle: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("PATCH vehicle error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ── DELETE /api/vehicles/[id] ── */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  if (vehicle.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await prisma.vehicle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
