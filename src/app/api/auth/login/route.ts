import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user.id, user.email, user.role);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, avatarUrl: user.avatarUrl },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires:  expiresAt,
      path:     "/",
    });

    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
