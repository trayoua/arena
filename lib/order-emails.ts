import "server-only";
import { z } from "zod";
import { business, deliveryPayment } from "@/lib/content";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type EmailStatus = "pending" | "sending" | "sent" | "failed" | "skipped";

export type OrderEmailRow = {
  id: string;
  reference: string;
  kind: "order" | "question";
  product_name: string | null;
  product_volume: string | null;
  quantity: number;
  unit_price_cents: number | null;
  total_price_cents: number | null;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  message: string | null;
  created_at: string;
  owner_email_status: EmailStatus;
  customer_email_status: EmailStatus;
  email_attempts: number;
  email_last_attempt_at: string | null;
};

type MailgunConfig = {
  apiKey: string;
  domain: string;
  from: string;
  ownerEmail: string;
  baseUrl: string;
};

const ownerEmailSchema = z.string().trim().email().max(254);

function getMailgunConfig(): MailgunConfig | null {
  const apiKey = process.env.MAILGUN_API_KEY?.trim();
  const domain = process.env.MAILGUN_DOMAIN?.trim();
  const from = process.env.MAILGUN_FROM?.trim();
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL?.trim();
  const region = process.env.MAILGUN_REGION?.trim().toLowerCase() || "us";
  if (!apiKey || !domain || !from || !ownerEmail) return null;
  if (!ownerEmailSchema.safeParse(ownerEmail).success) return null;
  if (region !== "us" && region !== "eu") return null;
  return {
    apiKey,
    domain,
    from,
    ownerEmail,
    baseUrl: region === "eu" ? "https://api.eu.mailgun.net/v3" : "https://api.mailgun.net/v3",
  };
}

export function isEmailConfigured() {
  return getMailgunConfig() !== null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(cents: number | null, currency: string) {
  if (cents === null) return "Очаква потвърждение";
  const amount = (cents / 100).toFixed(2);
  return currency === "EUR" ? `${amount} €` : `${amount} ${currency}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  }).format(new Date(value));
}

function productSummary(order: OrderEmailRow) {
  if (!order.product_name) return "—";
  return `${order.quantity} × ${order.product_name}${order.product_volume ? ` · ${order.product_volume}` : ""}`;
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://decucare-arena.vercel.app").replace(/\/$/, "");
}

function buildOwnerEmail(order: OrderEmailRow) {
  const isOrder = order.kind === "order";
  const subject = isOrder
    ? `Нова поръчка ${order.reference} · DECUCARE`
    : `Ново запитване ${order.reference} · DECUCARE`;
  const adminUrl = `${siteUrl()}/admin`;
  const rows: Array<[string, string]> = [
    ["Номер", order.reference],
    ["Тип", isOrder ? "Поръчка" : "Въпрос"],
    ["Дата", formatDate(order.created_at)],
    ["Клиент", order.customer_name],
    ["Имейл", order.customer_email],
    ["Телефон", order.customer_phone || "—"],
    ["Артикул", productSummary(order)],
    ["Общо", formatMoney(order.total_price_cents, order.currency)],
    ...(isOrder
      ? ([["Плащане", `${deliveryPayment.method} при получаване`]] as Array<[string, string]>)
      : []),
    ["Съобщение", order.message || "—"],
  ];
  const text = [
    isOrder ? "Нова поръчка от сайта на DECUCARE." : "Ново запитване от сайта на DECUCARE.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Преглед в администрацията: ${adminUrl}`,
    "",
    "Това е автоматично известие. Заявката вече е записана в базата данни.",
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#2f2a3a;line-height:1.6">
      <h2 style="color:#5b3e8f">${isOrder ? "Нова поръчка" : "Ново запитване"} · DECUCARE</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="border-bottom:1px solid #eee1f5;font-weight:bold">${escapeHtml(label)}</td><td style="border-bottom:1px solid #eee1f5">${escapeHtml(value)}</td></tr>`,
          )
          .join("")}
      </table>
      <p><a href="${escapeHtml(adminUrl)}" style="color:#5b3e8f">Отвори администрацията</a></p>
      <p style="color:#6f6880;font-size:13px">Заявката вече е записана в базата данни. Това е автоматично известие.</p>
    </div>`;
  return { to: getMailgunConfig()!.ownerEmail, subject, text, html, replyTo: order.customer_email };
}

function buildCustomerEmail(order: OrderEmailRow) {
  const isOrder = order.kind === "order";
  const subject = isOrder
    ? `Получихме вашата поръчка ${order.reference} · DECUCARE`
    : `Получихме вашия въпрос ${order.reference} · DECUCARE`;
  const url = siteUrl();
  const summary = isOrder
    ? `${productSummary(order)}\nОбщо: ${formatMoney(order.total_price_cents, order.currency)}`
    : `Съобщение: ${order.message || "—"}`;
  const text = [
    `Здравейте, ${order.customer_name},`,
    "",
    isOrder
      ? "Благодарим ви! Получихме вашата заявка за DECUCARE и я записахме успешно."
      : "Благодарим ви! Получихме вашия въпрос към DECUCARE и го записахме успешно.",
    "",
    `Номер за справка: ${order.reference}`,
    `Дата: ${formatDate(order.created_at)}`,
    summary,
    "",
    isOrder
      ? `Това съобщение потвърждава само получаването на заявката. Няма онлайн плащане. Плащането е с ${deliveryPayment.method.toLowerCase()} при получаване: ${deliveryPayment.description} Поръчката все още не е означена като платена или изпратена. Ще се свържем с вас, за да потвърдим детайлите.`
      : "Ще се свържем с вас с отговор възможно най-скоро.",
    "",
    `Телефон за връзка: ${business.phone}`,
    `Може да разгледате продукта отново тук: ${url}`,
    "",
    "С уважение,",
    "Екипът на DECUCARE",
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;color:#2f2a3a;line-height:1.7">
      <h2 style="color:#5b3e8f">Благодарим ви, ${escapeHtml(order.customer_name)}!</h2>
      <p>${
        isOrder
          ? "Получихме вашата заявка за <strong>DECUCARE</strong> и я записахме успешно."
          : "Получихме вашия въпрос към <strong>DECUCARE</strong> и го записахме успешно."
      }</p>
      <p style="background:#f7f2fb;border-radius:10px;padding:14px">
        <strong>Номер за справка:</strong> ${escapeHtml(order.reference)}<br />
        <strong>Дата:</strong> ${escapeHtml(formatDate(order.created_at))}<br />
        ${
          isOrder
            ? `<strong>Артикул:</strong> ${escapeHtml(productSummary(order))}<br /><strong>Общо:</strong> ${escapeHtml(formatMoney(order.total_price_cents, order.currency))}`
            : `<strong>Съобщение:</strong> ${escapeHtml(order.message || "—")}`
        }
      </p>
      <p>${
        isOrder
          ? `Това съобщение потвърждава само получаването на заявката. Няма онлайн плащане. Плащането е с <strong>${escapeHtml(deliveryPayment.method.toLowerCase())}</strong> при получаване: ${escapeHtml(deliveryPayment.description)} Поръчката все още не е означена като платена или изпратена. Ще се свържем с вас, за да потвърдим детайлите.`
          : "Ще се свържем с вас с отговор възможно най-скоро."
      }</p>
      <p>Телефон за връзка: <a href="${escapeHtml(business.phoneHref)}" style="color:#5b3e8f">${escapeHtml(business.phone)}</a></p>
      <p><a href="${escapeHtml(url)}" style="color:#5b3e8f">Към сайта на DECUCARE</a></p>
      <p style="color:#6f6880">С уважение,<br />Екипът на DECUCARE</p>
    </div>`;
  return { to: order.customer_email, subject, text, html, replyTo: getMailgunConfig()!.ownerEmail };
}

async function sendMailgunMessage(
  config: MailgunConfig,
  message: { to: string; subject: string; text: string; html: string; replyTo: string },
) {
  const body = new URLSearchParams({
    from: config.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    "h:Reply-To": message.replyTo,
    "o:tracking": "false",
  });
  const response = await fetch(
    `${config.baseUrl}/${encodeURIComponent(config.domain)}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${config.apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const safeDetail = detail.slice(0, 300).replace(/\s+/g, " ");
    throw new Error(`Mailgun върна ${response.status}${safeDetail ? `: ${safeDetail}` : ""}`);
  }
  const data = (await response.json().catch(() => null)) as { id?: string } | null;
  return data?.id ?? null;
}

async function claimEmailSlot(orderId: string, column: "owner_email_status" | "customer_email_status") {
  const supabase = getSupabaseAdmin();
  const staleSendingCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("orders")
    .update({
      [column]: "sending",
      email_last_attempt_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .neq(column, "sent")
    .neq(column, "sending")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (data) return true;

  // Recover a slot left behind by a crashed function only after a safe cooldown.
  const { data: recovered, error: recoveryError } = await supabase
    .from("orders")
    .update({
      [column]: "sending",
      email_last_attempt_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq(column, "sending")
    .lt("email_last_attempt_at", staleSendingCutoff)
    .select("id")
    .maybeSingle();
  if (recoveryError) throw recoveryError;
  return Boolean(recovered);
}

async function finishEmailSlot(
  orderId: string,
  column: "owner_email_status" | "customer_email_status",
  result: { ok: true; messageId: string | null } | { ok: false; error: string },
) {
  const supabase = getSupabaseAdmin();
  const sentAtColumn = column === "owner_email_status" ? "owner_email_sent_at" : "customer_email_sent_at";
  const messageIdColumn = column === "owner_email_status" ? "owner_email_message_id" : "customer_email_message_id";
  const patch = result.ok
    ? {
        [column]: "sent",
        [sentAtColumn]: new Date().toISOString(),
        [messageIdColumn]: result.messageId,
        email_last_error: null,
      }
    : {
        [column]: "failed",
        email_last_error: result.error.slice(0, 1000),
      };
  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) console.error("Failed to record email status", error);
}

export async function dispatchOrderEmails(orderId: string) {
  const supabase = getSupabaseAdmin();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id,reference,kind,product_name,product_volume,quantity,unit_price_cents,total_price_cents,currency,customer_name,customer_email,customer_phone,message,created_at,owner_email_status,customer_email_status,email_attempts,email_last_attempt_at",
    )
    .eq("id", orderId)
    .maybeSingle<OrderEmailRow>();
  if (error) throw error;
  if (!order) return { owner: "skipped" as EmailStatus, customer: "skipped" as EmailStatus };
  if (order.owner_email_status === "sent" && order.customer_email_status === "sent") {
    return { owner: "sent" as EmailStatus, customer: "sent" as EmailStatus };
  }

  const config = getMailgunConfig();
  if (!config) {
    const { error: skipError } = await supabase
      .from("orders")
      .update({
        owner_email_status: "skipped",
        customer_email_status: "skipped",
        email_last_error: "Mailgun все още не е конфигуриран.",
      })
      .eq("id", orderId)
      .neq("owner_email_status", "sent")
      .neq("customer_email_status", "sent");
    if (skipError) console.error("Failed to mark emails skipped", skipError);
    return { owner: "skipped" as EmailStatus, customer: "skipped" as EmailStatus };
  }

  await supabase
    .from("orders")
    .update({ email_attempts: order.email_attempts + 1 })
    .eq("id", orderId);

  const jobs: Array<Promise<void>> = [];
  const results: { owner: EmailStatus; customer: EmailStatus } = {
    owner: order.owner_email_status,
    customer: order.customer_email_status,
  };

  if (order.owner_email_status !== "sent") {
    jobs.push(
      (async () => {
        try {
          const claimed = await claimEmailSlot(orderId, "owner_email_status");
          if (!claimed) return;
          const messageId = await sendMailgunMessage(config, buildOwnerEmail(order));
          await finishEmailSlot(orderId, "owner_email_status", { ok: true, messageId });
          results.owner = "sent";
        } catch (err) {
          const message = err instanceof Error ? err.message : "Неизвестна грешка при имейла.";
          console.error("Owner email failed", message);
          await finishEmailSlot(orderId, "owner_email_status", { ok: false, error: message });
          results.owner = "failed";
        }
      })(),
    );
  } else {
    results.owner = "sent";
  }

  if (order.customer_email_status !== "sent") {
    jobs.push(
      (async () => {
        try {
          const claimed = await claimEmailSlot(orderId, "customer_email_status");
          if (!claimed) return;
          const messageId = await sendMailgunMessage(config, buildCustomerEmail(order));
          await finishEmailSlot(orderId, "customer_email_status", { ok: true, messageId });
          results.customer = "sent";
        } catch (err) {
          const message = err instanceof Error ? err.message : "Неизвестна грешка при имейла.";
          console.error("Customer email failed", message);
          await finishEmailSlot(orderId, "customer_email_status", { ok: false, error: message });
          results.customer = "failed";
        }
      })(),
    );
  } else {
    results.customer = "sent";
  }

  await Promise.all(jobs);
  return results;
}
