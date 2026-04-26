import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    let storeUserId: string | null = null;
    let leadTipo = "comum";

    if (body.storeSlug) {
      const store = await (prisma as any).user.findFirst({ where: { storeSlug: body.storeSlug }, select: { id: true } });
      storeUserId = store?.id ?? null;
      if (storeUserId) {
        const plan = await getStorePlan(storeUserId);
        if (plan === "ELITE") {
          leadTipo = "premium";
        } else {
          storeUserId = null;
          leadTipo = "comum";
        }
      }
    }

    const lead = await (prisma as any).seguroLead.create({
      data: {
        tipoVeiculo:        body.tipoVeiculo        ?? "carro",
        zeroKm:             body.zeroKm             ?? false,
        placa:              body.placa              || null,
        ano:                body.ano                ?? "",
        marca:              body.marca              ?? "",
        modelo:             body.modelo             ?? "",
        versao:             body.versao             || null,
        usoComercial:       body.usoComercial       ?? false,
        blindado:           body.blindado           ?? false,
        kitGas:             body.kitGas             ?? false,
        beneficioFiscal:    body.beneficioFiscal    ?? false,
        cep:                body.cep                ?? "",
        condutorJovem:      body.condutorJovem      ?? false,
        possuiSeguro:       body.possuiSeguro       ?? false,
        classeBonus:        body.classeBonus        || null,
        vencimentoSeguro:   body.vencimentoSeguro   || null,
        tipoPessoa:         body.tipoPessoa         ?? "pf",
        nomeSocial:         body.nomeSocial         || null,
        nome:               body.nome               ?? "",
        cpfCnpj:            body.cpfCnpj            ?? "",
        razaoSocial:        body.razaoSocial        || null,
        nomeFantasia:       body.nomeFantasia       || null,
        nascimento:         body.nascimento         || null,
        email:              body.email              ?? "",
        telefone:           body.telefone           ?? "",
        principalMotorista: body.principalMotorista ?? true,
        leadTipo,
        storeSlug:          body.storeSlug          || null,
        storeUserId,
        vehicleId:          body.vehicleId          || null,
      },
    });

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("[seguro lead]", err);
    return NextResponse.json({ error: "Erro ao salvar lead" }, { status: 500 });
  }
}
