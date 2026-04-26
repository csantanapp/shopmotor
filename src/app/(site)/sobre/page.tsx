import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nós — ShopMotor",
  description: "Conheça a ShopMotor, a plataforma definitiva para compra e venda de veículos no Brasil.",
};

async function getStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/public-stats`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json() as Promise<{ totalVehicles: number; totalUsers: number; totalStores: number }>;
  } catch {
    return null;
  }
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k+`;
  return `${n}+`;
}

export default async function SobrePage() {
  const stats = await getStats();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">

      {/* Hero */}
      <div className="space-y-4">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Nossa História</p>
        <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-none">
          Conectando<br />pessoas e veículos.
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed max-w-xl">
          A ShopMotor nasceu da paixão por automóveis e da vontade de criar uma plataforma simples, transparente e eficiente para quem quer comprar ou vender veículos no Brasil.
        </p>
      </div>

      {/* Missão / Visão / Valores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: "rocket_launch",
            title: "Missão",
            text: "Tornar a compra e venda de veículos mais simples, segura e acessível para todos os brasileiros.",
          },
          {
            icon: "visibility",
            title: "Visão",
            text: "Ser a plataforma automotiva mais confiável do Brasil, reconhecida pela transparência e pela qualidade da experiência.",
          },
          {
            icon: "favorite",
            title: "Valores",
            text: "Transparência, segurança, inovação e respeito ao usuário. Acreditamos que boas negociações começam com informação honesta.",
          },
        ].map(item => (
          <div key={item.title} className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
            </div>
            <h2 className="font-black text-on-surface">{item.title}</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Números */}
      <div className="bg-inverse-surface rounded-3xl p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { value: stats ? fmt(stats.totalVehicles) : "—", label: "Veículos anunciados" },
          { value: stats ? fmt(stats.totalUsers) : "—", label: "Usuários cadastrados" },
          { value: stats ? fmt(stats.totalStores) : "—", label: "Lojas parceiras" },
          { value: "26", label: "Estados atendidos" },
        ].map(item => (
          <div key={item.label}>
            <p className="text-4xl font-black text-inverse-on-surface">{item.value}</p>
            <p className="text-sm text-inverse-on-surface/60 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* O que oferecemos */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-on-surface">O que oferecemos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "search", title: "Busca inteligente", desc: "Filtros avançados por marca, modelo, ano, preço, km, tipo de combustível e muito mais." },
            { icon: "price_check", title: "Comparação FIPE", desc: "Cada anúncio mostra o valor FIPE para que você saiba se está pagando um preço justo." },
            { icon: "campaign", title: "Impulsionamento", desc: "Destaque seu anúncio com os planos Turbo, Destaque e Super Destaque para mais visibilidade e contatos." },
            { icon: "storefront", title: "Lojas e revendas", desc: "Empresas podem criar páginas personalizadas com vitrine de veículos e identidade de marca." },
            { icon: "chat", title: "Chat integrado", desc: "Compradores e vendedores se comunicam com segurança dentro da plataforma." },
            { icon: "star", title: "Sistema de avaliações", desc: "Avalie e seja avaliado para construir uma reputação confiável na plataforma." },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-4 bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
              <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="font-bold text-on-surface">{item.title}</p>
                <p className="text-sm text-on-surface-variant mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-primary-container/20 rounded-2xl p-8">
        <div>
          <h3 className="text-xl font-black text-on-surface">Pronto para começar?</h3>
          <p className="text-sm text-on-surface-variant mt-1">Crie sua conta gratuitamente e publique seu primeiro anúncio hoje.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link href="/cadastro" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all">
            Criar conta
          </Link>
          <Link href="/contato" className="border border-outline-variant text-on-surface font-bold px-6 py-3 rounded-full text-sm hover:bg-surface-container transition-colors">
            Fale conosco
          </Link>
        </div>
      </div>

    </div>
  );
}
