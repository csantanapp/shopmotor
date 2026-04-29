import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STORE_PLANS, StorePlan } from "@/lib/store-plans";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = prisma;

  const store = await db.user.findFirst({
    where: { storeSlug: slug, accountType: "PJ", isDemo: false },
    select: {
      id: true, name: true, tradeName: true, companyName: true,
      avatarUrl: true, storeBannerUrl: true, storeDescription: true,
      city: true, state: true, phone: true, sharePhone: true,
      plan: true, createdAt: true, storeSlug: true,
      socialInstagram: true, socialFacebook: true, socialYoutube: true, socialTiktok: true,
      _count: { select: { vehicles: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!store) return NextResponse.json({ error: "Loja não encontrada." }, { status: 404 });

  // Busca assinatura ativa
  const now = new Date();
  const activeSub = await db.storeSubscription.findFirst({
    where: { userId: store.id, status: "active", endsAt: { gt: now } },
    orderBy: { endsAt: "desc" },
  });

  const subPlan = activeSub?.plan as StorePlan | null;
  const planConfig = subPlan ? STORE_PLANS[subPlan] : null;

  // Controle de visibilidade por plano
  const showPhone    = planConfig?.leadContact ?? false;
  const showSocial   = planConfig?.socialLinks ?? false;
  const isVerified   = !!planConfig;
  const planName     = planConfig?.name ?? null;

  // Redes sociais (do SiteConfig do usuário — futuramente por loja; por ora usa as globais se plano permitir)
  // Por enquanto usamos campos extras que já existem ou null
  const social = showSocial ? {
    instagram: store.socialInstagram ?? null,
    facebook:  store.socialFacebook  ?? null,
    youtube:   store.socialYoutube   ?? null,
    tiktok:    store.socialTiktok    ?? null,
  } : null;

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: store.id, status: "ACTIVE" },
    orderBy: [{ boostLevel: "desc" }, { createdAt: "desc" }],
    include: {
      photos: { orderBy: [{ isCover: "desc" }, { order: "asc" }], take: 1 },
    },
  });

  return NextResponse.json({
    store: {
      ...store,
      phone: showPhone ? store.phone : null,
      whatsapp: showPhone && store.sharePhone ? store.phone : null,
      social,
      isVerified,
      planName,
      subPlan,
    },
    vehicles,
  });
}
