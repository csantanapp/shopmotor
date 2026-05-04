import { NextRequest, NextResponse } from "next/server";
import { SECURE_COOKIE_OPTIONS } from "@/lib/auth";

const isSafeRedirect = (url: string) => url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\");

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const rawRedirect = req.nextUrl.searchParams.get("redirect") ?? "/perfil";
  const redirect = isSafeRedirect(rawRedirect) ? rawRedirect : "/perfil";

  // CSRF: generate a random token, store in cookie, embed in state
  const csrfToken = crypto.randomUUID();
  const state = `${csrfToken}|${redirect}`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );

  // Short-lived cookie — expires when browser closes or after 10 min
  response.cookies.set("oauth_csrf", csrfToken, {
    ...SECURE_COOKIE_OPTIONS,
    maxAge: 600,
  });

  return response;
}
