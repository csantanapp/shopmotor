import { NextRequest, NextResponse } from "next/server";
import { revokeSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (token) {
    await revokeSession(token);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
