import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { isSameOrigin, verifySessionToken } from "@/lib/security";
import { dispatchOrderEmails } from "@/lib/order-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ id: z.string().uuid() });

export async function POST(request: Request) {
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
  try {
    const emails = await dispatchOrderEmails(parsed.data.id);
    return NextResponse.json({ ok: true, emails });
  } catch (error) {
    console.error("Admin email retry failed", error);
    return NextResponse.json(
      { error: "Не успяхме да изпратим имейлите. Опитайте отново след малко." },
      { status: 503 },
    );
  }
}
