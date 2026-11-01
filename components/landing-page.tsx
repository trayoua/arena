"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Droplets,
  Flower2,
  HandHeart,
  Heart,
  Leaf,
  Mail,
  Plus,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  activeIngredients,
  exampleReviews,
  fullIngredients,
  type ProductInfo,
  retailers,
  site,
} from "@/lib/content";
import { OrderForm, type Intent } from "@/components/order-form";
import { Brand } from "@/components/site-header";

function SectionLabel({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`section-label ${light ? "label-light" : ""}`}>
      <span />
      {children}
    </p>
  );
}

export function LandingPage({ product }: { product: ProductInfo }) {
  const [selectedProduct, setSelectedProduct] = useState(product.id);
  const [intent, setIntent] = useState<Intent>("order");

  function selectProduct() {
    setSelectedProduct(product.id);
    setIntent("order");
    document.getElementById("order")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    window.setTimeout(
      () =>
        document
          .getElementById("order-product")
          ?.focus({ preventScroll: true }),
      450,
    );
  }

  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <SectionLabel>СПЕЦИАЛНА ГРИЖА. ВСЕКИ ДЕН.</SectionLabel>
            <h1 id="hero-title">
              Нежна грижа.
              <br />
              За кожата,
              <br />
              <em>която обичате.</em>
            </h1>
            <p className="hero-description">
              Запознайте се с <strong>DECUCARE</strong> — регенериращ и
              възстановяващ крем за чувствителна, раздразнена или увредена кожа.
              Един малък ритуал, изцяло за вас.
            </p>
            <div className="hero-actions">
              <a className="button" href="#product">
                Открийте DECUCARE
                <ArrowDownRight size={19} aria-hidden="true" />
              </a>
              <a
                className="text-link"
                href="#decucare"
                aria-label="Научете повече за продукта"
              >
                Научете повече
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="hero-details">
              <span>
                <Droplets size={17} aria-hidden="true" />
                150 мл
              </span>
              <i />
              <span>
                <Flower2 size={18} aria-hidden="true" />
                Лайка · Невен · Алое
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo">
              <Image
                src="/images/decucare-hero.webp"
                alt="Две туби DECUCARE сред зелени листа върху светла повърхност — продуктова фотография на DECUCARE"
                width={1500}
                height={841}
                priority
                sizes="(max-width: 760px) 92vw, 46vw"
                className="hero-image"
              />
            </div>
            <div className="care-seal" aria-hidden="true">
              <Heart size={23} strokeWidth={1.3} />
              <span>
                МАЛЪК РИТУАЛ
                <br />
                ГОЛЯМА ГРИЖА
              </span>
            </div>
            <div className="hero-photo-note">
              <Leaf size={22} strokeWidth={1.4} aria-hidden="true" />
              <div>
                <span>Внимание към всеки детайл</span>
                <strong>Вашата ежедневна грижа.</strong>
              </div>
            </div>
            <p className="image-disclaimer">
              Продуктова фотография · DECUCARE 150 мл
            </p>
          </div>
        </div>
        <div className="container">
          <div className="quiet-strip">
            <span>
              <Flower2 size={19} strokeWidth={1.4} aria-hidden="true" />
              Вдъхновена от природата формула
            </span>
            <span>
              <HandHeart size={19} strokeWidth={1.4} aria-hidden="true" />
              Грижа за чувствителна кожа
            </span>
            <span>
              <Sparkles size={19} strokeWidth={1.4} aria-hidden="true" />
              Място в ежедневния ви ритуал
            </span>
          </div>
        </div>
      </section>

      <section
        id="product"
        className="section product-section"
        aria-labelledby="product-title"
      >
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <SectionLabel>ВАШИЯТ НОВ ЕЖЕДНЕВЕН РИТУАЛ</SectionLabel>
              <h2 id="product-title">
                Малка туба.
                <br />
                <em>Много внимание.</em>
              </h2>
            </div>
            <p>
              Понякога кожата има нужда от малко повече грижа.
              <br className="desktop-break" /> Подарете ѝ внимание с DECUCARE.
            </p>
          </div>
          <article className="product-card">
            <div className="product-photo">
              <Image
                src="/images/decucare-bathroom.webp"
                alt="DECUCARE крем 150 мл на преден план, с още една туба и зелено растение в банята"
                width={1200}
                height={713}
                sizes="(max-width: 760px) 92vw, 42vw"
                className="product-real-image"
              />
              <span className="product-image-label">ГРИЖА С ВНИМАНИЕ</span>
              <span className="product-volume">150 мл / 5 oz</span>
            </div>
            <div className="product-content">
              <span className="soft-badge">
                <span />
                ГРИЖА С ПОСЛАНИЕ
              </span>
              <h3>
                DECUCARE <em>крем</em>
              </h3>
              <p className="product-subtitle">
                Регенериращ и възстановяващ крем · 150 мл
              </p>
              <p className="product-description">
                Специална грижа за раздразнена и чувствителна кожа. Подпомага
                естествените процеси на обновяване и поддържането на добрия вид
                на кожата.
              </p>
              <ul className="product-checks">
                <li>
                  <Check size={16} aria-hidden="true" />С лайка, невен и алое
                  вера
                </li>
                <li>
                  <Check size={16} aria-hidden="true" />
                  За кожа, подложена на триене и натиск
                </li>
              </ul>
              <div className="product-price">
                <span>Цена</span>
                <strong>
                  {product.price === null
                    ? "Очаква потвърждение"
                    : `${product.price.toFixed(2)} €`}
                </strong>
                <small>
                  {product.price === null
                    ? "Вашата цена ще бъде добавена преди публикуване."
                    : "Цена за 1 брой DECUCARE, 150 мл. Заявката не е онлайн плащане."}
                </small>
              </div>
              <div className="product-actions">
                <button className="button" onClick={selectProduct}>
                  Поръчай DECUCARE
                </button>
                <a className="text-link" href="#decucare">
                  Разгледай детайлите
                  <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section
        id="decucare"
        className="section details-section"
        aria-labelledby="details-title"
      >
        <div className="container">
          <div className="details-grid">
            <div className="details-intro">
              <SectionLabel>ОПОЗНАЙТЕ DECUCARE</SectionLabel>
              <h2 id="details-title">
                Грижата е<br />
                <em>в детайлите.</em>
              </h2>
              <p>
                Формула, съчетаваща растителни екстракти и хидратиращи съставки.
                Създадена за моменти, в които кожата ви има нужда от специално
                внимание.
              </p>
              <div className="texture-photo">
                <Image
                  src="/images/decucare-detail.webp"
                  alt="Близък кадър на логото и лилавия надпис върху опаковката на DECUCARE"
                  width={1100}
                  height={617}
                  sizes="(max-width: 760px) 90vw, 40vw"
                />
              </div>
              <p className="texture-caption">
                Реален детайл от опаковката на DECUCARE.
              </p>
            </div>
            <div className="product-accordion">
              <details open>
                <summary>
                  <span>
                    <span className="accordion-number">01</span>За какво е
                    предназначен?
                  </span>
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <div className="accordion-content">
                  <p>
                    DECUCARE е предназначен за специална грижа за раздразнена и
                    чувствителна кожа. Подпомага естествените процеси на
                    обновяване и поддържане на добрия ѝ вид.
                  </p>
                  <p>
                    Според информацията на търговците е подходящ при зачервяване
                    и дискомфорт от триене или залежаване, както и за
                    предпазване на кожа, подложена на натиск.
                  </p>
                  <div className="inline-note">
                    <ShieldCheck size={19} aria-hidden="true" />
                    <span>
                      Козметичен продукт за грижа за кожата. Не замества
                      медицинска диагноза или назначено лечение.
                    </span>
                  </div>
                </div>
              </details>
              <details>
                <summary>
                  <span>
                    <span className="accordion-number">02</span>Какво съдържа?
                  </span>
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <div className="accordion-content">
                  <p>Активни съставки, посочени в продуктовата информация:</p>
                  <dl className="ingredient-list">
                    {activeIngredients.map((item) => (
                      <div key={item.name}>
                        <dt>{item.name}</dt>
                        <dd>{item.detail}</dd>
                      </div>
                    ))}
                  </dl>
                  <details className="inci-details">
                    <summary>
                      Пълен състав (INCI)
                      <ChevronRight size={16} aria-hidden="true" />
                    </summary>
                    <p lang="en">{fullIngredients}</p>
                  </details>
                  <p className="small-note">
                    Възможни са промени във формулата. Проверявайте опаковката
                    преди употреба. Съдържа ароматни съставки като citronellol,
                    geraniol, linalool и citral.
                  </p>
                </div>
              </details>
              <details>
                <summary>
                  <span>
                    <span className="accordion-number">03</span>Как да го
                    използвате?
                  </span>
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <div className="accordion-content">
                  <ol className="usage-list">
                    <li>Нанесете върху засегнатата зона.</li>
                    <li>Масажирайте с леки движения до пълно попиване.</li>
                    <li>
                      Използвайте 2–3 пъти дневно, като следвате указанията
                      върху опаковката.
                    </li>
                  </ol>
                  <p>
                    Съхранявайте на сухо и прохладно място, под 25 °C, далеч от
                    деца и пряка слънчева светлина. Не използвайте след срока на
                    годност.
                  </p>
                </div>
              </details>
              <details>
                <summary>
                  <span>
                    <span className="accordion-number">04</span>Важно преди
                    употреба
                  </span>
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <div className="accordion-content">
                  <p>
                    Само за външна употреба. Избягвайте контакт с очите. Не
                    използвайте при свръхчувствителност към някоя от съставките.
                  </p>
                  <p>
                    Според публикуваната информация продуктът не е подходящ за
                    деца под 3 години или по време на бременност. При съмнение,
                    постоянно раздразнение или влошаване се консултирайте с
                    лекар или фармацевт.
                  </p>
                  <p>
                    Следвайте листовката на конкретната опаковка. Не поставяйте
                    продукта върху рани без медицинска преценка.
                  </p>
                </div>
              </details>
              <details>
                <summary>
                  <span>
                    <span className="accordion-number">05</span>Опаковка и
                    произход
                  </span>
                  <Plus size={19} aria-hidden="true" />
                </summary>
                <div className="accordion-content">
                  <dl className="spec-list">
                    <div>
                      <dt>Продукт</dt>
                      <dd>DECUCARE крем</dd>
                    </div>
                    <div>
                      <dt>Разфасовка</dt>
                      <dd>150 мл</dd>
                    </div>
                    <div>
                      <dt>Производител</dt>
                      <dd>„Гален Фарма“ ООД</dd>
                    </div>
                    <div>
                      <dt>Страна на произход</dt>
                      <dd>България</dd>
                    </div>
                  </dl>
                  <p className="small-note">
                    Данните са сверени с публичните описания на търговците.
                    Потвърдете ги с актуалната опаковка преди реални продажби.
                  </p>
                </div>
              </details>
              <div className="sources-note">
                <span>Източници на информация · {site.checkedOn}</span>
                <div>
                  <a
                    href="https://galen.bg/dekukear-krem-150ml"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Galen
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                  <a
                    href="https://366.bg/product/decucare-krem-150-ml"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Аптеки 36.6
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="benefits"
        className="section benefits-section"
        aria-labelledby="benefits-title"
      >
        <div className="container">
          <div className="section-heading centered">
            <SectionLabel>МАЛКИ ЖЕСТОВЕ, КОИТО ИМАТ ЗНАЧЕНИЕ</SectionLabel>
            <h2 id="benefits-title">
              Три причини за <em>вашата грижа.</em>
            </h2>
          </div>
          <div className="benefits-grid">
            {[
              {
                n: "01",
                Icon: HandHeart,
                title: "Бързо облекчение",
                text: "Нанесете върху засегнатата зона с леки движения.",
              },
              {
                n: "02",
                Icon: Droplets,
                title: "Попива без следа",
                text: "Нанасяйте с лек масаж до попиване за нежна грижа през деня.",
              },
              {
                n: "03",
                Icon: Leaf,
                title: "Нежен към кожата",
                text: "Нанасяйте 2–3 пъти на ден за оптимален комфорт и защита.",
              },
            ].map(({ n, Icon, title, text }) => (
              <article className="benefit-card" key={n}>
                <div className="benefit-top">
                  <span className="benefit-icon">
                    <Icon size={28} strokeWidth={1.25} aria-hidden="true" />
                  </span>
                  <span className="benefit-number">{n}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className="benefits-note">
            Предложени рекламни послания. Твърденията за бързо облекчение и
            попиване без следа очакват потвърждение от производителя преди
            публикуване.
          </p>
        </div>
      </section>

      <section
        id="reviews"
        className="section reviews-section"
        aria-labelledby="reviews-title"
      >
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <SectionLabel>ЛИЧНИ ИСТОРИИ, НЕЖНА ГРИЖА</SectionLabel>
              <h2 id="reviews-title">
                Място за <em>вашето мнение.</em>
              </h2>
            </div>
            <span className="example-badge">ПРИМЕРНИ ОТЗИВИ</span>
          </div>
          <div className="reviews-grid">
            {exampleReviews.map((review) => (
              <article className="review-card" key={review.name}>
                <div className="review-top">
                  <Quote size={26} strokeWidth={1.2} aria-hidden="true" />
                  <span>Примерен текст</span>
                </div>
                <h3>{review.title}</h3>
                <p>„{review.text}“</p>
                <div className="review-author">
                  <span className="avatar" aria-hidden="true">
                    {review.initials}
                  </span>
                  <div>
                    <strong>{review.name}</strong>
                    <span>Илюстративен профил</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="reviews-note">
            Това са примерни текстове за визията, не реални клиентски мнения.
            Преди старт ще ги заменим с истински отзиви, със съгласието на
            техните автори.
          </p>
        </div>
      </section>

      <section
        id="order"
        className="section order-section"
        aria-labelledby="order-title"
      >
        <div className="container order-grid">
          <div className="order-copy">
            <SectionLabel light>ТУК СМЕ ЗА ВАС</SectionLabel>
            <h2 id="order-title">
              Една малка стъпка
              <br />
              към <em>повече грижа.</em>
            </h2>
            <p>
              Изберете своя DECUCARE или ни пишете. Ще се радваме да отговорим
              на вашите въпроси.
            </p>
            <ol className="order-steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Изберете продукта</strong>
                  <p>DECUCARE крем · 150 мл</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Оставете данни за връзка</strong>
                  <p>Само необходимото за вашата заявка.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Очаквайте обаждане или имейл</strong>
                  <p>Ще потвърдим детайлите, преди да изпратим пратка.</p>
                </div>
              </li>
            </ol>
            <div className="order-contact">
              <Mail size={21} strokeWidth={1.4} aria-hidden="true" />
              <div>
                <strong>Имате нещо друго наум?</strong>
                <button
                  onClick={() => {
                    setIntent("question");
                    document.getElementById("customer-name")?.focus();
                  }}
                >
                  Изпратете въпрос чрез формата
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          <OrderForm
            product={product}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            intent={intent}
            setIntent={setIntent}
          />
        </div>
      </section>

      <section
        id="retailers"
        className="section retailers-section"
        aria-labelledby="retailers-title"
      >
        <div className="container">
          <div className="section-heading centered">
            <SectionLabel>ОЩЕ МЕСТА ДА ОТКРИЕТЕ ГРИЖАТА</SectionLabel>
            <h2 id="retailers-title">
              DECUCARE е <em>и на тези места.</em>
            </h2>
            <p>Разгледайте продукта при избрани онлайн търговци.</p>
          </div>
          <div className="retailer-grid">
            {retailers.map((retailer) => (
              <a
                className={`retailer-card ${retailer.className}`}
                href={retailer.url}
                key={retailer.name}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${retailer.name} — разгледай DECUCARE (отваря се в нов раздел)`}
              >
                <ArrowUpRight
                  className="retailer-arrow"
                  size={16}
                  aria-hidden="true"
                />
                <span className="retailer-wordmark">{retailer.name}</span>
                <span className="retailer-note">{retailer.note}</span>
              </a>
            ))}
          </div>
          <p className="retailers-note">
            Това са търговски обекти, а не потвърдени договорни партньори.
            Цените и наличността се определят от тях. Марките принадлежат на
            съответните им собственици.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand">
              <Brand />
              <p>
                Малък ритуал.
                <br />
                Голяма грижа за вашата кожа.
              </p>
            </div>
            <div className="footer-navigation">
              <span>ОПОЗНАЙТЕ DECUCARE</span>
              <a href="#product">Продуктът</a>
              <a href="#decucare">Състав и употреба</a>
              <a href="#retailers">Къде да ни откриете</a>
            </div>
            <div className="footer-navigation">
              <span>ДА БЪДЕМ В КОНТАКТ</span>
              <a href="#order" onClick={() => setIntent("question")}>
                Изпратете запитване
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
              <p className="footer-placeholder">
                Телефон и имейл
                <br />
                очакват вашите данни.
              </p>
            </div>
            <div className="footer-social">
              <span>ПОСЛЕДВАЙТЕ ГРИЖАТА</span>
              <div className="social-placeholder">
                <Heart size={18} strokeWidth={1.4} aria-hidden="true" />
                <p>
                  Instagram и Facebook
                  <br />
                  <small>Очакваме вашите профили.</small>
                </p>
              </div>
              <a className="back-top" href="#top">
                Обратно в началото
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} DECUCARE. С внимание към детайла.
            </p>
            <a href="/privacy">Поверителност</a>
            <span>
              Създадено с грижа <Heart size={12} aria-hidden="true" />
            </span>
          </div>
          <p className="footer-preview">
            Работен преглед · Заявките се записват · Имейл известията още не са
            активни · Няма онлайн плащане
          </p>
        </div>
      </footer>
    </main>
  );
}
