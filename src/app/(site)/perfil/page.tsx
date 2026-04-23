"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

interface DashStats {
  total: number;
  active: number;
  draft: number;
  paused: number;
  sold: number;
  totalViews: number;
}

interface RecentVehicle {
  id: string;
  brand: string;
  model: string;
  price: number;
  status: string;
  views: number;
  photos: { url: string }[];
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:  "bg-green-100 text-green-700",
  DRAFT:   "bg-surface-container text-on-surface-variant",
  PAUSED:  "bg-yellow-100 text-yellow-700",
  SOLD:    "bg-blue-100 text-blue-700",
  EXPIRED: "bg-error/10 text-error",
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo", DRAFT: "Rascunho", PAUSED: "Pausado", SOLD: "Vendido", EXPIRED: "Expirado",
};

export default function PerfilPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [recent, setRecent] = useState<RecentVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vehicles/mine")
      .then(r => r.json())
      .then(data => {
        const vehicles: RecentVehicle[] = data.vehicles ?? [];
        const s: DashStats = {
          total:      vehicles.length,
          active:     vehicles.filter(v => v.status === "ACTIVE").length,
          draft:      vehicles.filter(v => v.status === "DRAFT").length,
          paused:     vehicles.filter(v => v.status === "PAUSED").length,
          sold:       vehicles.filter(v => v.status === "SOLD").length,
          totalViews: vehicles.reduce((sum, v) => sum + (v.views ?? 0), 0),
        };
        setStats(s);
        setRecent(vehicles.slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const planLabel = user?.plan === "PREMIUM" ? "Premium" : "Grátis";
  const memberSince = user ? new Date().getFullYear() : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-inverse-surface text-white p-8 md:p-10 rounded-2xl shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-neutral-400 text-xs uppercase tracking-widest font-bold mb-1">Bem-vindo de volta</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight">
              {user?.name?.split(" ")[0] ?? "..."} 👋
            </h1>
            <p className="text-neutral-400 text-sm mt-2">Plano {planLabel} · Membro desde {memberSince}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/perfil/cadastrar"
              className="flex items-center gap-2 bg-primary-container text-on-primary-container font-black px-6 py-3 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all"
            >
              <Icon name="add" />
              Novo anúncio
            </Link>
            <Link
              href="/perfil/meus-anuncios"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
            >
              <Icon name="list_alt" />
              Meus anúncios
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 top-0 w-64 h-full bg-primary/10 -skew-x-12 pointer-events-none" />
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="directions_car" label="Total de anúncios" value={stats?.total ?? 0} />
          <StatCard icon="check_circle"   label="Anúncios ativos"   value={stats?.active ?? 0} color="text-green-600" />
          <StatCard icon="visibility"     label="Visualizações"     value={stats?.totalViews ?? 0} />
          <StatCard icon="sell"           label="Vendidos"          value={stats?.sold ?? 0} color="text-blue-600" />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "add_circle",    label: "Cadastrar veículo", href: "/perfil/cadastrar",     color: "bg-primary-container/20 text-primary" },
          { icon: "favorite",      label: "Favoritos",         href: "/perfil/favoritos",     color: "bg-red-50 text-red-500" },
          { icon: "chat_bubble",   label: "Mensagens",         href: "/perfil/mensagens",     color: "bg-blue-50 text-blue-600" },
          { icon: "manage_accounts", label: "Minha conta",    href: "/perfil/conta",         color: "bg-surface-container text-on-surface-variant" },
        ].map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-3 p-6 bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.color}`}>
              <Icon name={a.icon} className="text-xl" />
            </div>
            <span className="text-sm font-bold text-on-surface">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent listings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-tight text-on-surface">Anúncios recentes</h2>
          <Link href="/perfil/meus-anuncios" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            Ver todos <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface-container-lowest rounded-xl animate-pulse" />)}
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-surface-container-lowest rounded-2xl">
            <Icon name="directions_car" className="text-5xl text-outline mb-3" />
            <p className="font-bold text-on-surface mb-1">Nenhum anúncio ainda</p>
            <p className="text-sm text-on-surface-variant mb-4">Cadastre seu primeiro veículo agora.</p>
            <Link href="/perfil/cadastrar" className="bg-primary-container text-on-primary-container font-black px-6 py-2.5 rounded-full text-sm uppercase tracking-widest">
              Cadastrar veículo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(v => {
              const price    = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
              const coverUrl = v.photos?.[0]?.url ?? null;
              return (
                <div key={v.id} className="flex items-center gap-4 bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                    {coverUrl
                      ? <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Icon name="directions_car" className="text-xl text-outline" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-sm truncate">{v.brand} {v.model}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${STATUS_COLOR[v.status] ?? ""}`}>
                        {STATUS_LABEL[v.status] ?? v.status}
                      </span>
                      <span className="text-xs text-on-surface-variant flex items-center gap-0.5">
                        <Icon name="visibility" className="text-xs" />{v.views}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-on-surface text-sm">{price}</p>
                    <Link href={`/carro/${v.id}`} className="text-[10px] text-primary font-bold hover:underline">
                      Ver anúncio
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Status breakdown */}
      {stats && stats.total > 0 && (
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <h2 className="text-base font-black uppercase tracking-tight text-on-surface mb-6">Resumo dos anúncios</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Ativos",    value: stats.active, color: "bg-green-500" },
              { label: "Rascunho",  value: stats.draft,  color: "bg-neutral-400" },
              { label: "Pausados",  value: stats.paused, color: "bg-yellow-400" },
              { label: "Vendidos",  value: stats.sold,   color: "bg-blue-500" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${s.color}`} />
                <div>
                  <p className="text-2xl font-black text-on-surface">{s.value}</p>
                  <p className="text-xs text-on-surface-variant font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

function StatCard({ icon, label, value, color = "text-on-surface" }: {
  icon: string; label: string; value: number; color?: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
      <Icon name={icon} className={`text-2xl mb-2 ${color}`} />
      <p className={`text-3xl font-black ${color}`}>{value.toLocaleString("pt-BR")}</p>
      <p className="text-xs text-on-surface-variant font-medium mt-0.5">{label}</p>
    </div>
  );
}
