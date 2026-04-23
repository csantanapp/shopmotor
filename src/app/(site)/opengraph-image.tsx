import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "ShopMotor — Compre e venda veículos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        background: "#0c0f0f",
        position: "relative",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(230,57,70,0.15) 0%, transparent 70%)",
          display: "flex",
        }}
      />

      {/* Accent line decoration */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "#e63946",
          display: "flex",
        }}
      />

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          zIndex: 10,
        }}
      >
        {/* Logo badge */}
        <div
          style={{
            background: "#e63946",
            borderRadius: 16,
            padding: "16px 40px",
            display: "flex",
            boxShadow: "0 0 60px rgba(230,57,70,0.4)",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -2,
              display: "flex",
            }}
          >
            ShopMotor
          </span>
        </div>

        {/* Tagline */}
        <span
          style={{
            color: "#cbd5e1",
            fontSize: 28,
            fontWeight: 400,
            textAlign: "center",
            display: "flex",
          }}
        >
          A plataforma para comprar e vender veículos com segurança
        </span>

        {/* Stats pills */}
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {["Carros", "Motos", "Caminhões", "Barcos"].map((cat) => (
            <span
              key={cat}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 50,
                padding: "8px 20px",
                color: "#94a3b8",
                fontSize: 18,
                display: "flex",
              }}
            >
              {cat}
            </span>
          ))}
        </div>

        <span style={{ color: "#475569", fontSize: 18, display: "flex", marginTop: 4 }}>
          www.shopmotor.com.br
        </span>
      </div>
    </div>,
    { ...size }
  );
}
