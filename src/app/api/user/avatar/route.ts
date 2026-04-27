import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";
import { validateImageUpload } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhuma foto enviada." }, { status: 400 });

  const validated = await validateImageUpload(file, { maxBytes: 5 * 1024 * 1024 });
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: validated.status });

  const { buffer, ext, mime } = validated;

  // Remove avatar antigo do R2
  const current = await prisma.user.findUnique({ where: { id: user.id }, select: { avatarUrl: true } });
  if (current?.avatarUrl?.includes("r2.dev")) {
    deleteFromR2(`avatars/avatar-${user.id}`).catch(() => {});
  }

  const key = `avatars/avatar-${user.id}-${Date.now()}${ext}`;
  const avatarUrl = await uploadToR2(key, buffer, mime);

  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });

  return NextResponse.json({ avatarUrl });
}
