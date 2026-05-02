import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/erp/Layout";
import { PlanCard } from "@/components/erp/PlanCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Eye, MousePointerClick, Phone, Zap, Heart, Flame } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/anuncios")({
  head: () => ({ meta: [{ title: "Impulsionamento — ShopMotor Sales OS" }] }),
  component: Page,
});

const recommended = [
  { car: "Toyota Corolla XEi 2023", views: 4210, favs: 184, leads: 38, score: 92 },
  { car: "Jeep Compass Limited 2024", views: 3890, favs: 152, leads: 31, score: 86 },
  { car: "VW T-Cross Highline 2023", views: 2870, favs: 98, leads: 12, score: 74 },
];

const tierLabel: Record<string, string> = { turbo: "Turbo", destaque: "Destaque", super: "Super destaque", normal: "Normal" };
const ads = [
  { car: "Toyota Corolla XEi 2023", tier: "super", views: 8900, clicks: 612, contacts: 84 },
  { car: "Jeep Compass Limited 2024", tier: "destaque", views: 5430, clicks: 412, contacts: 71 },
  { car: "Honda Civic Touring 2022", tier: "turbo", views: 3210, clicks: 248, contacts: 58 },
  { car: "VW T-Cross Highline 2023", tier: "normal", views: 1240, clicks: 78, contacts: 18 },
];

function Page() {
  return (
    <Layout title="Impulsionamento Inteligente" subtitle="Aumente o alcance dos veículos certos, no momento certo">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Planos de impulso
      </h3>
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <PlanCard
          name="Turbo"
          tagline="Mais visibilidade no feed por 3 dias"
          price="R$ 49"
          features={[
            "3x mais visualizações",
            "Selo Turbo no anúncio",
            "Aparece no topo da categoria",
            "Recomendado para estoque novo",
          ]}
          cta="Ativar Turbo"
        />
        <PlanCard
          name="Destaque"
          tagline="Posição premium por 7 dias"
          price="R$ 129"
          highlight
          features={[
            "5x mais visualizações",
            "Posição fixa no topo",
            "Inclusão em e-mail marketing",
            "Recomendado para alta intenção",
          ]}
          cta="Ativar Destaque"
        />
        <PlanCard
          name="Super Destaque"
          tagline="Máxima exposição por 15 dias"
          price="R$ 289"
          features={[
            "10x mais visualizações",
            "Banner na home do ShopMotor",
            "Prioridade em buscas relacionadas",
            "Recomendado para veículos premium",
          ]}
          cta="Ativar Super"
        />
      </div>

      <div className="rounded-2xl border border-gold/30 bg-gradient-dark p-6 text-background mb-6">
        <div className="flex items-center gap-2 text-gold">
          <Flame className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Recomendados para impulsionar agora</span>
        </div>
        <p className="mt-2 text-sm text-background/70">
          Veículos com alto volume de visitas, favoritos e leads recentes — o momento ideal para investir em alcance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        {recommended.map((r) => (
          <div key={r.car} className="rounded-xl border border-border bg-card p-5 shadow-elegant">
            <p className="text-xs uppercase tracking-wider text-gold-deep font-bold">Score {r.score}</p>
            <h4 className="mt-1 font-semibold">{r.car}</h4>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 py-2">
                <Eye className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                <p className="mt-0.5 text-sm font-bold">{r.views.toLocaleString("pt-BR")}</p>
              </div>
              <div className="rounded-md bg-muted/50 py-2">
                <Heart className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                <p className="mt-0.5 text-sm font-bold">{r.favs}</p>
              </div>
              <div className="rounded-md bg-muted/50 py-2">
                <Phone className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                <p className="mt-0.5 text-sm font-bold">{r.leads}</p>
              </div>
            </div>
            <button
              onClick={() => toast.success(`${r.car} impulsionado`)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-gold px-4 py-2 text-sm font-bold text-ink shadow-gold hover:opacity-90"
            >
              <Zap className="h-4 w-4" /> Impulsionar agora
            </button>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Anúncios ativos
      </h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ads.map((a) => (
          <div key={a.car} className="rounded-xl border border-border bg-card p-5 shadow-elegant">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Anúncio</p>
                <h4 className="mt-1 font-semibold truncate">{a.car}</h4>
              </div>
              <StatusBadge status={a.tier} label={tierLabel[a.tier]} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted/50 py-2">
                <Eye className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                <p className="mt-0.5 text-sm font-bold">{a.views.toLocaleString("pt-BR")}</p>
              </div>
              <div className="rounded-md bg-muted/50 py-2">
                <MousePointerClick className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                <p className="mt-0.5 text-sm font-bold">{a.clicks}</p>
              </div>
              <div className="rounded-md bg-muted/50 py-2">
                <Phone className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                <p className="mt-0.5 text-sm font-bold">{a.contacts}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
