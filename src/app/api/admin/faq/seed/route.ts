import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

const FAQS = [
  { categoria: "Geral", pergunta: "O que é a ShopMotor?", resposta: "A ShopMotor é uma plataforma online de compra e venda de veículos que conecta compradores e vendedores em todo o Brasil, com ferramentas como comparação FIPE, impulsionamento de anúncios e chat integrado.", pagina: "faq", ordem: 1 },
  { categoria: "Geral", pergunta: "A ShopMotor cobra alguma taxa para anunciar?", resposta: "O cadastro e a publicação de até 3 anúncios são gratuitos. Recursos extras como anúncios adicionais e impulsionamento são pagos conforme os planos disponíveis.", pagina: "faq", ordem: 2 },
  { categoria: "Geral", pergunta: "A ShopMotor intermedia pagamentos entre comprador e vendedor?", resposta: "Não. A ShopMotor é uma plataforma de anúncios. Os pagamentos e negociações são realizados diretamente entre as partes, sem intermediação financeira nossa.", pagina: "faq", ordem: 3 },
  { categoria: "Anúncios", pergunta: "Como meu anúncio aparece nos resultados de busca?", resposta: "Os resultados são ordenados por data de publicação por padrão. Anúncios impulsionados (Destaque ou Elite) aparecem no topo. Você também pode filtrar por preço, km, marca e outros critérios.", pagina: "faq", ordem: 1 },
  { categoria: "Anúncios", pergunta: "Por quanto tempo meu anúncio fica ativo?", resposta: "Anúncios ficam ativos indefinidamente enquanto você não os pausar, excluir ou marcar como vendido.", pagina: "faq", ordem: 2 },
  { categoria: "Anúncios", pergunta: "O que significa 'Abaixo da FIPE'?", resposta: "Quando o preço do anúncio é inferior ao valor de referência FIPE para aquele modelo e ano, exibimos automaticamente essa indicação para ajudar compradores a identificar boas oportunidades.", pagina: "faq", ordem: 3 },
  { categoria: "Conta e Acesso", pergunta: "Posso ter mais de uma conta?", resposta: "Cada CPF ou CNPJ pode ter apenas uma conta na ShopMotor. Contas duplicadas podem ser suspensas.", pagina: "faq", ordem: 1 },
  { categoria: "Conta e Acesso", pergunta: "Meus dados pessoais são seguros?", resposta: "Sim. Seguimos a LGPD e adotamos criptografia de dados, HTTPS e boas práticas de segurança.", pagina: "faq", ordem: 2 },
  { categoria: "Conta e Acesso", pergunta: "Como funciona a conta Loja (PJ)?", resposta: "Contas PJ são para empresas do setor automotivo. Além dos recursos padrão, lojas terão uma página pública personalizada com banner, logo e vitrine de veículos.", pagina: "faq", ordem: 3 },
  { categoria: "FIPE e Valores", pergunta: "Como é calculado o valor FIPE exibido?", resposta: "Consultamos a tabela FIPE via API parceira com base na marca, modelo e ano do veículo informados no anúncio.", pagina: "faq", ordem: 1 },
  { categoria: "FIPE e Valores", pergunta: "O valor FIPE é atualizado automaticamente?", resposta: "O valor é consultado no momento da publicação do anúncio. Para anúncios antigos, o valor pode estar desatualizado em relação à tabela atual.", pagina: "faq", ordem: 2 },
  { categoria: "Pagamentos e Planos", pergunta: "Quais formas de pagamento são aceitas?", resposta: "Aceitamos cartão de crédito, PIX e boleto bancário para contratação de planos e impulsionamentos.", pagina: "faq", ordem: 1 },
  { categoria: "Pagamentos e Planos", pergunta: "Posso cancelar meu plano a qualquer momento?", resposta: "Sim, planos recorrentes podem ser cancelados a qualquer momento. O acesso permanece ativo até o fim do período já pago.", pagina: "faq", ordem: 2 },
  { categoria: "Pagamentos e Planos", pergunta: "Existe reembolso?", resposta: "Créditos de impulsionamento já utilizados não são reembolsáveis. Para cancelamentos de planos, avaliamos caso a caso conforme o Código de Defesa do Consumidor.", pagina: "faq", ordem: 3 },
  { categoria: "Impulsionamento", pergunta: "Quando começa a aparecer no topo após contratar?", resposta: "Imediatamente. Assim que o impulsionamento é ativado, seu anúncio sobe para o topo dos resultados de busca e exibe o selo do plano escolhido.", pagina: "ads", ordem: 1 },
  { categoria: "Impulsionamento", pergunta: "Posso impulsionar mais de um veículo ao mesmo tempo?", resposta: "Sim. Cada anúncio tem seu próprio impulsionamento independente. Você pode ativar planos diferentes para veículos diferentes.", pagina: "ads", ordem: 2 },
  { categoria: "Impulsionamento", pergunta: "O que acontece quando o período termina?", resposta: "O anúncio volta ao posicionamento orgânico normalmente. Nenhum dado é perdido e você pode renovar o impulsionamento quando quiser.", pagina: "ads", ordem: 3 },
  { categoria: "Impulsionamento", pergunta: "Precisa ser vendedor cadastrado para impulsionar?", resposta: "Sim. Para acessar os planos de impulsionamento você precisa ter uma conta de vendedor e pelo menos um anúncio ativo na plataforma.", pagina: "ads", ordem: 4 },
];

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma as any;
  const existing = await db.faqItem.count();
  if (existing > 0) {
    return NextResponse.json({ ok: true, message: `Já existem ${existing} FAQs. Nada inserido.` });
  }

  await db.faqItem.createMany({ data: FAQS });
  return NextResponse.json({ ok: true, inserted: FAQS.length });
}
