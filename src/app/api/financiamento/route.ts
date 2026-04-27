import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { encrypt, maskCpf } from "@/lib/crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resolve plano ativo da loja a partir do userId
async function getStorePlan(userId: string): Promise<"STARTER" | "PRO" | "ELITE" | null> {
  const sub = await (prisma as any).storeSubscription.findFirst({
    where: { userId, status: "active", endsAt: { gt: new Date() } },
    select: { plan: true },
  });
  return sub?.plan ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, cpf, nascimento, email, cidade, whatsapp, prazo, valorCarro, entrada, parcelas, financiado, pmt, storeSlug, vehicleId } = body;

    // Resolve storeUserId e plano a partir do slug
    let storeUserId: string | null = null;
    let leadTipo = "comum";

    if (storeSlug) {
      const store = await (prisma as any).user.findFirst({ where: { storeSlug }, select: { id: true } });
      storeUserId = store?.id ?? null;

      if (storeUserId) {
        const plan = await getStorePlan(storeUserId);
        // Apenas ELITE recebe leads de financiamento
        if (plan === "ELITE") {
          leadTipo = "premium";
        } else {
          // STARTER e PRO não recebem lead de financiamento — salva sem vínculo à loja
          storeUserId = null;
          leadTipo = "comum";
        }
      }
    }

    await (prisma as any).financiamentoLead.create({
      data: {
        nome, cpf: encrypt(cpf), nascimento, email, cidade, whatsapp, prazo,
        valorCarro, entrada, financiado, parcelas, pmt,
        storeSlug: storeSlug ?? null,
        storeUserId,
        vehicleId: vehicleId ?? null,
        // leadTipo não existe no model FinanciamentoLead ainda, mas está no SeguroLead
      },
    });

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

    await resend.emails.send({
      from: "ShopMotor <noreply@shopmotor.com.br>",
      to: "contato@shopmotor.com.br",
      subject: `[Financiamento] Nova simulação — ${nome}${storeSlug ? ` via loja ${storeSlug}` : ""}`,
      html: `
        <h2>Nova simulação de financiamento</h2>
        ${storeSlug ? `<p><strong>Loja origem:</strong> /loja/${storeSlug} (plano: ${leadTipo === "premium" ? "ELITE ✅" : "sem acesso"})</p>` : ""}
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>CPF:</strong> ${maskCpf(cpf)}</p>
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
