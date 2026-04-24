import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma as any;
  const { searchParams } = new URL(req.url);
  const origem  = searchParams.get("origem") ?? "";
  const status  = searchParams.get("status") ?? "";
  const q       = searchParams.get("q") ?? "";
  const page    = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit   = 20;
  const skip    = (page - 1) * limit;

  const where: any = {};
  if (origem) where.origem = origem;
  if (status) where.status = status;
  if (q) where.OR = [
    { name:    { contains: q, mode: "insensitive" } },
    { email:   { contains: q, mode: "insensitive" } },
    { company: { contains: q, mode: "insensitive" } },
    { subject: { contains: q, mode: "insensitive" } },
  ];

  const [total, messages, counts] = await Promise.all([
    db.contactMessage.count({ where }),
    db.contactMessage.findMany({
      where, orderBy: { createdAt: "desc" }, skip, take: limit,
    }),
    db.contactMessage.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  return NextResponse.json({ messages, total, page, pages: Math.ceil(total / limit), counts });
}

export async function PATCH(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma as any;
  const { id, status, replyText } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

  const data: any = {};
  if (status) data.status = status;
  if (replyText !== undefined) {
    data.replyText = replyText;
    data.repliedAt = new Date();
    data.status = "respondido";
  }
  if (status === "lido" && !data.readAt) {
    data.readAt = new Date();
  }

  const msg = await db.contactMessage.update({ where: { id }, data });

  // Enviar e-mail de resposta
  if (replyText && msg.email) {
    await resend.emails.send({
      from: "ShopMotor <noreply@shopmotor.com.br>",
      to: msg.email,
      subject: `Re: ${msg.subject || "Sua mensagem na ShopMotor"}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff">
          <h1 style="font-size:20px;font-weight:900;text-transform:uppercase;margin-bottom:4px">ShopMotor</h1>
          <p style="color:#555">Olá, <strong>${msg.name}</strong>!</p>
          <p style="color:#333;line-height:1.7;white-space:pre-wrap">${replyText}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="color:#999;font-size:12px">Mensagem original:</p>
          <p style="color:#bbb;font-size:12px;line-height:1.6;white-space:pre-wrap">${msg.message}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="color:#ccc;font-size:11px">© ${new Date().getFullYear()} ShopMotor.</p>
        </div>
      `,
    });
  }

  return NextResponse.json({ message: msg });
}

export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma as any;
  const { id } = await req.json();
  await db.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
