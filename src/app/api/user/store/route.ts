import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";

/* ── GET /api/user/store ── */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  const u = user as any;
  if (u.accountType !== "PJ")
    return NextResponse.json({ error: "Apenas contas loja (PJ) podem acessar esta area." }, { status: 403 });

  return NextResponse.json({
    store: {
      storeSlug:        u.storeSlug,
      storeDescription: u.storeDescription,
      storeBannerUrl:   u.storeBannerUrl,
      avatarUrl:        u.avatarUrl,
      name:             u.name,
      tradeName:        u.tradeName,
      companyName:      u.companyName,
      city:             u.city,
      state:            u.state,
      phone:            u.phone,
      sharePhone:       u.sharePhone,
      social: {
        instagram: u.socialInstagram ?? null,
        facebook:  u.socialFacebook  ?? null,
        youtube:   u.socialYoutube   ?? null,
        tiktok:    u.socialTiktok    ?? null,
      },
    },
  });
}

/* ── PATCH /api/user/store — atualizar descricao ── */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  const u = user as any;
  if (u.accountType !== "PJ")
    return NextResponse.json({ error: "Apenas contas loja (PJ)." }, { status: 403 });

  const body = await req.json();
  const data: Record<string, any> = {};
  if (body.storeDescription !== undefined) data.storeDescription = body.storeDescription || null;
  if (body.tradeName        !== undefined) data.tradeName        = body.tradeName || null;
  if (body.phone            !== undefined) data.phone            = body.phone || null;
  if (body.sharePhone       !== undefined) data.sharePhone       = Boolean(body.sharePhone);
  if (body.social?.instagram !== undefined) data.socialInstagram = body.social.instagram || null;
  if (body.social?.facebook  !== undefined) data.socialFacebook  = body.social.facebook  || null;
  if (body.social?.youtube   !== undefined) data.socialYoutube   = body.social.youtube   || null;
  if (body.social?.tiktok    !== undefined) data.socialTiktok    = body.social.tiktok    || null;

  await (prisma.user.update as any)({ where: { id: user.id }, data });
  return NextResponse.json({ ok: true });
}

/* ── POST /api/user/store — upload banner ── */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });

  const u = user as any;
  if (u.accountType !== "PJ")
    return NextResponse.json({ error: "Apenas contas loja (PJ)." }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("banner") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo nao enviado." }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type))
    return NextResponse.json({ error: "Formato invalido. Use JPG, PNG ou WEBP." }, { status: 400 });

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Arquivo muito grande. Maximo 5MB." }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `banner-${user.id}-${Date.now()}.${ext}`;
  const uploadDir = process.env.UPLOAD_DIR ?? "./public/uploads";
  await fs.mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  const storeBannerUrl = `${process.env.NEXT_PUBLIC_UPLOAD_URL ?? "/uploads"}/${filename}`;
  await (prisma.user.update as any)({ where: { id: user.id }, data: { storeBannerUrl } });

  return NextResponse.json({ storeBannerUrl });
}
