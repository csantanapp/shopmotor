import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadToR2 } from "@/lib/r2";
import { validateImageUpload } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const validated = await validateImageUpload(file, { maxBytes: 5 * 1024 * 1024, allowGif: false });
  if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: validated.status });

  const { buffer, ext, mime } = validated;
  const key = `hero/banner-${Date.now()}${ext}`;
  const url = await uploadToR2(key, buffer, mime);

  return NextResponse.json({ url });
}
