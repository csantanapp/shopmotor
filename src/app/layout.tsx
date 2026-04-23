import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "block",
  preload: true,
  adjustFontFallback: true,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <meta name="theme-color" content="#0c0f0f" />
      </head>
      <body className={`${inter.variable} font-body bg-surface text-on-surface overflow-x-hidden`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-container focus:text-on-primary-container focus:rounded-full focus:font-bold focus:text-sm"
        >
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <Navbar />
          <main id="main-content" className="pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
