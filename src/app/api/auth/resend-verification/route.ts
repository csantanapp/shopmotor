import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    if ((user as any).emailVerified) return NextResponse.json({ error: "E-mail já verificado." }, { status: 400 });

    // Invalidate existing tokens
    await (prisma as any).emailVerification.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await (prisma as any).emailVerification.create({ data: { userId: user.id, token, expiresAt } });

    sendVerificationEmail(user.email, user.name, token).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[resend-verification]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
