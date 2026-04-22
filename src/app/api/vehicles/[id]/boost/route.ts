import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/*
  Regras por plano:
  PUSH     → boostLevel=DESTAQUE, selo 5d, galeria 3d, topo 5d
  DESTAQUE → boostLevel=DESTAQUE, selo 7d, galeria 3d, topo 7d
  ELITE    → boostLevel=ELITE,    selo 7d, galeria 7d, topo 7d
*/
const PLAN_RULES = {
  PUSH: {
    boostLevel: "DESTAQUE" as const,
    badgeDays:   5,
    galleryDays: 3,
    topDays:     5,
  },
  DESTAQUE: {
    boostLevel: "DESTAQUE" as const,
    badgeDays:   7,
    galleryDays: 3,
    topDays:     7,
  },
  ELITE: {
    boostLevel: "ELITE" as const,
    badgeDays:   7,
    galleryDays: 7,
    topDays:     7,
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
