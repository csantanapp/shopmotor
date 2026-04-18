import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./public/uploads";
const MAX_SIZE   = 10 * 1024 * 1024; // 10MB

/* ── POST /api/vehicles/[id]/photos ── */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  if (vehicle.userId !== user.id) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  const formData = await req.formData();
  const files    = formData.getAll("photos") as File[];

  if (!files.length) return NextResponse.json({ error: "Nenhuma foto enviada." }, { status: 400 });

  const currentCount = await prisma.vehiclePhoto.count({ where: { vehicleId: id } });
  if (currentCount + files.length > 20) {
    return NextResponse.json({ error: "Máximo de 20 fotos por veículo." }, { status: 400 });
  }

  const uploaded: { url: string; filename: string }[] = [];

  await mkdir(UPLOAD_DIR, { recursive: true });

  for (const file of files) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Arquivo ${file.name} excede 10MB.` }, { status: 400 });
    }

    const ext      = path.extname(file.name).toLowerCase();
    const allowed  = [".jpg", ".jpeg", ".png", ".webp"];
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: `Formato ${ext} não permitido.` }, { status: 400 });
    }

    const filename = `${id}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const buffer   = Buffer.from(await file.arrayBuffer());

    await writeFile(filepath, buffer);
    uploaded.push({ url: `/uploads/${filename}`, filename });
  }

  const isCoverNeeded = currentCount === 0;

  const photos = await prisma.$transaction(
    uploaded.map((p, i) =>
      prisma.vehiclePhoto.create({
        data: {
          vehicleId: id,
          url:      p.url,
          filename: p.filename,
          order:    currentCount + i,
          isCover:  isCoverNeeded && i === 0,
        },
      })
    )
  );

  return NextResponse.json({ photos }, { status: 201 });
}

/* ── DELETE /api/vehicles/[id]/photos?photoId=xxx ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id }    = await params;
  const photoId   = req.nextUrl.searchParams.get("photoId");
  if (!photoId)   return NextResponse.json({ error: "photoId obrigatório." }, { status: 400 });

  const photo = await prisma.vehiclePhoto.findUnique({ where: { id: photoId }, include: { vehicle: true } });
  if (!photo)                          return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  if (photo.vehicle.userId !== user.id) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  await prisma.vehiclePhoto.delete({ where: { id: photoId } });
  return NextResponse.json({ ok: true });
}
