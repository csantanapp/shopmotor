import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErpUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string; despesaId: string }> };

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const user = await getErpUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, despesaId } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { userId: true } });
  if (vehicle?.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.vehicleDespesa.deleteMany({ where: { id: despesaId, vehicleId: id } });
  return NextResponse.json({ ok: true });
}
