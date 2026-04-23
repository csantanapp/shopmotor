import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "Arquivo deve ter no máximo 5MB." }, { status: 400 });

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED.includes(ext))
    return NextResponse.json({ error: "Formato não permitido. Use JPG, PNG, WebP ou GIF." }, { status: 400 });

  const mime = file.type || "image/jpeg";
  const key = `ads/ad-${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToR2(key, buffer, mime);

  return NextResponse.json({ url });
}
