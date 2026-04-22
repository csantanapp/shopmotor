import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhuma foto enviada." }, { status: 400 });

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Foto deve ter no máximo 5MB." }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext))
    return NextResponse.json({ error: "Formato não permitido." }, { status: 400 });

  // Remove avatar antigo do R2
  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { avatarUrl: true } });
  if (current?.avatarUrl?.includes("r2.dev")) {
    const oldKey = `avatars/avatar-${user.id}`;
    deleteFromR2(oldKey).catch(() => {});
  }

  const key    = `avatars/avatar-${user.id}-${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const avatarUrl = await uploadToR2(key, buffer, file.type || "image/jpeg");

  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });

  return NextResponse.json({ avatarUrl });
}
