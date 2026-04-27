"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

const faqs = [
  {
    category: "Anúncios",
    question: "Como publicar meu anúncio?",
    answer: "Acesse 'Cadastrar Veículo' no menu lateral, preencha os dados do veículo, adicione fotos e clique em Publicar. Seu anúncio ficará ativo imediatamente.",
  },
  {
    category: "Anúncios",
    question: "Como editar ou excluir um anúncio?",
    answer: "Vá em 'Meus Anúncios' no menu lateral, localize o anúncio e clique em Editar. Para excluir, abra o anúncio e use a opção de exclusão no final da página.",
  },
  {
    category: "Anúncios",
    question: "Quantas fotos posso adicionar por anúncio?",
    answer: "Você pode adicionar até 20 fotos por anúncio. Recomendamos incluir fotos do exterior, interior, motor e detalhes relevantes.",
  },
  {
    category: "Mensagens",
    question: "Como responder uma proposta de comprador?",
    answer: "Acesse 'Mensagens' no menu lateral. Todas as propostas recebidas aparecem lá. Clique na conversa para responder diretamente pelo chat.",
  },
  {
    category: "Mensagens",
    question: "Como sei que recebi uma nova mensagem?",
    answer: "Um badge vermelho aparece no ícone de notificações (sino) no topo da página sempre que houver mensagens não lidas.",
  },
  {
    category: "Conta",
    question: "Como alterar minha foto de perfil?",
    answer: "Vá em 'Minha Conta' no menu lateral. Clique no ícone de câmera sobre sua foto de perfil e selecione uma nova imagem (JPG, PNG ou WebP, máximo 5MB).",
  },
  {
    category: "Conta",
    question: "Como alterar minha senha?",
    answer: "Acesse 'Minha Conta', role até a seção 'Segurança' e clique em 'Alterar'. Você precisará confirmar a senha atual antes de definir uma nova.",
  },
  {
    category: "Conta",
    question: "Posso compartilhar meu telefone com compradores?",
    answer: "Sim. Em 'Minha Conta' você pode ativar a opção 'Divulgar telefone'. Quando ativado, seu número aparece no chat para o comprador interessado.",
  },
  {
    category: "Pagamentos",
    question: "O cadastro é gratuito?",
    answer: "Sim, o cadastro e a publicação de anúncios são totalmente gratuitos. O Plano Premium é opcional e oferece recursos adicionais.",
  },
];

const topics = [
  { icon: "directions_car", label: "Anúncios", desc: "Publicar, editar e gerenciar" },
  { icon: "chat_bubble", label: "Mensagens", desc: "Chat com compradores" },
  { icon: "manage_accounts", label: "Conta", desc: "Perfil e configurações" },
  { icon: "payments", label: "Pagamentos", desc: "Planos e cobranças" },
  { icon: "security", label: "Segurança", desc: "Privacidade e senha" },
  { icon: "help", label: "Outros", desc: "Dúvidas gerais" },
];

export default function AjudaPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter(f => {
    const matchSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || f.category === activeCategory;
    return matchSearch && matchCat;
  });

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
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory(null); setOpenIndex(null); }}
          placeholder="Pesquisar na central de ajuda..."
          className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-0 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-primary-container outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
            <Icon name="close" className="text-lg" />
          </button>
        )}
      </div>

      {/* Topics */}
      {!search && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {topics.map((t) => {
            const active = activeCategory === t.label;
            return (
              <button
                key={t.label}
                onClick={() => { setActiveCategory(active ? null : t.label); setOpenIndex(null); }}
                className={`p-5 rounded-2xl shadow-sm flex flex-col gap-3 text-left transition-colors group border-2 ${active ? "border-primary-container bg-primary-container/10" : "border-transparent bg-surface-container-lowest hover:bg-primary-container/5"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? "bg-primary-container" : "bg-surface-container group-hover:bg-primary-container/20"}`}>
                  <Icon name={t.icon} className={`text-xl ${active ? "text-on-primary-container" : "text-on-surface"}`} />
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{t.label}</p>
                  <p className="text-xs text-on-surface-variant">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* FAQ */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-on-surface">
            {activeCategory ? `${activeCategory}` : search ? `Resultados para "${search}"` : "Perguntas Frequentes"}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}</p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <Icon name="search_off" className="text-5xl text-outline mb-3" />
            <p className="font-bold text-on-surface">Nenhum resultado encontrado</p>
            <p className="text-sm text-on-surface-variant mt-1">Tente outros termos ou entre em contato com o suporte.</p>
          </div>
        ) : (
          <div className="px-8 pb-4">
            {filtered.map((faq, i) => (
              <div key={i} className="border-b border-neutral-100 last:border-0">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left gap-4"
                >
                  <div className="flex items-start gap-3">
                    {!activeCategory && !search && (
                      <span className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary-container/20 px-2 py-0.5 rounded-full flex-shrink-0">
                        {faq.category}
                      </span>
                    )}
                    <span className="font-semibold text-sm text-on-surface">{faq.question}</span>
                  </div>
                  <Icon name={openIndex === i ? "expand_less" : "expand_more"} className="text-outline flex-shrink-0 text-xl" />
                </button>
                {openIndex === i && (
                  <p className="text-sm text-on-surface-variant pb-4 leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="bg-inverse-surface text-white p-8 rounded-2xl space-y-4">
        <h2 className="text-base font-bold">Não encontrou o que procurava?</h2>
        <p className="text-sm text-neutral-400">Nossa equipe de suporte está disponível de segunda a sábado, das 8h às 20h.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/554599999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all"
          >
            <Icon name="chat" className="text-lg" />
            WhatsApp
          </a>
          <a
            href="mailto:suporte@shopmotor.com.br"
            className="flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-colors"
          >
            <Icon name="mail" className="text-lg" />
            Enviar e-mail
          </a>
        </div>
      </div>

    </div>
  );
}
