import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSameOrigin, verifySessionToken } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "completed", "cancelled"]),
});

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get("decucare_admin")?.value)) {
    return NextResponse.json({ error: "Неоторизиран достъп." }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Невалидни данни." }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) {
    return NextResponse.json({ error: "Неуспешен запис." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
