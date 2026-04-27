import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getGeoFromIp(ip: string) {
  try {
    if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.")) return {};
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,status`, { signal: AbortSignal.timeout(1500) });
    const data = await res.json();
    if (data.status === "success") return { country: data.country, region: data.regionName, city: data.city };
  } catch {}
  return {};
}

export async function POST(req: NextRequest) {
  try {
    const { path, referrer, sessionId } = await req.json();

    if (path?.startsWith("/admin")) return NextResponse.json({ ok: true });

    const ua = req.headers.get("user-agent") ?? "";
    const device = /Mobile|Android|iPhone|iPad/i.test(ua)
      ? /iPad/i.test(ua) ? "tablet" : "mobile"
      : "desktop";

    const cfCountry = req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry");
    const cfRegion = req.headers.get("x-vercel-ip-country-region") ?? req.headers.get("cf-ipcountry-region");
    const cfCity = req.headers.get("x-vercel-ip-city") ?? req.headers.get("cf-ipcity");

    let country = cfCountry ?? null;
    let region = cfRegion ?? null;
    let city = cfCity ?? null;

    if (!country) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "";
      const geo = await getGeoFromIp(ip);
      country = geo.country ?? null;
      region = geo.region ?? null;
      city = geo.city ?? null;
    }

    await prisma.pageView.create({
      data: { path: path ?? "/", referrer: referrer || null, device, country, region, city, sessionId: sessionId || null },
    });
  } catch {
    // silent
  }
  return NextResponse.json({ ok: true });
}
