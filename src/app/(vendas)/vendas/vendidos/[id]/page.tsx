"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

interface Photo   { url: string; isCover: boolean; order: number; }
interface Feature { name: string; }
interface Sale {
  soldAt: string;
  valorVenda?: number;
  buyerNome?: string;
  buyerDocumento?: string;
  buyerTelefone?: string;
  buyerEmail?: string;
  observacao?: string;
}
interface Vehicle {
  id: string;
  brand: string; model: string; version?: string; bodyType?: string;
  yearFab: number; yearModel: number; km: number;
  fuel: string; transmission: string; color?: string;
  doors?: number; cylindercc?: number; vehicleType: string;
  condition: string; price: number;
  description?: string; city?: string; state?: string;
  createdAt: string; updatedAt: string;
  photos: Photo[];
  features: Feature[];
}

function fmt(n?: number | null) {
  if (n == null) return "—";
  return `R$ ${n.toLocaleString("pt-BR")}`;
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
      <span className="text-xs text-gray-400 uppercase tracking-wide font-black">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-black/5 pb-4 mb-4">
        <Icon name={icon} className="text-gray-400 text-lg" />
        <h2 className="font-black text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function VendidoDetalhePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [sale, setSale]       = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`/api/vehicles/${id}`).then(r => r.json()),
      fetch(`/api/vehicles/${id}/vender`).then(r => r.json()),
    ]).then(([vd, sd]) => {
      const v = vd.vehicle;
      if (!v) { router.push("/vendas/vendidos"); return; }
      v.photos = [...(v.photos ?? [])].sort((a: Photo, b: Photo) => a.order - b.order);
      setVehicle(v);
      setSale(sd.sale ?? null);
      setLoading(false);
    }).catch(() => router.push("/vendas/vendidos"));
  }, [id, router]);

  if (loading) return (
    <ErpLayout title="Ficha do Vendido" subtitle="">
      <div className="flex items-center justify-center py-32">
        <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
      </div>
    </ErpLayout>
  );

  if (!vehicle) return null;

  const isMoto    = vehicle.vehicleType === "MOTO";
  const allPhotos = vehicle.photos;
  const currentPhoto = allPhotos[photoIdx];

  return (
    <ErpLayout
      title={`${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""}`}
      subtitle={`Vendido · ${vehicle.yearFab} · ${vehicle.km.toLocaleString("pt-BR")} km`}
    >
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push("/vendas/vendidos")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
          <Icon name="arrow_back" className="text-base" /> Voltar a Vendidos
        </button>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-green-100 text-green-700 border border-green-200 px-3 py-1 text-xs font-black">
            <Icon name="sell" className="text-xs" /> VENDIDO
          </span>
          {sale?.soldAt && (
            <span className="text-sm text-gray-400">
              em {new Date(sale.soldAt).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left — vehicle info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Gallery */}
          {allPhotos.length > 0 && (
            <div className="rounded-xl border border-black/10 bg-white overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-gray-100">
                <img src={currentPhoto?.url} alt="" className="w-full h-full object-cover" />
                {allPhotos.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition">
                      <Icon name="chevron_left" className="text-white text-xl" />
                    </button>
                    <button onClick={() => setPhotoIdx(i => (i + 1) % allPhotos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition">
                      <Icon name="chevron_right" className="text-white text-xl" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-black px-2 py-1 rounded-full">
                      {photoIdx + 1} / {allPhotos.length}
                    </div>
                  </>
                )}
              </div>
              {allPhotos.length > 1 && (
                <div className="flex gap-1.5 p-3 overflow-x-auto">
                  {allPhotos.map((p, i) => (
                    <button key={i} onClick={() => setPhotoIdx(i)}
                      className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition ${i === photoIdx ? "border-primary-container" : "border-transparent"}`}>
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Identificação */}
          <Section title="Identificação" icon="directions_car">
            <div className="space-y-0">
              <InfoRow label="Marca" value={vehicle.brand} />
              <InfoRow label="Modelo" value={vehicle.model} />
              <InfoRow label="Versão" value={vehicle.version} />
              <InfoRow label="Ano fabricação" value={vehicle.yearFab} />
              <InfoRow label="Ano modelo" value={vehicle.yearModel} />
              <InfoRow label="Condição" value={vehicle.condition === "NEW" ? "Novo" : "Usado"} />
              {!isMoto && <InfoRow label="Carroceria" value={vehicle.bodyType} />}
              <InfoRow label="Localização" value={vehicle.city && vehicle.state ? `${vehicle.city} / ${vehicle.state}` : (vehicle.city ?? vehicle.state)} />
            </div>
          </Section>

          {/* Especificações */}
          <Section title="Especificações" icon="settings">
            <div className="space-y-0">
              <InfoRow label="Quilometragem" value={`${vehicle.km.toLocaleString("pt-BR")} km`} />
              <InfoRow label="Combustível" value={vehicle.fuel} />
              <InfoRow label="Câmbio" value={vehicle.transmission} />
              <InfoRow label="Cor" value={vehicle.color} />
              {!isMoto && <InfoRow label="Portas" value={vehicle.doors ? `${vehicle.doors} portas` : null} />}
              {isMoto && <InfoRow label="Cilindrada" value={vehicle.cylindercc ? `${vehicle.cylindercc} cc` : null} />}
            </div>
          </Section>

          {/* Opcionais */}
          {vehicle.features.length > 0 && (
            <Section title="Opcionais e características" icon="star">
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map(f => (
                  <span key={f.name} className="rounded-full border border-black/10 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
                    {f.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Descrição */}
          {vehicle.description && (
            <Section title="Descrição" icon="description">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
            </Section>
          )}
        </div>

        {/* Right — sale + buyer */}
        <div className="space-y-6">

          {/* Valor da venda */}
          <Section title="Venda" icon="sell">
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-4">
              <p className="text-xs font-black uppercase tracking-wide text-green-700 mb-1">Valor vendido</p>
              <p className="text-2xl font-black text-green-800">{fmt(sale?.valorVenda ?? vehicle.price)}</p>
              {sale?.soldAt && (
                <p className="text-xs text-green-600 mt-1">
                  {new Date(sale.soldAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            {sale?.observacao && (
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">Observações</p>
                <p className="text-sm text-gray-600">{sale.observacao}</p>
              </div>
            )}
          </Section>

          {/* Dados do comprador */}
          <Section title="Dados do comprador" icon="person">
            {!sale?.buyerNome && !sale?.buyerDocumento && !sale?.buyerTelefone && !sale?.buyerEmail ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Icon name="person_off" className="text-3xl text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">Dados do comprador não informados.</p>
              </div>
            ) : (
              <div className="space-y-0">
                <InfoRow label="Nome" value={sale?.buyerNome} />
                <InfoRow label="CPF / CNPJ" value={sale?.buyerDocumento} />
                <InfoRow label="Telefone" value={sale?.buyerTelefone} />
                <InfoRow label="E-mail" value={sale?.buyerEmail} />
              </div>
            )}
            {sale?.buyerTelefone && (
              <a href={`https://wa.me/55${sale.buyerTelefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-black text-white hover:opacity-90 transition w-full justify-center">
                <Icon name="chat" className="text-sm" /> WhatsApp
              </a>
            )}
          </Section>

          {/* Meta */}
          <div className="rounded-xl border border-black/10 bg-white p-4 shadow-sm text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Cadastrado em</span>
              <span>{new Date(vehicle.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span>Vendido em</span>
              <span>{sale?.soldAt ? new Date(sale.soldAt).toLocaleDateString("pt-BR") : new Date(vehicle.updatedAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>

          {/* Link para ficha completa */}
          <Link href={`/vendas/estoque/${id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50 transition">
            <Icon name="inventory" className="text-sm" /> Ver ficha do estoque
          </Link>
        </div>
      </div>
    </ErpLayout>
  );
}
