import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import CarroClient from "./CarroClient";

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.shopmotor.com.br";

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: {
        brand: true, model: true, version: true,
        yearFab: true, yearModel: true, km: true, price: true,
        city: true, state: true, condition: true,
        photos: { where: { isCover: true }, take: 1, select: { url: true } },
      },
    });

    if (!vehicle) return { title: "Veículo não encontrado — ShopMotor" };

    const price = vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
    const km = vehicle.km === 0 ? "0 km" : `${vehicle.km.toLocaleString("pt-BR")} km`;
    const year = `${vehicle.yearFab}/${vehicle.yearModel}`;
    const title = `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""} ${year} — ${price} | ShopMotor`;
    const description = `${vehicle.brand} ${vehicle.model} ${year}, ${km}, ${vehicle.condition === "NEW" ? "0 km" : "usado"}, ${vehicle.city}/${vehicle.state}. ${price}. Compre com segurança no ShopMotor.`;
    const image = vehicle.photos[0]?.url ?? `${baseUrl}/og-default.jpg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/carro/${id}`,
        siteName: "ShopMotor",
        images: [{ url: image, width: 1200, height: 630, alt: `${vehicle.brand} ${vehicle.model}` }],
        type: "website",
        locale: "pt_BR",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return { title: "ShopMotor — Marketplace Automotivo" };
  }
}

export default function CarroPage({ params }: Props) {
  return <CarroClient params={params} />;
}
