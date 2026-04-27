import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "shopmotor_token";
const JWT_SECRET  = new TextEncoder().encode(process.env.JWT_SECRET ?? "shopmotor_secret_2024_xK9mP2qR");

// ── Rate limiting em memória (sliding window) ─────────────────────────────────
// Limites por rota sensível (requests por janela de tempo)
const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/auth/login":           { max: 10,  windowMs: 60_000 },   // 10/min
  "/api/auth/register":        { max: 5,   windowMs: 60_000 },   // 5/min
  "/api/auth/forgot-password": { max: 5,   windowMs: 60_000 },   // 5/min
  "/api/contact":              { max: 10,  windowMs: 60_000 },   // 10/min
  "/api/financiamento":        { max: 10,  windowMs: 60_000 },   // 10/min
  "/api/seguros":              { max: 10,  windowMs: 60_000 },   // 10/min
  "/api/conversations":        { max: 30,  windowMs: 60_000 },   // 30/min
};

// Map: "ip:rota" → timestamps de requests
const hitMap = new Map<string, number[]>();

function isRateLimited(ip: string, pathname: string): boolean {
  const limit = RATE_LIMITS[pathname];
  if (!limit) return false;

  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const hits = (hitMap.get(key) ?? []).filter(t => now - t < limit.windowMs);
  hits.push(now);
  hitMap.set(key, hits);

  // Limpeza periódica para não acumular memória
  if (hitMap.size > 10_000) {
    for (const [k, timestamps] of hitMap) {
      if (timestamps.every(t => now - t > 300_000)) hitMap.delete(k);
    }
  }

  return hits.length > limit.max;
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Rate limiting
  if (isRateLimited(getIp(req), pathname)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde e tente novamente." }, { status: 429 });
  }

  if (pathname.startsWith("/perfil") && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if ((payload as any).role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/perfil/:path*",
    "/admin/:path*",
    "/admin",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/contact",
    "/api/financiamento",
    "/api/seguros",
    "/api/conversations",
  ],
};
