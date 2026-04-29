import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import HeroSearch from "@/components/ui/HeroSearch";
import AdBanner from "@/components/ads/AdBanner";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // revalida a cada 60 segundos

/* ── Static data ─────────────────────────────────────── */

const BASE = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";
const brands = [
  { name: "Chevrolet",  src: `${BASE}/chevrolet.png` },
  { name: "Volkswagen", src: `${BASE}/volkswagen.png` },
  { name: "Fiat",       src: `${BASE}/fiat.png` },
  { name: "Ford",       src: `${BASE}/ford.png` },
  { name: "Toyota",     src: `${BASE}/toyota.png` },
  { name: "Honda",      src: `${BASE}/honda.png` },
  { name: "Hyundai",    src: `${BASE}/hyundai.png` },
  { name: "BMW",        src: `${BASE}/bmw.png` },
  { name: "Jeep",       src: `${BASE}/jeep.png` },
  { name: "Nissan",     src: `${BASE}/nissan.png` },
  { name: "Renault",    src: `${BASE}/renault.png` },
  { name: "Peugeot",    src: `${BASE}/peugeot.png` },
  { name: "Kia",        src: `${BASE}/kia.png` },
  { name: "Mitsubishi", src: `${BASE}/mitsubishi.png` },
  { name: "Audi",       src: `${BASE}/audi.png` },
];

const bodyCategories = [
  { label: "SUVs",        icon: "directions_car",   count: 1482 },
  { label: "Sedãs",       icon: "airport_shuttle",  count: 934  },
  { label: "Hatchbacks",  icon: "local_taxi",       count: 721  },
  { label: "Picapes",     icon: "rv_hookup",        count: 388  },
  { label: "Esportivos",  icon: "speed",            count: 154  },
  { label: "Elétricos",   icon: "electric_car",     count: 97   },
];

const highlights = [
  { label: "Abaixo da FIPE", icon: "trending_down", color: "bg-green-50 text-green-700 border-green-200" },
  { label: "0 km",           icon: "new_releases",  color: "bg-blue-50 text-blue-700 border-blue-200"  },
  { label: "Blindados",      icon: "shield",        color: "bg-neutral-900 text-white border-neutral-700" },
  { label: "Leilão",         icon: "gavel",         color: "bg-primary-container/30 text-on-surface border-primary-container" },
];

/* const stats = [
  { value: "48.200+", label: "Veículos anunciados" },
  { value: "12.000+", label: "Vendedores ativos"   },
  { value: "R$ 2bi+", label: "Em negociações"      },
  { value: "4.9★",    label: "Avaliação média"     },
]; */

/* ── Page ─────────────────────────────────────────────── */

type StoreUser = {
  id: string; name: string; tradeName: string | null; avatarUrl: string | null; storeSlug: string | null;
  city: string | null; state: string | null;
  _count: { vehicles: number };
};

type BoostedVehicle = {
  id: string; brand: string; model: string; version: string | null;
  yearFab: number; yearModel: number; km: number; price: number;
  city: string; state: string;
  photos: { url: string }[];
};

function BoostedCard({ v }: { v: BoostedVehicle }) {
  const price = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const km = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
  const cover = v.photos[0]?.url ?? null;
  return (
    <Link href={`/carro/${v.id}`} className="bg-surface-container-lowest rounded-xl overflow-hidden hover:scale-[1.02] transition-transform group shadow-sm block">
      <div className="h-48 overflow-hidden relative bg-surface-container">
        {cover
          ? <img src={cover} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Icon name="directions_car" className="text-5xl text-outline" /></div>
        }
      </div>
      <div className="p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">{v.brand}</p>
        <p className="font-bold text-sm text-on-surface truncate">{v.model}{v.version ? ` ${v.version}` : ""}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{v.yearFab} · {km}</p>
        <div className="flex items-end justify-between mt-3">
          <p className="text-lg font-black text-on-surface">{price}</p>
          <span className="text-[10px] text-on-surface-variant">{v.city}, {v.state}</span>
        </div>
      </div>
    </Link>
  );
}

const vehicleSelect = {
  id: true, brand: true, model: true, version: true,
  yearFab: true, yearModel: true, km: true, price: true,
  city: true, state: true,
  photos: { where: { isCover: true }, take: 1, select: { url: true } },
} as const;

export default async function Home() {
  const now = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  const [destaques, elite, recentes, lojas]: [BoostedVehicle[], BoostedVehicle[], BoostedVehicle[], StoreUser[]] = await Promise.all([
    db.vehicle.findMany({
      where: { status: "ACTIVE", boostLevel: "DESTAQUE", boostGalleryUntil: { gte: now } },
      orderBy: { boostGalleryUntil: "desc" },
      take: 8,
      select: vehicleSelect,
    }),
    db.vehicle.findMany({
      where: { status: "ACTIVE", boostLevel: "ELITE", boostGalleryUntil: { gte: now } },
      orderBy: { boostGalleryUntil: "desc" },
      take: 8,
      select: vehicleSelect,
    }),
    prisma.vehicle.findMany({
      where: { status: "ACTIVE", boostLevel: "NONE" },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: vehicleSelect,
    }),
    db.user.findMany({
      where: { accountType: "PJ", storeSlug: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, tradeName: true, avatarUrl: true, storeSlug: true, city: true, state: true, _count: { select: { vehicles: true } } },
    }),
  ]);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-inverse-surface overflow-hidden min-h-[600px] flex items-center">
        {/* BG car image */}
        <div className="absolute inset-0">
          <Image
            src="/images/FINANCIAMENTO.png"
            alt="Hero car"
            fill
            className="object-cover opacity-25"
            priority
          />
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-inverse-surface/60 via-inverse-surface/75 to-inverse-surface" />
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 py-24 w-full flex flex-col items-center text-center">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-0.5 bg-primary-container" />
              <span className="text-primary-container text-xs font-black uppercase tracking-widest">O maior marketplace automotivo</span>
              <span className="w-8 h-0.5 bg-primary-container" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none uppercase mb-6">
              VOCÊ DE<br />
              <span className="text-primary-container">CARRO NOVO!</span>
            </h1>
            <p className="text-neutral-400 text-lg mb-10 max-w-xl">
              Mais de 48 mil veículos de particulares e lojas. Compre, venda e negocie com segurança.
            </p>

            {/* Search bar */}
            <HeroSearch />

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {highlights.map((h) => (
                <Link
                  key={h.label}
                  href="/busca"
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all hover:scale-105 ${h.color}`}
                >
                  <Icon name={h.icon} className="text-sm" />
                  {h.label}
                </Link>
              ))}
            </div>
        </div>

      </section>

      {/* ── BUSCAR POR CARROCERIA ── */}
      <section className="max-w-screen-2xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Explore por categoria</p>
            <h2 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Tipo de veículo</h2>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {bodyCategories.map((cat) => (
            <Link
              key={cat.label}
              href="/busca"
              className="group bg-surface-container-lowest rounded-2xl p-5 flex flex-col items-center gap-3 text-center hover:bg-primary-container transition-colors shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-container group-hover:bg-primary flex items-center justify-center transition-colors">
                <Icon name={cat.icon} className="text-2xl text-on-surface group-hover:text-on-primary-container transition-colors" />
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface group-hover:text-on-primary-container transition-colors">{cat.label}</p>
                <p className="text-[11px] text-on-surface-variant group-hover:text-on-primary-container/70 transition-colors">{cat.count.toLocaleString("pt-BR")}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BANNER PARCEIRO HOME ── */}
      <div className="max-w-screen-2xl mx-auto px-6 pb-6">
        <AdBanner slot="home_banner" maxHeight={150} />
      </div>


      {/* ── ANÚNCIOS DESTAQUE ── */}
      {destaques.length > 0 && (
        <section className="max-w-screen-2xl mx-auto px-6 pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Selecionados para você</p>
              <h2 className="text-3xl font-black tracking-tighter text-on-surface uppercase">
                Anúncios Destaques
              </h2>
              <div className="h-1 w-16 bg-primary-container mt-2" />
            </div>
            <Link href="/busca" className="text-primary font-bold flex items-center gap-1 hover:underline text-sm">
              Ver todos <Icon name="arrow_forward" className="text-base" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destaques.map((v) => (
              <BoostedCard key={v.id} v={v} />
            ))}
          </div>
        </section>
      )}

      {/* ── ANÚNCIOS ELITE ── */}
      {elite.length > 0 && (
        <section className="bg-inverse-surface/5 py-16">
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Selecionados para você</p>
                <h2 className="text-3xl font-black tracking-tighter text-on-surface uppercase">
                  Anúncios Elite
                </h2>
                <div className="h-1 w-16 bg-inverse-surface mt-2" />
              </div>
              <Link href="/busca" className="text-primary font-bold flex items-center gap-1 hover:underline text-sm">
                Ver todos <Icon name="arrow_forward" className="text-base" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {elite.map((v) => (
                <BoostedCard key={v.id} v={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MARCAS POPULARES — carrossel marquee ── */}
      <section className="bg-surface-container-low py-14 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-6 mb-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Navegue por marca</p>
              <h2 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Marcas populares</h2>
            </div>
            <Link href="/busca" className="text-primary font-bold flex items-center gap-1 hover:underline text-sm">
              Ver todas <Icon name="arrow_forward" className="text-base" />
            </Link>
          </div>
        </div>

        {/* fade edges */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface-container-low to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface-container-low to-transparent z-10 pointer-events-none" />

          <div className="flex animate-marquee gap-4 w-max">
            {[...brands, ...brands].map((brand, i) => (
              <Link
                key={`${brand.name}-${i}`}
                href={`/busca?brand=${brand.name}`}
                className="group flex-shrink-0 bg-surface-container-lowest rounded-2xl px-10 py-7 flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm w-48 h-28"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.src}
                  alt={brand.name}
                  className="h-16 w-auto max-w-[140px] object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANÚNCIOS RECENTES ── */}
      {recentes.length > 0 && (
        <section className="max-w-screen-2xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Recém adicionados</p>
              <h2 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Novos anúncios</h2>
              <div className="h-1 w-16 bg-primary-container mt-2" />
            </div>
            <Link href="/busca" className="text-primary font-bold flex items-center gap-1 hover:underline text-sm">
              Ver todos <Icon name="arrow_forward" className="text-base" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentes.map((v) => <BoostedCard key={v.id} v={v} />)}
          </div>
        </section>
      )}

      {/* ── EDITORIAL BANNER ── */}
      <section className="max-w-screen-2xl mx-auto px-6 py-20">
        <div className="bg-inverse-surface rounded-2xl overflow-hidden relative" style={{ height: 90 }}>
          <div className="absolute inset-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIvLp-rtsJt2IjPOLqXPiPBkYuHU2HARrJ8J75dRrfQv_2BBPNRKry2HOpanttRVmJy92r7AXo9cbIv9RWOnK-iZxLQHeC1V2d1Wtrb5ZK9luoIbaZF1i46T9MLv-3Z8nWX4O_A9qqOH01kXZNfGmV1Wpkd8lDPgkP4O4oGxm_wsvLXs8eUB7WnvXulAselnLZ2vNhT9Fqx08p22CtyTtig7tJQo0VJQkA1AcdwoZdwH4MIc9T0KGWWWku95z_Nrg5iutFCvtq-Ig"
              alt="Supercar"
              fill
              className="object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface/90 via-inverse-surface/60 to-transparent" />
          </div>
          <div className="relative z-10 h-full flex items-center justify-between px-8 gap-6">
            <div className="flex flex-col gap-1">
              <p className="text-primary-container text-[10px] font-black uppercase tracking-widest">Coleção exclusiva</p>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight">
                Para quem é apaixonado por carro
              </h2>
            </div>
            <Link
              href="/busca"
              className="flex-shrink-0 bg-primary-container text-on-primary-container font-black py-2.5 px-6 rounded-full hover:scale-105 transition-transform uppercase tracking-widest text-xs whitespace-nowrap"
            >
              Explorar Coleção
            </Link>
          </div>
        </div>
      </section>

      {/* ── LOJAS EM DESTAQUE ── */}
      {lojas.length > 0 && (
        <section className="max-w-screen-2xl mx-auto px-6 pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Parceiros verificados</p>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Lojas em destaque</h3>
              <div className="h-1 w-16 bg-primary-container mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lojas.map((shop) => (
              <Link
                key={shop.id}
                href={shop.storeSlug ? `/loja/${shop.storeSlug}` : `/vendedor/${shop.id}`}
                className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col items-center text-center border border-transparent hover:border-primary-container transition-all shadow-sm group"
              >
                <div className="w-16 h-16 bg-surface-container rounded-full mb-3 overflow-hidden flex items-center justify-center group-hover:ring-2 group-hover:ring-primary-container transition-all">
                  {shop.avatarUrl
                    ? <img src={shop.avatarUrl} alt={shop.name} className="w-full h-full object-cover" />
                    : <Icon name="storefront" className="text-2xl text-outline" />
                  }
                </div>
                <span className="font-bold text-sm text-on-surface uppercase tracking-tight mb-1 truncate w-full">
                  {shop.tradeName ?? shop.name}
                </span>
                {(shop.city || shop.state) && (
                  <span className="text-[11px] text-on-surface-variant flex items-center gap-1 justify-center">
                    <Icon name="location_on" className="text-xs text-primary" />
                    {[shop.city, shop.state].filter(Boolean).join(", ")}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── SERVIÇOS ── */}
      <section className="bg-surface-container-highest/30 py-20">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Ecossistema completo</p>
            <h2 className="text-3xl font-black tracking-tighter uppercase">Além da compra e venda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              /* oculto: { icon: "tire_repair", title: "Acessórios", desc: "Personalize seu veículo com o que há de mais moderno em tecnologia e design." } */
              { icon: "security",       title: "Simule Seguro", desc: "Proteção total para sua nova conquista com as melhores taxas do mercado.",    highlight: false, href: "/seguros"  },
              { icon: "account_balance", title: "Financiamento", desc: "Aprovação rápida e parcelas que cabem no seu planejamento financeiro.", highlight: false, href: "/financiamento" },
            ].map((s) => (
              <div
                key={s.title}
                className={`bg-surface-container-lowest p-10 rounded-3xl shadow-sm ${s.highlight ? "scale-105 border-2 border-primary-container relative" : ""}`}
              >
                {s.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-container px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    Recomendado
                  </div>
                )}
                <Icon name={s.icon} fill className="text-5xl text-primary mb-6 block" />
                <h4 className="text-2xl font-black mb-3 uppercase">{s.title}</h4>
                <p className="text-on-surface-variant mb-8 leading-relaxed text-sm">{s.desc}</p>
                {(s as any).href ? (
                  <a href={(s as any).href} className={`block w-full text-center font-bold py-3 rounded-full transition-all uppercase text-sm tracking-widest ${
                    s.highlight
                      ? "bg-primary-container hover:bg-primary-fixed-dim"
                      : "border border-outline/20 hover:bg-on-surface hover:text-white"
                  }`}>
                    Simular agora
                  </a>
                ) : (
                  <button className="w-full font-bold py-3 rounded-full transition-all uppercase text-sm tracking-widest border border-outline/20 hover:bg-on-surface hover:text-white">
                    Saiba mais
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
