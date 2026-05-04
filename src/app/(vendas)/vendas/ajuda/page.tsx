"use client";

import { useState } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";

const faqs = [
  { category: "Anúncios", question: "Quantos anúncios posso publicar?", answer: "Pessoas físicas (CPF) têm até 3 anúncios gratuitos simultâneos no plano Free e até 20 no Plano Premium. Lojistas (CNPJ) têm até 20 vagas gratuitas simultâneas, independentemente de terem ou não um plano comercial ativo." },
  { category: "Anúncios", question: "Por quanto tempo meu anúncio fica no ar?", answer: "Cada anúncio gratuito fica ativo por 30 dias corridos. Ao vencer, ele sai das buscas e vai para a seção Inativos. Você pode renová-lo gratuitamente mais 2 vezes (totalizando até 90 dias). Após os 3 períodos, o ciclo gratuito está esgotado e a reativação exige impulsionamento pago." },
  { category: "Anúncios", question: "O que acontece quando o anúncio expira?", answer: "Quando o prazo de 30 dias vence, o anúncio é marcado como Expirado, removido das buscas e listagens públicas, e movido para a aba Inativos em Meus Anúncios. Você recebe um e-mail e uma notificação no sino avisando. Clique em Renovar para republicar gratuitamente (se ainda houver renovações disponíveis)." },
  { category: "Anúncios", question: "Como funciona a renovação gratuita?", answer: "Cada anúncio pode ser renovado gratuitamente 2 vezes, sempre de forma manual. Acesse Meus Anúncios › aba Inativos e clique em Renovar no anúncio desejado. A renovação republica o anúncio por mais 30 dias imediatamente, sem custo." },
  { category: "Anúncios", question: "Posso editar um anúncio depois de publicado?", answer: "Sim, enquanto o anúncio estiver Ativo você pode editar qualquer informação (fotos, preço, descrição, especificações). Anúncios em 'Ciclo Gratuito Esgotado' têm edição bloqueada — é necessário impulsionar para desbloquear." },
  { category: "Anúncios", question: "Quantas fotos são obrigatórias?", answer: "São obrigatórias no mínimo 3 fotos para publicar um anúncio. Você pode adicionar até 20 fotos por anúncio. Recomendamos incluir fotos do exterior (frente, lateral, traseira), interior (painel, bancos) e motor para aumentar a confiança do comprador." },
  { category: "Anúncios", question: "Como marcar um veículo como vendido?", answer: "Em Meus Anúncios, localize o anúncio e clique no botão Vender. Confirme a ação. O anúncio é marcado como Vendido, removido das buscas e a vaga gratuita é liberada imediatamente para outro anúncio." },
  { category: "Lojistas", question: "Quem pode anunciar como Lojista (PJ/CNPJ)?", answer: "Empresas, garagens, revendas e concessionárias com CNPJ ativo. O cadastro exige CNPJ válido, razão social, nome fantasia, endereço comercial e dados do responsável." },
  { category: "Lojistas", question: "Qual é o limite de anúncios para Lojistas?", answer: "Cada conta Lojista tem 20 vagas gratuitas simultâneas. Planos comerciais (Starter, Pro, Elite) oferecem cotas adicionais independentes das 20 vagas gratuitas." },
  { category: "Lojistas", question: "O que é a página pública da loja?", answer: "Todo Lojista tem uma página pública em shopmotor.com.br/loja/[seu-slug] que exibe todos os anúncios ativos da conta. Compradores podem filtrar por marca, modelo, faixa de preço e ano diretamente na página da loja." },
  { category: "Impulsionamento", question: "Quais são os planos de impulsionamento disponíveis?", answer: "Turbo (R$ 49 — 7 dias): mais visibilidade. Destaque (R$ 129 — 15 dias): posicionamento premium. Super Destaque (R$ 289 — 30 dias): máxima exposição com banner na home." },
  { category: "Impulsionamento", question: "Qual a diferença entre impulsionamento e plano comercial?", answer: "O impulsionamento é pontual, pago por anúncio individual. O plano comercial é uma assinatura mensal com cota extra de anúncios e recursos de loja — os dois podem ser usados juntos." },
  { category: "Impulsionamento", question: "Quais formas de pagamento são aceitas?", answer: "Cartão de crédito, Pix e boleto bancário — processados via Mercado Pago. O pagamento é confirmado em tempo real para Pix e cartão. Boleto pode levar até 3 dias úteis para compensar." },
  { category: "Mensagens", question: "Como funciona o chat com compradores?", answer: "Compradores interessados podem iniciar uma conversa direto na página do anúncio. Você recebe uma notificação e por e-mail. Acesse Mensagens no menu lateral para responder. Todo histórico fica salvo na plataforma." },
  { category: "Conta", question: "Como alterar minha senha?", answer: "Em Minha Conta, role até a seção Segurança e clique em Alterar. Informe a senha atual e defina a nova. Use uma senha forte com letras, números e símbolos." },
  { category: "Conta", question: "Posso ter uma conta PF e PJ ao mesmo tempo?", answer: "Não. Cada e-mail corresponde a uma conta. Para atuar como Lojista (CNPJ), crie uma conta com os dados da empresa." },
  { category: "Pagamentos", question: "O cadastro e a publicação são gratuitos?", answer: "Sim. Criar conta e publicar anúncios dentro da cota gratuita (3 para PF / 20 para Lojistas) é totalmente grátis. Planos comerciais e impulsionamentos são opcionais e pagos." },
  { category: "Segurança", question: "Como denunciar um anúncio suspeito?", answer: "Na página do anúncio, clique no menu (⋮) e selecione 'Reportar anúncio'. Nossa equipe analisa em até 48 horas. Nunca realize pagamentos fora da plataforma." },
  { category: "Segurança", question: "Meus dados pessoais são protegidos?", answer: "Sim. Seguimos a LGPD (Lei Geral de Proteção de Dados). Seu CPF/CNPJ é armazenado criptografado e nunca é exibido publicamente." },
];

const topics = [
  { icon: "directions_car", label: "Anúncios",        desc: "Publicar, renovar e gerenciar" },
  { icon: "storefront",     label: "Lojistas",        desc: "CNPJ, loja e planos comerciais" },
  { icon: "rocket_launch",  label: "Impulsionamento", desc: "Turbo, Destaque e Super Destaque" },
  { icon: "chat_bubble",    label: "Mensagens",       desc: "Chat com compradores" },
  { icon: "manage_accounts", label: "Conta",          desc: "Perfil e configurações" },
  { icon: "payments",       label: "Pagamentos",      desc: "Planos e cobranças" },
  { icon: "security",       label: "Segurança",       desc: "Privacidade e senha" },
];

export default function AjudaErpPage() {
  const [search, setSearch]             = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIndex, setOpenIndex]       = useState<number | null>(null);

  const filtered = faqs.filter(f => {
    const matchSearch = !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <ErpLayout title="Central de Ajuda" subtitle="Dúvidas frequentes e suporte">

      {/* Search */}
      <div className="relative mb-6 max-w-xl">
        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory(null); setOpenIndex(null); }}
          placeholder="Pesquisar na central de ajuda..."
          className="w-full pl-11 pr-4 py-3 border border-black/10 bg-white rounded-xl text-sm focus:ring-2 focus:ring-primary-container outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
            <Icon name="close" className="text-base" />
          </button>
        )}
      </div>

      {/* Topics */}
      {!search && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {topics.map(t => {
            const active = activeCategory === t.label;
            return (
              <button key={t.label}
                onClick={() => { setActiveCategory(active ? null : t.label); setOpenIndex(null); }}
                className={`p-4 rounded-xl border-2 flex flex-col gap-2 text-left transition ${active ? "border-primary-container bg-yellow-50" : "border-black/10 bg-white hover:bg-gray-50"}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? "bg-primary-container" : "bg-gray-100"}`}>
                  <Icon name={t.icon} className={`text-lg ${active ? "text-black" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* FAQ */}
      <div className="rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden mb-6">
        <div className="px-6 pt-5 pb-3 border-b border-black/10 bg-gray-50">
          <h2 className="font-black text-gray-900">
            {activeCategory ?? (search ? `Resultados para "${search}"` : "Perguntas Frequentes")}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}</p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Icon name="search_off" className="text-5xl text-gray-200 mb-3" />
            <p className="font-black text-gray-400">Nenhum resultado</p>
            <p className="text-sm text-gray-400 mt-1">Tente outros termos ou entre em contato com o suporte.</p>
          </div>
        ) : (
          <div className="px-6 pb-2">
            {filtered.map((faq, i) => (
              <div key={i} className="border-b border-black/5 last:border-0">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left gap-4"
                >
                  <div className="flex items-start gap-2">
                    {!activeCategory && !search && (
                      <span className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full shrink-0">
                        {faq.category}
                      </span>
                    )}
                    <span className="font-semibold text-sm text-gray-900">{faq.question}</span>
                  </div>
                  <Icon name={openIndex === i ? "expand_less" : "expand_more"} className="text-gray-400 shrink-0 text-xl" />
                </button>
                {openIndex === i && (
                  <p className="text-sm text-gray-600 pb-4 leading-relaxed">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="rounded-xl bg-gray-900 text-white p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-black text-base">Não encontrou o que procurava?</p>
          <p className="text-sm text-gray-400 mt-1">Nossa equipe está disponível de segunda a sábado, das 8h às 20h.</p>
        </div>
        <a href="mailto:suporte@shopmotor.com.br"
          className="shrink-0 flex items-center gap-2 bg-primary-container text-black px-5 py-2.5 rounded-xl font-black text-sm hover:opacity-90 transition">
          <Icon name="mail" className="text-base" /> Falar com suporte
        </a>
      </div>

    </ErpLayout>
  );
}
