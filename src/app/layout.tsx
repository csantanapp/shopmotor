import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import PageTracker from "@/components/PageTracker";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.shopmotor.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ShopMotor — Compre e Venda Veículos",
    template: "%s | ShopMotor",
  },
  description: "A plataforma para comprar e vender veículos com segurança. Carros, motos, caminhões e mais.",
  keywords: ["comprar carro", "vender carro", "marketplace automotivo", "carros usados", "shopmotor"],
  authors: [{ name: "ShopMotor", url: BASE_URL }],
  creator: "ShopMotor",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "ShopMotor",
    title: "ShopMotor — Compre e Venda Veículos",
    description: "A plataforma para comprar e vender veículos com segurança.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopMotor — Compre e Venda Veículos",
    description: "A plataforma para comprar e vender veículos com segurança.",
  },
};

async function getPixelScripts(): Promise<string> {
  try {
    const row = await (prisma as any).siteConfig.findUnique({ where: { key: "pixel_scripts" } });
    return row?.value ?? "";
  } catch {
    return "";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pixelScripts = await getPixelScripts();

  return (
    <html lang="pt-BR" className="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0c0f0f" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        {pixelScripts && (
          <div dangerouslySetInnerHTML={{ __html: pixelScripts }} />
        )}
      </head>
      <body className={`${inter.variable} ${barlowCondensed.variable} font-body bg-surface text-on-surface overflow-x-hidden`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-container focus:text-on-primary-container focus:rounded-full focus:font-bold focus:text-sm"
        >
          Pular para o conteúdo
        </a>
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
