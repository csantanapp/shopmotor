import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Central de Ajuda — ShopMotor",
  description: "Encontre respostas e suporte para usar a ShopMotor.",
};

const topics = [
  {
    icon: "person_add",
    title: "Cadastro e Conta",
    items: [
      { q: "Como criar uma conta?", a: "Acesse /cadastro, preencha seus dados e escolha entre conta Pessoa Física ou Jurídica. O cadastro é gratuito." },
      { q: "Esqueci minha senha. Como recuperar?", a: "Na tela de login, clique em Esqueci minha senha e informe seu e-mail. Você receberá um link de redefinição." },
      { q: "Como alterar meus dados cadastrais?", a: "Acesse Minha Conta > Dados Pessoais, edite as informações e clique em Salvar." },
      { q: "Como excluir minha conta?", a: "Em Minha Conta > Segurança, role até Zona de Perigo e clique em Excluir Conta. A ação é irreversível." },
    ],
  },
  {
    icon: "directions_car",
    title: "Anúncios",
    items: [
      { q: "Como publicar um anúncio?", a: "Acesse Meu Perfil > Novo Anúncio. Preencha os dados do veículo, adicione fotos e publique." },
      { q: "Quantos anúncios posso ter?", a: "Todo vendedor tem 20 anúncios ativos como base. Lojistas com plano podem ter bônus adicionais dependendo do plano contratado." },
      { q: "Como editar um anúncio já publicado?", a: "Em Meus Anúncios, clique no ícone de edição ao lado do anúncio desejado." },
      { q: "Como marcar um veículo como vendido?", a: "Em Meus Anúncios, clique no ícone de handshake ao lado do anúncio ativo." },
      { q: "O que é a badge Baixou o preço?", a: "Quando você reduz o preço de um anúncio já publicado, essa indicação aparece automaticamente para alertar compradores interessados." },
      { q: "O que acontece quando meu anúncio expira?", a: "Anúncios ficam ativos por 30 dias. Após esse período você pode renovar gratuitamente até 2 vezes. Após as 2 renovações, é necessário impulsionar para reativar." },
    ],
  },
  {
    icon: "rocket_launch",
    title: "Impulsionamento",
    items: [
      { q: "Como funciona o impulsionamento?", a: "Anúncios impulsionados aparecem no topo dos resultados de busca com um selo de destaque. Existem três planos: Turbo (7 dias), Destaque (15 dias) e Super Destaque (30 dias)." },
      { q: "Qual a diferença entre os planos de impulsionamento?", a: "Turbo por R$17,90 impulsiona por 7 dias. Destaque por R$27,90 impulsiona por 15 dias. Super Destaque por R$47,90 impulsiona por 30 dias com máxima visibilidade." },
      { q: "Posso cancelar um impulsionamento?", a: "Não é possível cancelar impulsos já ativados, pois o crédito é consumido no ato da contratação." },
      { q: "Como reativar um anúncio expirado após as 2 renovações?", a: "Após usar os 2 períodos gratuitos de renovação, o anúncio só pode ser reativado contratando um plano de impulsionamento." },
    ],
  },
  {
    icon: "chat",
    title: "Mensagens",
    items: [
      { q: "Como entrar em contato com um vendedor?", a: "Na página do anúncio, clique em Enviar mensagem. Você precisa estar logado para enviar mensagens." },
      { q: "Onde encontro minhas conversas?", a: "Acesse Meu Perfil > Mensagens para ver todas as suas conversas ativas." },
      { q: "O vendedor pode ver meu telefone?", a: "Seu telefone só é exibido se você ativar a opção Compartilhar telefone nas configurações da conta." },
    ],
  },
  {
    icon: "star",
    title: "Avaliações",
    items: [
      { q: "Como avaliar um vendedor?", a: "Na página do anúncio, após iniciar uma conversa, a seção de avaliações fica disponível abaixo das informações do veículo." },
      { q: "Posso editar ou excluir minha avaliação?", a: "Avaliações publicadas não podem ser editadas. Em caso de avaliação indevida, entre em contato com nosso suporte." },
    ],
  },
];

export default function AjudaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Suporte</p>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface">Central de Ajuda</h1>
        <p className="text-on-surface-variant text-sm">Encontre respostas rápidas sobre como usar a ShopMotor.</p>
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/faq",       icon: "help",     label: "FAQ"       },
          { href: "/seguranca", icon: "shield",   label: "Segurança" },
          { href: "/contato",   icon: "mail",     label: "Contato"   },
          { href: "/ads",       icon: "campaign", label: "Anuncie"   },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm group text-center"
          >
            <span className="material-symbols-outlined text-2xl text-primary group-hover:text-on-primary-container">{item.icon}</span>
            <span className="text-sm font-bold text-on-surface group-hover:text-on-primary-container">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Tópicos */}
      <div className="space-y-8">
        {topics.map(topic => (
          <div key={topic.title} className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-xl">{topic.icon}</span>
              <h2 className="font-black text-on-surface">{topic.title}</h2>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {topic.items.map(item => (
                <details key={item.q} className="group px-6 py-4 cursor-pointer">
                  <summary className="flex items-center justify-between gap-4 text-sm font-semibold text-on-surface list-none">
                    {item.q}
                    <span className="material-symbols-outlined text-base text-outline flex-shrink-0 group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary-container/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div>
          <p className="font-black text-on-surface">Não encontrou o que precisava?</p>
          <p className="text-sm text-on-surface-variant">Nossa equipe está pronta para ajudar.</p>
        </div>
        <Link href="/contato" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all flex-shrink-0">
          Falar com suporte
        </Link>
      </div>

    </div>
  );
}
