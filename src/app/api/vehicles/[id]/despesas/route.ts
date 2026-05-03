import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { userId: true } });
  if (vehicle?.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const despesas = await prisma.vehicleDespesa.findMany({
    where: { vehicleId: id },
    include: { clienteFornecedor: { select: { id: true, nome: true } } },
    orderBy: { data: "desc" },
  });
  return NextResponse.json({ despesas });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { userId: true } });
  if (vehicle?.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { nome, data, valor, clienteFornecedorId } = body;
  if (!nome || !data || valor == null) return NextResponse.json({ error: "Campos obrigatórios: nome, data, valor" }, { status: 400 });
  const despesa = await prisma.vehicleDespesa.create({
    data: {
      vehicleId: id,
      nome,
      data: new Date(data),
      valor: Math.round(Number(valor)),
      clienteFornecedorId: clienteFornecedorId || null,
    },
    include: { clienteFornecedor: { select: { id: true, nome: true } } },
  });
  return NextResponse.json({ despesa }, { status: 201 });
}
