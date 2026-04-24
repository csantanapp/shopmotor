import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, cpf, nascimento, email, cidade, whatsapp, prazo, valorCarro, entrada, parcelas, financiado, pmt } = body;

    await (prisma as any).financiamentoLead.create({
      data: { nome, cpf, nascimento, email, cidade, whatsapp, prazo, valorCarro, entrada, financiado, parcelas, pmt },
    });

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

    await resend.emails.send({
      from: "ShopMotor <noreply@shopmotor.com.br>",
      to: "contato@shopmotor.com.br",
      subject: `[Financiamento] Nova simulação — ${nome}`,
      html: `
        <h2>Nova simulação de financiamento</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>CPF:</strong> ${cpf}</p>
        <p><strong>Nascimento:</strong> ${nascimento}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Cidade:</strong> ${cidade}</p>
        <p><strong>Prazo de compra:</strong> ${prazo}</p>
        <hr/>
        <p><strong>Veículo:</strong> ${fmt(valorCarro)}</p>
        <p><strong>Entrada:</strong> ${fmt(entrada)}</p>
        <p><strong>Financiado:</strong> ${fmt(financiado)}</p>
        <p><strong>Parcelas:</strong> ${parcelas}x de ${fmt(pmt)}</p>
      `,
    });
  } catch {}

  return NextResponse.json({ ok: true });
}
