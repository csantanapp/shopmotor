import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import LojaClient from "./LojaClient";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.shopmotor.com.br";

  try {
    const store = await (prisma.user as any).findFirst({
      where: { storeSlug: slug },
      select: {
        name: true, tradeName: true, companyName: true,
        city: true, state: true, storeDescription: true,
        avatarUrl: true, storeBannerUrl: true,
      },
    });

    if (!store) return { title: "Loja não encontrada — ShopMotor" };

    const storeName = store.tradeName || store.companyName || store.name;
    const title = `${storeName} — Loja no ShopMotor`;
    const description = store.storeDescription
      ? store.storeDescription.slice(0, 160)
      : `Confira os veículos de ${storeName}${store.city ? ` em ${store.city}/${store.state}` : ""} no ShopMotor.`;
    const image = store.storeBannerUrl ?? store.avatarUrl ?? `${baseUrl}/og-default.jpg`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/loja/${slug}`,
        siteName: "ShopMotor",
        images: [{ url: image, width: 1200, height: 630, alt: storeName }],
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

export default function LojaPage({ params }: Props) {
  return <LojaClient params={params} />;
}
