import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.clienteFornecedor.findFirst({ where: { id, userId: user.id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find buyer users matching email or phone
  const buyerWhere: { OR: object[] } = { OR: [] };
  if (lead.email) buyerWhere.OR.push({ email: lead.email });
  if (lead.telefone) buyerWhere.OR.push({ phone: lead.telefone });

  if (buyerWhere.OR.length === 0) return NextResponse.json({ history: [] });

  const buyers = await prisma.user.findMany({ where: buyerWhere, select: { id: true } });
  const buyerIds = buyers.map(b => b.id);
  if (buyerIds.length === 0) return NextResponse.json({ history: [] });

  const conversations = await prisma.conversation.findMany({
    where: { buyerId: { in: buyerIds }, sellerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      vehicle: { select: { id: true, brand: true, model: true, version: true, yearFab: true } },
      messages: { orderBy: { createdAt: "asc" } },
      crm: true,
      notas: { orderBy: { createdAt: "asc" } },
    },
  });

  const history = conversations.map(conv => ({
    id: conv.id,
    vehicle: conv.vehicle
      ? `${conv.vehicle.brand} ${conv.vehicle.model}${conv.vehicle.version ? ` ${conv.vehicle.version}` : ""} ${conv.vehicle.yearFab}`
      : "Veículo removido",
    vehicleId: conv.vehicle?.id ?? null,
    stage: conv.crm?.stage ?? "novo",
    tags: conv.crm?.tags ? JSON.parse(conv.crm.tags) : [],
    valorProposta: conv.crm?.valorProposta ?? null,
    interesse: conv.crm?.interesse ?? null,
    motivoPerda: conv.crm?.motivoPerda ?? null,
    mensagens: conv.messages.length,
    notas: conv.notas.map(n => ({ id: n.id, texto: n.texto, autorNome: n.autorNome, createdAt: n.createdAt })),
    updatedAt: conv.updatedAt,
    createdAt: conv.createdAt,
  }));

  return NextResponse.json({ history });
}
