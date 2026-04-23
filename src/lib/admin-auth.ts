import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "shopmotor_secret_2024_xK9mP2qR");

export async function requireAdmin(_req?: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("shopmotor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if ((payload as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
