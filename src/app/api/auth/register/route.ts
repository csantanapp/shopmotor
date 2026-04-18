import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "A senha deve ter no mínimo 8 caracteres." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role: "SELLER" },
      select: { id: true, name: true, email: true, role: true, plan: true },
    });

    const { token, expiresAt } = await createSession(user.id, user.email, user.role);

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires:  expiresAt,
      path:     "/",
    });

    return response;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
