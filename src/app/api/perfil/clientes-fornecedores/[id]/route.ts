import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function getOwned(id: string, userId: string) {
  return prisma.clienteFornecedor.findFirst({ where: { id, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const item = await prisma.clienteFornecedor.findFirst({
    where: { id, userId: user.id },
    include: {
      vehicles: {
        include: {
          vehicle: { select: { id: true, brand: true, model: true, version: true, yearFab: true, price: true, status: true } },
        },
      },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!await getOwned(id, user.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const item = await prisma.clienteFornecedor.update({ where: { id }, data: body });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!await getOwned(id, user.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.clienteFornecedor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
