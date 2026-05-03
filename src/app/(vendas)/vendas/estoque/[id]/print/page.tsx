"use client";

import { useEffect, useState, useRef } from "react";

/* ── types ── */
interface Feature { name: string; }
interface Photo   { url: string; isCover: boolean; order: number; }
interface Aquisicao { valorFinalAquisicao?: number; valorPago?: number; valorNotaFiscal?: number; }
interface Vehicle {
  id: string;
  brand: string; model: string; version?: string;
  yearFab: number; yearModel: number; km: number;
  fuel: string; transmission: string; color?: string;
  doors?: number; cylindercc?: number; vehicleType: string;
  condition: string; price: number;
  description?: string; city?: string; state?: string;
  fipeBrandCode?: string; fipeModelCode?: string; fipeYearCode?: string;
  fipePrice?: number;
  photos: Photo[]; features: Feature[];
  aquisicao?: Aquisicao;
}
interface Store {
  name: string; companyName?: string; tradeName?: string;
  storeBannerUrl?: string; city?: string; state?: string;
  phone?: string;
}

function fmt(n?: number | null) {
  if (n == null) return "—";
  return `R$ ${n.toLocaleString("pt-BR")}`;
}

const FEATURE_GROUPS = [
  ["Ar condicionado","Direção hidráulica/elétrica","Vidros elétricos","Travas elétricas","Retrovisores elétricos","Bancos em couro","Piloto automático"],
  ["Airbag","Freio ABS","Controle de tração"],
  ["Carplay","Sensor de estacionamento","Faróis de LED/Xenon","Teto solar","Rodas liga leve","Tração 4x4"],
  ["IPVA Pago","Licenciado","Único dono","Garantia de fábrica","Todas revisões feitas pela concessionária"],
];

export default function PrintFicha({ params }: { params: { id: string } }) {
  const { id } = params;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [store, setStore]     = useState<Store | null>(null);
  const [fipeAtual, setFipeAtual] = useState<number | null>(null);
  const printed = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/vehicles/${id}`).then(r => r.json()),
      fetch(`/api/vehicles/${id}/aquisicao`).then(r => r.json()),
      fetch("/api/user/profile").then(r => r.json()),
    ]).then(([vd, aqd, sd]) => {
      const v: Vehicle = vd.vehicle;
      if (!v) return;
      v.aquisicao = aqd.aquisicao;
      v.photos = [...(v.photos ?? [])].sort((a, b) => a.order - b.order);
      setVehicle(v);
      setStore(sd.user ?? sd);

      if (v.fipeBrandCode && v.fipeModelCode && v.fipeYearCode) {
        const type = v.vehicleType === "MOTO" ? "MOTO" : "CAR";
        fetch(`/api/fipe/brands/${v.fipeBrandCode}/models/${v.fipeModelCode}/years/${v.fipeYearCode}?vehicleType=${type}`)
          .then(r => r.json())
          .then(fipe => {
            if (fipe?.price) {
              setFipeAtual(Math.round(Number(fipe.price.replace(/[^\d,]/g, "").replace(",", "."))));
            }
          })
          .catch(() => {});
      }
    });
  }, [id]);

  // auto-print once data is loaded
  useEffect(() => {
    if (vehicle && store && !printed.current) {
      printed.current = true;
      setTimeout(() => window.print(), 600);
    }
  }, [vehicle, store]);

  if (!vehicle || !store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
      </div>
    );
  }

  const coverPhoto = vehicle.photos.find(p => p.isCover) ?? vehicle.photos[0];
  const otherPhotos = vehicle.photos.filter(p => !p.isCover).slice(0, 3);
  const storeName = store.tradeName ?? store.companyName ?? store.name;
  const aq = vehicle.aquisicao;
  const custoAquisicao = aq?.valorFinalAquisicao ?? aq?.valorPago ?? aq?.valorNotaFiscal ?? null;
  const margemPrevista = custoAquisicao != null ? vehicle.price - custoAquisicao : null;
  const vehicleFeatures = vehicle.features.map(f => f.name);
  const fipeEntrada = vehicle.fipePrice ?? null;

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 12mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        * { box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: #fff; color: #111; margin: 0; }
      `}</style>

      {/* Print button — hidden on print */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-gray-800 transition">
          🖨️ Imprimir
        </button>
        <button onClick={() => window.close()}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-gray-200 transition">
          ✕ Fechar
        </button>
      </div>

      {/* ══ FICHA — HORIZONTAL A4 ══ */}
      <div style={{ width: "100%", minHeight: "190mm", background: "#fff", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* HEADER — Logo ShopMotor + Logo Cliente + Título */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "3px solid #ffd709", paddingBottom: "10px", marginBottom: "14px" }}>
          {/* ShopMotor logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ffd709", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900 }}>
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#111", lineHeight: 1 }}>ShopMotor</div>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#888", letterSpacing: "0.15em", textTransform: "uppercase" }}>Gestão de estoque</div>
            </div>
          </div>

          {/* Vehicle title (center) */}
          <div style={{ textAlign: "center", flex: 1, padding: "0 20px" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#111", lineHeight: 1.1 }}>
              {vehicle.brand} {vehicle.model}
            </div>
            {vehicle.version && (
              <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{vehicle.version}</div>
            )}
          </div>

          {/* Store logo / name */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", textAlign: "right" }}>
            {store.storeBannerUrl ? (
              <img src={store.storeBannerUrl} alt={storeName} style={{ height: 40, maxWidth: 120, objectFit: "contain", borderRadius: 6 }} />
            ) : (
              <div style={{ fontSize: 13, fontWeight: 900, color: "#333" }}>{storeName}</div>
            )}
            {store.city && (
              <div style={{ fontSize: 10, color: "#888" }}>{store.city}{store.state ? `/${store.state}` : ""}</div>
            )}
          </div>
        </div>

        {/* BODY — 3 colunas */}
        <div style={{ display: "flex", gap: "14px", flex: 1 }}>

          {/* COL 1 — Fotos */}
          <div style={{ width: "30%", display: "flex", flexDirection: "column", gap: 6 }}>
            {coverPhoto ? (
              <img src={coverPhoto.url} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
            ) : (
              <div style={{ width: "100%", aspectRatio: "4/3", background: "#f5f5f5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🚗</div>
            )}
            {otherPhotos.length > 0 && (
              <div style={{ display: "flex", gap: 4 }}>
                {otherPhotos.map((p, i) => (
                  <img key={i} src={p.url} alt="" style={{ flex: 1, aspectRatio: "4/3", objectFit: "cover", borderRadius: 5, border: "1px solid #eee" }} />
                ))}
              </div>
            )}
          </div>

          {/* COL 2 — Dados + Especificações */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Dados principais */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <tbody>
                {[
                  ["Ano / Modelo",  `${vehicle.yearFab} / ${vehicle.yearModel}`],
                  ["Quilometragem", `${vehicle.km.toLocaleString("pt-BR")} km`],
                  ["Combustível",   vehicle.fuel],
                  ["Câmbio",        vehicle.transmission],
                  ["Cor",           vehicle.color ?? "—"],
                  ...(vehicle.vehicleType !== "MOTO" && vehicle.doors ? [["Portas", `${vehicle.doors} portas`]] : []),
                  ...(vehicle.vehicleType === "MOTO" && vehicle.cylindercc ? [["Cilindrada", `${vehicle.cylindercc} cc`]] : []),
                  ["Condição",      vehicle.condition === "NEW" ? "Novo" : "Usado"],
                  ...(vehicle.city ? [["Localização", `${vehicle.city}${vehicle.state ? `/${vehicle.state}` : ""}`]] : []),
                ].map(([label, value], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                    <td style={{ padding: "4px 8px", fontWeight: 700, color: "#666", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", width: "40%", borderBottom: "1px solid #f0f0f0" }}>{label}</td>
                    <td style={{ padding: "4px 8px", fontWeight: 700, color: "#111", borderBottom: "1px solid #f0f0f0" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Opcionais */}
            {vehicleFeatures.length > 0 && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>Opcionais e características</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {vehicleFeatures.map((f, i) => (
                    <span key={i} style={{ fontSize: 9, background: "#f5f5f5", border: "1px solid #e5e5e5", borderRadius: 20, padding: "2px 7px", fontWeight: 700, color: "#444" }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição */}
            {vehicle.description && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Descrição</div>
                <p style={{ fontSize: 10, color: "#555", lineHeight: 1.5, margin: 0, maxHeight: 56, overflow: "hidden" }}>{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* COL 3 — Valores + FIPE */}
          <div style={{ width: "26%", display: "flex", flexDirection: "column", gap: 8 }}>

            {/* Valor de venda */}
            <div style={{ background: "#ffd709", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#7a6200", marginBottom: 4 }}>Valor de venda</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#111", lineHeight: 1 }}>{fmt(vehicle.price)}</div>
            </div>

            {/* Custo / Margem — apenas para uso interno, pode omitir para cliente */}
            {custoAquisicao != null && (
              <div style={{ border: "1px solid #eee", borderRadius: 10, padding: "10px 12px", background: "#fafafa" }}>
                <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", marginBottom: 6 }}>Dados internos</div>
                <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "2px 0", color: "#666" }}>Custo aquisição</td>
                      <td style={{ padding: "2px 0", fontWeight: 700, textAlign: "right" }}>{fmt(custoAquisicao)}</td>
                    </tr>
                    {margemPrevista != null && (
                      <tr>
                        <td style={{ padding: "2px 0", color: "#666" }}>Margem prevista</td>
                        <td style={{ padding: "2px 0", fontWeight: 900, textAlign: "right", color: margemPrevista > 0 ? "#16a34a" : "#dc2626" }}>
                          {fmt(margemPrevista)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* FIPE */}
            {(fipeEntrada || fipeAtual) && (
              <div style={{ border: "1px solid #eee", borderRadius: 10, padding: "10px 12px", background: "#fafafa" }}>
                <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999", marginBottom: 6 }}>Tabela FIPE</div>
                <table style={{ width: "100%", fontSize: 10, borderCollapse: "collapse" }}>
                  <tbody>
                    {fipeEntrada != null && (
                      <tr>
                        <td style={{ padding: "2px 0", color: "#666" }}>Valor na entrada</td>
                        <td style={{ padding: "2px 0", fontWeight: 700, textAlign: "right" }}>{fmt(fipeEntrada)}</td>
                      </tr>
                    )}
                    {fipeAtual != null && (
                      <tr>
                        <td style={{ padding: "2px 0", color: "#666" }}>Valor atual</td>
                        <td style={{ padding: "2px 0", fontWeight: 700, textAlign: "right" }}>{fmt(fipeAtual)}</td>
                      </tr>
                    )}
                    {fipeEntrada != null && fipeAtual != null && (
                      <tr>
                        <td style={{ padding: "2px 0", color: "#666" }}>Variação</td>
                        <td style={{ padding: "2px 0", fontWeight: 900, textAlign: "right", color: fipeAtual >= fipeEntrada ? "#16a34a" : "#dc2626" }}>
                          {fipeAtual >= fipeEntrada ? "+" : ""}{fmt(fipeAtual - fipeEntrada)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rodapé da coluna */}
            <div style={{ marginTop: "auto", fontSize: 9, color: "#bbb", textAlign: "center", paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
              Ficha gerada em {new Date().toLocaleDateString("pt-BR")} via ShopMotor
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
