import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "shopmotor_token";
const JWT_SECRET  = new TextEncoder().encode(process.env.JWT_SECRET ?? "shopmotor_secret_2024_xK9mP2qR");

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

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
  matcher: ["/perfil/:path*", "/admin/:path*", "/admin"],
};
