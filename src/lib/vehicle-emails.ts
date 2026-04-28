import { Resend } from "resend";
import { createNotification } from "@/lib/notifications";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ShopMotor <noreply@shopmotor.com.br>";
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://shopmotor.com.br";

function vehicleLabel(v: { brand: string; model: string; yearFab: number }) {
  return `${v.brand} ${v.model} ${v.yearFab}`;
}

type UserInfo = { id: string; email: string; name: string };
type VehicleInfo = { id: string; brand: string; model: string; yearFab: number };

export async function sendExpirationEmail(user: UserInfo, vehicle: VehicleInfo, renewalCount: number) {
  const label = vehicleLabel(vehicle);
  const cycleEsgotado = renewalCount >= 2;
  const url = `${BASE}/perfil/meus-anuncios`;

  const title = cycleEsgotado
    ? `Ciclo gratuito esgotado — ${label}`
    : `Seu anúncio expirou — ${label}`;
  const body = cycleEsgotado
    ? "Seu anúncio completou os 60 dias gratuitos. Impulsione para reativar."
    : renewalCount === 1
      ? "Seu anúncio expirou. Esta é a última renovação gratuita disponível."
      : "Seu anúncio expirou e foi removido das buscas. Renove gratuitamente.";

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `[ShopMotor] ${title}`,
      html: cycleEsgotado ? `
        <h2>Ciclo gratuito esgotado</h2>
        <p>Olá, ${user.name}!</p>
        <p>Seu anúncio do <strong>${label}</strong> completou os 2 períodos gratuitos (60 dias) e não pode mais ser renovado gratuitamente.</p>
        <p><a href="${BASE}/perfil/impulsionar/${vehicle.id}" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Impulsionar agora</a></p>
      ` : `
        <h2>Seu anúncio saiu do ar</h2>
        <p>Olá, ${user.name}!</p>
        <p>Seu anúncio do <strong>${label}</strong> expirou e foi removido das buscas.</p>
        ${renewalCount === 1 ? `<p><strong>⚠️ Esta é a última renovação gratuita disponível.</strong></p>` : ""}
        <p><a href="${url}" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Renovar anúncio</a></p>
      `,
    }),
    createNotification({
      userId: user.id,
      type: cycleEsgotado ? "cycle_exhausted" : "vehicle_expired",
      title,
      body,
      vehicleId: vehicle.id,
      actionUrl: cycleEsgotado ? `/perfil/impulsionar/${vehicle.id}` : "/perfil/meus-anuncios",
    }),
  ]);
}

export async function sendExpirationWarningEmail(user: UserInfo, vehicle: VehicleInfo, daysLeft: number, renewalCount: number) {
  const label = vehicleLabel(vehicle);
  const isLastCycle = renewalCount >= 1;
  const title = `Seu anúncio expira em ${daysLeft} dias — ${label}`;
  const body = isLastCycle
    ? `Atenção: último período gratuito. Após expirar, será necessário impulsionar para reativar.`
    : `Seu anúncio expira em ${daysLeft} dias. Após expirar, você poderá renová-lo gratuitamente.`;

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `[ShopMotor] ${title}`,
      html: `
        <h2>Seu anúncio expira em breve</h2>
        <p>Olá, ${user.name}!</p>
        <p>O anúncio do <strong>${label}</strong> expira em <strong>${daysLeft} dias</strong>.</p>
        ${isLastCycle ? `<p><strong>⚠️ Este é o último período gratuito.</strong></p>` : ""}
        <p><a href="${BASE}/perfil/meus-anuncios" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Ver meus anúncios</a></p>
      `,
    }),
    createNotification({
      userId: user.id,
      type: "vehicle_warning",
      title,
      body,
      vehicleId: vehicle.id,
      actionUrl: "/perfil/meus-anuncios",
    }),
  ]);
}

export async function sendSlotAvailableEmail(user: UserInfo, vehicle: VehicleInfo) {
  const label = vehicleLabel(vehicle);
  const title = `Vaga liberada! ${label} pode ser publicado`;
  const body = "Uma vaga gratuita foi liberada. Publique seu anúncio agora.";

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `[ShopMotor] ${title}`,
      html: `
        <h2>Uma vaga gratuita foi liberada!</h2>
        <p>Olá, ${user.name}!</p>
        <p>Você tem o anúncio do <strong>${label}</strong> aguardando publicação.</p>
        <p><a href="${BASE}/perfil/meus-anuncios" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Publicar agora</a></p>
      `,
    }),
    createNotification({
      userId: user.id,
      type: "slot_available",
      title,
      body,
      vehicleId: vehicle.id,
      actionUrl: "/perfil/meus-anuncios",
    }),
  ]);
}

export async function sendRenewalConfirmationEmail(user: UserInfo, vehicle: { brand: string; model: string; yearFab: number }, expiresAt: Date, renewalCount: number) {
  const label = vehicleLabel(vehicle);
  const expiry = expiresAt.toLocaleDateString("pt-BR");
  const title = `Anúncio reativado — ${label}`;
  const body = `Seu anúncio está ativo até ${expiry}.${renewalCount >= 2 ? " Este foi o último período gratuito." : ""}`;

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `[ShopMotor] ${title}`,
      html: `
        <h2>Anúncio reativado com sucesso!</h2>
        <p>Olá, ${user.name}!</p>
        <p>Seu anúncio do <strong>${label}</strong> está ativo novamente até <strong>${expiry}</strong>.</p>
        ${renewalCount >= 2 ? `<p><strong>⚠️ Este foi o último período gratuito. Após ${expiry}, será necessário impulsionar para reativar.</strong></p>` : ""}
        <p><a href="${BASE}/perfil/meus-anuncios" style="background:#FFD700;color:#000;padding:12px 24px;border-radius:999px;font-weight:900;text-decoration:none;">Ver meus anúncios</a></p>
      `,
    }),
    createNotification({
      userId: user.id,
      type: "renewal_confirmed",
      title,
      body,
      actionUrl: "/perfil/meus-anuncios",
    }),
  ]);
}
