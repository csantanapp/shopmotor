import Image from "next/image";
import Link from "next/link";
import VehicleCard from "@/components/ui/VehicleCard";
import Icon from "@/components/ui/Icon";
import { vehicles } from "@/lib/data";

/* ── Static data ─────────────────────────────────────── */

const brands = [
  { name: "Chevrolet", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuANwT_9IHH4fqjRBUYSjj0u4sm3HZ-PLH5gIqUwkFETofITT9GbTyxRmJBrBeGBmL-A9HaGl33CvNemRN09p0zyfmuSUiy1kCqq0FCYTpdVlp2T7x0ziK7Yc8glLNA-DravIxCGhdiqSLhc4Iz0oVL_s8e01oJ53fV3CQegBPNhwiuXWIjfvjsY-2W3THVEOk8gJuhwGbf9ofpnF_frOKNx5ESn7P1ZxpTxMEkTD_ZC0hlWXbqf9wOjtnHhdMsG0l6yjnvscyB0VRs" },
  { name: "Hyundai",   src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCg7ghe9E_wtYzk4YRrMS22aIV6RFexXYD8K-IZcFUQDTWpHZsmySxVtdjd_cpe98ueGCzHuS4mcIMkNOZsDnqmb0j1T6fIJUserWig6XaOOqQrZM3WbcvCQpWrhUk3KGz78q04ZhkvYNKGLC6rMfwI0MMj50zrka1W47GHo8VkghdYS1XKn6WCKujvlMsC_5EvVeisGv1FmPy2mTGFuIhtQL9r7qg8jQQL1Kh-7njVHMoTx_WyrLHamOjQnVqa5BGKBuP_r-WaBkg" },
  { name: "Fiat",      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCE0bfcbyYrkaaTjHO-LomfiHF7nxbb57HGuk8MJ5yt4TE7sjDCjJzwMHIgdPDbsItln36dWKGod0qIcafqHFFgagC3O7a0t2T2zuiu9DFQcCA1sg5yWXmPU7CKJhUVB0bCCW2oLgpueNARIgFPBhgOqL9p3drcB4u_ojxezS1wKpWqSUz4xyiTG7_2B11JCLP0hLBWv8m_49DPXnYL4Zep1_hJ84jnjYbQTeuWJhkMtw8IJa3t5uoerZe7zX-xobJCOXSAoLJbieY" },
  { name: "Ford",      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6nSKExLYWuS_jIJqf-NBPpEvmruAeRuKI0_Fag8DD1FcB7GiFGYyhSFXDzvjIDfEsBqKJYXt7-pFhmb_JmJE1Eu4WE-pZBSvofaYXh-AuFZPfvXlzMm4BazogyfLfezX7xJukvsnb2YvwN5lGpCl0zuJn19VJlOXgASFXhd6jGZJTO7caLHu7Ui3Sxnyw54T6sR9L2m_6oNTLaGVg_eWx0156v6cB-AUkWzJq0HhsGpfHeOomvBIGSKZuvw52H-tMrXtzFVlKNyY" },
  { name: "Nissan",    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8w4H7GsLjdbn8WCm5rV6R5ss1Wvn4DrGhtijIhs3LWiESvAber2mGc1PfwcOEGs7PAI80EavuDz7-pIdEdCnpdEHzYUjCWgaQdMUgWilmRchn1_3M3rrWRx36HVbuVdIi_9E0U6CRmBMyIc5y15DVms3wFAyP9wjzqQOGCIZ1c0FLkS_RYKcNOhE5g5cnZxxlYb3vrRoDX24tQywt3mgVX5mnu223X5Zj3_v8MnNPLc8a6OOxCfqH4T4YkHK0" },
  { name: "BMW",       src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnwyCjchIG-cdoH_J97R9P69ZK1VRoQBY5YEPbUENh8pRRFzmM870YQERLIQvaAY5H3sCuXTAQBP9l_t-7P_uRqhvtAW8DukPIm3uafbL-0jvajPGQYTXBsvYO_eslidyg2Rk6hdPknZDZRxCoc2VMhCKGHZjNHT_0tM0c46zcQqvKyV1jT3H36eCPRL4DHIBS-s6rjUDTLKcp1MhTE5NEZSXWM5nKaAcQGxcE1knP7xQyBc_lUPI3zX3MPTs6iXpxVQpVJRdiLIM" },
  { name: "Toyota",    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxokegQvDzHCFk_GgV5uS1TAMuRo4PMR6dnddP2U-ONiM3btS_qM0VIQEm827C1U87waF33eyxklt_QZucCg4AQhNStZzg44iw-NzX6dyvtCqm6iq9WVtxWMILN0JdANgf3ohfcDpegd4duoD1wGK8xcpoKZmZr6E4b26wx6u95FdBpszvE1AEtWnDAc9hReVZZTXVK07yyCJGfPmdUBOEfxfR2ku_D4xiPY_cDYLXyZFUxxeu8W0FLpUvXx4LEpA6upAp5vI9pVY" },
  { name: "Jeep",      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhKZ22i1qajTM-cNak1hBR5NjAFrrU-dbM3WMBYw1pqh3T3Bm-oLd6ARh3_XqOrl67Ot0ju0nYeM3SdzrHXUulqMU7koZZYYjRRBGdSH9aCma_kSMrVcFbUmtN9JxSC4mInxOH1ncKyOToGNRffBbRfZiW6ijow6df-0czXC3Gs0_H8YNreiU4y_DGT2RZBIb70d173wpXd6TKCsoo7YVT6FgTsSrm11TvRuVpOwcxRUOh8dRaC5YAdMx6VhbSl5mIdlHXrRDd-Dw" },
  { name: "Volkswagen", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAU12xyGzXvOpk7TqFcrpglST2tEiHpcK_Y7SKEctOSYTjAqYM0ZHdA9vYLBh0c8M5idrTaWdJujrlUjGbBuOgNSqNLvkdAVFbq4ztvrweJlyKUDQ6tJSQ6vinCYGpbdRfM0bPf7WAjhAHXBS5cJaQfbG3_jQ5IZZ0ezAjlchWZfkS3Zv4_BCXgvJUeOdM7uq-8MCdbTCf6RoGcpBv9NcKYC81Pqbnl5OVaRwbe31hbxe0f4IfSKT-Y-Lf-jZTstJC3BmB5xrbvcrw" },
  { name: "Honda",     src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnvLqtu9j8ckf3Vt8-hvnglhnw3nIeOZ7MtZfSxyeEm5So6FDCSz0mcpU1qAaFwGcMh35xEpT3AUCLalvMHKzuJOWm4zs3jxrJbkHuDbqBYpISBjDG9JbcI1goqhQAiPbF87DOPGgk4MfT4X32G9Be44OnBcHzOQE2cHC8H1dzyj3W9h9IMbzfduNTm98HL4HDopqwdcN4LTNiXENjAg4CWbs1UqeigFBDIXijKJSIbeEGHtBTZj9rzFq8uva_soOaIcrNmb63j3M" },
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

const stats = [
  { value: "48.200+", label: "Veículos anunciados" },
  { value: "12.000+", label: "Vendedores ativos"   },
  { value: "R$ 2bi+", label: "Em negociações"      },
  { value: "4.9★",    label: "Avaliação média"     },
];

/* ── Page ─────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-inverse-surface overflow-hidden min-h-[600px] flex items-center">
        {/* BG car image */}
        <div className="absolute inset-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehxNs9I9ak52LfvX_Zc3BVGNcPeZ1FnK3XDjiLtGXZpa8_S7fs9ePvOMwHIMiWFG1MPgWz_J1MhDiXcMV3kWnIN33Y1Ax_jyj6riWUhcLHJFWN2upxKz16lyPpVDyryAsfcodfBkdqXYPgR-GSTeLhBIGITS1-SjCZKAyMu_7hWkDEJFVxesHEpPQXR7YwOEozTX6cZxyBvPl78nytBKtX_iQcHHyN5V6epMv-4viGLiRp8Bj5gkmWv064nm8rRhpNpvZNuqVXsI"
            alt="Hero car"
            fill
            className="object-cover opacity-25"
            priority
          />
          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface via-inverse-surface/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 py-24 w-full">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-0.5 bg-primary-container" />
              <span className="text-primary-container text-xs font-black uppercase tracking-widest">O maior marketplace automotivo</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none uppercase mb-6">
              VOCÊ DE<br />
              <span className="text-primary-container">CARRO NOVO!</span>
            </h1>
            <p className="text-neutral-400 text-lg mb-10 max-w-md">
              Mais de 48 mil veículos de particulares e lojas. Compre, venda e negocie com segurança.
            </p>

            {/* Search bar */}
            <div className="bg-surface-container-lowest rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl">
              <div className="flex items-center gap-3 flex-1 px-4">
                <Icon name="search" className="text-outline text-xl flex-shrink-0" />
                <input
                  className="w-full border-none focus:ring-0 bg-transparent py-3 text-base outline-none placeholder:text-outline"
                  placeholder="Marca, modelo ou versão..."
                  type="text"
                />
              </div>
              <Link
                href="/busca"
                className="bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-black px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest whitespace-nowrap"
              >
                Buscar veículos
                <Icon name="arrow_forward" />
              </Link>
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap gap-2 mt-4">
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
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-screen-2xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-neutral-400 text-xs">{s.label}</p>
              </div>
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

      {/* ── OPORTUNIDADES ── */}
      <section className="max-w-screen-2xl mx-auto px-6 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Selecionados para você</p>
            <h2 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Destaques</h2>
            <div className="h-1 w-16 bg-primary-container mt-2" />
          </div>
          <Link href="/busca" className="text-primary font-bold flex items-center gap-1 hover:underline text-sm">
            Ver todos <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      </section>

      {/* ── MARCAS POPULARES ── */}
      <section className="bg-surface-container-low py-16">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Navegue por marca</p>
              <h2 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Marcas populares</h2>
            </div>
            <Link href="/busca" className="text-primary font-bold flex items-center gap-1 hover:underline text-sm">
              Ver todas <Icon name="arrow_forward" className="text-base" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href="/busca"
                className="group bg-surface-container-lowest rounded-2xl px-6 py-5 flex flex-col items-center gap-3 hover:bg-primary-container transition-all shadow-sm"
              >
                <div className="h-10 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100">
                  <Image src={brand.src} alt={brand.name} width={80} height={40} className="h-8 w-auto object-contain" />
                </div>
                <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-primary-container transition-colors uppercase tracking-wide">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDITORIAL BANNER ── */}
      <section className="max-w-screen-2xl mx-auto px-6 py-20">
        <div className="bg-inverse-surface rounded-3xl overflow-hidden flex flex-col md:flex-row relative min-h-[320px]">
          <div className="p-12 md:p-20 flex-1 z-10 flex flex-col justify-center">
            <p className="text-primary-container text-xs font-black uppercase tracking-widest mb-4">Coleção exclusiva</p>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase mb-5 italic tracking-tighter">
              PARA QUEM É<br />APAIXONADO<br />POR CARRO
            </h2>
            <p className="text-zinc-400 max-w-sm mb-8 text-sm leading-relaxed">
              Experiência editorial completa com as melhores máquinas do mercado mundial.
            </p>
            <Link
              href="/busca"
              className="bg-primary-container text-on-primary-container font-black py-3 px-8 rounded-full self-start hover:scale-105 transition-transform uppercase tracking-widest text-xs"
            >
              Explorar Coleção
            </Link>
          </div>
          <div className="md:absolute right-0 top-0 bottom-0 md:w-3/5 h-64 md:h-full">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIvLp-rtsJt2IjPOLqXPiPBkYuHU2HARrJ8J75dRrfQv_2BBPNRKry2HOpanttRVmJy92r7AXo9cbIv9RWOnK-iZxLQHeC1V2d1Wtrb5ZK9luoIbaZF1i46T9MLv-3Z8nWX4O_A9qqOH01kXZNfGmV1Wpkd8lDPgkP4O4oGxm_wsvLXs8eUB7WnvXulAselnLZ2vNhT9Fqx08p22CtyTtig7tJQo0VJQkA1AcdwoZdwH4MIc9T0KGWWWku95z_Nrg5iutFCvtq-Ig"
              alt="Supercar"
              fill
              className="object-cover md:object-right kinetic-angle"
            />
          </div>
        </div>
      </section>

      {/* ── MODELOS & LOJAS ── */}
      <section className="max-w-screen-2xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Mais buscados</p>
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">Categorias em alta</h3>
          <div className="space-y-3">
            {[
              { label: "SUVs Premium",              count: "1.482 anúncios" },
              { label: "Esportivos & Conversíveis", count: "154 anúncios"   },
              { label: "Picapes 4x4",               count: "388 anúncios"   },
              { label: "Elétricos & Híbridos",      count: "97 anúncios"    },
            ].map((cat, i) => (
              <Link
                key={cat.label}
                href="/busca"
                className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group hover:bg-primary-container transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-outline group-hover:text-on-primary-container/40 transition-colors w-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-bold text-on-surface group-hover:text-on-primary-container transition-colors">{cat.label}</p>
                    <p className="text-xs text-on-surface-variant group-hover:text-on-primary-container/70 transition-colors">{cat.count}</p>
                  </div>
                </div>
                <Icon name="chevron_right" className="text-outline group-hover:text-on-primary-container transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Parceiros verificados</p>
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">Lojas em destaque</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Elite Motors",   icon: "stars",    badge: "Top vendedor" },
              { name: "Premium Cars",   icon: "verified", badge: "Verificado"   },
              { name: "Auto Center SP", icon: "storefront", badge: "Novo"       },
              { name: "Speed Motors",   icon: "bolt",     badge: "Popular"      },
            ].map((shop) => (
              <Link
                key={shop.name}
                href="/busca"
                className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer border border-transparent hover:border-primary-container transition-all shadow-sm group"
              >
                <div className="w-14 h-14 bg-surface-container rounded-full mb-3 flex items-center justify-center group-hover:bg-primary-container transition-colors">
                  <Icon name={shop.icon} fill className="text-primary text-2xl group-hover:text-on-primary-container transition-colors" />
                </div>
                <span className="font-bold text-sm text-on-surface uppercase tracking-tight mb-1">{shop.name}</span>
                <span className="text-[10px] text-primary font-black uppercase tracking-widest">{shop.badge}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVIÇOS ── */}
      <section className="bg-surface-container-highest/30 py-20">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Ecossistema completo</p>
            <h2 className="text-3xl font-black tracking-tighter uppercase">Além da compra e venda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "tire_repair",    title: "Acessórios",    desc: "Personalize seu veículo com o que há de mais moderno em tecnologia e design.", highlight: false },
              { icon: "security",       title: "Simule Seguro", desc: "Proteção total para sua nova conquista com as melhores taxas do mercado.",    highlight: true  },
              { icon: "account_balance", title: "Financiamento", desc: "Aprovação rápida e parcelas que cabem no seu planejamento financeiro.",      highlight: false },
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
                <button className={`w-full font-bold py-3 rounded-full transition-all uppercase text-sm tracking-widest ${
                  s.highlight
                    ? "bg-primary-container hover:bg-primary-fixed-dim"
                    : "border border-outline/20 hover:bg-on-surface hover:text-white"
                }`}>
                  Saiba mais
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
