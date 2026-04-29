import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/unsubscribe?token=<base64userId>
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/", req.url));

  try {
    const userId = Buffer.from(token, "base64").toString("utf8");
    await prisma.user.update({
      where: { id: userId },
      data: { emailUnsubscribed: true } as any,
    });
  } catch {}

  return NextResponse.redirect(new URL("/unsubscribe/confirmado", req.url));
}
