import Link from "next/link";
import type { Metadata } from "next";
import MarcaForm from "./MarcaForm";

export const metadata: Metadata = {
  title: "Anuncie Conosco — ShopMotor",
  description: "Publique seus veículos na ShopMotor e alcance milhares de compradores em todo o Brasil.",
};

export default function AnunciePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">

      {/* Hero */}
      <div className="space-y-4">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Para Vendedores</p>
        <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-none">
          Venda mais rápido.<br />Anuncie na ShopMotor.
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed max-w-xl">
          Alcance milhares de compradores qualificados em todo o Brasil. Planos para pessoa física e lojas, com ferramentas que fazem a diferença.
        </p>
      </div>

      {/* Anuncie sua marca */}
      <div className="space-y-0" id="marcas">
        <div className="bg-inverse-surface rounded-t-3xl px-10 pt-12 pb-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary-container text-2xl">campaign</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary-container/70">Para empresas</p>
              <h2 className="text-3xl font-black text-inverse-on-surface tracking-tighter mt-1">
                Anuncie sua marca<br />na ShopMotor
              </h2>
              <p className="text-sm text-inverse-on-surface/60 mt-2 max-w-lg">
                Alcance milhares de compradores de veiculos qualificados todos os dias. Nossa audiencia esta
                ativamente pesquisando e comparando — o momento certo para a sua marca estar presente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              { icon: "group", value: "10k+", label: "usuarios ativos/mes" },
              { icon: "visibility", value: "50k+", label: "pageviews/mes" },
              { icon: "directions_car", value: "8k+", label: "buscas de veiculos/mes" },
              { icon: "location_on", value: "26", label: "estados alcancados" },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-2xl p-4 text-center">
                <span className="material-symbols-outlined text-primary-container text-xl">{item.icon}</span>
                <p className="text-2xl font-black text-inverse-on-surface mt-1">{item.value}</p>
                <p className="text-[10px] text-inverse-on-surface/50 uppercase tracking-wide mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {[
              { icon: "web", title: "Banners e Display", desc: "Espacos de destaque na home, busca e paginas de anuncio. Alta visibilidade para quem esta comprando agora." },
              { icon: "featured_play_list", title: "Conteudo Patrocinado", desc: "Artigos e comparativos com sua marca integrados na experiencia de navegacao do usuario." },
              { icon: "email", title: "E-mail Marketing", desc: "Segmentacao por perfil de comprador: tipo de veiculo, faixa de preco, regiao geografica e mais." },
            ].map(item => (
              <div key={item.title} className="bg-white/5 rounded-2xl p-5 space-y-2">
                <span className="material-symbols-outlined text-primary-container text-xl">{item.icon}</span>
                <p className="font-black text-inverse-on-surface text-sm">{item.title}</p>
                <p className="text-xs text-inverse-on-surface/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-b-3xl shadow-sm px-10 py-10 space-y-6">
          <div>
            <h3 className="text-xl font-black text-on-surface">Solicite uma proposta</h3>
            <p className="text-sm text-on-surface-variant mt-1">Preencha o formulario e nossa equipe comercial entra em contato em ate 2 dias uteis.</p>
          </div>
          <MarcaForm />
        </div>
      </div>

      {/* CTA final */}
      <div className="text-center space-y-4 bg-primary-container/20 rounded-3xl p-12">
        <h3 className="text-3xl font-black text-on-surface">Pronto para vender?</h3>
        <p className="text-on-surface-variant">Cadastro gratuito. Primeiro anúncio em menos de 5 minutos.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/cadastro" className="bg-primary-container text-on-primary-container font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-[0px_8px_24px_rgba(255,215,9,0.25)]">
            Criar conta grátis
          </Link>
          <Link href="/contato" className="border border-outline-variant text-on-surface font-bold px-8 py-4 rounded-full text-sm hover:bg-surface-container transition-colors">
            Falar com vendas
          </Link>
        </div>
      </div>

    </div>
  );
}

