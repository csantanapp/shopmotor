import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dúvidas Frequentes — ShopMotor",
  description: "Respostas para as perguntas mais comuns sobre a ShopMotor.",
};

const faqs = [
  {
    categoria: "Geral",
    perguntas: [
      { q: "O que é a ShopMotor?", a: "A ShopMotor é uma plataforma online de compra e venda de veículos que conecta compradores e vendedores em todo o Brasil, com ferramentas como comparação FIPE, impulsionamento de anúncios e chat integrado." },
      { q: "A ShopMotor cobra alguma taxa para anunciar?", a: "O cadastro e a publicação de até 3 anúncios são gratuitos. Recursos extras como anúncios adicionais e impulsionamento são pagos conforme os planos disponíveis." },
      { q: "A ShopMotor intermedia pagamentos entre comprador e vendedor?", a: "Não. A ShopMotor é uma plataforma de anúncios. Os pagamentos e negociações são realizados diretamente entre as partes, sem intermediação financeira nossa." },
    ],
  },
  {
    categoria: "Anúncios",
    perguntas: [
      { q: "Como meu anúncio aparece nos resultados de busca?", a: "Os resultados são ordenados por data de publicação por padrão. Anúncios impulsionados (Destaque ou Elite) aparecem no topo. Você também pode filtrar por preço, km, marca e outros critérios." },
      { q: "Por quanto tempo meu anúncio fica ativo?", a: "Anúncios ficam ativos indefinidamente enquanto você não os pausar, excluir ou marcar como vendido. Anúncios impulsionados têm prazo de destaque conforme o plano escolhido." },
      { q: "Posso ter fotos em 360° no anúncio?", a: "No momento os anúncios suportam até 20 fotos convencionais. Funcionalidades de fotos 360° estão no nosso roadmap." },
      { q: "O que significa 'Abaixo da FIPE'?", a: "Quando o preço do anúncio é inferior ao valor de referência FIPE para aquele modelo e ano, exibimos automaticamente essa indicação para ajudar compradores a identificar boas oportunidades." },
    ],
  },
  {
    categoria: "Conta e Acesso",
    perguntas: [
      { q: "Posso ter mais de uma conta?", a: "Cada CPF ou CNPJ pode ter apenas uma conta na ShopMotor. Contas duplicadas podem ser suspensas." },
      { q: "Meus dados pessoais são seguros?", a: "Sim. Seguimos a LGPD e adotamos criptografia de dados, HTTPS e boas práticas de segurança. Consulte nossa Política de Privacidade para mais detalhes." },
      { q: "Como funciona a conta Loja (PJ)?", a: "Contas PJ são para empresas do setor automotivo. Além dos recursos padrão, lojas terão uma página pública personalizada com banner, logo e vitrine de veículos." },
    ],
  },
  {
    categoria: "FIPE e Valores",
    perguntas: [
      { q: "Como é calculado o valor FIPE exibido?", a: "Consultamos a tabela FIPE via API parceira (Parallelum) com base na marca, modelo e ano do veículo informados no anúncio." },
      { q: "O valor FIPE é atualizado automaticamente?", a: "O valor é consultado no momento da publicação do anúncio. Para anúncios antigos, o valor pode estar desatualizado em relação à tabela atual." },
    ],
  },
  {
    categoria: "Pagamentos e Planos",
    perguntas: [
      { q: "Quais formas de pagamento são aceitas?", a: "Aceitamos cartão de crédito, PIX e boleto bancário para contratação de planos e impulsionamentos." },
      { q: "Posso cancelar meu plano a qualquer momento?", a: "Sim, planos recorrentes podem ser cancelados a qualquer momento. O acesso permanece ativo até o fim do período já pago." },
      { q: "Existe reembolso?", a: "Créditos de impulsionamento já utilizados não são reembolsáveis. Para cancelamentos de planos, avaliamos caso a caso conforme o Código de Defesa do Consumidor." },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-primary">FAQ</p>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface">Dúvidas Frequentes</h1>
        <p className="text-on-surface-variant text-sm">Respostas rápidas para as perguntas mais comuns.</p>
      </div>

      <div className="space-y-8">
        {faqs.map(cat => (
          <div key={cat.categoria} className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30">
              <h2 className="font-black text-on-surface">{cat.categoria}</h2>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {cat.perguntas.map(item => (
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

      <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
        <div>
          <p className="font-black text-on-surface">Sua dúvida não está aqui?</p>
          <p className="text-sm text-on-surface-variant">Fale diretamente com nosso suporte.</p>
        </div>
        <Link href="/contato" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all flex-shrink-0">
          Entrar em contato
        </Link>
      </div>

    </div>
  );
}
