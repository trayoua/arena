import { NextResponse } from "next/server";
import { orderSubmissionSchema } from "@/lib/order-schema";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getClientIp, hashForRateLimit, isSameOrigin } from "@/lib/security";
import { dispatchOrderEmails } from "@/lib/order-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 16_000;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 403 });
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY) {
    return NextResponse.json({ error: "Заявката е твърде голяма." }, { status: 413 });
  }

  let json: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) {
      return NextResponse.json({ error: "Заявката е твърде голяма." }, { status: 413 });
    }
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Невалидни данни." }, { status: 400 });
  }

  const parsed = orderSubmissionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Моля, проверете попълнените полета.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;
  if (data.website) {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const ipHash = hashForRateLimit(getClientIp(request));
  const emailHash = hashForRateLimit(data.email);

  const [ipAllowed, emailAllowed] = await Promise.all([
    supabase.rpc("consume_rate_limit", { p_key: `order:ip:${ipHash}`, p_limit: 6, p_window_seconds: 600 }),
    supabase.rpc("consume_rate_limit", { p_key: `order:email:${emailHash}`, p_limit: 4, p_window_seconds: 3600 }),
  ]);
  if (ipAllowed.error || emailAllowed.error) {
    console.error("Rate limit error", ipAllowed.error || emailAllowed.error);
    return NextResponse.json({ error: "Временна техническа грешка. Опитайте отново след малко." }, { status: 503 });
  }
  if (!ipAllowed.data || !emailAllowed.data) {
    return NextResponse.json({ error: "Твърде много заявки. Опитайте отново по-късно." }, { status: 429 });
  }

  let product: { id: string; name: string; volume: string; price_cents: number | null; currency: string } | null = null;
  if (data.kind === "order") {
    const { data: row, error } = await supabase
      .from("products")
      .select("id,name,volume,price_cents,currency")
      .eq("id", data.product!)
      .eq("is_active", true)
      .maybeSingle();
    if (error) {
      console.error("Product lookup error", error);
      return NextResponse.json({ error: "Временна техническа грешка. Опитайте отново след малко." }, { status: 503 });
    }
    if (!row) {
      return NextResponse.json({ error: "Избраният продукт не е наличен." }, { status: 400 });
    }
    product = row;
  }

  const unitPrice = product?.price_cents ?? null;
  const totalPrice = unitPrice === null ? null : unitPrice * data.quantity;
  const insert = {
    kind: data.kind,
    product_id: product?.id ?? null,
    product_name: product?.name ?? null,
    product_volume: product?.volume ?? null,
    quantity: data.kind === "order" ? data.quantity : 1,
    unit_price_cents: unitPrice,
    total_price_cents: totalPrice,
    currency: product?.currency ?? "EUR",
    customer_name: data.name,
    customer_email: data.email,
    customer_phone: data.phone,
    message: data.message,
    consent: data.consent,
    idempotency_key: data.idempotencyKey,
    ip_hash: ipHash,
    email_hash: emailHash,
  };

  const { data: created, error } = await supabase
    .from("orders")
    .insert(insert)
    .select("id,reference,kind,quantity,total_price_cents,currency")
    .single();

  if (error) {
    if (error.code === "23505") {
        const { data: existing, error: existingError } = await supabase
          .from("orders")
          .select("id,reference,kind,quantity,total_price_cents,currency")
          .eq("idempotency_key", data.idempotencyKey)
          .maybeSingle();
      if (!existingError && existing) {
        const emails = await dispatchOrderEmails(existing.id).catch((emailError) => {
          console.error("Duplicate order email retry failed", emailError);
          return null;
        });
        return NextResponse.json({
          ok: true,
          reference: existing.reference,
          kind: existing.kind,
          duplicate: true,
          emails,
          summary: {
            quantity: existing.quantity,
            totalPriceCents: existing.total_price_cents,
            currency: existing.currency,
          },
        });
      }
    }
    console.error("Order insert error", error);
    return NextResponse.json({ error: "Не успяхме да запишем заявката. Опитайте отново след малко." }, { status: 503 });
  }

  const emails = await dispatchOrderEmails(created.id).catch((emailError) => {
    console.error("Order email dispatch failed", emailError);
    return null;
  });

  return NextResponse.json({
    ok: true,
    reference: created.reference,
    kind: created.kind,
    emails,
    summary: {
      quantity: created.quantity,
      totalPriceCents: created.total_price_cents,
      currency: created.currency,
    },
  });
}
