import Link from "next/link";
import Icon from "@/components/ui/Icon";


const whyShopMotor = [
  { icon: "ads_click",   title: "Alto alcance",           desc: "Dezenas de milhares de compradores navegando todos os meses em busca do veículo ideal." },
  { icon: "psychology",  title: "Intenção de compra real", desc: "Quem está no ShopMotor já decidiu comprar. Sua marca aparece no exato momento da decisão." },
  { icon: "target",      title: "Segmentação precisa",     desc: "Impacte usuários por marca, modelo, faixa de preço, estado e tipo de veículo. Zero desperdício de verba." },
  { icon: "trending_up", title: "Resultados mensuráveis",  desc: "Visualizações, cliques e conversões rastreados em tempo real. Você sabe exatamente o que está recebendo." },
];

const FALLBACK_FAQS = [
  { q: "Quando começa a aparecer no topo após contratar?",   a: "Imediatamente. Assim que o impulsionamento é ativado, seu anúncio sobe para o topo dos resultados de busca e exibe o selo do plano escolhido." },
  { q: "Posso impulsionar mais de um veículo ao mesmo tempo?", a: "Sim. Cada anúncio tem seu próprio impulsionamento independente. Você pode ativar planos diferentes para veículos diferentes." },
  { q: "O que acontece quando o período termina?",           a: "O anúncio volta ao posicionamento orgânico normalmente. Nenhum dado é perdido e você pode renovar o impulsionamento quando quiser." },
  { q: "Precisa ser vendedor cadastrado para impulsionar?",   a: "Sim. Você precisa ter uma conta de vendedor e pelo menos um anúncio ativo na plataforma." },
];

async function getPlatformStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/public-stats`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json() as Promise<{ totalVehicles: number; totalUsers: number; totalStores: number }>;
  } catch { return null; }
}

async function getAdsFaqs(): Promise<{ q: string; a: string }[]> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/faq?pagina=ads`, { next: { revalidate: 300 } });
    if (!res.ok) return FALLBACK_FAQS;
    const d = await res.json();
    if (!d.items || d.items.length === 0) return FALLBACK_FAQS;
    return d.items.map((i: any) => ({ q: i.pergunta, a: i.resposta }));
  } catch { return FALLBACK_FAQS; }
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k+`;
  return `${n}+`;
}

export default async function AdsPage() {
  const [platformStats, faqs] = await Promise.all([getPlatformStats(), getAdsFaqs()]);

  const stats = [
    { value: platformStats ? fmt(platformStats.totalVehicles) : "—", label: "Anúncios ativos", icon: "directions_car" },
    { value: platformStats ? fmt(platformStats.totalUsers) : "—", label: "Vendedores cadastrados", icon: "people" },
    { value: "6x", label: "Sessões por usuário/mês", icon: "repeat" },
    { value: "20 min", label: "Tempo médio na plataforma", icon: "schedule" },
  ];

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative bg-inverse-surface overflow-hidden min-h-[560px] flex items-center">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface via-inverse-surface/90 to-inverse-surface/60" />

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 py-24 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-0.5 bg-primary-container" />
              <span className="text-primary-container text-xs font-black uppercase tracking-widest">ShopMotor Ads</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none uppercase mb-6">
              SUA MARCA<br />
              <span className="text-primary-container">NO MOMENTO<br />DA DECISÃO</span>
            </h1>

            <p className="text-neutral-400 text-lg mb-10 max-w-xl leading-relaxed">
              Impulsionamos a conexão entre vendedores e compradores. Coloque seu veículo — ou sua marca — no centro de quem já decidiu comprar.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/contato"
                className="flex items-center gap-2 bg-primary-container text-on-primary-container font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all"
              >
                <Icon name="mail" className="text-lg" />
                Fale com a gente
              </Link>
              <Link
                href="/perfil/meus-anuncios"
                className="flex items-center gap-2 border border-white/20 text-white font-black px-8 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <Icon name="rocket_launch" className="text-lg" />
                Impulsionar meu anúncio
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-screen-2xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                  <Icon name={s.icon} className="text-primary-container text-lg" />
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-none">{s.value}</p>
                  <p className="text-neutral-400 text-xs mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUE SHOPMOTORS ADS ── */}
      <section className="max-w-screen-2xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Vantagem competitiva</p>
          <h2 className="text-4xl font-black tracking-tighter text-on-surface uppercase">Por que ShopMotor Ads?</h2>
          <p className="text-on-surface-variant mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Enquanto outras plataformas apostam em alcance genérico, nós entregamos atenção qualificada — usuários com intenção real de compra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyShopMotor.map((item) => (
            <div key={item.title} className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm group hover:bg-primary-container transition-colors duration-300">
              <div className="w-12 h-12 bg-surface-container group-hover:bg-primary rounded-xl flex items-center justify-center mb-5 transition-colors">
                <Icon name={item.icon} className="text-2xl text-primary group-hover:text-on-primary-container transition-colors" />
              </div>
              <h3 className="font-black text-base text-on-surface group-hover:text-on-primary-container uppercase tracking-tight mb-2 transition-colors">{item.title}</h3>
              <p className="text-sm text-on-surface-variant group-hover:text-on-primary-container/80 leading-relaxed transition-colors">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ── COMO FUNCIONA ── */}
      <section className="max-w-screen-2xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Simples assim</p>
          <h2 className="text-4xl font-black tracking-tighter text-on-surface uppercase">Como funciona</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { step: "01", icon: "person_add", title: "Crie sua conta", desc: "Cadastre-se como vendedor gratuitamente em menos de 2 minutos." },
            { step: "02", icon: "add_circle", title: "Anuncie seu veículo", desc: "Publique seu anúncio com fotos, descrição e preço." },
            { step: "03", icon: "rocket_launch", title: "Escolha o plano", desc: "Selecione Turbo, Destaque ou Super Destaque conforme seu objetivo." },
            { step: "04", icon: "visibility", title: "Apareça mais", desc: "Seu anúncio sobe imediatamente para o topo e ganha o selo do plano." },
          ].map((item) => (
            <div key={item.step} className="text-center group">
              <div className="relative inline-flex mb-5">
                <div className="w-16 h-16 bg-surface-container-lowest rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary-container transition-colors">
                  <Icon name={item.icon} className="text-3xl text-primary group-hover:text-on-primary-container transition-colors" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-container text-on-primary-container text-[10px] font-black rounded-full flex items-center justify-center">
                  {item.step}
                </span>
              </div>
              <h3 className="font-black text-on-surface uppercase tracking-tight mb-2">{item.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-surface-container-low py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Tire suas dúvidas</p>
            <h2 className="text-4xl font-black tracking-tighter text-on-surface uppercase">Perguntas frequentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-container/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="help_outline" className="text-primary text-sm" />
                  </div>
                  <div>
                    <p className="font-black text-on-surface mb-2">{faq.q}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-inverse-surface py-24">
        <div className="max-w-screen-2xl mx-auto px-6 text-center">
          <p className="text-primary-container text-xs font-black uppercase tracking-widest mb-4">Pronto para começar?</p>
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase mb-6 leading-tight">
            SEU CARRO VENDIDO<br />
            <span className="text-primary-container">MAIS RÁPIDO</span>
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto text-sm leading-relaxed mb-10">
            Quem impulsiona vende até 3x mais rápido. Não espere o comprador te encontrar — vá até ele.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/perfil/meus-anuncios"
              className="flex items-center gap-2 bg-primary-container text-on-primary-container font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all"
            >
              <Icon name="rocket_launch" className="text-lg" />
              Impulsionar agora
            </Link>
            <a
              href="mailto:publicidade@shopmotor.com.br"
              className="flex items-center gap-2 border border-white/20 text-white font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              <Icon name="mail" className="text-lg" />
              publicidade@shopmotor.com.br
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
