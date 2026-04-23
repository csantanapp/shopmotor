import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.shopmotor.com.br";

  const [vehicles, stores] = await Promise.all([
    prisma.vehicle.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    }),
    (prisma.user as any).findMany({
      where: { accountType: "PJ", storeSlug: { not: null } },
      select: { storeSlug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl,                     lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/busca`,          lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${baseUrl}/cadastro`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/login`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/anuncie`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sobre`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contato`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/termos`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/privacidade`,    lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/faq`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map(v => ({
    url: `${baseUrl}/carro/${v.id}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const storeRoutes: MetadataRoute.Sitemap = stores
    .filter((s: any) => s.storeSlug)
    .map((s: any) => ({
      url: `${baseUrl}/loja/${s.storeSlug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...vehicleRoutes, ...storeRoutes];
}
