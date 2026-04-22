import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";

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

  await mkdir(UPLOAD_DIR, { recursive: true });

  // Remove avatar antigo se existir
  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { avatarUrl: true } });
  if (current?.avatarUrl) {
    const oldFile = path.join("./public", current.avatarUrl);
    unlink(oldFile).catch(() => {});
  }

  const filename = `avatar-${user.id}-${Date.now()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, Buffer.from(await file.arrayBuffer()));

  const avatarUrl = `/uploads/${filename}`;
  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });

  return NextResponse.json({ avatarUrl });
}
