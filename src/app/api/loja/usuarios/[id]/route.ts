import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErpUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getErpUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { nome, email, senha, grupoId } = await req.json();
  const data: Record<string, unknown> = {};
  if (nome)    data.nome    = nome;
  if (email)   data.email   = email;
  if (grupoId) data.grupoId = grupoId;
  if (senha)   data.senhaHash = await bcrypt.hash(senha, 10);
  await prisma.usuarioLoja.updateMany({ where: { id: params.id, userId: user.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getErpUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.usuarioLoja.deleteMany({ where: { id: params.id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
