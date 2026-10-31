"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";

type EmailStatus = "pending" | "sending" | "sent" | "failed" | "skipped";

type Order = {
  id: string;
  reference: string;
  kind: "order" | "question";
  product_name: string | null;
  product_volume: string | null;
  quantity: number;
  total_price_cents: number | null;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  message: string | null;
  status: "new" | "contacted" | "completed" | "cancelled";
  created_at: string;
  owner_email_status: EmailStatus;
  customer_email_status: EmailStatus;
  email_last_error: string | null;
};

type Product = {
  id: string;
  name: string;
  volume: string;
  price_cents: number | null;
  currency: string;
};

const statusLabels: Record<Order["status"], string> = {
  new: "Нова",
  contacted: "Свързан клиент",
  completed: "Завършена",
  cancelled: "Отказана",
};

const emailStatusLabels: Record<EmailStatus, string> = {
  pending: "изчаква",
  sending: "изпраща се",
  sent: "изпратен",
  failed: "неуспешен",
  skipped: "неактивен",
};

function formatMoney(cents: number | null, currency: string) {
  if (cents === null) return "Цена за потвърждение";
  return `${(cents / 100).toFixed(2)} ${currency === "EUR" ? "€" : currency}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  }).format(new Date(value));
}

export function AdminDashboard({
  orders,
  products,
  emailConfigured,
}: {
  orders: Order[];
  products: Product[];
  emailConfigured: boolean;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      products.map((p) => [p.id, p.price_cents === null ? "" : (p.price_cents / 100).toFixed(2)]),
    ),
  );

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function updateStatus(id: string, status: Order["status"]) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Неуспешен запис.");
        return;
      }
      router.refresh();
    } catch {
      setError("Няма връзка. Опитайте отново.");
    } finally {
      setBusyId(null);
    }
  }

  async function retryEmails(id: string) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch("/api/admin/orders/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || "Не успяхме да изпратим имейлите.");
        return;
      }
      router.refresh();
    } catch {
      setError("Няма връзка. Опитайте отново.");
    } finally {
      setBusyId(null);
    }
  }

  async function updatePrice(id: string) {
    setBusyId(id);
    setError("");
    const raw = priceInputs[id]?.trim().replace(",", ".") ?? "";
    const priceEur = raw === "" ? null : Number(raw);
    if (priceEur !== null && (!Number.isFinite(priceEur) || priceEur < 0)) {
      setError("Въведете валидна цена или оставете полето празно.");
      setBusyId(null);
      return;
    }
    try {
      const response = await fetch("/api/admin/product", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, priceEur }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Неуспешен запис.");
        return;
      }
      router.refresh();
    } catch {
      setError("Няма връзка. Опитайте отново.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <p className="section-label">DECUCARE</p>
            <h1>Поръчки и запитвания</h1>
          </div>
          <div className="admin-header-actions">
            <button className="button button-secondary" onClick={() => router.refresh()}>
              <RefreshCw size={16} aria-hidden="true" />
              Обнови
            </button>
            <button className="button button-secondary" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              Изход
            </button>
          </div>
        </header>

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        <section className="admin-panel" aria-labelledby="products-heading">
          <h2 id="products-heading">Продукт и цена</h2>
          <p className="admin-note">
            Празно поле означава „цена за потвърждение“. Промяната се записва в Supabase и важи за нови поръчки.
          </p>
          {products.map((product) => (
            <div className="admin-product-row" key={product.id}>
              <div>
                <strong>
                  {product.name} · {product.volume}
                </strong>
                <span>
                  Текуща цена: {formatMoney(product.price_cents, product.currency)}
                </span>
              </div>
              <label className="admin-price-field">
                <span>Цена в евро</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceInputs[product.id] ?? ""}
                  onChange={(e) =>
                    setPriceInputs((current) => ({ ...current, [product.id]: e.target.value }))
                  }
                  placeholder="напр. 12.50"
                />
              </label>
              <button
                className="button"
                disabled={busyId === product.id}
                onClick={() => updatePrice(product.id)}
              >
                {busyId === product.id ? "Запис…" : "Запиши цената"}
              </button>
            </div>
          ))}
        </section>

        <section className="admin-panel" aria-labelledby="orders-heading">
          <h2 id="orders-heading">Последни заявки ({orders.length})</h2>
          {!emailConfigured && (
            <p className="admin-note" role="status">
              Имейл известията още не са активни. Заявките се записват сигурно, но
              за изпращане на имейли трябва да се добавят настройките на Mailgun.
            </p>
          )}
          {orders.length === 0 ? (
            <p className="admin-note">Още няма записани заявки.</p>
          ) : (
            <div className="admin-orders">
              {orders.map((order) => (
                <article className="admin-order" key={order.id}>
                  <div className="admin-order-top">
                    <div>
                      <strong>{order.reference}</strong>
                      <span>
                        {order.kind === "order" ? "Поръчка" : "Въпрос"} · {formatDate(order.created_at)}
                      </span>
                    </div>
                    <span className={`admin-status status-${order.status}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <dl className="admin-order-details">
                    <div>
                      <dt>Клиент</dt>
                      <dd>{order.customer_name}</dd>
                    </div>
                    <div>
                      <dt>Имейл</dt>
                      <dd>
                        <a href={`mailto:${order.customer_email}`}>{order.customer_email}</a>
                      </dd>
                    </div>
                    <div>
                      <dt>Телефон</dt>
                      <dd>
                        {order.customer_phone ? (
                          <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Артикул</dt>
                      <dd>
                        {order.product_name
                          ? `${order.quantity} × ${order.product_name} ${order.product_volume ?? ""}`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Общо</dt>
                      <dd>{formatMoney(order.total_price_cents, order.currency)}</dd>
                    </div>
                    {order.message && (
                      <div className="admin-message">
                        <dt>Съобщение</dt>
                        <dd>{order.message}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="admin-email-row">
                    <span className={`admin-email-badge email-${order.owner_email_status}`}>
                      Известие до собственика: {emailStatusLabels[order.owner_email_status]}
                    </span>
                    <span className={`admin-email-badge email-${order.customer_email_status}`}>
                      Потвърждение до клиента: {emailStatusLabels[order.customer_email_status]}
                    </span>
                    {order.email_last_error && (
                      <span className="admin-email-error">{order.email_last_error}</span>
                    )}
                  </div>
                  <div className="admin-order-actions">
                    <label>
                      <span className="sr-only">Статус на {order.reference}</span>
                      <select
                        value={order.status}
                        disabled={busyId === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value as Order["status"])}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="button button-secondary button-tiny"
                      disabled={
                        busyId === order.id ||
                        (order.owner_email_status === "sent" &&
                          order.customer_email_status === "sent")
                      }
                      onClick={() => retryEmails(order.id)}
                    >
                      {busyId === order.id ? "Изпращане…" : "Изпрати имейлите отново"}
                    </button>
                    {busyId === order.id && <span>Запис…</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
