import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser() as any;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.accountType !== "PJ") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") ?? "todos"; // "todos" | "carro" | "moto" | "financiamento"

  const leads: {
    id: string;
    nome: string;
    telefone: string | null;
    email: string | null;
    interesse: string;
    veiculo: string | null;
    status: string;
    criadoEm: string;
  }[] = [];

  // Conversations (carro / moto)
  if (tipo === "todos" || tipo === "carro" || tipo === "moto") {
    // vehicleType in DB: "CAR" | "MOTO"
    const vehicleTypeFilter = tipo === "carro" ? "CAR" : tipo === "moto" ? "MOTO" : undefined;

    const convs = await prisma.conversation.findMany({
      where: {
        sellerId: user.id,
        ...(vehicleTypeFilter && { vehicle: { vehicleType: vehicleTypeFilter } }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: { select: { brand: true, model: true, vehicleType: true } },
        buyer:   { select: { name: true, phone: true, email: true } },
      },
    });

    for (const c of convs) {
      const vt = c.vehicle?.vehicleType ?? "CAR";
      const interesse = vt === "MOTO" ? "moto" : "carro";
      leads.push({
        id: c.id,
        nome: c.buyer?.name ?? "—",
        telefone: (c.buyer as any)?.phone ?? null,
        email: c.buyer?.email ?? null,
        interesse,
        veiculo: c.vehicle ? `${c.vehicle.brand} ${c.vehicle.model}` : null,
        status: "conversa",
        criadoEm: c.createdAt.toISOString(),
      });
    }
  }

  // Financiamento leads
  if (tipo === "todos" || tipo === "financiamento") {
    const fins = await prisma.financiamentoLead.findMany({
      where: { storeUserId: user.id },
      orderBy: { createdAt: "desc" },
    });

    for (const f of fins) {
      leads.push({
        id: f.id,
        nome: f.nome,
        telefone: f.whatsapp,
        email: f.email,
        interesse: "financiamento",
        veiculo: null,
        status: f.status,
        criadoEm: f.createdAt.toISOString(),
      });
    }
  }

  leads.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  return NextResponse.json({ leads });
}
