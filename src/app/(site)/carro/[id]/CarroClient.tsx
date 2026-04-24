"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

interface VehiclePhoto { id: string; url: string; order: number; isCover: boolean; }
interface VehicleFeature { id: string; name: string; }
interface Seller {
  id: string; name: string; nickname: string | null; tradeName: string | null;
  avatarUrl: string | null; phone: string | null;
  plan: string; city: string | null; state: string | null; createdAt: string;
  lastSeenAt: string | null; accountType?: string; storeSlug?: string | null;
  listingsCount: number; salesCount: number;
}
interface Vehicle {
  id: string; brand: string; model: string; version: string | null;
  vehicleType: string; motoType: string | null; cylindercc: number | null;
  bodyType: string | null; yearFab: number; yearModel: number; km: number;
  fuel: string; transmission: string; color: string | null; doors: number | null;
  price: number; previousPrice: number | null; fipePrice: number | null;
  acceptTrade: boolean; financing: boolean; armored: boolean; auction: boolean;
  condition: "NEW" | "USED"; description: string | null; city: string; state: string;
  views: number; status: string;
  fipeBrandCode: string | null; fipeModelCode: string | null; fipeYearCode: string | null;
  photos: VehiclePhoto[];
  features: VehicleFeature[];
  user: Seller;
}

export default function CarroClient({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [msgForm, setMsgForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [shopMotorAvg, setShopMotorAvg] = useState<number | null>(null);
  const [shopMotorCount, setShopMotorCount] = useState(0);
  const [fipePrice, setFipePrice] = useState<number | null>(null);
  const [loadingFipe, setLoadingFipe] = useState(false);

  // Carrega veículo (apenas uma vez por id)
  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then(async r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return; }
        const data = await r.json();
        setVehicle(data.vehicle);
        setShopMotorAvg(data.priceComparison?.shopMotorAvg ?? null);
        setShopMotorCount(data.priceComparison?.shopMotorCount ?? 0);
        const cover = data.vehicle.photos.findIndex((p: VehiclePhoto) => p.isCover);
        setActivePhoto(cover >= 0 ? cover : 0);
        setLoading(false);

        const { fipeBrandCode, fipeModelCode, fipeYearCode } = data.vehicle;
        if (fipeBrandCode && fipeModelCode && fipeYearCode) {
          setLoadingFipe(true);
          fetch(`/api/fipe/brands/${fipeBrandCode}/models/${fipeModelCode}/years/${fipeYearCode}`)
            .then(r => r.ok ? r.json() : null)
            .then(fipe => {
              if (fipe?.price) {
                const num = Number(fipe.price.replace(/[^\d,]/g, "").replace(",", ".")) * 100;
                setFipePrice(Math.round(num));
              }
            })
            .finally(() => setLoadingFipe(false));
        }
      });
  }, [id]);

  // Checa favorito após autenticação carregar
  useEffect(() => {
    if (authLoading || !user) return;
    setMsgForm(f => ({ ...f, name: user.name, email: user.email, phone: user.phone ?? "" }));
    fetch(`/api/favorites?vehicleId=${id}`)
      .then(r => r.json())
      .then(d => setIsFav(d.isFav ?? false));
  }, [id, user, authLoading]);

  async function toggleFavorite() {
    if (!user) { router.push(`/login?redirect=/carro/${id}`); return; }
    const next = !isFav;
    setIsFav(next);
    try {
      if (!next) {
        await fetch(`/api/favorites?vehicleId=${id}`, { method: "DELETE" });
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleId: id }),
        });
        if (!res.ok) setIsFav(false);
      }
    } catch {
      setIsFav(!next);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { router.push(`/login?redirect=/carro/${id}`); return; }
    setSending(true);
    const text = msgForm.message || `Olá! Tenho interesse no ${vehicle?.brand} ${vehicle?.model}. Poderia me passar mais informações?`;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: id, text }),
      });
      if (res.ok) {
        setSent(true);
        setMsgForm({ name: "", email: "", phone: "", message: "" });
      }
    } catch {
      // falha silenciosa — usuário pode tentar novamente
    } finally {
      setSending(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="w-10 h-10 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
    </div>
  );

  if (notFound || !vehicle) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Icon name="search_off" className="text-6xl text-outline mb-4" />
      <h1 className="text-2xl font-black text-on-surface mb-2">Anúncio não encontrado</h1>
      <p className="text-on-surface-variant mb-6">Este veículo pode ter sido removido ou não está mais disponível.</p>
      <Link href="/busca" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
        Ver outros veículos
      </Link>
    </div>
  );

  const price  = vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const km     = vehicle.km === 0 ? "0 km" : `${vehicle.km.toLocaleString("pt-BR")} km`;
  const photos = vehicle.photos.sort((a, b) => a.order - b.order);

  const isMoto = vehicle.vehicleType === "MOTO";
  const specs = [
    { icon: "calendar_today",    label: "Ano",           value: `${vehicle.yearFab}/${vehicle.yearModel}` },
    { icon: "speed",             label: "Quilometragem", value: km },
    { icon: "local_gas_station", label: "Combustível",   value: vehicle.fuel },
    { icon: "settings",          label: "Câmbio",        value: vehicle.transmission },
    { icon: "new_releases",      label: "Condição",      value: vehicle.condition === "NEW" ? "Novo (0 km)" : "Usado" },
    ...(isMoto && vehicle.cylindercc ? [{ icon: "speed", label: "Cilindrada", value: `${vehicle.cylindercc} cc` }] : []),
    ...(isMoto && vehicle.motoType   ? [{ icon: "two_wheeler", label: "Tipo",       value: vehicle.motoType       }] : []),
    ...(!isMoto && vehicle.bodyType  ? [{ icon: "directions_car", label: "Carroceria", value: vehicle.bodyType   }] : []),
    ...(vehicle.color    ? [{ icon: "palette",        label: "Cor",        value: vehicle.color    }] : []),
    ...(!isMoto && vehicle.doors ? [{ icon: "sensor_door", label: "Portas", value: `${vehicle.doors} portas` }] : []),
    ...(vehicle.armored  ? [{ icon: "shield",         label: "Blindagem",  value: "Sim"            }] : []),
    ...(vehicle.auction  ? [{ icon: "gavel",          label: "Leilão",     value: "Sim"            }] : []),
  ];

  const sellerSince = new Date(vehicle.user.createdAt).getFullYear();

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-xs uppercase tracking-widest mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <Link href="/busca" className="hover:text-primary transition-colors">Busca</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface font-bold">{vehicle.brand} {vehicle.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-container shadow-sm group">
              {photos.length > 0 ? (
                <img src={photos[activePhoto]?.url} alt={`${vehicle.brand} ${vehicle.model} — foto ${activePhoto + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="directions_car" className="text-8xl text-outline" />
                </div>
              )}
              {photos.length > 1 && (
                <>
                  <button onClick={() => setActivePhoto(p => (p - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100">
                    <Icon name="chevron_left" className="text-2xl" />
                  </button>
                  <button onClick={() => setActivePhoto(p => (p + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100">
                    <Icon name="chevron_right" className="text-2xl" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                <Icon name="photo_camera" className="text-sm" />
                {activePhoto + 1}/{photos.length || 1} FOTOS
              </div>
              <button onClick={toggleFavorite} aria-label={isFav ? "Remover dos favoritos" : "Favoritar"} className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                <Icon name="favorite" fill={isFav} className={isFav ? "text-red-400" : "text-white"} />
              </button>
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {photos.map((p, i) => (
                  <button key={p.id} onClick={() => setActivePhoto(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all ${i === activePhoto ? "ring-2 ring-primary ring-offset-2" : "opacity-60 hover:opacity-100"}`}>
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Identificação */}
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-on-surface uppercase leading-none">
              {vehicle.brand} {vehicle.model}
            </h1>
            {vehicle.version && <p className="text-on-surface-variant font-medium mt-2">{vehicle.version}</p>}
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {specs.map(s => (
              <div key={s.label} className="bg-surface-container-low px-4 py-3 rounded-xl flex items-center gap-3">
                <Icon name={s.icon} className="text-primary text-xl flex-shrink-0" />
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest leading-none">{s.label}</p>
                  <p className="text-on-surface font-black text-sm leading-tight mt-0.5">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Localização */}
          <div className="flex items-center gap-4 text-on-surface-variant text-sm flex-wrap">
            <span className="flex items-center gap-1.5">
              <Icon name="location_on" className="text-lg text-primary" />
              {vehicle.city}, {vehicle.state}
            </span>
          </div>

          {/* Opcionais */}
          {vehicle.features.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-widest">Itens e opcionais</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                {vehicle.features.map(f => (
                  <div key={f.id} className="flex items-center gap-3 text-on-surface text-sm font-medium">
                    <Icon name="check_circle" fill className="text-primary text-xl flex-shrink-0" />
                    {f.name}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Descrição */}
          {vehicle.description && (
            <section className="bg-surface-container-low p-8 rounded-2xl">
              <h2 className="text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-widest">Observações do vendedor</h2>
              <p className="text-on-surface text-sm leading-relaxed whitespace-pre-line break-words overflow-hidden">{vehicle.description}</p>
            </section>
          )}

          {/* Comparativo de preços */}
          <section className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Comparativo de preços</h2>
            <div className="grid grid-cols-3 gap-3">

              {/* Valor anunciado */}
              <div className="bg-primary-container/20 rounded-2xl p-4 flex flex-col gap-1">
                <Icon name="sell" className="text-lg text-primary mb-1" />
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant leading-tight">Valor anunciado</p>
                <p className="text-base font-black text-on-surface leading-tight">{price}</p>
              </div>

              {/* Média ShopMotor */}
              <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-1">
                <Icon name="bar_chart" className="text-lg text-on-surface-variant mb-1" />
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant leading-tight">
                  {shopMotorCount <= 1 ? "ShopMotor" : "Média ShopMotor"}
                </p>
                {shopMotorAvg !== null ? (
                  <>
                    <p className="text-base font-black text-on-surface leading-tight">
                      {shopMotorAvg.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
                    </p>
                    {shopMotorCount > 1 && (
                      <span className={`text-[10px] font-black mt-1 ${vehicle.price < shopMotorAvg ? "text-green-600" : vehicle.price > shopMotorAvg ? "text-red-600" : "text-on-surface-variant"}`}>
                        {vehicle.price < shopMotorAvg
                          ? `${Math.round((1 - vehicle.price / shopMotorAvg) * 100)}% abaixo`
                          : vehicle.price > shopMotorAvg
                          ? `${Math.round((vehicle.price / shopMotorAvg - 1) * 100)}% acima`
                          : "Na média"}
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-on-surface-variant">Sem dados</p>
                )}
              </div>

              {/* FIPE */}
              <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-1">
                <Icon name="account_balance" className="text-lg text-on-surface-variant mb-1" />
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant leading-tight">Tabela FIPE</p>
                {loadingFipe ? (
                  <span className="w-4 h-4 border-2 border-outline/30 border-t-outline rounded-full animate-spin mt-1" />
                ) : fipePrice !== null ? (
                  <p className="text-base font-black text-on-surface leading-tight">
                    {(fipePrice / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant italic mt-1">Não disponível</p>
                )}
              </div>

            </div>
          </section>

        </div>

        {/* ── Right (sticky) ── */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_12px_32px_rgba(45,47,47,0.06)] space-y-6">

            {/* Preço e condições */}
            <div className="pb-6 border-b border-surface-container-high space-y-3">
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mb-1">Preço</p>
                <p className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{price}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vehicle.previousPrice && vehicle.previousPrice > vehicle.price && (
                    <span className="flex items-center gap-1 text-xs font-black text-green-700 bg-green-50 px-3 py-1 rounded-full">
                      <Icon name="trending_down" className="text-sm" />
                      Baixou o preço · era {vehicle.previousPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
                    </span>
                  )}
                  {vehicle.fipePrice && vehicle.fipePrice > 0 && vehicle.price < vehicle.fipePrice && (
                    <span className="flex items-center gap-1 text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                      <Icon name="verified" className="text-sm" />Abaixo da FIPE
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-on-surface-variant">
                {vehicle.acceptTrade && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon name="sync_alt" className="text-base text-green-600" />Aceita troca
                  </span>
                )}
                {vehicle.financing && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon name="account_balance" className="text-base text-blue-600" />Financiamento
                  </span>
                )}
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h3 className="text-base font-black text-on-surface uppercase tracking-tighter mb-4">Enviar proposta</h3>
              {sent ? (
                <div className="flex flex-col items-center py-6 text-center gap-3">
                  <Icon name="check_circle" fill className="text-5xl text-green-500" />
                  <p className="font-bold text-on-surface">Proposta enviada!</p>
                  <p className="text-xs text-on-surface-variant">Acompanhe a resposta nas suas mensagens.</p>
                  <Link href="/perfil/mensagens" className="text-xs text-primary font-bold hover:underline mt-1 flex items-center gap-1">
                    <Icon name="chat" className="text-sm" />Ver mensagens
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <textarea rows={4} required
                    value={msgForm.message || `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model}. Poderia me passar mais informações?`}
                    onChange={e => setMsgForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
                  />
                  <button type="submit" disabled={sending} className="w-full bg-primary-container text-on-primary-container font-black uppercase tracking-tighter py-4 rounded-full transition-colors active:scale-95 shadow-lg shadow-primary-container/20 disabled:opacity-60 flex items-center justify-center gap-2">
                    {sending && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
                    {sending ? "Enviando..." : "Enviar Proposta"}
                  </button>
                </form>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Compartilhar</span>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no Facebook" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-[#1877F2] hover:text-white text-on-surface-variant transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                </a>
                <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-[#E1306C] hover:text-white text-on-surface-variant transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href={`https://www.tiktok.com/`} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-black hover:text-white text-on-surface-variant transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.75a4.85 4.85 0 01-1.02-.06z"/></svg>
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira este anúncio no ShopMotor: ${typeof window !== "undefined" ? window.location.href : ""}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no WhatsApp" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-[#25D366] hover:text-white text-on-surface-variant transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
              <button className="flex items-center gap-1 hover:text-error transition-colors font-medium text-xs text-on-surface-variant">
                <Icon name="flag" className="text-sm" />Denunciar
              </button>
            </div>
          </div>

          {/* Bloco do anunciante */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-5">

            {/* Avatar + nome */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0 border-2 border-primary-container">
                {vehicle.user.avatarUrl ? (
                  <img src={vehicle.user.avatarUrl} alt={vehicle.user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-on-surface-variant">{vehicle.user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm text-on-surface uppercase leading-tight truncate">
                  {vehicle.user.accountType === "PJ"
                    ? (vehicle.user.tradeName ?? vehicle.user.name)
                    : (vehicle.user.nickname ?? vehicle.user.name)}
                </p>
                {vehicle.user.plan === "PREMIUM" && (
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Premium</span>
                )}
              </div>
            </div>

            {/* Informações hierárquicas */}
            <div className="space-y-2 text-xs text-on-surface-variant divide-y divide-surface-container">
              {vehicle.user.lastSeenAt && (
                <div className="flex items-center justify-between py-1.5 first:pt-0">
                  <span className="font-medium">Último acesso</span>
                  <span className="font-bold text-on-surface">{(() => {
                    const diff = Date.now() - new Date(vehicle.user.lastSeenAt!).getTime();
                    const mins = Math.floor(diff / 60000);
                    if (mins < 60) return `há ${mins} min`;
                    const hrs = Math.floor(mins / 60);
                    if (hrs < 24) return `há ${hrs}h`;
                    const days = Math.floor(hrs / 24);
                    return `há ${days} dia${days > 1 ? "s" : ""}`;
                  })()}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-1.5 first:pt-0">
                <span className="font-medium">No ShopMotor desde</span>
                <span className="font-bold text-on-surface">{sellerSince}</span>
              </div>
              {vehicle.user.city && vehicle.user.state && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-medium">Localização</span>
                  <span className="font-bold text-on-surface flex items-center gap-1">
                    <Icon name="location_on" className="text-xs text-primary" />
                    {vehicle.user.city}, {vehicle.user.state}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-1.5">
                <span className="font-medium">Anúncios ativos</span>
                <span className="font-bold text-on-surface">{vehicle.user.listingsCount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="font-medium">Vendas realizadas</span>
                <span className="font-bold text-on-surface">{vehicle.user.salesCount}</span>
              </div>
            </div>


            {/* Ações */}
            <div className="space-y-3 pt-1">
              {user && vehicle.user.phone ? (
                <a
                  href={`https://wa.me/55${vehicle.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Vi seu anúncio do ${vehicle.brand} ${vehicle.model} no ShopMotor e tenho interesse.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-full transition-colors text-sm"
                >
                  <Icon name="chat" className="text-base" />
                  Chamar no WhatsApp
                </a>
              ) : !user ? (
                <Link
                  href={`/login?redirect=/carro/${id}`}
                  className="flex items-center justify-center gap-2 w-full bg-green-500/20 text-green-700 font-bold py-3 rounded-full text-sm border border-green-500/30 hover:bg-green-500/30 transition-colors"
                >
                  <Icon name="lock" className="text-base" />
                  Faça login para ver o contato
                </Link>
              ) : null}
              <Link
                href={vehicle.user.accountType === "PJ" && vehicle.user.storeSlug
                  ? `/loja/${vehicle.user.storeSlug}`
                  : `/vendedor/${vehicle.user.id}`}
                className="flex items-center justify-center gap-2 w-full border border-outline-variant hover:bg-surface-container text-on-surface font-bold py-3 rounded-full transition-colors text-sm"
              >
                <Icon name={vehicle.user.accountType === "PJ" ? "storefront" : "person"} className="text-base" />
                {vehicle.user.accountType === "PJ" ? "Ver perfil da loja" : "Ver perfil do anunciante"}
              </Link>
            </div>
          </div>

        </div>
      </div>

      </div>{/* end grid */}

      <div className="mt-12 pt-8 border-t border-outline-variant/30">
        <Link href="/busca" className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
          <Icon name="arrow_back" className="text-lg" />Voltar para a busca
        </Link>
      </div>

    </div>
  );
}
