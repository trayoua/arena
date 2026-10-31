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

export type Intent = "order" | "question";

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
  | { status: "success"; reference: string; kind: Intent; duplicate: boolean }
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
      });
      form.reset();
      setQuantity(1);
      setMessageLength(0);
      setSelectedProduct("");
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
                {product.name} · {product.volume}
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
        {isOrder && selectedProduct === product.id && (
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
                  : " Ще се свържем с вас за потвърждение. Това не е плащане или изпращане на пратка."}
              </p>
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
