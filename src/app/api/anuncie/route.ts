import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company, name, email, phone, segment, budget, message } = body;

  if (!company || !name || !email || !segment || !budget) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
  }

  try {
    const db = prisma;

    // Salvar no banco
    await db.contactMessage.create({
      data: {
        origem: "anuncie",
        name, email, phone: phone || null,
        company, segment, budget,
        message: message || "",
        subject: `Proposta comercial — ${company}`,
      },
    });

    // Notificação por e-mail
    await resend.emails.send({
      from: "ShopMotor <noreply@shopmotor.com.br>",
      to: "contato@shopmotor.com.br",
      replyTo: email,
      subject: `[Anuncie] Nova proposta — ${company}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff">
          <h1 style="font-size:20px;font-weight:900;text-transform:uppercase;margin-bottom:4px">ShopMotor Ads</h1>
          <p style="color:#999;font-size:12px;margin-bottom:24px">Nova proposta comercial via /anuncie</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#999;font-size:12px;width:120px">Empresa</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:700">${company}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#999;font-size:12px">Contato</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:700">${name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#999;font-size:12px">E-mail</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:700">${email}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#999;font-size:12px">Telefone</td><td style="padding:8px 0;border-bottom:1px solid #eee">${phone || "—"}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#999;font-size:12px">Segmento</td><td style="padding:8px 0;border-bottom:1px solid #eee">${segment}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#999;font-size:12px">Investimento</td><td style="padding:8px 0;border-bottom:1px solid #eee">${budget}</td></tr>
          </table>
          ${message ? `<p style="color:#333;line-height:1.7;white-space:pre-wrap"><strong>Objetivo:</strong><br>${message}</p>` : ""}
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="color:#ccc;font-size:11px">Gerencie no CMS: /admin/mensagens</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Anuncie error:", err);
    return NextResponse.json({ error: "Erro ao enviar proposta." }, { status: 500 });
  }
}
