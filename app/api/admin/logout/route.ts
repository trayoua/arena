import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 403 });
  }
  const cookieStore = await cookies();
  cookieStore.delete("decucare_admin");
  return NextResponse.json({ ok: true });
}
