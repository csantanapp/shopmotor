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

  // Conversations (carro / moto) — fetch all seller convs, then filter by vehicle tipoVeiculo
  if (tipo === "todos" || tipo === "carro" || tipo === "moto") {
    const convs = await (prisma as any).conversation.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: { select: { brand: true, model: true, tipoVeiculo: true } },
        buyer:   { select: { name: true, phone: true, email: true } },
      },
    });

    for (const c of convs) {
      const tv: string = c.vehicle?.tipoVeiculo ?? "carro";
      if (tipo !== "todos" && tv !== tipo) continue;
      leads.push({
        id: c.id,
        nome: c.buyer?.name ?? "—",
        telefone: c.buyer?.phone ?? null,
        email: c.buyer?.email ?? null,
        interesse: tv,
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
