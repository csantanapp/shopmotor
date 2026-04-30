import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, COOKIE_NAME, SECURE_COOKIE_OPTIONS } from "@/lib/auth";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req);
    if (!rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      // User registered via Google (no password) — suggest Google login
      if (user && (user as any).googleId) {
        return NextResponse.json({ error: "Esta conta usa login com Google. Clique em 'Entrar com Google'." }, { status: 401 });
      }
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

    response.cookies.set(COOKIE_NAME, token, { ...SECURE_COOKIE_OPTIONS, expires: expiresAt });

    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
