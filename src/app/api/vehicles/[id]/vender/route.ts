import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { userId: true, price: true } });
  if (!vehicle || vehicle.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { buyerNome, buyerDocumento, buyerTelefone, buyerEmail, observacao, soldAt } = body;

  const [updated] = await prisma.$transaction([
    prisma.vehicle.update({ where: { id }, data: { status: "SOLD" } }),
    prisma.vehicleSale.upsert({
      where: { vehicleId: id },
      create: {
        vehicleId: id,
        valorVenda: vehicle.price,
        soldAt: soldAt ? new Date(soldAt) : new Date(),
        buyerNome: buyerNome || null,
        buyerDocumento: buyerDocumento || null,
        buyerTelefone: buyerTelefone || null,
        buyerEmail: buyerEmail || null,
        observacao: observacao || null,
      },
      update: {
        valorVenda: vehicle.price,
        soldAt: soldAt ? new Date(soldAt) : new Date(),
        buyerNome: buyerNome || null,
        buyerDocumento: buyerDocumento || null,
        buyerTelefone: buyerTelefone || null,
        buyerEmail: buyerEmail || null,
        observacao: observacao || null,
      },
    }),
  ]);

  return NextResponse.json({ vehicle: updated });
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { userId: true } });
  if (!vehicle || vehicle.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sale = await prisma.vehicleSale.findUnique({ where: { vehicleId: id } });
  return NextResponse.json({ sale });
}
