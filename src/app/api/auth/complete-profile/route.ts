import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

function slugify(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function validateCNPJ(cnpj: string) {
  const c = cnpj.replace(/\D/g, "");
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  const digit = (digits: string, weights: number[]) => {
    const sum = weights.reduce((s, w, i) => s + Number(digits[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return digit(c, w1) === Number(c[12]) && digit(c, w2) === Number(c[13]);
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const { phone, accountType, cnpj, companyName, tradeName, termos } = await req.json();

    if (!phone) return NextResponse.json({ error: "Telefone é obrigatório." }, { status: 400 });
    if (!termos) return NextResponse.json({ error: "Aceite os Termos de Uso para continuar." }, { status: 400 });

    const updateData: Record<string, unknown> = {
      phone,
      sharePhone: false,
      accountType: accountType === "PJ" ? "PJ" : "PF",
      profileComplete: true,
      role: "SELLER",
    };

    if (accountType === "PJ") {
      if (!cnpj || !companyName)
        return NextResponse.json({ error: "CNPJ e Razão Social são obrigatórios para loja." }, { status: 400 });
      if (!validateCNPJ(cnpj))
        return NextResponse.json({ error: "CNPJ inválido." }, { status: 400 });

      const cnpjClean = cnpj.replace(/\D/g, "");
      const cnpjEncrypted = encrypt(cnpjClean);
      const cnpjExists = await prisma.user.findFirst({
        where: { cnpj: cnpjEncrypted, NOT: { id: sessionUser.id } },
      });
      if (cnpjExists) return NextResponse.json({ error: "CNPJ já cadastrado." }, { status: 409 });

      // Generate unique store slug
      const base = slugify(tradeName || companyName || sessionUser.name);
      let slug = base;
      let attempt = 0;
      while (true) {
        const taken = await prisma.user.findFirst({ where: { storeSlug: slug } });
        if (!taken) { updateData.storeSlug = slug; break; }
        slug = `${base}-${++attempt}`;
      }

      updateData.cnpj = cnpjEncrypted;
      updateData.companyName = companyName;
      updateData.tradeName = tradeName || null;
    }

    await prisma.user.update({ where: { id: sessionUser.id }, data: updateData });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[complete-profile]", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
