import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { path, referrer, sessionId } = await req.json();

    if (path?.startsWith("/admin")) return NextResponse.json({ ok: true });

    const ua = req.headers.get("user-agent") ?? "";
    const device = /Mobile|Android|iPhone|iPad/i.test(ua)
      ? /iPad/i.test(ua) ? "tablet" : "mobile"
      : "desktop";

    const country = req.headers.get("x-vercel-ip-country") ??
      req.headers.get("cf-ipcountry") ?? null;

    await (prisma as any).pageView.create({
      data: { path: path ?? "/", referrer: referrer || null, device, country, sessionId: sessionId || null },
    });
  } catch {
    // silent
  }
  return NextResponse.json({ ok: true });
}
