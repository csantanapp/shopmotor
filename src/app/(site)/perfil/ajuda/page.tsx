"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

const faqs = [
  // ── Anúncios (PF) ──────────────────────────────────────────────────────────
  {
    category: "Anúncios",
    question: "Quantos anúncios posso publicar?",
    answer:
      "Pessoas físicas (CPF) têm até 3 anúncios gratuitos simultâneos no plano Free e até 20 no Plano Premium. Lojistas (CNPJ) têm até 20 vagas gratuitas simultâneas, independentemente de terem ou não um plano comercial ativo.",
  },
  {
    category: "Anúncios",
    question: "Por quanto tempo meu anúncio fica no ar?",
    answer:
      "Cada anúncio gratuito fica ativo por 30 dias corridos. Ao vencer, ele sai das buscas e vai para a seção Inativos. Você pode renová-lo gratuitamente mais 2 vezes (totalizando até 90 dias). Após os 3 períodos, o ciclo gratuito está esgotado e a reativação exige impulsionamento pago.",
  },
  {
    category: "Anúncios",
    question: "O que acontece quando o anúncio expira?",
    answer:
      "Quando o prazo de 30 dias vence, o anúncio é marcado como Expirado, removido das buscas e listagens públicas, e movido para a aba Inativos em Meus Anúncios. Você recebe um e-mail e uma notificação no sino avisando. Clique em Renovar para republicar gratuitamente (se ainda houver renovações disponíveis).",
  },
  {
    category: "Anúncios",
    question: "Como funciona a renovação gratuita?",
    answer:
      "Cada anúncio pode ser renovado gratuitamente 2 vezes, sempre de forma manual. Acesse Meus Anúncios › aba Inativos e clique em Renovar no anúncio desejado. A renovação republica o anúncio por mais 30 dias imediatamente, sem custo. Não há prazo limite para renovar — o anúncio aguarda em Inativos indefinidamente.",
  },
  {
    category: "Anúncios",
    question: "O que é o ciclo gratuito esgotado?",
    answer:
      "Após os 3 períodos de 30 dias (publicação inicial + 2 renovações = 90 dias totais), o anúncio entra em estado 'Ciclo Gratuito Esgotado'. Ele fica armazenado em Inativos mas não pode ser renovado gratuitamente. A única forma de reativar é contratar um plano de impulsionamento pago (Turbo, Destaque ou Super Destaque). A edição do anúncio também fica bloqueada nesse estado.",
  },
  {
    category: "Anúncios",
    question: "Posso editar um anúncio depois de publicado?",
    answer:
      "Sim, enquanto o anúncio estiver Ativo você pode editar qualquer informação (fotos, preço, descrição, especificações). Anúncios em 'Ciclo Gratuito Esgotado' têm edição bloqueada — é necessário impulsionar para desbloquear.",
  },
  {
    category: "Anúncios",
    question: "Quantas fotos são obrigatórias?",
    answer:
      "São obrigatórias no mínimo 3 fotos para publicar um anúncio. Você pode adicionar até 20 fotos por anúncio. Recomendamos incluir fotos do exterior (frente, lateral, traseira), interior (painel, bancos) e motor para aumentar a confiança do comprador.",
  },
  {
    category: "Anúncios",
    question: "Como funciona a vaga FIFO (fila de espera)?",
    answer:
      "Quando uma das suas vagas gratuitas é liberada (por exclusão, venda ou esgotamento de ciclo de outro anúncio) e você tem anúncios salvos em Inativos aguardando publicação, o sistema identifica o anúncio mais antigo elegível e exibe o botão 'Publicar grátis' diretamente nele. Você recebe uma notificação por e-mail e no sino.",
  },
  {
    category: "Anúncios",
    question: "Como marcar um veículo como vendido?",
    answer:
      "Em Meus Anúncios, localize o anúncio e clique no ícone de aperto de mão (handshake). Confirme a ação. O anúncio é marcado como Vendido, removido das buscas e a vaga gratuita é liberada imediatamente para outro anúncio.",
  },
  {
    category: "Anúncios",
    question: "Atingi o limite de vagas, o que faço?",
    answer:
      "Ao tentar publicar quando todas as vagas estão ocupadas, você verá a tela 'Limite de vagas atingido' com 3 opções: (a) Aguardar liberação de uma vaga — o anúncio fica salvo e você é notificado quando uma vaga abrir; (b) Publicar imediatamente via impulsionamento pago (Turbo, Destaque ou Super Destaque); (c) Contratar um plano comercial (Starter, Pro ou Elite) que oferece cotas adicionais.",
  },

  // ── Lojistas ───────────────────────────────────────────────────────────────
  {
    category: "Lojistas",
    question: "Quem pode anunciar como Lojista (PJ/CNPJ)?",
    answer:
      "Empresas, garagens, revendas e concessionárias com CNPJ ativo. O cadastro exige CNPJ válido, razão social, nome fantasia, endereço comercial e dados do responsável. Contas Pessoa Física (CPF) não podem operar como Lojista.",
  },
  {
    category: "Lojistas",
    question: "Qual é o limite de anúncios para Lojistas?",
    answer:
      "Cada conta Lojista tem 20 vagas gratuitas simultâneas. Anúncios ativos ocupam uma vaga. Anúncios em Inativos (aguardando renovação) não ocupam vaga. Anúncios em 'Ciclo Gratuito Esgotado' também não ocupam vaga. Planos comerciais (Starter, Pro, Elite) oferecem cotas adicionais independentes das 20 vagas gratuitas.",
  },
  {
    category: "Lojistas",
    question: "O que é a página pública da loja?",
    answer:
      "Todo Lojista tem uma página pública em shopmotor.com.br/loja/[seu-slug] que exibe todos os anúncios ativos da conta. Compradores podem filtrar por marca, modelo, faixa de preço e ano diretamente na página da loja. Anúncios expirados ou inativos não aparecem na página pública.",
  },
  {
    category: "Lojistas",
    question: "Quais são os planos comerciais disponíveis?",
    answer:
      "Há três planos: Starter (cotas adicionais + recursos básicos de loja), Pro (mais cotas + links sociais + acesso ao contato do lead) e Elite (máxima cota + analytics + simulação de financiamento + destaque na Home). Os anúncios do plano comercial são independentes das 20 vagas gratuitas e seguem as regras próprias de cada plano.",
  },

  // ── Impulsionamento ────────────────────────────────────────────────────────
  {
    category: "Impulsionamento",
    question: "Quais são os planos de impulsionamento disponíveis?",
    answer:
      "Turbo (R$ 17,90 — 7 dias): topo das buscas, selo Destaque e galeria. Destaque (R$ 27,90 — 15 dias): posicionamento privilegiado, prioridade em filtros, seção Destaques da Home. Super Destaque (R$ 47,90 — 30 dias): topo absoluto dos resultados, seção Elite da Home, prioridade total em descoberta.",
  },
  {
    category: "Impulsionamento",
    question: "Qual a diferença entre impulsionamento e plano comercial?",
    answer:
      "O impulsionamento é pontual, pago por anúncio individual, sem assinatura. Serve para dar mais visibilidade a um anúncio específico ou para reativar um anúncio com ciclo esgotado. O plano comercial é uma assinatura mensal que oferece cota extra de anúncios e recursos de loja — não substitui o impulsionamento, os dois podem ser usados juntos.",
  },
  {
    category: "Impulsionamento",
    question: "O que acontece quando o impulsionamento termina?",
    answer:
      "Se o anúncio ainda tinha ciclo gratuito disponível, ele volta para Ativo com a expiração original. Se o ciclo gratuito estava esgotado (3 períodos consumidos), ao término do impulsionamento o anúncio retorna para Inativos no estado 'Ciclo Gratuito Esgotado'. Você recebe uma notificação e pode contratar novo impulsionamento.",
  },
  {
    category: "Impulsionamento",
    question: "Posso editar o anúncio durante o impulsionamento?",
    answer:
      "Sim, a edição fica liberada durante toda a vigência do impulsionamento, mesmo que o anúncio estivesse com ciclo esgotado antes.",
  },
  {
    category: "Impulsionamento",
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Cartão de crédito, Pix e boleto bancário — processados via Mercado Pago. O pagamento é confirmado em tempo real para Pix e cartão. Boleto pode levar até 3 dias úteis para compensar.",
  },

  // ── Mensagens ──────────────────────────────────────────────────────────────
  {
    category: "Mensagens",
    question: "Como funciona o chat com compradores?",
    answer:
      "Compradores interessados podem iniciar uma conversa direto na página do anúncio. Você recebe uma notificação no sino e por e-mail. Acesse Mensagens no menu lateral para responder. Todo histórico fica salvo na plataforma.",
  },
  {
    category: "Mensagens",
    question: "Como sei que recebi uma nova mensagem?",
    answer:
      "Um badge vermelho com o número de mensagens não lidas aparece no sino no canto superior da tela. Além disso, você recebe uma notificação interna na página de Notificações.",
  },
  {
    category: "Mensagens",
    question: "Posso compartilhar meu telefone com compradores?",
    answer:
      "Sim. Em Minha Conta, ative a opção 'Divulgar telefone'. Quando ativado, seu número aparece para o comprador interessado dentro do chat.",
  },

  // ── Conta ──────────────────────────────────────────────────────────────────
  {
    category: "Conta",
    question: "Como alterar minha foto de perfil?",
    answer:
      "Acesse Minha Conta no menu lateral. Clique no ícone de câmera sobre sua foto e selecione uma imagem (JPG, PNG ou WebP, máximo 5 MB). A foto é atualizada imediatamente.",
  },
  {
    category: "Conta",
    question: "Como alterar minha senha?",
    answer:
      "Em Minha Conta, role até a seção Segurança e clique em Alterar. Informe a senha atual e defina a nova. Use uma senha forte com letras, números e símbolos.",
  },
  {
    category: "Conta",
    question: "O que são as notificações do sino?",
    answer:
      "O sino no topo da tela consolida avisos importantes: anúncios próximos do vencimento (3 dias antes), confirmação de expiração, confirmação de renovação, ciclo gratuito esgotado, vaga liberada (FIFO) e ativação/término de impulsionamento. Acesse Notificações no menu para ver o histórico.",
  },
  {
    category: "Conta",
    question: "Posso ter uma conta PF e PJ ao mesmo tempo?",
    answer:
      "Não. Cada e-mail corresponde a uma conta. Para atuar como Lojista (CNPJ), crie uma conta com os dados da empresa. Contas Pessoa Física e Pessoa Jurídica são completamente separadas.",
  },

  // ── Pagamentos ─────────────────────────────────────────────────────────────
  {
    category: "Pagamentos",
    question: "O cadastro e a publicação são gratuitos?",
    answer:
      "Sim. Criar conta e publicar anúncios dentro da cota gratuita (3 para PF / 20 para Lojistas) é totalmente grátis. Planos comerciais e impulsionamentos são opcionais e pagos.",
  },
  {
    category: "Pagamentos",
    question: "Como cancelar meu plano comercial?",
    answer:
      "Acesse Meu Plano no menu lateral e clique em Cancelar assinatura. O plano permanece ativo até o fim do período já pago. Após o cancelamento, os anúncios do plano seguem as regras de transição definidas em cada plano.",
  },
  {
    category: "Pagamentos",
    question: "Recebo reembolso se meu anúncio for removido por moderação?",
    answer:
      "Não há reembolso em caso de remoção por moderação (conteúdo inadequado, dados falsos etc.). O ciclo gratuito é considerado parcial ou totalmente consumido conforme avaliação. Você recebe uma notificação com o motivo da remoção.",
  },

  // ── Segurança ──────────────────────────────────────────────────────────────
  {
    category: "Segurança",
    question: "Como denunciar um anúncio suspeito?",
    answer:
      "Na página do anúncio, clique no menu (⋮) e selecione 'Reportar anúncio'. Descreva o motivo. Nossa equipe analisa em até 48 horas. Nunca realize pagamentos fora da plataforma.",
  },
  {
    category: "Segurança",
    question: "Como proteger minha conta de acessos não autorizados?",
    answer:
      "Use uma senha única e forte para o ShopMotor. Nunca compartilhe seus dados de acesso. Se suspeitar de acesso não autorizado, altere a senha imediatamente em Minha Conta › Segurança e entre em contato com o suporte.",
  },
  {
    category: "Segurança",
    question: "Meus dados pessoais são protegidos?",
    answer:
      "Sim. Seguimos a LGPD (Lei Geral de Proteção de Dados). Seu CPF/CNPJ é armazenado criptografado e nunca é exibido publicamente. Apenas informações que você autorizar (como telefone) ficam visíveis para outros usuários.",
  },
];

const topics = [
  { icon: "directions_car", label: "Anúncios",       desc: "Publicar, renovar e gerenciar" },
  { icon: "storefront",     label: "Lojistas",       desc: "CNPJ, loja e planos comerciais" },
  { icon: "rocket_launch",  label: "Impulsionamento", desc: "Turbo, Destaque e Super Destaque" },
  { icon: "chat_bubble",    label: "Mensagens",      desc: "Chat com compradores" },
  { icon: "manage_accounts", label: "Conta",         desc: "Perfil e configurações" },
  { icon: "payments",       label: "Pagamentos",     desc: "Planos e cobranças" },
  { icon: "security",       label: "Segurança",      desc: "Privacidade e senha" },
];

export default function AjudaPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter(f => {
    const matchSearch = !search ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
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
          {topics.map(t => {
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
            {activeCategory
              ? activeCategory
              : search
              ? `Resultados para "${search}"`
              : "Perguntas Frequentes"}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <Icon name="search_off" className="text-5xl text-outline mb-3" />
            <p className="font-bold text-on-surface">Nenhum resultado encontrado</p>
            <p className="text-sm text-on-surface-variant mt-1 mb-6">
              Tente outros termos ou entre em contato com o suporte.
            </p>
            <Link
              href="/contato"
              className="flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all"
            >
              <Icon name="flag" className="text-lg" />
              Reportar
            </Link>
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
        <p className="text-sm text-neutral-400">
          Nossa equipe de suporte está disponível de segunda a sábado, das 8h às 20h.
        </p>
        <div>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all"
          >
            <Icon name="flag" className="text-lg" />
            Reportar
          </Link>
        </div>
      </div>

    </div>
  );
}
