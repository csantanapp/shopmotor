import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/* ── GET /api/user/profile ── */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  return NextResponse.json({
    user: {
      id:        user.id,
      name:      user.name,
      email:     user.email,
      phone:     user.phone,
      avatarUrl: user.avatarUrl,
      role:      user.role,
      plan:      user.plan,
      cpf:       user.cpf,
      zipCode:   user.zipCode,
      address:   user.address,
      city:      user.city,
      state:     user.state,
      createdAt: user.createdAt,
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

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(body.name         !== undefined && { name:     body.name }),
      ...(body.phone        !== undefined && { phone:    body.phone }),
      ...(body.zipCode      !== undefined && { zipCode:  body.zipCode }),
      ...(body.address      !== undefined && { address:  body.address }),
      ...(body.city         !== undefined && { city:     body.city }),
      ...(body.state        !== undefined && { state:    body.state }),
      ...(body.passwordHash !== undefined && { passwordHash: body.passwordHash }),
    },
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, plan: true },
  });

  return NextResponse.json({ user: updated });
}
