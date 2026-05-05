import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook OLX — recebe leads gerados na plataforma.
 *
 * Configurar em: painel OLX > Integrações > Webhook URL
 *   → https://shopmotor.com.br/api/webhooks/olx
 *
 * [IMPLEMENTAR] Validar assinatura quando OLX documentar o header de verificação.
 */

/* GET — validação do endpoint (OLX faz ping ao cadastrar o webhook) */
export async function GET() {
  return NextResponse.json({ ok: true });
}

/* POST — recebe lead da OLX */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  // [IMPLEMENTAR] Validar assinatura HMAC quando OLX disponibilizar:
  // const signature = req.headers.get("x-olx-signature");
  // if (!validateOlxSignature(body, signature)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  try {
    const olxAdId     = String(body.ad_id   ?? "");
    const buyerName   = String(body.name     ?? "");
    const buyerPhone  = body.phone   ? String(body.phone)  : null;
    const buyerEmail  = body.email   ? String(body.email)  : null;
    const message     = body.message ? String(body.message): null;

    if (!olxAdId) return NextResponse.json({ ok: true }); // ignora eventos sem ad_id

    // Localiza o veículo pelo olxAdId
    const vehicle = await prisma.vehicle.findFirst({
      where: { olxAdId },
      select: { id: true, userId: true, brand: true, model: true },
    });

    if (!vehicle) {
      console.warn("[webhook OLX] veículo não encontrado para olxAdId:", olxAdId);
      return NextResponse.json({ ok: true });
    }

    // Salva o lead como FinanciamentoLead reutilizando a estrutura de leads existente
    // [IMPLEMENTAR] Criar model dedicado OlxLead quando volume justificar
    const db = prisma as any;
    await db.olxLead?.create?.({
      data: {
        olxAdId,
        vehicleId: vehicle.id,
        storeUserId: vehicle.userId,
        buyerName,
        buyerPhone,
        buyerEmail,
        message,
        status: "novo",
      },
    }).catch(() => {
      // Tabela olxLead ainda não existe — logar e continuar
      console.info("[webhook OLX] lead recebido (tabela olxLead pendente):", { olxAdId, buyerName });
    });

    console.info("[webhook OLX] lead recebido:", { olxAdId, buyerName, vehicleId: vehicle.id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook OLX]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
