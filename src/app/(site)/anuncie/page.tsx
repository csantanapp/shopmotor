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
        <Link href="/cadastro" className="inline-block bg-primary-container text-on-primary-container font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-[0px_8px_24px_rgba(255,215,9,0.25)]">
          Comece grátis
        </Link>
      </div>

      {/* Planos */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-on-surface">Planos disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <PlanCard
            name="Grátis"
            price="R$ 0"
            period="para sempre"
            highlight={false}
            features={[
              "Até 3 anúncios ativos",
              "Fotos ilimitadas por anúncio",
              "Chat com compradores",
              "Comparação FIPE automática",
              "Perfil público de vendedor",
            ]}
            cta="Começar grátis"
            href="/cadastro"
          />

          <PlanCard
            name="Premium"
            price="R$ 49"
            period="por mês"
            highlight={true}
            features={[
              "Até 20 anúncios ativos",
              "Badge Premium no perfil",
              "Destaque nas buscas",
              "Estatísticas de visualizações",
              "Suporte prioritário",
              "Todos os recursos do Grátis",
            ]}
            cta="Assinar Premium"
            href="/cadastro"
          />

          <PlanCard
            name="Loja"
            price="R$ 99"
            period="por mês"
            highlight={false}
            features={[
              "Anúncios ilimitados",
              "Página da loja personalizada",
              "Banner e logo da empresa",
              "URL exclusiva (/loja/sua-loja)",
              "Relatórios avançados",
              "Todos os recursos do Premium",
            ]}
            cta="Criar minha loja"
            href="/cadastro"
          />

        </div>
      </div>

      {/* Impulsionamento */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-on-surface">Impulsione seus anúncios</h2>
          <p className="text-sm text-on-surface-variant mt-1">Disponível para todos os planos como recurso adicional.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-3 border-2 border-primary-container/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-xl">stars</span>
              <h3 className="font-black text-on-surface">Destaque</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">Seu anúncio aparece no topo dos resultados de busca com badge dourado. Mais visibilidade, mais contatos.</p>
            <ul className="space-y-1 text-sm text-on-surface-variant">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-sm">check</span>Posição de destaque nas buscas</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-sm">check</span>Badge "Destaque" no card</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-600 text-sm">check</span>Rotação justa entre anúncios destaque</li>
            </ul>
          </div>

          <div className="bg-inverse-surface rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 text-xl">workspace_premium</span>
              <h3 className="font-black text-inverse-on-surface">Elite</h3>
            </div>
            <p className="text-sm text-inverse-on-surface/70 leading-relaxed">O nível máximo de visibilidade. Anúncios Elite aparecem acima dos Destaque e têm presença garantida nas primeiras posições.</p>
            <ul className="space-y-1 text-sm text-inverse-on-surface/70">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-yellow-400 text-sm">check</span>Posição acima do Destaque</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-yellow-400 text-sm">check</span>Badge "Elite" exclusivo</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-yellow-400 text-sm">check</span>Máxima exposição na galeria</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Por que anunciar */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-on-surface">Por que anunciar na ShopMotor?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "group", title: "Audiência qualificada", desc: "Compradores que estão ativamente buscando veículos, não navegação casual." },
            { icon: "price_check", title: "Transparência de preços", desc: "Comparação FIPE automática que ajuda compradores a tomar decisões mais rápidas." },
            { icon: "trending_up", title: "Ferramentas de impulsionamento", desc: "Destaque seu anúncio quando precisar vender mais rápido." },
            { icon: "insights", title: "Estatísticas em tempo real", desc: "Saiba quantas pessoas visualizaram seu anúncio e como ele está performando." },
            { icon: "storefront", title: "Página da loja", desc: "Lojas têm URL exclusiva e vitrine personalizada com todos os seus veículos." },
            { icon: "verified_user", title: "Plataforma segura", desc: "Sistema de avaliações, chat interno e verificação de usuários para mais confiança." },
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

function PlanCard({ name, price, period, highlight, features, cta, href }: {
  name: string; price: string; period: string; highlight: boolean;
  features: string[]; cta: string; href: string;
}) {
  return (
    <div className={`rounded-2xl p-6 space-y-5 flex flex-col ${highlight ? "bg-inverse-surface shadow-2xl scale-[1.02]" : "bg-surface-container-lowest shadow-sm"}`}>
      <div>
        <p className={`text-xs font-black uppercase tracking-widest ${highlight ? "text-primary-container" : "text-on-surface-variant"}`}>{name}</p>
        <p className={`text-3xl font-black mt-1 ${highlight ? "text-inverse-on-surface" : "text-on-surface"}`}>{price}</p>
        <p className={`text-xs ${highlight ? "text-inverse-on-surface/60" : "text-on-surface-variant"}`}>{period}</p>
      </div>
      <ul className="space-y-2 flex-1">
        {features.map(f => (
          <li key={f} className={`flex items-start gap-2 text-sm ${highlight ? "text-inverse-on-surface/80" : "text-on-surface-variant"}`}>
            <span className={`material-symbols-outlined text-sm flex-shrink-0 mt-0.5 ${highlight ? "text-primary-container" : "text-green-600"}`}>check_circle</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block text-center font-black py-3 rounded-full text-sm uppercase tracking-widest transition-all hover:-translate-y-0.5 ${
          highlight
            ? "bg-primary-container text-on-primary-container"
            : "bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-on-primary-container"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
