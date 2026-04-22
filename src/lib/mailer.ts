import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   ?? "smtp.gmail.com",
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}`;

  await transporter.sendMail({
    from:    process.env.SMTP_FROM ?? "ShopMotor <noreply@shopmotor.com.br>",
    to,
    subject: "Redefinicao de senha — ShopMotor",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h1 style="font-size:24px;font-weight:900;color:#1a1a1a;margin-bottom:8px">Redefinir senha</h1>
        <p style="color:#555;font-size:15px;margin-bottom:24px">Ola, ${name}! Recebemos uma solicitacao para redefinir a senha da sua conta ShopMotor.</p>
        <a href="${url}" style="display:inline-block;background:#ffd709;color:#1a1a1a;font-weight:900;font-size:14px;padding:14px 32px;border-radius:999px;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em">
          Redefinir minha senha
        </a>
        <p style="color:#888;font-size:13px;margin-top:24px">Este link expira em <strong>1 hora</strong>. Se voce nao solicitou essa alteracao, ignore este e-mail.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
        <p style="color:#bbb;font-size:12px">ShopMotor &mdash; <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#bbb">${process.env.NEXT_PUBLIC_APP_URL}</a></p>
      </div>
    `,
  });
}
