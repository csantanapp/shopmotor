import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { userId: true } });
  if (vehicle?.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const aquisicao = await prisma.vehicleAquisicao.findUnique({
    where: { vehicleId: id },
    include: { clienteFornecedor: true },
  });
  return NextResponse.json({ aquisicao });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { userId: true } });
  if (vehicle?.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const aquisicao = await prisma.vehicleAquisicao.upsert({
    where: { vehicleId: id },
    create: { vehicleId: id, ...body },
    update: body,
  });
  return NextResponse.json({ aquisicao });
}
