import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(`forgot:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde 1 hora." }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "E-mail obrigatorio." }, { status: 400 });

  // Always return success to avoid user enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true });

  // Invalidate previous tokens
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });

  try {
    await sendPasswordResetEmail(user.email, user.name, token);
  } catch (err) {
    console.error("[forgot-password] email error:", err);
    // In dev, log the reset URL so it can be tested without SMTP
    console.log(`[forgot-password] reset URL: ${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`);
  }

  return NextResponse.json({ ok: true });
}
