import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const db = prisma;
  const items = await db.faqItem.findMany({
    orderBy: [{ pagina: "asc" }, { categoria: "asc" }, { ordem: "asc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const db = prisma;
  const body = await req.json();
  const item = await db.faqItem.create({
    data: {
      categoria: body.categoria,
      pergunta: body.pergunta,
      resposta: body.resposta,
      ordem: Number(body.ordem ?? 0),
      ativo: body.ativo ?? true,
      pagina: body.pagina ?? "faq",
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const db = prisma;
  const { id, ...data } = await req.json();
  if (data.ordem !== undefined) data.ordem = Number(data.ordem);
  const item = await db.faqItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const db = prisma;
  const { id } = await req.json();
  await db.faqItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
