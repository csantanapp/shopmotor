import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.shopmotor.com.br";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/perfil/", "/api/", "/ads/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
