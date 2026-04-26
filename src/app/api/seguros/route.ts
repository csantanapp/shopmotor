import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
        leadTipo:           body.storeSlug ? "lojista" : "comum",
        storeSlug:          body.storeSlug          || null,
        storeUserId:        body.storeUserId        || null,
        vehicleId:          body.vehicleId          || null,
      },
    });

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("[seguro lead]", err);
    return NextResponse.json({ error: "Erro ao salvar lead" }, { status: 500 });
  }
}
