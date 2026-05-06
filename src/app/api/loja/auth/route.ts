import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "erp_token";

/* POST /api/loja/auth — login de colaborador */
export async function POST(req: NextRequest) {
  const { email, senha } = await req.json();
  if (!email || !senha) {
    return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 });
  }

  const colaborador = await prisma.usuarioLoja.findFirst({
    where: { email: email.toLowerCase().trim() },
    include: {
      grupo: { select: { id: true, nome: true, modulos: true } },
      user:  { select: { id: true, tradeName: true, companyName: true, name: true, storeSlug: true } },
    },
  });

  if (!colaborador) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const valid = await bcrypt.compare(senha, colaborador.senhaHash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const modulos = (() => { try { return JSON.parse(colaborador.grupo.modulos); } catch { return {}; } })();

  const payload = {
    colaboradorId: colaborador.id,
    lojaUserId:    colaborador.userId,
    nome:          colaborador.nome,
    email:         colaborador.email,
    grupoId:       colaborador.grupoId,
    grupoNome:     colaborador.grupo.nome,
    modulos,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });

  const res = NextResponse.json({
    ok: true,
    nome: colaborador.nome,
    loja: colaborador.user.tradeName ?? colaborador.user.companyName ?? colaborador.user.name,
    grupoNome: colaborador.grupo.nome,
    modulos,
  });

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 12, // 12h
  });

  return res;
}

/* DELETE /api/loja/auth — logout do colaborador */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("erp_token", "", { maxAge: 0, path: "/" });
  return res;
}

/* GET /api/loja/auth — retorna dados do colaborador logado */
export async function GET(req: NextRequest) {
  const token = req.cookies.get("erp_token")?.value;
  if (!token) return NextResponse.json({ colaborador: null });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    return NextResponse.json({ colaborador: payload });
  } catch {
    return NextResponse.json({ colaborador: null });
  }
}
