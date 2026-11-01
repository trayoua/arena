"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Check,
  Info,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import type { ProductInfo } from "@/lib/content";
import { formatMoney, toPriceCents } from "@/lib/money";

export type Intent = "order" | "question";

type OrderSummary = {
  quantity: number;
  totalPriceCents: number | null;
  currency: string;
};

function isOrderSummary(value: unknown): value is OrderSummary {
  if (typeof value !== "object" || value === null) return false;
  const summary = value as Record<string, unknown>;
  return (
    typeof summary.quantity === "number" &&
    Number.isInteger(summary.quantity) &&
    summary.quantity >= 1 &&
    summary.quantity <= 20 &&
    (summary.totalPriceCents === null ||
      (typeof summary.totalPriceCents === "number" &&
        Number.isInteger(summary.totalPriceCents) &&
        summary.totalPriceCents >= 0)) &&
    typeof summary.currency === "string" &&
    summary.currency.length > 0
  );
}

type OrderFormProps = {
  product: ProductInfo;
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  intent: Intent;
  setIntent: (value: Intent) => void;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | {
      status: "success";
      reference: string;
      kind: Intent;
      duplicate: boolean;
      emails: { owner: string; customer: string } | null;
      summary: OrderSummary | null;
    }
  | { status: "error"; message: string };

export function OrderForm({
  product,
  selectedProduct,
  setSelectedProduct,
  intent,
  setIntent,
}: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [messageLength, setMessageLength] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const formStartedAt = useRef<number>(0);
  const idempotencyKey = useRef<string>("");
  const isOrder = intent === "order";
  const busy = submitState.status === "submitting";
  const hasSelectedProduct = selectedProduct === product.id;
  const unitPriceCents = toPriceCents(product.price);
  const totalPriceCents =
    unitPriceCents === null ? null : unitPriceCents * quantity;
  const unitPriceLabel = formatMoney(unitPriceCents, product.currency);

  useEffect(() => {
    formStartedAt.current = Date.now();
    idempotencyKey.current = crypto.randomUUID();
  }, []);

  function resetSubmissionGuards() {
    formStartedAt.current = Date.now();
    idempotencyKey.current = crypto.randomUUID();
  }

  function changeIntent(value: Intent) {
    setIntent(value);
    setSubmitState({ status: "idle" });
    resetSubmissionGuards();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitState({ status: "submitting" });

    const payload = {
      kind: intent,
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      product: String(formData.get("product") || ""),
      quantity,
      message: String(formData.get("message") || ""),
      consent: formData.get("consent") === "on",
      website: String(formData.get("website") || ""),
      formStartedAt: formStartedAt.current,
      idempotencyKey: idempotencyKey.current,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setSubmitState({
          status: "error",
          message:
            data?.error ||
            "Не успяхме да изпратим заявката. Опитайте отново след малко.",
        });
        return;
      }
      setSubmitState({
        status: "success",
        reference: data.reference,
        kind: data.kind,
        duplicate: Boolean(data.duplicate),
        emails: data.emails ?? null,
        summary: isOrderSummary(data.summary) ? data.summary : null,
      });
      form.reset();
      setQuantity(1);
      setMessageLength(0);
      setSelectedProduct(product.id);
      resetSubmissionGuards();
    } catch {
      setSubmitState({
        status: "error",
        message: "Няма връзка. Проверете интернета и опитайте отново.",
      });
    }
  }

  return (
    <div className="form-card">
      <div className="form-tabs" role="group" aria-label="Причина за контакт">
        <button
          type="button"
          aria-pressed={isOrder}
          className={isOrder ? "active" : ""}
          onClick={() => changeIntent("order")}
          disabled={busy}
        >
          <ShoppingBag size={17} aria-hidden="true" />
          Поръчка
        </button>
        <button
          type="button"
          aria-pressed={!isOrder}
          className={!isOrder ? "active" : ""}
          onClick={() => changeIntent("question")}
          disabled={busy}
        >
          <MessageCircle size={17} aria-hidden="true" />
          Въпрос
        </button>
      </div>
      <div className="form-heading">
        <h3>
          {isOrder ? "Вашата грижа започва тук." : "Ще се радваме да ви чуем."}
        </h3>
        <p>
          {isOrder
            ? "Попълнете няколко лесни стъпки."
            : "Питайте ни за продукта или неговата употреба."}
        </p>
      </div>
      <div className="form-preview-note" id="order-note">
        <Info size={17} aria-hidden="true" />
        <span>
          Заявката се записва сигурно. Няма онлайн плащане; ще се свържем с вас
          за потвърждение.
        </span>
      </div>
      <form
        method="post"
        onSubmit={submit}
        aria-describedby="order-note"
        aria-busy={busy}
        onChange={() => {
          if (submitState.status === "error") setSubmitState({ status: "idle" });
        }}
      >
        <div className="honeypot-field" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="customer-name">
              Вашето име <span>*</span>
            </label>
            <input
              id="customer-name"
              name="name"
              autoComplete="name"
              placeholder="Име и фамилия"
              required
              minLength={2}
              maxLength={100}
              disabled={busy}
            />
          </div>
          <div className="field">
            <label htmlFor="customer-email">
              Имейл <span>*</span>
            </label>
            <input
              id="customer-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vie@example.com"
              required
              maxLength={254}
              disabled={busy}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="customer-phone">
            Телефон {isOrder ? <span>*</span> : <small>(по желание)</small>}
          </label>
          <input
            id="customer-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+359 88 123 4567"
            required={isOrder}
            minLength={6}
            maxLength={30}
            disabled={busy}
          />
        </div>
        <div className={`field-grid ${isOrder ? "product-quantity-row" : ""}`}>
          <div className="field">
            <label htmlFor="order-product">
              {isOrder ? "Избран артикул" : "Продукт, за който питате"}{" "}
              {isOrder && <span>*</span>}
            </label>
            <select
              id="order-product"
              name="product"
              required={isOrder}
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              disabled={busy}
            >
              <option value="">Изберете продукт</option>
              <option value={product.id}>
                {product.name} · {product.volume} · {unitPriceLabel}
              </option>
            </select>
          </div>
          {isOrder && (
            <div className="field">
              <label htmlFor="order-quantity">Количество</label>
              <div className="quantity-control">
                <button
                  type="button"
                  aria-label="Намали количеството"
                  disabled={busy || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={16} />
                </button>
                <input
                  id="order-quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  max={20}
                  step={1}
                  required
                  value={quantity}
                  disabled={busy}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        20,
                        Math.max(1, Math.trunc(Number(e.target.value) || 1)),
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  aria-label="Увеличи количеството"
                  disabled={busy || quantity >= 20}
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
        {isOrder && hasSelectedProduct && (
          <p className="selected-product-note" role="status">
            <Check size={14} aria-hidden="true" />
            {product.name} · {product.volume} е избран
          </p>
        )}
        <div className="field">
          <label htmlFor="customer-message">
            {isOrder ? "Съобщение" : "Вашият въпрос"}{" "}
            {isOrder ? <small>(по желание)</small> : <span>*</span>}
          </label>
          <textarea
            id="customer-message"
            name="message"
            rows={3}
            placeholder={
              isOrder
                ? "Нещо, което е добре да знаем?"
                : "С какво можем да ви помогнем?"
            }
            required={!isOrder}
            minLength={isOrder ? undefined : 5}
            maxLength={2000}
            disabled={busy}
            onChange={(e) => setMessageLength(e.target.value.length)}
          />
          <span className="character-count">{messageLength} / 2000</span>
        </div>
        {isOrder && (
          <section
            className={`order-summary${hasSelectedProduct ? "" : " order-summary-empty"}`}
            aria-labelledby="order-summary-title"
          >
            <div className="order-summary-heading">
              <h4 id="order-summary-title">Вашата поръчка</h4>
              <span>Без онлайн плащане</span>
            </div>
            {hasSelectedProduct ? (
              <dl className="order-summary-lines">
                <div className="order-summary-line order-summary-product">
                  <dt>
                    <span>
                      {product.name} · {product.volume}
                    </span>
                    <small>
                      {quantity} бр. · {unitPriceLabel} / бр.
                    </small>
                  </dt>
                  <dd data-testid="order-product-total">
                    {formatMoney(totalPriceCents, product.currency)}
                  </dd>
                </div>
                <div className="order-summary-line">
                  <dt>Доставка</dt>
                  <dd className="order-summary-delivery">Не е включена</dd>
                </div>
                <div className="order-summary-line order-summary-total">
                  <dt>Общо за продуктите</dt>
                  <dd
                    data-testid="order-total"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {formatMoney(totalPriceCents, product.currency)}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="order-summary-placeholder">
                Изберете продукт и количество, за да видите сумата.
              </p>
            )}
            <p className="order-summary-note">
              {unitPriceCents === null
                ? "Цената и доставката ще бъдат уточнени при потвърждение на заявката."
                : "Доставката не е включена и ще бъде уточнена при потвърждение на заявката."}{" "}
              Няма онлайн плащане.
            </p>
          </section>
        )}
        <label className="consent-label">
          <input type="checkbox" name="consent" required disabled={busy} />
          <span>
            Съгласен/на съм данните ми да бъдат използвани за обработка на тази{" "}
            {isOrder ? "поръчка" : "запитване"}.{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Поверителност{" "}
              <span className="sr-only">(отваря се в нов раздел)</span>
            </a>
          </span>
        </label>
        <button className="button form-submit" type="submit" disabled={busy}>
          {busy
            ? "Изпращане…"
            : isOrder
              ? "Изпрати заявката"
              : "Изпрати въпроса"}
        </button>
        {submitState.status === "success" && (
          <div className="form-result form-result-success" role="status">
            <Check size={21} aria-hidden="true" />
            <div>
              <strong>
                {submitState.kind === "order"
                  ? "Благодарим! Заявката е приета и записана."
                  : "Благодарим! Съобщението е прието и записано."}
              </strong>
              <p>
                Номер за справка: <b>{submitState.reference}</b>.
                {submitState.duplicate
                  ? " Тази заявка вече беше записана; не създадохме дубликат."
                  : submitState.emails?.customer === "sent"
                    ? " Изпратихме потвърждение на вашия имейл. Ще се свържем с вас за детайлите. Това не е плащане или изпращане на пратка."
                    : " Ще се свържем с вас за потвърждение. Това не е плащане или изпращане на пратка."}
              </p>
              {submitState.kind === "order" && submitState.summary && (
                <p className="form-result-summary" data-testid="success-total">
                  {submitState.summary.totalPriceCents === null ? (
                    "Цената и доставката ще бъдат уточнени при потвърждение."
                  ) : (
                    <>
                      Записана сума за продуктите:{" "}
                      <b>
                        {formatMoney(
                          submitState.summary.totalPriceCents,
                          submitState.summary.currency,
                        )}
                      </b>{" "}
                      ({submitState.summary.quantity} бр.). Доставката не е
                      включена.
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
        {submitState.status === "error" && (
          <div className="form-result form-result-error" role="alert">
            <Info size={21} aria-hidden="true" />
            <div>
              <strong>Заявката не беше записана.</strong>
              <p>{submitState.message}</p>
            </div>
          </div>
        )}
        <p className="form-footnote">
          Полетата със * са задължителни. Няма онлайн плащане.
        </p>
      </form>
    </div>
  );
}
