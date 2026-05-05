import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Nota = { texto: string; autorNome: string; createdAt: string };

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lead = await prisma.financiamentoLead.findFirst({
    where: { id: params.id, storeUserId: user.id },
  });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ lead });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lead = await prisma.financiamentoLead.findFirst({
    where: { id: params.id, storeUserId: user.id },
  });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, string>;
  try { body = await req.json(); } catch { return Response.json({ error: "Body inválido." }, { status: 400 }); }

  // Add a nota
  if (body.addNota) {
    const existing = Array.isArray(lead.notas) ? (lead.notas as Nota[]) : [];
    const notas: Nota[] = [...existing, { texto: body.addNota, autorNome: body.autorNome ?? "Atendente", createdAt: new Date().toISOString() }];
    const updated = await prisma.financiamentoLead.update({
      where: { id: params.id },
      data: { notas },
    });
    return NextResponse.json({ notas: updated.notas });
  }

  // Update status
  if (body.status) {
    const allowed = ["novo", "contatado", "convertido", "descartado"];
    if (!allowed.includes(body.status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    await prisma.financiamentoLead.update({ where: { id: params.id }, data: { status: body.status } });
  }

  return NextResponse.json({ ok: true });
}
