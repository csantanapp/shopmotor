import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/*
  Regras por plano:
  TURBO         → boostLevel=DESTAQUE,       selo 7d,  galeria 7d,  topo 7d   — R$ 17,90
  DESTAQUE      → boostLevel=DESTAQUE,       selo 15d, galeria 15d, topo 15d  — R$ 27,90
  SUPER_DESTAQUE→ boostLevel=SUPER_DESTAQUE, selo 30d, galeria 30d, topo 30d  — R$ 47,90
*/
const PLAN_RULES = {
  TURBO: {
    boostLevel: "DESTAQUE" as const,
    badgeDays:   7,
    galleryDays: 7,
    topDays:     7,
  },
  DESTAQUE: {
    boostLevel: "DESTAQUE" as const,
    badgeDays:   15,
    galleryDays: 15,
    topDays:     15,
  },
  SUPER_DESTAQUE: {
    boostLevel: "ELITE" as const,
    badgeDays:   30,
    galleryDays: 30,
    topDays:     30,
  },
} as const;

function addDays(days: number) {
  return new Date(Date.now() + days * 86_400_000);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  let plan: string;
  try {
    ({ plan } = await req.json());
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  if (plan !== "NONE" && !PLAN_RULES[plan as keyof typeof PLAN_RULES]) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id }, select: { userId: true } });
  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });

  const isOwner = vehicle.userId === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  let data: Record<string, unknown>;

  if (plan === "NONE") {
    data = {
      boostPlan: "NONE",
      boostLevel: "NONE",
      boostUntil: null,
      boostTopUntil: null,
      boostGalleryUntil: null,
    };
  } else {
    const rules = PLAN_RULES[plan as keyof typeof PLAN_RULES];
    data = {
      boostPlan:         plan,
      boostLevel:        rules.boostLevel,
      boostUntil:        addDays(rules.badgeDays),
      boostTopUntil:     addDays(rules.topDays),
      boostGalleryUntil: addDays(rules.galleryDays),
    };
  }

  try {
    const updated = await prisma.vehicle.update({
      where: { id },
      data,
      select: { id: true, boostPlan: true, boostLevel: true, boostUntil: true, boostTopUntil: true, boostGalleryUntil: true },
    });
    return NextResponse.json({ vehicle: updated });
  } catch (err) {
    console.error("[boost POST]", err);
    return NextResponse.json({ error: "Erro ao aplicar impulsionamento." }, { status: 500 });
  }
}
