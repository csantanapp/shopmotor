import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ShopMotor <noreply@shopmotor.com.br>";
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://shopmotor.com.br";

function vehicleLabel(v: { brand: string; model: string; yearFab: number }) {
  return `${v.brand} ${v.model} ${v.yearFab}`;
}

export async function sendExpirationEmail(user: { email: string; name: string }, vehicle: { id: string; brand: string; model: string; yearFab: number }, renewalCount: number) {
  const label = vehicleLabel(vehicle);
  const cycleEsgotado = renewalCount >= 2;

  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: cycleEsgotado
      ? `[ShopMotor] Ciclo gratuito esgotado — ${label}`
      : `[ShopMotor] Seu anúncio expirou — ${label}`,
    html: cycleEsgotado ? `
      <h2>Ciclo gratuito esgotado</h2>
      <p>Olá, ${user.name}!</p>
      <p>Seu anúncio do <strong>${label}</strong> completou os 2 períodos gratuitos (60 dias no total) e não pode mais ser renovado gratuitamente.</p>
      <p>Para reativar e aparecer nas buscas novamente, escolha um plano de impulsionamento:</p>
      <p><a href="${BASE}/perfil/impulsionar/${vehicle.id}" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Impulsionar agora</a></p>
      <p>O anúncio permanece salvo em "Inativos" aguardando sua ação.</p>
    ` : `
      <h2>Seu anúncio saiu do ar</h2>
      <p>Olá, ${user.name}!</p>
      <p>Seu anúncio do <strong>${label}</strong> expirou e foi removido das buscas.</p>
      ${renewalCount === 1 ? `<p><strong>⚠️ Esta é a última renovação gratuita disponível.</strong></p>` : ""}
      <p>Acesse "Meus Anúncios" para renovar gratuitamente por mais 30 dias:</p>
      <p><a href="${BASE}/perfil/meus-anuncios" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Renovar anúncio</a></p>
    `,
  });
}

export async function sendExpirationWarningEmail(user: { email: string; name: string }, vehicle: { id: string; brand: string; model: string; yearFab: number }, daysLeft: number, renewalCount: number) {
  const label = vehicleLabel(vehicle);
  const isLastCycle = renewalCount >= 1;

  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: `[ShopMotor] Seu anúncio expira em ${daysLeft} dias — ${label}`,
    html: `
      <h2>Seu anúncio expira em breve</h2>
      <p>Olá, ${user.name}!</p>
      <p>O anúncio do <strong>${label}</strong> expira em <strong>${daysLeft} dias</strong>.</p>
      ${isLastCycle ? `<p><strong>⚠️ Atenção: este é o último período gratuito. Após expirar, será necessário impulsionar para reativar.</strong></p>` : ""}
      <p>Após expirar, o anúncio sairá das buscas. Você poderá ${isLastCycle ? "impulsioná-lo" : "renová-lo gratuitamente"} quando quiser.</p>
      <p><a href="${BASE}/perfil/meus-anuncios" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Ver meus anúncios</a></p>
    `,
  });
}

export async function sendSlotAvailableEmail(user: { email: string; name: string }, vehicle: { id: string; brand: string; model: string; yearFab: number }) {
  const label = vehicleLabel(vehicle);

  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: `[ShopMotor] Vaga liberada! Seu anúncio pode ser publicado — ${label}`,
    html: `
      <h2>Uma vaga gratuita foi liberada!</h2>
      <p>Olá, ${user.name}!</p>
      <p>Você tem o anúncio do <strong>${label}</strong> aguardando publicação.</p>
      <p>Como uma vaga foi liberada, você pode publicá-lo agora gratuitamente:</p>
      <p><a href="${BASE}/perfil/meus-anuncios" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Publicar agora</a></p>
    `,
  });
}

export async function sendRenewalConfirmationEmail(user: { email: string; name: string }, vehicle: { brand: string; model: string; yearFab: number }, expiresAt: Date, renewalCount: number) {
  const label = vehicleLabel(vehicle);
  const expiry = expiresAt.toLocaleDateString("pt-BR");

  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: `[ShopMotor] Anúncio reativado — ${label}`,
    html: `
      <h2>Anúncio reativado com sucesso!</h2>
      <p>Olá, ${user.name}!</p>
      <p>Seu anúncio do <strong>${label}</strong> está ativo novamente e aparece nas buscas até <strong>${expiry}</strong>.</p>
      ${renewalCount >= 2 ? `<p><strong>⚠️ Este foi o último período gratuito. Após ${expiry}, será necessário impulsionar para reativar.</strong></p>` : ""}
      <p><a href="${BASE}/perfil/meus-anuncios" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Ver meus anúncios</a></p>
    `,
  });
}
