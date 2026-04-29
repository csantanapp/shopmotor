import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const PLANS: Record<string, number> = {
  TURBO: 17.90,
  DESTAQUE: 27.90,
  SUPER_DESTAQUE: 47.90,
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ valid: false, error: "Não autenticado." }, { status: 401 });

  const { code, plan } = await req.json();
  if (!code || !plan) return NextResponse.json({ valid: false, error: "Dados inválidos." });

  const db = prisma as any;
  const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.active)
    return NextResponse.json({ valid: false, error: "Cupom inválido ou inativo." });

  const now = new Date();
  if (coupon.validFrom && new Date(coupon.validFrom) > now)
    return NextResponse.json({ valid: false, error: "Cupom ainda não está válido." });
  if (coupon.validUntil && new Date(coupon.validUntil) < now)
    return NextResponse.json({ valid: false, error: "Cupom expirado." });
  if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses)
    return NextResponse.json({ valid: false, error: "Cupom esgotado." });

  // Segmento
  if (coupon.segment !== "all") {
    const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: { accountType: true } });
    const accountType = fullUser?.accountType ?? "PF";
    if (coupon.segment === "pf" && accountType !== "PF")
      return NextResponse.json({ valid: false, error: "Cupom válido apenas para Pessoa Física." });
    if (coupon.segment === "lojista" && accountType !== "PJ")
      return NextResponse.json({ valid: false, error: "Cupom válido apenas para Lojistas." });
  }

  // Verificar se usuário já usou este cupom
  const alreadyUsed = await db.couponUse.findFirst({ where: { couponId: coupon.id, userId: user.id } });
  if (alreadyUsed)
    return NextResponse.json({ valid: false, error: "Você já utilizou este cupom." });

  // Primeiro uso — nunca impulsionou
  if (coupon.firstUseOnly) {
    const hasBoost = await (prisma as any).payment.findFirst({
      where: { userId: user.id, status: "approved" },
    });
    if (hasBoost)
      return NextResponse.json({ valid: false, error: "Cupom válido apenas para o primeiro impulsionamento." });
  }

  const originalPrice = PLANS[plan];
  if (!originalPrice) return NextResponse.json({ valid: false, error: "Plano inválido." });

  const discount = coupon.discountType === "percent"
    ? originalPrice * (coupon.discountValue / 100)
    : Math.min(coupon.discountValue, originalPrice);

  const finalPrice = Math.max(0.01, originalPrice - discount);

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    couponId: coupon.id,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    originalPrice,
    discount: Math.round(discount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
  });
}
