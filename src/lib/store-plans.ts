export type StorePlan = "STARTER" | "PRO" | "ELITE";

// Limite de anúncios gratuitos para PJ sem plano pago (Plano Grátis)
export const PJ_FREE_LIMIT = 10;

export const STORE_PLANS = {
  STARTER: {
    key: "STARTER",
    name: "Starter",
    emoji: "",
    price: 297,
    days: 30,
    anunciosBase: 20,
    anunciosExtras: 5,
    anunciosTotal: 25,
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
    features: [
      "Perfil Loja com identidade visual",
      "Vitrine Personalizada automática",
      "Nome da Loja + URL exclusiva",
      "20 anúncios gratuitos + 5 extras (25 no total)",
      "2 Destaques mensais inclusos",
      "Selo de verificação",
      "Acesso ao WhatsApp",
    ],
    notIncluded: [
      "Links de redes sociais no perfil",
      "Acesso ao e-mail e telefone do lead",
      "Analytics de anúncios",
      "Simulação de Financiamento",
      "Destaque Lojas na Home",
    ],
  },
  PRO: {
    key: "PRO",
    name: "Pro",
    emoji: "",
    price: 697,
    days: 30,
    anunciosBase: 20,
    anunciosExtras: 15,
    anunciosTotal: 35,
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
    features: [
      "Perfil Loja com identidade visual",
      "Vitrine Personalizada automática",
      "Nome da Loja + URL exclusiva",
      "20 anúncios gratuitos + 15 extras (35 no total)",
      "5 Destaques/mês inclusos",
      "Selo de verificação",
      "Links de redes sociais no perfil",
      "Acesso ao e-mail e telefone do lead",
      "Acesso ao WhatsApp",
      "Analytics de anúncios",
    ],
    notIncluded: [
      "Simulação de Financiamento",
      "Destaque Lojas na Home",
    ],
  },
  ELITE: {
    key: "ELITE",
    name: "Elite",
    emoji: "",
    price: 1197,
    days: 30,
    anunciosBase: 20,
    anunciosExtras: 30,
    anunciosTotal: 50,
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
    features: [
      "Perfil Loja com identidade visual",
      "Vitrine Personalizada automática",
      "Nome da Loja + URL exclusiva",
      "20 anúncios gratuitos + 30 extras (50 no total)",
      "10 Destaques/mês inclusos",
      "Selo de verificação",
      "Links de redes sociais no perfil",
      "Acesso ao e-mail e telefone do lead",
      "Acesso ao WhatsApp",
      "Analytics de anúncios",
      "Simulação de Financiamento integrada",
      "Destaque Lojas na Home",
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
