import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try { body = await req.json(); } catch { return Response.json({ error: "Body inválido." }, { status: 400 }); }
  const { token, password } = body;

  if (!token || !password)
    return NextResponse.json({ error: "Token e senha sao obrigatorios." }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "A senha deve ter no minimo 8 caracteres." }, { status: 400 });

  const reset = await prisma.passwordReset.findUnique({ where: { token } });

  if (!reset || reset.usedAt || new Date() > new Date(reset.expiresAt))
    return NextResponse.json({ error: "Link invalido ou expirado. Solicite um novo." }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { token }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: reset.userId } }),
  ]);

  return NextResponse.json({ ok: true });
}
