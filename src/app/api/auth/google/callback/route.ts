import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, COOKIE_NAME, SECURE_COOKIE_OPTIONS } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state") ?? "/perfil";

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=google_cancelled`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  `${baseUrl}/api/auth/google/callback`,
        grant_type:    "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_token`);
    }

    const tokens = await tokenRes.json();

    // 2. Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${baseUrl}/login?error=google_userinfo`);
    }

    const googleUser: { id: string; email: string; name: string; picture: string } = await userRes.json();

    // 3. Find or create user
    const db = prisma as any;
    let user = await db.user.findFirst({
      where: { OR: [{ googleId: googleUser.id }, { email: googleUser.email }] },
    });

    if (!user) {
      // New user via Google
      user = await db.user.create({
        data: {
          name:            googleUser.name,
          email:           googleUser.email,
          googleId:        googleUser.id,
          avatarUrl:       googleUser.picture,
          emailVerified:   true,
          profileComplete: false,
          role:            "SELLER",
        },
      });
    } else if (!user.googleId) {
      // Existing user (registered with email/password) — link Google account
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId:      googleUser.id,
          emailVerified: true,
          avatarUrl:     user.avatarUrl ?? googleUser.picture,
        },
      });
    }

    // 4. Create session
    const { token, expiresAt } = await createSession(user.id, user.email, user.role);

    // 5. Redirect — new/incomplete users go to conta with welcome banner
    const isNew = !(user as any).profileComplete;
    const destination = isNew
      ? `${baseUrl}/perfil/conta?welcome=google`
      : `${baseUrl}${state}`;

    const response = NextResponse.redirect(destination);
    response.cookies.set(COOKIE_NAME, token, { ...SECURE_COOKIE_OPTIONS, expires: expiresAt });

    return response;
  } catch (err) {
    console.error("[google/callback]", err);
    return NextResponse.redirect(`${baseUrl}/login?error=google_error`);
  }
}
