import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/* ── GET /api/reviews?userId=xxx ── */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId obrigatório." }, { status: 400 });

  try {
    const reviews = await prisma.review.findMany({
      where: { toUserId: userId },
      orderBy: { createdAt: "desc" },
      include: { fromUser: { select: { id: true, name: true, avatarUrl: true } } },
    });

    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

    return NextResponse.json({ reviews, avg, total: reviews.length });
  } catch (err) {
    console.error("[reviews GET]", err);
    return NextResponse.json({ error: "Erro ao buscar avaliações." }, { status: 500 });
  }
}

/* ── POST /api/reviews ── */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();
    const { toUserId, rating, comment } = body;

    if (!toUserId || !rating) return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    if (toUserId === user.id) return NextResponse.json({ error: "Você não pode avaliar a si mesmo." }, { status: 400 });
    if (rating < 1 || rating > 5) return NextResponse.json({ error: "Nota entre 1 e 5." }, { status: 400 });

    const existing = await prisma.review.findUnique({ where: { fromUserId_toUserId: { fromUserId: user.id, toUserId } } });
    if (existing) return NextResponse.json({ error: "Você já avaliou este vendedor." }, { status: 409 });

    const review = await prisma.review.create({
      data: { fromUserId: user.id, toUserId, rating: Number(rating), comment: comment || null },
      include: { fromUser: { select: { id: true, name: true, avatarUrl: true } } },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error("[reviews POST]", err);
    return NextResponse.json({ error: "Erro ao enviar avaliação." }, { status: 500 });
  }
}
