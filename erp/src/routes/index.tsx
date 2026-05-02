import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/erp/Layout";
import { OpportunityCard, type Opportunity } from "@/components/erp/OpportunityCard";
import { SalesInsightCard } from "@/components/erp/SalesInsightCard";
import {
  MessageCircle, FileSignature, Rocket, TrendingDown, Eye,
  Target, Flame, Lightbulb, Sparkles, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Central de Oportunidades — ShopMotor Sales OS" },
      { name: "description", content: "O que fazer agora para vender mais. Prioridades automáticas baseadas em leads, anúncios, estoque e intenção de compra." },
    ],
  }),
  component: Central,
});

function Central() {
  const ops: Opportunity[] = [
    {
      id: "1",
      type: "Lead esperando há 18 minutos",
      priority: "alta",
      impact: "+32% chance de conversão",
      vehicle: "Toyota Corolla XEi 2023",
      lead: "Rafael Souza",
      waitingTime: "18 min sem resposta",
      recommendation: "Responder no WhatsApp agora",
      icon: MessageCircle,
      actions: [
        { label: "WhatsApp", tone: "success", onClick: () => toast.success("Abrindo conversa com Rafael Souza") },
        { label: "Ver detalhes", tone: "ghost" },
      ],
    },
    {
      id: "2",
      type: "Cliente simulou financiamento",
      priority: "alta",
      impact: "Alta chance de compra",
      vehicle: "Jeep Compass Limited 2024",
      lead: "Marcos Lima",
      waitingTime: "há 42 min",
      recommendation: "Enviar proposta agora",
      icon: FileSignature,
      actions: [
        { label: "Enviar proposta", tone: "primary", onClick: () => toast.success("Proposta enviada para Marcos Lima") },
        { label: "WhatsApp", tone: "success" },
      ],
    },
    {
      id: "3",
      type: "Lead visitou o mesmo carro 3 vezes",
      priority: "alta",
      impact: "Intenção alta detectada",
      vehicle: "Honda Civic Touring 2022",
      lead: "Juliana Pires",
      waitingTime: "última visita há 12 min",
      recommendation: "Chamar agora antes que esfrie",
      icon: Flame,
      actions: [
        { label: "Ligar agora", tone: "primary", onClick: () => toast("Iniciando ligação…") },
        { label: "WhatsApp", tone: "success" },
      ],
    },
    {
      id: "4",
      type: "Veículo com 120 visualizações hoje",
      priority: "media",
      impact: "Momento ideal para aumentar alcance",
      vehicle: "VW T-Cross Highline 2023",
      waitingTime: "pico nas últimas 2h",
      recommendation: "Impulsionar este anúncio",
      icon: Rocket,
      actions: [
        { label: "Impulsionar", tone: "primary", onClick: () => toast.success("Anúncio impulsionado por 7 dias") },
        { label: "Ver anúncio", tone: "ghost" },
      ],
    },
    {
      id: "5",
      type: "Veículo há 28 dias sem venda",
      priority: "media",
      impact: "Pode aumentar leads qualificados",
      vehicle: "Hyundai HB20 Sense 2022",
      waitingTime: "28 dias parado",
      recommendation: "Ajustar preço sugerido -3,5%",
      icon: TrendingDown,
      actions: [
        { label: "Ajustar preço", tone: "primary", onClick: () => toast.success("Preço ajustado para R$ 76.140") },
        { label: "Manter", tone: "ghost" },
      ],
    },
    {
      id: "6",
      type: "Anúncio com baixa taxa de clique",
      priority: "baixa",
      impact: "Melhorar fotos pode dobrar contatos",
      vehicle: "Honda CB 500F 2024",
      recommendation: "Adicionar mais 4 fotos profissionais",
      icon: Eye,
      actions: [
        { label: "Editar anúncio", tone: "primary" },
      ],
    },
  ];

  const counts = {
    alta: ops.filter((o) => o.priority === "alta").length,
    media: ops.filter((o) => o.priority === "media").length,
    baixa: ops.filter((o) => o.priority === "baixa").length,
  };

  return (
    <Layout
      title="Central de Oportunidades"
      subtitle="Atualizado agora — o sistema prioriza ações que geram venda"
    >
      <section className="rounded-2xl border border-gold/30 bg-gradient-dark p-6 md:p-8 text-background shadow-elegant">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
              <Sparkles className="h-3 w-3" /> Sales OS
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">
              O que fazer agora para vender mais
            </h2>
            <p className="mt-2 text-sm md:text-base text-background/70">
              Prioridades automáticas baseadas em leads, anúncios, estoque e intenção de compra.
              Não mostramos números — mostramos como vender.
            </p>
          </div>
          <Link
            to="/direcao"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-gold px-4 py-2.5 text-sm font-bold text-ink shadow-gold transition hover:opacity-90"
          >
            Ver previsão da semana <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-destructive">Prioridade alta</p>
            <p className="mt-1 text-2xl font-bold text-background">{counts.alta} ações</p>
            <p className="text-xs text-background/60">Cada minuto reduz a chance de fechamento</p>
          </div>
          <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Prioridade média</p>
            <p className="mt-1 text-2xl font-bold text-background">{counts.media} ações</p>
            <p className="text-xs text-background/60">Ajustes que aceleram o estoque</p>
          </div>
          <div className="rounded-xl border border-background/10 bg-background/5 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-background/60">Otimização</p>
            <p className="mt-1 text-2xl font-bold text-background">{counts.baixa} ações</p>
            <p className="text-xs text-background/60">Melhorias contínuas de performance</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <SalesInsightCard
          icon={Lightbulb}
          tone="info"
          title="Tempo de resposta é o maior fator de conversão"
          description="Leads respondidos em até 5 minutos têm 4x mais chance de fechar."
        />
        <SalesInsightCard
          icon={Target}
          tone="success"
          title="O sistema prioriza oportunidades, não dados"
          description="Foque nas 3 ações de alta prioridade primeiro."
        />
        <SalesInsightCard
          icon={Flame}
          tone="default"
          title="Atenção aos veículos em alta"
          description="Anúncios com pico de visualizações merecem impulso imediato."
        />
      </div>

      <h3 className="mt-8 mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Suas próximas ações ({ops.length})
      </h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ops.map((o) => <OpportunityCard key={o.id} op={o} />)}
      </div>
    </Layout>
  );
}
