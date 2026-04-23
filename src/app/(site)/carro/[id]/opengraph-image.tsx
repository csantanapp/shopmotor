import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "ShopMotor — Anúncio de veículo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: { id: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.shopmotor.com.br";

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
      select: {
        brand: true, model: true, version: true,
        yearFab: true, yearModel: true, km: true, price: true,
        city: true, state: true, condition: true,
        photos: { where: { isCover: true }, take: 1, select: { url: true } },
      },
    });

    if (!vehicle) return fallback(baseUrl);

    const price = vehicle.price.toLocaleString("pt-BR", {
      style: "currency", currency: "BRL", minimumFractionDigits: 0,
    });
    const km = vehicle.km === 0 ? "0 km" : `${vehicle.km.toLocaleString("pt-BR")} km`;
    const year = `${vehicle.yearFab}/${vehicle.yearModel}`;
    const photo = vehicle.photos[0]?.url;
    const location = vehicle.city && vehicle.state ? `${vehicle.city} — ${vehicle.state}` : "";

    return new ImageResponse(
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          fontFamily: "sans-serif",
          background: "#0c0f0f",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background car image (blurred, full width) */}
        {photo && (
          <img
            src={photo}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.25,
            }}
          />
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(12,15,15,0.95) 40%, rgba(12,15,15,0.6) 100%)",
            display: "flex",
          }}
        />

        {/* Left: car photo */}
        {photo && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: 580,
              height: 630,
              display: "flex",
            }}
          >
            <img
              src={photo}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to right, #0c0f0f 0%, transparent 40%)",
                display: "flex",
              }}
            />
          </div>
        )}

        {/* Content */}
        <div
          style={{
            position: "absolute",
            left: 60,
            top: 0,
            bottom: 0,
            width: 620,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 0,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div
              style={{
                background: "#e63946",
                borderRadius: 8,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                ShopMotor
              </span>
            </div>
          </div>

          {/* Brand + Model */}
          <div style={{ color: "#ffffff", fontSize: 52, fontWeight: 800, lineHeight: 1.1, display: "flex", flexDirection: "column" }}>
            <span>{vehicle.brand}</span>
            <span>{vehicle.model}</span>
          </div>

          {/* Version */}
          {vehicle.version && (
            <div style={{ color: "#94a3b8", fontSize: 22, marginTop: 8, display: "flex" }}>
              {vehicle.version}
            </div>
          )}

          {/* Tags row */}
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <span
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                padding: "6px 14px",
                color: "#e2e8f0",
                fontSize: 16,
                display: "flex",
              }}
            >
              {year}
            </span>
            <span
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                padding: "6px 14px",
                color: "#e2e8f0",
                fontSize: 16,
                display: "flex",
              }}
            >
              {km}
            </span>
            {location && (
              <span
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 6,
                  padding: "6px 14px",
                  color: "#e2e8f0",
                  fontSize: 16,
                  display: "flex",
                }}
              >
                {location}
              </span>
            )}
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 32 }}>
            <span style={{ color: "#e63946", fontSize: 48, fontWeight: 800, display: "flex" }}>
              {price}
            </span>
          </div>

          {/* CTA */}
          <div style={{ color: "#64748b", fontSize: 16, marginTop: 16, display: "flex" }}>
            www.shopmotor.com.br
          </div>
        </div>
      </div>,
      { ...size }
    );
  } catch {
    return fallback(baseUrl);
  }
}

function fallback(baseUrl: string) {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0c0f0f",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          background: "#e63946",
          borderRadius: 12,
          padding: "12px 28px",
          display: "flex",
        }}
      >
        <span style={{ color: "#fff", fontSize: 48, fontWeight: 800 }}>ShopMotor</span>
      </div>
      <span style={{ color: "#94a3b8", fontSize: 24, display: "flex" }}>
        Compre e venda veículos com segurança
      </span>
    </div>,
    { ...size }
  );
}
