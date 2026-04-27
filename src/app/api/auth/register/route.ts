import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, COOKIE_NAME, SECURE_COOKIE_OPTIONS } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/mailer";
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
    const body = await req.json();
    const { name, email, phone, sharePhone, password, zipCode, state, address, city,
            accountType, cnpj, companyName, tradeName } = body;

    if (!name || !email || !password)
      return NextResponse.json({ error: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "A senha deve ter no mínimo 8 caracteres." }, { status: 400 });

    // Validações PJ
    if (accountType === "PJ") {
      if (!cnpj || !companyName)
        return NextResponse.json({ error: "CNPJ e Razão Social são obrigatórios para loja." }, { status: 400 });
      if (!validateCNPJ(cnpj))
        return NextResponse.json({ error: "CNPJ inválido." }, { status: 400 });

      const cnpjClean = cnpj.replace(/\D/g, "");
      const cnpjEncrypted = encrypt(cnpjClean);
      const cnpjExists = await prisma.user.findFirst({ where: { cnpj: cnpjEncrypted } });
      if (cnpjExists) return NextResponse.json({ error: "CNPJ já cadastrado." }, { status: 409 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);

    // Gerar slug único para lojas
    let storeSlug: string | null = null;
    if (accountType === "PJ") {
      const base = slugify(tradeName || companyName || name);
      let slug = base;
      let attempt = 0;
      while (true) {
        const taken = await prisma.user.findFirst({ where: { storeSlug: slug } });
        if (!taken) { storeSlug = slug; break; }
        slug = `${base}-${++attempt}`;
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone:       phone      || null,
        sharePhone:  Boolean(sharePhone),
        passwordHash,
        role:        "SELLER",
        zipCode:     zipCode     || null,
        state:       state       || null,
        address:     address     || null,
        city:        city        || null,
        accountType: accountType === "PJ" ? "PJ" : "PF",
        cnpj:        accountType === "PJ" ? encrypt(cnpj.replace(/\D/g, "")) : null,
        companyName: accountType === "PJ" ? companyName : null,
        tradeName:   accountType === "PJ" ? tradeName || null : null,
        storeSlug,
      },
      select: { id: true, name: true, email: true, role: true, plan: true },
    });

    const { token, expiresAt } = await createSession(user.id, user.email, user.role);

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(COOKIE_NAME, token, { ...SECURE_COOKIE_OPTIONS, expires: expiresAt });

    sendWelcomeEmail(user.email, user.name).catch(() => null);

    return response;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
