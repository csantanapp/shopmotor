import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "shopmotor_token";
const PROTECTED   = ["/perfil"];
const AUTH_ONLY   = ["/login", "/cadastro"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let isLoggedIn = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(token, secret);
      isLoggedIn = true;
    } catch {
      isLoggedIn = false;
    }
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected && !isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));
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
