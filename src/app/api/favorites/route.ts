import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/* ── GET /api/favorites — listar favoritos do usuário ── */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      vehicle: {
        include: { photos: { where: { isCover: true }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ favorites });
}

/* ── POST /api/favorites — favoritar veículo ── */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { vehicleId } = await req.json();
  if (!vehicleId) return NextResponse.json({ error: "vehicleId obrigatório." }, { status: 400 });

  const favorite = await prisma.favorite.upsert({
    where:  { userId_vehicleId: { userId: user.id, vehicleId } },
    create: { userId: user.id, vehicleId },
    update: {},
  });

  return NextResponse.json({ favorite }, { status: 201 });
}

/* ── DELETE /api/favorites?vehicleId=xxx — desfavoritar ── */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const vehicleId = req.nextUrl.searchParams.get("vehicleId");
  if (!vehicleId) return NextResponse.json({ error: "vehicleId obrigatório." }, { status: 400 });

  await prisma.favorite.deleteMany({ where: { userId: user.id, vehicleId } });
  return NextResponse.json({ ok: true });
}
