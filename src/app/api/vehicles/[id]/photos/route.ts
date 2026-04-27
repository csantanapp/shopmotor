import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";
import { validateImageUpload } from "@/lib/upload";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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

  for (const file of files) {
    const validated = await validateImageUpload(file, { maxBytes: MAX_SIZE });
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const { buffer, ext, mime } = validated;
    const filename = `vehicles/${id}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const url      = await uploadToR2(filename, buffer, mime);

    uploaded.push({ url, filename });
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

/* ── PATCH /api/vehicles/[id]/photos — reordenar ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  if (vehicle.userId !== user.id) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  const body = await req.json();
  const orders: { id: string; order: number; isCover: boolean }[] = body.orders ?? [];

  await prisma.$transaction(
    orders.map(p =>
      prisma.vehiclePhoto.update({ where: { id: p.id }, data: { order: p.order, isCover: p.isCover } })
    )
  );

  return NextResponse.json({ ok: true });
}

/* ── DELETE /api/vehicles/[id]/photos?photoId=xxx ── */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  await params;
  const photoId = req.nextUrl.searchParams.get("photoId");
  if (!photoId) return NextResponse.json({ error: "photoId obrigatório." }, { status: 400 });

  const photo = await prisma.vehiclePhoto.findUnique({ where: { id: photoId }, include: { vehicle: true } });
  if (!photo)                           return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });
  if (photo.vehicle.userId !== user.id) return NextResponse.json({ error: "Sem permissão." }, { status: 403 });

  // Deletar do R2 se for URL do R2
  if (photo.filename && photo.url.includes("r2.dev")) {
    await deleteFromR2(photo.filename).catch(() => null);
  }

  await prisma.vehiclePhoto.delete({ where: { id: photoId } });
  return NextResponse.json({ ok: true });
}
