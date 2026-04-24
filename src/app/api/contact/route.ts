import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "ShopMotor <noreply@shopmotor.com.br>",
      to: "contato@shopmotor.com.br",
      replyTo: email,
      subject: `[Contato] ${subject} — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff">
          <h1 style="font-size:20px;font-weight:900;text-transform:uppercase;margin-bottom:4px">ShopMotor</h1>
          <p style="color:#999;font-size:12px;margin-bottom:24px">Nova mensagem via formulário de contato</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#999;font-size:12px;width:100px">Nome</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:700">${name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#999;font-size:12px">E-mail</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:700">${email}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#999;font-size:12px">Assunto</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:700">${subject}</td></tr>
          </table>
          <p style="color:#333;line-height:1.7;white-space:pre-wrap">${message}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="color:#ccc;font-size:11px">© ${new Date().getFullYear()} ShopMotor. Responda diretamente a este e-mail para falar com ${name}.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact email error:", err);
    return NextResponse.json({ error: "Erro ao enviar mensagem." }, { status: 500 });
  }
}
