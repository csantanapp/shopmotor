import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_CMS_KEY);
const FROM = "ShopMotor <noreply@shopmotor.com.br>";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://shopmotor.com.br";

function unsubscribeLink(userId: string) {
  const token = Buffer.from(userId).toString("base64");
  return `${BASE_URL}/api/unsubscribe?token=${token}`;
}

export async function sendCmsEmail({
  to, name, userId, title, body, ctaLabel, ctaUrl,
}: {
  to: string; name?: string | null; userId: string;
  title: string; body: string;
  ctaLabel?: string | null; ctaUrl?: string | null;
}) {
  const cta = ctaLabel && ctaUrl
    ? `<div style="text-align:center;margin:32px 0">
        <a href="${ctaUrl}" style="background:#EAB308;color:#000;font-weight:900;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:14px;letter-spacing:0.05em">${ctaLabel}</a>
       </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0c0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px">
    <div style="margin-bottom:32px">
      <span style="color:#EAB308;font-weight:900;font-size:20px;letter-spacing:-0.02em">SHOPMOTOR</span>
    </div>
    <div style="background:#111414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px">
      <h2 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 16px">${title}</h2>
      <div style="color:#a3a3a3;font-size:15px;line-height:1.6">${body}</div>
      ${cta}
    </div>
    <p style="color:#525252;font-size:12px;text-align:center;margin-top:24px">
      Você está recebendo este e-mail pois possui uma conta na ShopMotor.<br>
      © 2026 SHOPMOTOR. &nbsp;·&nbsp;
      <a href="${unsubscribeLink(userId)}" style="color:#525252;text-decoration:underline">Cancelar inscrição</a>
    </p>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({ from: FROM, to, subject: title, html });
  } catch (e) {
    console.error("[cms-email] error", e);
  }
}
