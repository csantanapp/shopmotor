import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { encrypt, safeDecrypt } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma;
  const { searchParams } = new URL(req.url);
  const q     = searchParams.get("q") ?? "";
  const page  = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 20;
  const skip  = (page - 1) * limit;
  const plan  = searchParams.get("plan") ?? "";

  const where: any = { accountType: "PJ" };
  if (q) where.OR = [
    { name:        { contains: q, mode: "insensitive" } },
    { tradeName:   { contains: q, mode: "insensitive" } },
    { companyName: { contains: q, mode: "insensitive" } },
    { email:       { contains: q, mode: "insensitive" } },
    { storeSlug:   { contains: q, mode: "insensitive" } },
    { cnpj:        { equals: encrypt(q.replace(/\D/g, "")) } },
  ];

  const [total, stores] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true, name: true, email: true, phone: true, sharePhone: true,
        tradeName: true, companyName: true, cnpj: true,
        city: true, state: true, address: true, zipCode: true,
        plan: true, storeSlug: true, avatarUrl: true, storeBannerUrl: true,
        storeDescription: true, socialInstagram: true, socialFacebook: true,
        socialYoutube: true, socialTiktok: true,
        createdAt: true, lastSeenAt: true,
        _count: { select: { vehicles: true } },
        storeSubscriptions: {
          where: { status: "active", endsAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, plan: true, status: true, startsAt: true, endsAt: true, amount: true },
        },
      },
    }),
  ]);

  // Se filtro de plano foi passado, filtra após busca pois o plano real é na subscription
  const filtered = (plan
    ? stores.filter((s: any) => s.storeSubscriptions?.[0]?.plan === plan)
    : stores
  ).map((s: any) => ({ ...s, cnpj: safeDecrypt(s.cnpj) }));

  return NextResponse.json({ stores: filtered, total: plan ? filtered.length : total, page, pages: Math.ceil((plan ? filtered.length : total) / limit) });
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma;
  const body = await req.json();
  const { name, email, password, phone, cnpj, companyName, tradeName,
          city, state, address, zipCode, subscriptionPlan, subscriptionMonths } = body;

  if (!name || !email || !password) return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });

  const bcrypt = await import("bcryptjs");
  const hash = await bcrypt.hash(password, 10);

  const slug = (tradeName || companyName || name)
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const baseSlug = slug.slice(0, 40);
  const count = await db.user.count({ where: { storeSlug: { startsWith: baseSlug } } });
  const storeSlug = count > 0 ? `${baseSlug}-${count}` : baseSlug;

  const user = await db.user.create({
    data: {
      name, email, phone: phone || null,
      cnpj: cnpj ? encrypt(cnpj.replace(/\D/g, "")) : null,
      companyName: companyName || null,
      tradeName: tradeName || null,
      city: city || null, state: state || null,
      address: address || null, zipCode: zipCode || null,
      passwordHash: hash,
      accountType: "PJ",
      storeSlug,
    },
  });

  if (subscriptionPlan && subscriptionPlan !== "NONE") {
    const months = Number(subscriptionMonths ?? 1);
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + months);
    await db.storeSubscription.create({
      data: { userId: user.id, plan: subscriptionPlan, status: "active", startsAt, endsAt, amount: 0 },
    });
  }

  return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma;
  const body = await req.json();
  const { id, subscriptionPlan, subscriptionMonths, ...userData } = body;
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

  // Atualiza dados do usuário (se houver campos)
  if (Object.keys(userData).length > 0) {
    await db.user.update({ where: { id }, data: userData });
  }

  // Atualiza/cria assinatura se plano foi informado
  if (subscriptionPlan) {
    // Desativa assinaturas ativas anteriores
    await db.storeSubscription.updateMany({
      where: { userId: id, status: "active" },
      data: { status: "cancelled" },
    });

    if (subscriptionPlan !== "NONE") {
      const months = Number(subscriptionMonths ?? 1);
      const startsAt = new Date();
      const endsAt = new Date();
      endsAt.setMonth(endsAt.getMonth() + months);

      await db.storeSubscription.create({
        data: {
          userId: id,
          plan: subscriptionPlan,
          status: "active",
          startsAt,
          endsAt,
          amount: 0,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
