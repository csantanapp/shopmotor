import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

function resolveJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("[shopmotor] JWT_SECRET environment variable is not set. Define it before starting the server.");
  return new TextEncoder().encode(secret);
}
const JWT_SECRET = resolveJwtSecret();

export async function requireAdmin(_req?: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("shopmotor_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if ((payload as { role?: string }).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
