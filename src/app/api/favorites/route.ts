import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/* GET /api/favorites?vehicleId=xxx — verifica se é favorito */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ isFav: false });

  const vehicleId = req.nextUrl.searchParams.get("vehicleId");
  if (!vehicleId) return NextResponse.json({ isFav: false });

  const fav = await prisma.favorite.findUnique({
    where: { userId_vehicleId: { userId: user.id, vehicleId } },
  });

  return NextResponse.json({ isFav: !!fav });
}

/* POST /api/favorites — adiciona favorito */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { vehicleId } = await req.json();
  if (!vehicleId) return NextResponse.json({ error: "vehicleId obrigatório." }, { status: 400 });

  await prisma.favorite.upsert({
    where: { userId_vehicleId: { userId: user.id, vehicleId } },
    create: { userId: user.id, vehicleId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

/* DELETE /api/favorites?vehicleId=xxx — remove favorito */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const vehicleId = req.nextUrl.searchParams.get("vehicleId");
  if (!vehicleId) return NextResponse.json({ error: "vehicleId obrigatório." }, { status: 400 });

  await prisma.favorite.deleteMany({
    where: { userId: user.id, vehicleId },
  });

  return NextResponse.json({ ok: true });
}
