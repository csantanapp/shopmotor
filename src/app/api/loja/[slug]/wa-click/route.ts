import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    await prisma.pageView.create({
      data: {
        path: `/loja/${slug}/whatsapp`,
        device: req.headers.get("user-agent")?.toLowerCase().includes("mobile") ? "Mobile" : "Desktop",
        sessionId: req.headers.get("x-session-id") ?? null,
      },
    });
  } catch {}
  return NextResponse.json({ ok: true });
}
