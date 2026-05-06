import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErpUser } from "@/lib/auth";
import { publishVehicle, removeVehicle, isOlxConfigured } from "@/lib/olx";

type Params = { params: Promise<{ vehicleId: string }> };

/* POST — publica ou atualiza veículo na OLX */
export async function POST(_req: NextRequest, { params }: Params) {
  const user = await getErpUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isOlxConfigured()) {
    return NextResponse.json({ error: "Integração OLX não configurada." }, { status: 503 });
  }

  const { vehicleId } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
    include: { photos: { where: { isCover: true }, take: 1 } },
  });
  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  if (vehicle.status !== "ACTIVE") {
    return NextResponse.json({ error: "Apenas veículos ativos podem ser publicados na OLX." }, { status: 400 });
  }

  try {
    const allPhotos = await prisma.vehiclePhoto.findMany({
      where: { vehicleId },
      orderBy: [{ isCover: "desc" }, { createdAt: "asc" }],
      take: 20,
    });

    const result = await publishVehicle({
      title:        `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""} ${vehicle.yearModel}`,
      description:  vehicle.description ?? `${vehicle.brand} ${vehicle.model} ${vehicle.yearFab}/${vehicle.yearModel}, ${vehicle.km.toLocaleString("pt-BR")} km.`,
      price:        vehicle.price,
      brand:        vehicle.brand,
      model:        vehicle.model,
      yearFab:      vehicle.yearFab,
      yearModel:    vehicle.yearModel,
      km:           vehicle.km,
      fuel:         vehicle.fuel,
      transmission: vehicle.transmission,
      color:        vehicle.color ?? undefined,
      city:         vehicle.city,
      state:        vehicle.state,
      photos:       allPhotos.map(p => p.url),
    });

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        olxAdId:        result.olxAdId,
        olxStatus:      "published",
        olxPublishedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, olxAdId: result.olxAdId, olxUrl: result.olxUrl });
  } catch (err) {
    console.error("[OLX publish]", err);
    return NextResponse.json({ error: "Falha ao publicar na OLX." }, { status: 500 });
  }
}

/* DELETE — remove anúncio da OLX */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getErpUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isOlxConfigured()) {
    return NextResponse.json({ error: "Integração OLX não configurada." }, { status: 503 });
  }

  const { vehicleId } = await params;

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id },
  });
  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  if (!vehicle.olxAdId) return NextResponse.json({ error: "Veículo não publicado na OLX." }, { status: 400 });

  try {
    await removeVehicle(vehicle.olxAdId);
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { olxAdId: null, olxStatus: "removed", olxPublishedAt: null },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[OLX remove]", err);
    return NextResponse.json({ error: "Falha ao remover da OLX." }, { status: 500 });
  }
}
