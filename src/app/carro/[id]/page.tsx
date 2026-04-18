"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

interface VehiclePhoto { id: string; url: string; order: number; isCover: boolean; }
interface VehicleFeature { id: string; name: string; }
interface Seller {
  id: string; name: string; avatarUrl: string | null; phone: string | null;
  plan: string; city: string | null; state: string | null; createdAt: string;
}
interface Vehicle {
  id: string; brand: string; model: string; version: string | null;
  bodyType: string | null; yearFab: number; yearModel: number; km: number;
  fuel: string; transmission: string; color: string | null; doors: number | null;
  price: number; acceptTrade: boolean; financing: boolean; armored: boolean; auction: boolean;
  condition: "NEW" | "USED"; description: string | null; city: string; state: string;
  views: number; status: string;
  photos: VehiclePhoto[];
  features: VehicleFeature[];
  user: Seller;
}

export default function CarroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [msgForm, setMsgForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then(async r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return; }
        const data = await r.json();
        setVehicle(data.vehicle);
        const cover = data.vehicle.photos.findIndex((p: VehiclePhoto) => p.isCover);
        setActivePhoto(cover >= 0 ? cover : 0);
        // Pre-fill contact form from logged-in user
        if (user) setMsgForm(f => ({ ...f, name: user.name, email: user.email, phone: user.phone ?? "" }));
        setLoading(false);
      });
  }, [id, user]);

  async function toggleFavorite() {
    if (!user) { router.push(`/login?redirect=/carro/${id}`); return; }
    if (isFav) {
      setIsFav(false);
      await fetch(`/api/favorites?vehicleId=${id}`, { method: "DELETE" });
    } else {
      setIsFav(true);
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: id }),
      });
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Message API will be wired later — simulate for now
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    setSent(true);
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

  const price = vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const km    = vehicle.km === 0 ? "0 km" : `${vehicle.km.toLocaleString("pt-BR")} km`;
  const photos = vehicle.photos.sort((a, b) => a.order - b.order);

  const specs = [
    { icon: "calendar_today",  label: "Ano",           value: `${vehicle.yearFab}/${vehicle.yearModel}` },
    { icon: "speed",           label: "Quilometragem", value: km },
    { icon: "local_gas_station", label: "Combustível", value: vehicle.fuel },
    { icon: "settings",        label: "Câmbio",        value: vehicle.transmission },
    ...(vehicle.bodyType ? [{ icon: "directions_car", label: "Carroceria", value: vehicle.bodyType }] : []),
    ...(vehicle.color    ? [{ icon: "palette",        label: "Cor",        value: vehicle.color    }] : []),
    ...(vehicle.doors    ? [{ icon: "sensor_door",    label: "Portas",     value: String(vehicle.doors) }] : []),
  ];

  const sellerSince = new Date(vehicle.user.createdAt).getFullYear();
  const whatsappUrl = vehicle.user.phone
    ? `https://wa.me/55${vehicle.user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Vi seu anúncio do ${vehicle.brand} ${vehicle.model} no ShopMotors e tenho interesse.`)}`
    : null;

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

      {/* Title + Price */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {vehicle.condition === "NEW" && <span className="bg-primary-container text-on-primary-container text-[10px] font-black px-2 py-0.5 rounded uppercase">0 km</span>}
            {vehicle.auction && <span className="bg-error text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">Leilão</span>}
            {vehicle.armored && <span className="bg-neutral-800 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1"><Icon name="shield" className="text-xs" />Blindado</span>}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-on-surface uppercase leading-none">
            {vehicle.brand} {vehicle.model}
          </h1>
          {vehicle.version && <p className="text-on-surface-variant font-medium mt-2">{vehicle.version}</p>}
        </div>
        <div className="md:text-right">
          <p className="text-on-surface-variant text-sm font-semibold uppercase tracking-wider mb-1">Preço</p>
          <p className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{price}</p>
          <div className="flex md:justify-end gap-3 mt-2 text-xs text-on-surface-variant">
            {vehicle.acceptTrade && <span className="flex items-center gap-1"><Icon name="sync_alt" className="text-sm text-green-600" />Aceita troca</span>}
            {vehicle.financing   && <span className="flex items-center gap-1"><Icon name="account_balance" className="text-sm text-blue-600" />Financiamento</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left ── */}
        <div className="lg:col-span-8 space-y-8">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-container shadow-sm group">
              {photos.length > 0 ? (
                <img
                  src={photos[activePhoto]?.url}
                  alt={`${vehicle.brand} ${vehicle.model} — foto ${activePhoto + 1}`}
                  className="w-full h-full object-cover"
                />
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
                  <button
                    key={p.id}
                    onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all ${i === activePhoto ? "ring-2 ring-primary ring-offset-2" : "opacity-60 hover:opacity-100"}`}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {specs.map(s => (
              <div key={s.label} className="bg-surface-container-low p-5 rounded-xl">
                <Icon name={s.icon} className="text-primary mb-2 block" />
                <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest">{s.label}</p>
                <p className="text-on-surface font-black text-base leading-tight mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Localização */}
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <Icon name="location_on" className="text-lg text-primary" />
            <span>{vehicle.city}, {vehicle.state}</span>
            <span className="text-outline">·</span>
            <Icon name="visibility" className="text-lg" />
            <span>{vehicle.views} visualizações</span>
          </div>

          {/* Características (features) */}
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
              <p className="text-on-surface text-sm leading-relaxed whitespace-pre-line">{vehicle.description}</p>
            </section>
          )}

        </div>

        {/* ── Right (sticky) ── */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0px_12px_32px_rgba(45,47,47,0.06)] sticky top-24 space-y-6">

            {/* Seller */}
            <div className="flex items-center gap-4 pb-6 border-b border-surface-container-high">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0 border-2 border-primary-container">
                {vehicle.user.avatarUrl ? (
                  <img src={vehicle.user.avatarUrl} alt={vehicle.user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-on-surface-variant">{vehicle.user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3 className="font-black text-sm text-on-surface uppercase leading-tight">{vehicle.user.name}</h3>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {vehicle.user.plan === "PREMIUM" ? "Vendedor Premium" : "Vendedor"}
                </p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Membro desde {sellerSince}</p>
                {vehicle.user.city && vehicle.user.state && (
                  <p className="text-[10px] text-on-surface-variant flex items-center gap-0.5 mt-0.5">
                    <Icon name="location_on" className="text-xs" />{vehicle.user.city}, {vehicle.user.state}
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-black py-3.5 rounded-full transition-colors uppercase tracking-widest text-sm"
              >
                <Icon name="chat_bubble" className="text-lg" />
                WhatsApp
              </a>
            )}

            {/* Contact form */}
            <div>
              <h3 className="text-base font-black text-on-surface uppercase tracking-tighter mb-4">Enviar proposta</h3>

              {sent ? (
                <div className="flex flex-col items-center py-6 text-center gap-3">
                  <Icon name="check_circle" fill className="text-5xl text-green-500" />
                  <p className="font-bold text-on-surface">Mensagem enviada!</p>
                  <p className="text-xs text-on-surface-variant">O vendedor entrará em contato em breve.</p>
                  <button onClick={() => setSent(false)} className="text-xs text-primary font-bold hover:underline mt-2">Enviar outra</button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <input
                    type="text" placeholder="Seu nome" required
                    value={msgForm.name} onChange={e => setMsgForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
                  />
                  <input
                    type="email" placeholder="seu@email.com" required
                    value={msgForm.email} onChange={e => setMsgForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
                  />
                  <input
                    type="tel" placeholder="(00) 00000-0000"
                    value={msgForm.phone} onChange={e => setMsgForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
                  />
                  <textarea
                    rows={3} required
                    value={msgForm.message || `Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model}. Poderia me passar mais informações?`}
                    onChange={e => setMsgForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-primary-container text-on-primary-container font-black uppercase tracking-tighter py-4 rounded-full transition-colors active:scale-95 shadow-lg shadow-primary-container/20 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {sending && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
                    {sending ? "Enviando..." : "Enviar Proposta"}
                  </button>
                </form>
              )}
            </div>

            {/* Share / Report */}
            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-container-high">
              <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
                <Icon name="share" className="text-sm" />Compartilhar
              </button>
              <button className="flex items-center gap-1 hover:text-error transition-colors font-medium">
                <Icon name="flag" className="text-sm" />Denunciar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Back to search */}
      <div className="mt-12 pt-8 border-t border-outline-variant/30">
        <Link href="/busca" className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
          <Icon name="arrow_back" className="text-lg" />
          Voltar para a busca
        </Link>
      </div>

    </div>
  );
}
