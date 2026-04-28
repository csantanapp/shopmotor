import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendRenewalConfirmationEmail } from "@/lib/vehicle-emails";

// POST /api/vehicles/[id]/renew
// Renova um anúncio EXPIRED por mais 30 dias (máximo 2 renovações)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true, renewalCount: true },
  });

  if (!vehicle) return NextResponse.json({ error: "Anúncio não encontrado." }, { status: 404 });
  if (vehicle.userId !== user.id)
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  if (vehicle.status !== "EXPIRED")
    return NextResponse.json({ error: "Apenas anúncios expirados podem ser renovados." }, { status: 400 });
  if (vehicle.renewalCount >= 2)
    return NextResponse.json(
      { error: "Este anúncio já utilizou os 2 períodos gratuitos. Impulsione para reativar." },
      { status: 403 }
    );

  const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const newRenewalCount = vehicle.renewalCount + 1;

  const updated = await prisma.vehicle.update({
    where: { id },
    data: {
      status: "ACTIVE",
      expiresAt: newExpiresAt,
      renewalCount: newRenewalCount,
    },
    select: { id: true, brand: true, model: true, yearFab: true, status: true, expiresAt: true, renewalCount: true, user: { select: { id: true, email: true, name: true } } },
  });

  sendRenewalConfirmationEmail(
    { id: updated.user.id, email: updated.user.email, name: updated.user.name ?? "Anunciante" },
    { brand: updated.brand, model: updated.model, yearFab: updated.yearFab },
    newExpiresAt,
    newRenewalCount,
  ).catch(e => console.error("[renew] email error", e));

  return NextResponse.json({ vehicle: updated });
}
