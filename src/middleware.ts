import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

const PROTECTED = ["/perfil"];
const AUTH_ONLY = ["/login", "/cadastro"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token        = req.cookies.get(COOKIE_NAME)?.value;
  const payload      = token ? verifyToken(token) : null;
  const isLoggedIn   = !!payload;

  // Rotas privadas → redireciona para login se não autenticado
  const isProtected = PROTECTED.some((path) => pathname.startsWith(path));
  if (isProtected && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Login/cadastro → redireciona para perfil se já autenticado
  const isAuthOnly = AUTH_ONLY.some((path) => pathname.startsWith(path));
  if (isAuthOnly && isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/perfil";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/perfil/:path*", "/login", "/cadastro"],
};
