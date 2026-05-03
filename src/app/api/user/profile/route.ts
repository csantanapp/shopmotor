import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { safeDecrypt } from "@/lib/crypto";

/* ── GET /api/user/profile ── */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any;
  return NextResponse.json({
    user: {
      id:        u.id,
      name:      u.name,
      email:     u.email,
      phone:     u.phone,
      avatarUrl: u.avatarUrl,
      role:      u.role,
      plan:      u.plan,
      cpf:       safeDecrypt(u.cpf),
      zipCode:   u.zipCode,
      address:   u.address,
      city:      u.city,
      state:     u.state,
      gender:      u.gender,
      nickname:    u.nickname,
      birthDate:   u.birthDate,
      createdAt:   u.createdAt,
      accountType: u.accountType,
      cnpj:        safeDecrypt(u.cnpj),
      companyName:    u.companyName,
      tradeName:      u.tradeName,
      storeBannerUrl: u.storeBannerUrl,
      storeSlug:      u.storeSlug,
    },
  });
}

/* ── PATCH /api/user/profile ── */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json();

  // Atualizar senha se fornecida
  if (body.newPassword) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: "Senha atual obrigatória." }, { status: 400 });
    }
    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: "Nova senha deve ter no mínimo 8 caracteres." }, { status: 400 });
    }
    body.passwordHash = await bcrypt.hash(body.newPassword, 12);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};
    if (body.name         !== undefined) data.name         = body.name;
    if (body.phone        !== undefined) data.phone        = body.phone;
    if (body.zipCode      !== undefined) data.zipCode      = body.zipCode;
    if (body.address      !== undefined) data.address      = body.address;
    if (body.city         !== undefined) data.city         = body.city;
    if (body.state        !== undefined) data.state        = body.state;
    if (body.gender       !== undefined) data.gender       = body.gender || null;
    if (body.birthDate    !== undefined) data.birthDate    = body.birthDate ? new Date(body.birthDate) : null;
    if (body.passwordHash !== undefined) data.passwordHash = body.passwordHash;
    if (body.tradeName    !== undefined) data.tradeName    = body.tradeName || null;
    if (body.nickname     !== undefined) data.nickname     = body.nickname || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.user.update({ where: { id: user.id }, data });

    return NextResponse.json({ user: { id: user.id } });
  } catch (err) {
    console.error("[profile PATCH]", err);
    return NextResponse.json({ error: "Erro ao salvar perfil." }, { status: 500 });
  }
}

/* ── DELETE /api/user/profile — excluir conta ── */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Senha obrigatória para excluir a conta." }, { status: 400 });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Senha incorreta." }, { status: 400 });

  try {
    await prisma.user.delete({ where: { id: user.id } });
    const res = NextResponse.json({ ok: true });
    res.cookies.delete("shopmotor_token");
    return res;
  } catch (err) {
    console.error("[profile DELETE]", err);
    return NextResponse.json({ error: "Erro ao excluir conta." }, { status: 500 });
  }
}
