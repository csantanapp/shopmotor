import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conv = await prisma.conversation.findFirst({
    where: { id: params.id, sellerId: user.id },
    include: { crm: true },
  });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const crm = conv.crm ?? { stage: "novo", tags: "[]", valorProposta: null, interesse: null, motivoPerda: null };
  return NextResponse.json({ crm: { ...crm, tags: JSON.parse(crm.tags ?? "[]") } });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conv = await prisma.conversation.findFirst({ where: { id: params.id, sellerId: user.id } });
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.stage !== undefined)        data.stage        = body.stage;
  if (body.tags !== undefined)         data.tags         = JSON.stringify(body.tags);
  if (body.valorProposta !== undefined) data.valorProposta = body.valorProposta ? Number(body.valorProposta) : null;
  if (body.interesse !== undefined)    data.interesse    = body.interesse;
  if (body.motivoPerda !== undefined)  data.motivoPerda  = body.motivoPerda;

  const crm = await prisma.leadCrm.upsert({
    where: { conversationId: params.id },
    create: { conversationId: params.id, ...data },
    update: data,
  });

  return NextResponse.json({ crm: { ...crm, tags: JSON.parse(crm.tags ?? "[]") } });
}
