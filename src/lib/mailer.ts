import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ShopMotor <noreply@shopmotor.com.br>";

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const link = `${baseUrl}/redefinir-senha?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Redefinição de senha — ShopMotor",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
        <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;margin-bottom:8px">ShopMotor</h1>
        <p style="color:#555">Olá, <strong>${name}</strong>!</p>
        <p style="color:#555">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo:</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;background:#facc15;color:#000;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;text-transform:uppercase;font-size:13px;letter-spacing:1px">
          Redefinir senha
        </a>
        <p style="color:#999;font-size:12px">Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#ccc;font-size:11px">© ${new Date().getFullYear()} ShopMotor.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bem-vindo ao ShopMotor!",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
        <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;margin-bottom:8px">ShopMotor</h1>
        <p style="color:#555">Olá, <strong>${name}</strong>! Seja bem-vindo ao maior marketplace automotivo.</p>
        <p style="color:#555;margin-bottom:24px">Sua conta foi criada com sucesso. Agora você pode anunciar, comprar e negociar veículos com segurança.</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.shopmotor.com.br"}" style="display:inline-block;margin:24px 0;background:#facc15;color:#000;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;text-transform:uppercase;font-size:13px;letter-spacing:1px">
          Acessar plataforma
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#ccc;font-size:11px">© ${new Date().getFullYear()} ShopMotor.</p>
      </div>
    `,
  });
}

export async function sendNewMessageEmail(to: string, name: string, senderName: string, vehicleName: string) {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.shopmotor.com.br"}/perfil/mensagens`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Nova mensagem de ${senderName} — ShopMotor`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff">
        <h1 style="font-size:24px;font-weight:900;text-transform:uppercase;margin-bottom:8px">ShopMotor</h1>
        <p style="color:#555">Olá, <strong>${name}</strong>!</p>
        <p style="color:#555">Você recebeu uma nova mensagem de <strong>${senderName}</strong> sobre o veículo <strong>${vehicleName}</strong>.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;background:#facc15;color:#000;font-weight:900;text-decoration:none;padding:14px 32px;border-radius:999px;text-transform:uppercase;font-size:13px;letter-spacing:1px">
          Ver mensagem
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#ccc;font-size:11px">© ${new Date().getFullYear()} ShopMotor.</p>
      </div>
    `,
  });
}
