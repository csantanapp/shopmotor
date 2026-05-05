export type StorePlan = "STARTER" | "PRO" | "ELITE";

// Planos ativos para venda (STARTER antigo foi descontinuado)
export const ACTIVE_PLANS: StorePlan[] = ["PRO", "ELITE"];

// Limite de anúncios gratuitos para PJ sem plano pago (Plano Grátis)
export const PJ_FREE_LIMIT = 30;

// Após login, lojistas Pro (ELITE) vão para o ERP; Starter (PRO) ficam no perfil
export const PLAN_REDIRECT: Record<string, string> = {
  ELITE: "/vendas",
  PRO:   "/perfil",
};

export const STORE_PLANS = {
  // Mantido no tipo para compatibilidade com assinaturas antigas — não vendido mais
  STARTER: {
    key: "STARTER",
    name: "Starter Legacy",
    emoji: "",
    price: 297,
    days: 30,
    anunciosBase: 30,
    anunciosExtras: 0,
    anunciosTotal: 30,
    destaques: 2,
    vitrine: true,
    vitrineLayout: "STARTER" as const,
    urlPersonalizada: true,
    seloVerificacao: true,
    socialLinks: false,
    leadContact: false,
    whatsapp: true,
    analytics: false,
    financiamento: false,
    homeDestaque: false,
    erpAccess: false,
    features: [
      "Perfil Loja com identidade visual",
      "30 anúncios no total",
      "2 Destaques mensais inclusos",
      "Selo de verificação",
      "Acesso ao WhatsApp",
    ],
    notIncluded: [],
  },
  // Antes chamado "Pro" — agora é o Plano Starter
  PRO: {
    key: "PRO",
    name: "Starter",
    emoji: "",
    price: 697,
    days: 30,
    anunciosBase: 50,
    anunciosExtras: 0,
    anunciosTotal: 50,
    destaques: 5,
    vitrine: true,
    vitrineLayout: "PRO" as const,
    urlPersonalizada: true,
    seloVerificacao: true,
    socialLinks: true,
    leadContact: true,
    whatsapp: true,
    analytics: true,
    financiamento: false,
    homeDestaque: false,
    erpAccess: false,
    features: [
      "Perfil Loja com identidade visual",
      "Vitrine Personalizada automática",
      "Nome da Loja + URL exclusiva",
      "Até 50 anúncios",
      "5 Destaques/mês inclusos",
      "Selo de verificação",
      "Links de redes sociais no perfil",
      "Acesso ao e-mail e telefone do lead",
      "Acesso ao WhatsApp",
      "Analytics de anúncios",
    ],
    notIncluded: [
      "Sistema ERP de gestão",
      "Simulação de Financiamento",
      "Destaque Lojas na Home",
    ],
  },
  // Antes chamado "Elite" — agora é o Plano Pro
  ELITE: {
    key: "ELITE",
    name: "Pro",
    emoji: "",
    price: 1197,
    days: 30,
    anunciosBase: 999999,
    anunciosExtras: 0,
    anunciosTotal: 999999,
    destaques: 10,
    vitrine: true,
    vitrineLayout: "ELITE" as const,
    urlPersonalizada: true,
    seloVerificacao: true,
    socialLinks: true,
    leadContact: true,
    whatsapp: true,
    analytics: true,
    financiamento: true,
    homeDestaque: true,
    erpAccess: true,
    features: [
      "Perfil Loja com identidade visual",
      "Vitrine Personalizada automática",
      "Nome da Loja + URL exclusiva",
      "Anúncios ilimitados",
      "10 Destaques/mês inclusos",
      "Selo de verificação",
      "Links de redes sociais no perfil",
      "Acesso ao e-mail e telefone do lead",
      "Acesso ao WhatsApp",
      "Analytics de anúncios",
      "Simulação de Financiamento integrada",
      "Destaque Lojas na Home",
      "Sistema ERP de gestão",
    ],
    notIncluded: [],
  },
} as const;

export function getPlanLimits(plan: StorePlan | null) {
  if (!plan || !STORE_PLANS[plan]) return { anunciosTotal: PJ_FREE_LIMIT, destaques: 0 };
  return {
    anunciosTotal: STORE_PLANS[plan].anunciosTotal,
    destaques: STORE_PLANS[plan].destaques,
  };
}

/** Retorna true se o plano pago permite WhatsApp */
export function planAllowsWhatsapp(plan: StorePlan | null): boolean {
  if (!plan) return false;
  return STORE_PLANS[plan].whatsapp;
}

/** Retorna true se o plano dá acesso ao ERP /vendas */
export function planAllowsErp(plan: StorePlan | null): boolean {
  if (!plan) return false;
  return (STORE_PLANS[plan] as { erpAccess?: boolean }).erpAccess === true;
}
