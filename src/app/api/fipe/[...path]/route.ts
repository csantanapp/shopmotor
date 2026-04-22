import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const vehicleType = req.nextUrl.searchParams.get("vehicleType");
  const fipeBase = vehicleType === "MOTO"
    ? "https://parallelum.com.br/fipe/api/v2/motorcycles"
    : "https://parallelum.com.br/fipe/api/v2/cars";
  const url = `${fipeBase}/${path.join("/")}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // cache 24h
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) return NextResponse.json({ error: "FIPE error" }, { status: res.status });

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Falha ao consultar FIPE" }, { status: 502 });
  }
}
