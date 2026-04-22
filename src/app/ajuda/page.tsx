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
      { q: "Como criar uma conta?", a: "Acesse /cadastro, preencha seus dados e escolha entre conta Pessoa Fisica ou Juridica. O cadastro e gratuito." },
      { q: "Esqueci minha senha. Como recuperar?", a: "Na tela de login, clique em Esqueci minha senha e informe seu e-mail. Voce recebera um link de redefinicao." },
      { q: "Como alterar meus dados cadastrais?", a: "Acesse Minha Conta > Dados Pessoais, edite as informacoes e clique em Salvar." },
      { q: "Como excluir minha conta?", a: "Em Minha Conta > Seguranca, role ate Zona de Perigo e clique em Excluir Conta. A acao e irreversivel." },
    ],
  },
  {
    icon: "directions_car",
    title: "Anuncios",
    items: [
      { q: "Como publicar um anuncio?", a: "Acesse Meu Perfil > Novo Anuncio. Preencha os dados do veiculo, adicione fotos e publique." },
      { q: "Quantos anuncios posso ter?", a: "No plano gratis voce pode ter ate 3 anuncios ativos. Com o plano Premium o limite e de 20 anuncios simultaneos." },
      { q: "Como editar um anuncio ja publicado?", a: "Em Meus Anuncios, clique no icone de edicao ao lado do anuncio desejado." },
      { q: "Como marcar um veiculo como vendido?", a: "Em Meus Anuncios, clique no icone de handshake ao lado do anuncio ativo." },
      { q: "O que e a badge Baixou o preco?", a: "Quando voce reduz o preco de um anuncio ja publicado, essa indicacao aparece automaticamente para alertar compradores interessados." },
    ],
  },
  {
    icon: "payments",
    title: "Impulsionamento",
    items: [
      { q: "Como funciona o impulsionamento?", a: "Anuncios impulsionados aparecem no topo dos resultados de busca. Existem dois niveis: Destaque e Elite." },
      { q: "Por quanto tempo o anuncio fica impulsionado?", a: "Depende do plano de impulso contratado. Os prazos sao exibidos antes da confirmacao do pagamento." },
      { q: "Posso cancelar um impulsionamento?", a: "Nao e possivel cancelar impulsos ja ativados, pois o credito e consumido no ato da contratacao." },
    ],
  },
  {
    icon: "chat",
    title: "Mensagens",
    items: [
      { q: "Como entrar em contato com um vendedor?", a: "Na pagina do anuncio, clique em Enviar mensagem. Voce precisa estar logado para enviar mensagens." },
      { q: "Onde encontro minhas conversas?", a: "Acesse Meu Perfil > Mensagens para ver todas as suas conversas ativas." },
      { q: "O vendedor pode ver meu telefone?", a: "Seu telefone so e exibido se voce ativar a opcao Compartilhar telefone nas configuracoes da conta." },
    ],
  },
  {
    icon: "star",
    title: "Avaliacoes",
    items: [
      { q: "Como avaliar um vendedor?", a: "Na pagina do anuncio, apos iniciar uma conversa, a secao de avaliacoes fica disponivel abaixo das informacoes do veiculo." },
      { q: "Posso editar ou excluir minha avaliacao?", a: "Avaliacoes publicadas nao podem ser editadas. Em caso de avaliacao indevida, entre em contato com nosso suporte." },
    ],
  },
];

export default function AjudaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Suporte</p>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface">Central de Ajuda</h1>
        <p className="text-on-surface-variant text-sm">Encontre respostas rapidas sobre como usar a ShopMotor.</p>
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/faq", icon: "help", label: "FAQ" },
          { href: "/seguranca", icon: "shield", label: "Seguranca" },
          { href: "/contato", icon: "mail", label: "Contato" },
          { href: "/anuncie", icon: "campaign", label: "Anuncie" },
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

      {/* Topicos */}
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
          <p className="font-black text-on-surface">Nao encontrou o que precisava?</p>
          <p className="text-sm text-on-surface-variant">Nossa equipe esta pronta para ajudar.</p>
        </div>
        <Link href="/contato" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all flex-shrink-0">
          Falar com suporte
        </Link>
      </div>

    </div>
  );
}
