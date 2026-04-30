import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/verificar-email?status=invalid", req.url));

  try {
    const record = await (prisma as any).emailVerification.findUnique({ where: { token } });

    if (!record || record.usedAt) {
      return NextResponse.redirect(new URL("/verificar-email?status=invalid", req.url));
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/verificar-email?status=expired", req.url));
    }

    await Promise.all([
      prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
      (prisma as any).emailVerification.update({ where: { token }, data: { usedAt: new Date() } }),
    ]);

    return NextResponse.redirect(new URL("/verificar-email?status=ok", req.url));
  } catch (err) {
    console.error("[verify-email]", err);
    return NextResponse.redirect(new URL("/verificar-email?status=error", req.url));
  }
}
