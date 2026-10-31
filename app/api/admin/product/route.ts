import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isSameOrigin, verifySessionToken } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().min(1).max(100),
  priceEur: z.union([z.number().min(0).max(10000), z.null()]),
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
    return NextResponse.json({ error: "Невалидна цена." }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  const priceCents = parsed.data.priceEur === null ? null : Math.round(parsed.data.priceEur * 100);
  const { error } = await supabase
    .from("products")
    .update({ price_cents: priceCents })
    .eq("id", parsed.data.id);
  if (error) {
    return NextResponse.json({ error: "Неуспешен запис." }, { status: 503 });
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true, priceCents });
}
