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
      user:     { select: { id: true, name: true, avatarUrl: true, phone: true, plan: true, city: true, state: true, createdAt: true } },
    },
  });

  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });

  // Incrementar views
  await prisma.vehicle.update({ where: { id }, data: { views: { increment: 1 } } });

  return NextResponse.json({ vehicle });
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

  const updated = await prisma.vehicle.update({
    where: { id },
    data: {
      ...(body.brand        !== undefined && { brand:        body.brand }),
      ...(body.model        !== undefined && { model:        body.model }),
      ...(body.version      !== undefined && { version:      body.version }),
      ...(body.price        !== undefined && { price:        Number(body.price) }),
      ...(body.km           !== undefined && { km:           Number(body.km) }),
      ...(body.description  !== undefined && { description:  body.description }),
      ...(body.status       !== undefined && { status:       body.status }),
      ...(body.color        !== undefined && { color:        body.color }),
      ...(body.fuel         !== undefined && { fuel:         body.fuel }),
      ...(body.transmission !== undefined && { transmission: body.transmission }),
      ...(body.acceptTrade  !== undefined && { acceptTrade:  Boolean(body.acceptTrade) }),
      ...(body.financing    !== undefined && { financing:    Boolean(body.financing) }),
    },
  });

  return NextResponse.json({ vehicle: updated });
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
