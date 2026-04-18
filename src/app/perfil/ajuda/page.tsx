import type { Metadata } from "next";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Ajuda — ShopMotors" };

const faqs = [
  {
    question: "Como publicar meu anúncio?",
    answer: "Acesse 'Cadastrar Veículo' no menu lateral, preencha os dados do veículo, adicione fotos e clique em Publicar. Seu anúncio será revisado e publicado em até 2 horas.",
  },
  {
    question: "Como editar ou excluir um anúncio?",
    answer: "Vá em 'Meu Perfil', localize o anúncio ativo e clique em Editar. Para excluir, acesse as opções do anúncio e selecione Excluir anúncio.",
  },
  {
    question: "Como entrar em contato com um comprador?",
    answer: "Use a aba 'Mensagens' para responder interessados. Você também pode visualizar o telefone do comprador na tela do anúncio.",
  },
  {
    question: "Meu anúncio não está aparecendo na busca. O que fazer?",
    answer: "Verifique se o anúncio está com status 'Ativo'. Caso esteja em revisão, aguarde até 2 horas. Se o problema persistir, entre em contato com o suporte.",
  },
  {
    question: "Como funciona o Plano Premium?",
    answer: "O Plano Premium destaca seu anúncio nos resultados de busca, adiciona o selo 'Premium Listing' e oferece estatísticas detalhadas de visualizações e contatos.",
  },
];

const topics = [
  { icon: "directions_car", label: "Anúncios", desc: "Publicar, editar e gerenciar" },
  { icon: "payments", label: "Pagamentos", desc: "Planos e cobranças" },
  { icon: "security", label: "Segurança", desc: "Conta e privacidade" },
  { icon: "chat_bubble", label: "Mensagens", desc: "Chat com compradores" },
  { icon: "star", label: "Avaliações", desc: "Reputação e reviews" },
  { icon: "help", label: "Outros", desc: "Dúvidas gerais" },
];

export default function AjudaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div>
        <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Central de Ajuda</h1>
        <p className="text-on-surface-variant text-sm mt-1">Como podemos te ajudar hoje?</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl" />
        <input
          placeholder="Pesquisar na central de ajuda..."
          className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-0 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-primary-container outline-none"
        />
      </div>

      {/* Topics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {topics.map((t) => (
          <button key={t.label} className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm flex flex-col gap-3 text-left hover:bg-primary-container/10 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-primary-container transition-colors">
              <Icon name={t.icon} className="text-xl text-on-surface group-hover:text-on-primary-container" />
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">{t.label}</p>
              <p className="text-xs text-on-surface-variant">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-1">
        <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4 mb-4">Perguntas Frequentes</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="group border-b border-neutral-100 last:border-0">
            <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
              <span className="font-semibold text-sm text-on-surface pr-4">{faq.question}</span>
              <Icon name="expand_more" className="text-outline flex-shrink-0 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-sm text-on-surface-variant pb-4 leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>

      {/* Contact */}
      <div className="bg-inverse-surface text-white p-8 rounded-2xl space-y-4">
        <h2 className="text-base font-bold">Não encontrou o que procurava?</h2>
        <p className="text-sm text-neutral-400">Nossa equipe de suporte está disponível de segunda a sábado, das 8h às 20h.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all">
            <Icon name="chat" className="text-lg" />
            Abrir chat
          </button>
          <button className="flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-colors">
            <Icon name="mail" className="text-lg" />
            Enviar e-mail
          </button>
        </div>
      </div>

    </div>
  );
}
