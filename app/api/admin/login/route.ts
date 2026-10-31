import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createSessionToken, getClientIp, hashForRateLimit, isSameOrigin, verifyPassword } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 403 });
  }
  let password = "";
  try {
    const body = await request.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Невалидни данни." }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const ipHash = hashForRateLimit(getClientIp(request));
  const { data: allowed, error } = await supabase.rpc("consume_rate_limit", {
    p_key: `admin:ip:${ipHash}`,
    p_limit: 8,
    p_window_seconds: 900,
  });
  if (error) {
    return NextResponse.json({ error: "Временна техническа грешка." }, { status: 503 });
  }
  if (!allowed) {
    return NextResponse.json({ error: "Твърде много опити. Опитайте по-късно." }, { status: 429 });
  }
  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: "Грешна парола." }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set("decucare_admin", createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return NextResponse.json({ ok: true });
}
