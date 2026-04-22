"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

interface VehiclePhoto { id: string; url: string; order: number; isCover: boolean; }
interface VehicleFeature { id: string; name: string; }
interface Seller {
  id: string; name: string; avatarUrl: string | null; phone: string | null;
  plan: string; city: string | null; state: string | null; createdAt: string;
  accountType?: string; storeSlug?: string | null;
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

export default function CarroPage({ params }: { params: { id: string } }) {
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

  // Reviews
  interface Review { id: string; rating: number; comment: string | null; createdAt: string; fromUser: { id: string; name: string; avatarUrl: string | null } }
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsAvg, setReviewsAvg] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSent, setReviewSent] = useState(false);

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

  // Carrega reviews do vendedor quando veículo estiver disponível
  useEffect(() => {
    if (!vehicle) return;
    fetch(`/api/reviews?userId=${vehicle.user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setReviews(d.reviews); setReviewsAvg(d.avg); } })
      .catch(() => {});
  }, [vehicle]);

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

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicle) return;
    setReviewError("");
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: vehicle.user.id, rating: reviewForm.rating, comment: reviewForm.comment }),
      });
      const data = await res.json();
      if (!res.ok) { setReviewError(data.error ?? "Erro ao enviar avaliação."); return; }
      setReviews(prev => [data.review, ...prev]);
      setReviewsAvg(prev => prev === null ? reviewForm.rating : (prev * reviews.length + reviewForm.rating) / (reviews.length + 1));
      setReviewSent(true);
    } catch { setReviewError("Erro ao enviar avaliação."); }
    finally { setSubmittingReview(false); }
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
              <p className="text-on-surface text-sm leading-relaxed whitespace-pre-line">{vehicle.description}</p>
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

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-container-high">
              <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
                <Icon name="share" className="text-sm" />Compartilhar
              </button>
              <button className="flex items-center gap-1 hover:text-error transition-colors font-medium">
                <Icon name="flag" className="text-sm" />Denunciar
              </button>
            </div>
          </div>

          {/* Bloco do anunciante */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Anunciante</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0 border-2 border-primary-container">
                {vehicle.user.avatarUrl ? (
                  <img src={vehicle.user.avatarUrl} alt={vehicle.user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-black text-on-surface-variant">{vehicle.user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="font-black text-sm text-on-surface uppercase">{vehicle.user.name}</p>
                {vehicle.user.city && vehicle.user.state && (
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <Icon name="location_on" className="text-xs" />{vehicle.user.city}, {vehicle.user.state}
                  </p>
                )}
                <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                  <Icon name="calendar_today" className="text-xs" />Na ShopMotor desde {sellerSince}
                </p>
              </div>
            </div>
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

      </div>{/* end grid */}

      {/* Avaliações do vendedor */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black uppercase tracking-tighter text-on-surface">Avaliações do vendedor</h2>
            {reviewsAvg !== null && (
              <div className="flex items-center gap-1.5 bg-primary-container/20 px-3 py-1 rounded-full">
                <Icon name="star" fill className="text-yellow-500 text-base" />
                <span className="font-black text-sm text-on-surface">{reviewsAvg.toFixed(1)}</span>
                <span className="text-xs text-on-surface-variant">({reviews.length})</span>
              </div>
            )}
          </div>
        </div>

        {/* Lista de avaliações */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {r.fromUser.avatarUrl
                      ? <img src={r.fromUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="text-sm font-black text-on-surface-variant">{r.fromUser.name.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{r.fromUser.name}</p>
                    <p className="text-xs text-on-surface-variant">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Icon key={s} name="star" fill={s <= r.rating} className={`text-sm ${s <= r.rating ? "text-yellow-500" : "text-outline"}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-on-surface-variant leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">Este vendedor ainda não tem avaliações.</p>
        )}

        {/* Formulário de avaliação */}
        {user && user.id !== vehicle.user.id && !reviewSent && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Avaliar vendedor</h3>
            {reviewError && (
              <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
                <Icon name="error" className="text-lg flex-shrink-0" />{reviewError}
              </div>
            )}
            <form onSubmit={submitReview} className="space-y-4">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                    <Icon name="star" fill={s <= reviewForm.rating} className={`text-2xl transition-colors ${s <= reviewForm.rating ? "text-yellow-500" : "text-outline hover:text-yellow-400"}`} />
                  </button>
                ))}
                <span className="text-sm text-on-surface-variant ml-2">{["","Ruim","Regular","Bom","Muito bom","Excelente"][reviewForm.rating]}</span>
              </div>
              <textarea
                rows={3}
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Conte sua experiência com este vendedor (opcional)..."
                className="w-full bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="flex items-center gap-2 bg-primary-container text-on-primary-container font-black px-8 py-2.5 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60"
              >
                {submittingReview && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
                <Icon name="star" className="text-base" />
                Enviar avaliação
              </button>
            </form>
          </div>
        )}

        {reviewSent && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
            <Icon name="check_circle" className="text-lg flex-shrink-0" />Avaliação enviada com sucesso!
          </div>
        )}
      </section>

      <div className="mt-12 pt-8 border-t border-outline-variant/30">
        <Link href="/busca" className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
          <Icon name="arrow_back" className="text-lg" />Voltar para a busca
        </Link>
      </div>

    </div>
  );
}
