"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface Seller {
  id: string;
  name: string;
  avatarUrl: string | null;
  phone: string | null;
  plan: string;
  city: string | null;
  state: string | null;
  createdAt: string;
  _count: { vehicles: number };
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  yearFab: number;
  yearModel: number;
  km: number;
  price: number;
  city: string;
  state: string;
  photos: { url: string }[];
}

export default function VendedorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/seller/${id}`)
      .then(async r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return; }
        const data = await r.json();
        setSeller(data.seller);
        setVehicles(data.vehicles);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="w-10 h-10 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
    </div>
  );

  if (notFound || !seller) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Icon name="person_off" className="text-6xl text-outline mb-4" />
      <h1 className="text-2xl font-black text-on-surface mb-2">Vendedor não encontrado</h1>
      <p className="text-on-surface-variant mb-6">Este perfil pode ter sido removido.</p>
      <Link href="/busca" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
        Ver veículos
      </Link>
    </div>
  );

  const memberSince = new Date(seller.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const isPremium   = seller.plan === "PREMIUM";
  const whatsappUrl = seller.phone
    ? `https://wa.me/55${seller.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Vi seus anúncios no ShopMotors e tenho interesse.")}`
    : null;

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 space-y-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs uppercase tracking-widest flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface font-bold">{seller.name}</span>
      </nav>

      {/* Seller hero */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-inverse-surface to-neutral-700 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,215,9,0.3) 20px, rgba(255,215,9,0.3) 21px)" }} />
        </div>

        {/* Profile */}
        <div className="px-6 md:px-10 pb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-10">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-surface bg-surface-container flex items-center justify-center flex-shrink-0 shadow-lg">
              {seller.avatarUrl ? (
                <img src={seller.avatarUrl} alt={seller.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-on-surface-variant">{seller.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-black text-on-surface tracking-tight">{seller.name}</h1>
                {isPremium && (
                  <span className="flex items-center gap-1 bg-primary-container text-on-primary-container text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    <Icon name="verified" className="text-xs" />Premium
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                {seller.city && seller.state && (
                  <span className="flex items-center gap-1">
                    <Icon name="location_on" className="text-sm" />{seller.city}, {seller.state}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Icon name="calendar_today" className="text-sm" />Membro desde {memberSince}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="directions_car" className="text-sm" />{seller._count.vehicles} anúncio{seller._count.vehicles !== 1 ? "s" : ""} ativo{seller._count.vehicles !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-shrink-0">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-black px-5 py-2.5 rounded-full text-sm transition-colors"
                >
                  <Icon name="chat_bubble" className="text-base" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-black uppercase tracking-tight text-on-surface">
          Anúncios ativos
          <span className="ml-2 text-sm font-normal text-on-surface-variant normal-case tracking-normal">({vehicles.length})</span>
        </h2>

        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Icon name="directions_car" className="text-5xl text-outline mb-3" />
            <p className="font-bold text-on-surface">Nenhum anúncio ativo no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vehicles.map(v => {
              const price    = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
              const km       = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
              const coverUrl = v.photos[0]?.url ?? null;
              return (
                <Link
                  key={v.id}
                  href={`/carro/${v.id}`}
                  className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm group hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative bg-surface-container">
                    {coverUrl ? (
                      <img src={coverUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="directions_car" className="text-5xl text-outline" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">{v.brand}</p>
                      <h3 className="font-bold text-base leading-tight text-on-surface mb-1 truncate">
                        {v.model}{v.version ? ` ${v.version}` : ""}
                      </h3>
                      <p className="text-xs text-on-surface-variant">{v.yearFab}/{v.yearModel} · {km}</p>
                    </div>
                    <div className="mt-3">
                      <p className="text-lg font-black text-on-surface">{price}</p>
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant mt-1">
                        <Icon name="location_on" className="text-sm" />{v.city}, {v.state}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
