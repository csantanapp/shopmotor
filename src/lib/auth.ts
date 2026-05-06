import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest } from "next/server";

const JWT_SECRET  = process.env.JWT_SECRET!;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? "24h";
const COOKIE_NAME = "shopmotor_token";
const COOKIE_TTL_DAYS = 1;

export const SECURE_COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax",
  path:     "/",
};

export interface JWTPayload {
  userId: string;
  email:  string;
  role:   string;
}

/* ── Gerar token ── */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as jwt.SignOptions);
}

/* ── Verificar token ── */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/* ── Pegar usuário logado a partir dos cookies ── */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
}

/* ── Criar sessão e setar cookie ── */
export async function createSession(userId: string, email: string, role: string) {
  const token = signToken({ userId, email, role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + COOKIE_TTL_DAYS);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  return { token, expiresAt };
}

/* ── Revogar sessão ── */
export async function revokeSession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export { COOKIE_NAME };

/**
 * Resolve o usuário dono da loja a partir de qualquer contexto ERP.
 * - Se houver erp_token válido → retorna o usuário cujo id é lojaUserId (dono da loja)
 * - Caso contrário → delega para getCurrentUser() (dono logado normalmente)
 *
 * Use esta função em todos os endpoints do ERP para que colaboradores
 * vejam os dados da loja do dono, não os seus próprios.
 */
export async function getErpUser(req?: NextRequest) {
  // Tenta erp_token primeiro (via req.cookies em route handlers, ou next/headers)
  let erpToken: string | undefined;
  if (req) {
    erpToken = req.cookies.get("erp_token")?.value;
  } else {
    const cookieStore = await cookies();
    erpToken = cookieStore.get("erp_token")?.value;
  }

  if (erpToken) {
    try {
      const payload = jwt.verify(erpToken, JWT_SECRET) as { lojaUserId: string };
      if (payload?.lojaUserId) {
        return prisma.user.findUnique({ where: { id: payload.lojaUserId } });
      }
    } catch {
      // token inválido — cai para o fluxo normal
    }
  }

  return getCurrentUser();
}
