import { chromium as playwright } from "playwright";
import serverlessChromium, {
  inflate,
  setupLambdaEnvironment,
} from "@sparticuz/chromium";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The packaged browser also supplies the few shared libraries absent on a minimal Linux host.
await inflate(
  join(process.cwd(), "node_modules/@sparticuz/chromium/bin/al2023.tar.br"),
);
setupLambdaEnvironment(join(tmpdir(), "al2023", "lib"));
const baseURL = process.env.BASE_URL || "http://localhost:3000";
const browser = await playwright.launch({
  executablePath: await serverlessChromium.executablePath(),
  args: serverlessChromium.args.filter(
    (arg) =>
      ![
        "--disable-web-security",
        "--allow-running-insecure-content",
        "--single-process",
      ].includes(arg),
  ),
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [];
const submittedRequests = [];
const orderPayloads = [];
await context.route("**/api/orders", async (route) => {
  const payload = route.request().postDataJSON();
  orderPayloads.push(payload);
  const isOrder = payload.kind === "order";
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      ok: true,
      reference: "DC-TEST-1001",
      kind: payload.kind,
      summary: isOrder
        ? {
            quantity: payload.quantity,
            totalPriceCents: 1390 * payload.quantity,
            currency: "EUR",
          }
        : null,
    }),
  });
});
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (r.method() !== "GET") submittedRequests.push(`${r.method()} ${r.url()}`);
});
await fs.mkdir("test-results", { recursive: true });

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(await page.locator("html").getAttribute("lang"), "bg");
  assert.equal(await page.locator("h1").count(), 1);
  assert.ok(
    (await page.locator("#product-title").innerText()).includes("Една туба.\nЦял ритуал."),
    "The approved product heading should be shown",
  );
  for (const id of [
    "product",
    "decucare",
    "benefits",
    "reviews",
    "order",
    "retailers",
  ]) {
    assert.equal(
      await page.locator(`#${id}`).count(),
      1,
      `Missing section ${id}`,
    );
  }
  assert.equal(await page.locator(".review-card").count(), 3);
  const reviewText = await page.locator("#reviews").innerText();
  for (const expected of [
    "Мария Петкова",
    "Димитър Генов",
    "Елена Георгиева",
    "Още след първото нанасяне усетих разлика.",
    "Много съм доволен.",
    "Бих поръчала отново.",
  ]) {
    assert.ok(reviewText.includes(expected), `Missing review content: ${expected}`);
  }
  assert.ok(!/ПРИМЕРНИ|Примерен текст|Илюстративен профил/.test(reviewText));
  assert.equal(await page.locator(".retailer-card").count(), 8);
  assert.equal(await page.locator(".retailer-logo").count(), 8);
  const retailerLogoSources = await page.locator(".retailer-logo").evaluateAll((logos) =>
    logos.map((logo) => logo.getAttribute("src") || ""),
  );
  assert.ok(
    retailerLogoSources.every((source) => source.includes("%2Fimages%2Fretailers%2F")),
    "Every retailer card should use an owner-supplied logo asset",
  );
  const emagLink = page.locator('a[href="https://www.emag.bg/brands/brand/decucare"]');
  assert.equal(await emagLink.count(), 1);
  assert.ok((await emagLink.getAttribute("aria-label"))?.includes("eMAG"));
  const facebookLinks = page.locator('a[href="https://www.facebook.com/profile.php?id=61583186613579"]');
  assert.equal(await facebookLinks.count(), 1);
  assert.equal(await page.locator(".social-link").count(), 1);
  assert.ok((await page.locator(".site-footer").innerText()).includes("Facebook"));
  assert.ok(!/Instagram|YouTube|TikTok/.test(await page.locator(".site-footer").innerText()));
  assert.ok((await page.locator('a[href="tel:+359899822992"]').count()) >= 2);
  const orderCopyText = await page.locator(".order-copy").innerText();
  for (const expected of [
    "Доставка и плащане",
    "Наложен платеж",
    "Плащане в брой или с карта при получаване",
    "Speedy",
    "Econt",
    "Sameday/easybox",
    "BOX NOW",
    "+359 89 982 2992",
  ]) {
    assert.ok(orderCopyText.includes(expected), `Missing delivery/contact content: ${expected}`);
  }
  assert.ok((await page.locator(".site-footer").innerText()).includes("„Гален Фарма“ ООД за „А БРАНДС“ ЕООД"));
  assert.equal((await page.locator(".order-summary-heading span").innerText()).trim(), "Наложен платеж");
  assert.ok(await page.locator(".site-header .brand-mark").isVisible());
  const heroCaptionLayout = await page.evaluate(() => {
    const visual = document.querySelector(".hero-visual").getBoundingClientRect();
    const note = document.querySelector(".hero-photo-note").getBoundingClientRect();
    const caption = document.querySelector(".image-disclaimer").getBoundingClientRect();
    return {
      captionAfterNote: caption.top - note.bottom,
      captionInsideVisual: caption.left >= visual.left && caption.right <= visual.right,
    };
  });
  assert.ok(
    heroCaptionLayout.captionAfterNote >= 8,
    "The product-photo caption must not overlap the floating photo note",
  );
  assert.ok(heroCaptionLayout.captionInsideVisual, "The product-photo caption must stay inside the hero visual");
  assert.equal(
    await page.locator('.desktop-nav a[href="#retailers"]').innerText(),
    "Партньори",
  );
  assert.equal(await page.locator(".header-order svg").count(), 0);
  assert.equal(await page.locator(".product-actions .button svg").count(), 0);
  assert.equal(await page.locator(".form-submit svg").count(), 0);
  assert.equal(
    await page.locator("#mobile-navigation a:last-child svg").count(),
    0,
  );
  assert.ok(
    (await page.locator(".hero-image").getAttribute("src")).includes(
      "decucare-hero",
    ),
  );
  assert.ok(
    (await page.locator(".product-real-image").getAttribute("src")).includes(
      "decucare-bathroom",
    ),
  );
  const displayedPrice = await page.locator(".product-price strong").textContent();
  assert.match(displayedPrice ?? "", /^\d+\.\d{2} €$/, "Product price should be visible");
  assert.equal(
    (await page.getByTestId("order-total").innerText()).trim(),
    displayedPrice?.trim(),
    "The order summary should be visible immediately for the single product",
  );
  assert.ok(
    (await page.locator(".product-price small").textContent())?.includes(
      "не е онлайн плащане",
    ),
    "Price note should clarify that the request is not an online payment",
  );
  const readableTextSizes = await page.evaluate(() => {
    const size = (selector) =>
      parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
    return {
      hero: size(".hero-description"),
      product: size(".product-description"),
      review: size(".review-card > p"),
      fieldLabel: size(".field label"),
      consent: size(".consent-label"),
      footer: size(".footer-brand > p"),
    };
  });
  assert.ok(readableTextSizes.hero >= 16, "Hero body text should be readable");
  assert.ok(readableTextSizes.product >= 16, "Product body text should be readable");
  assert.ok(readableTextSizes.review >= 15, "Review text should be readable");
  assert.ok(readableTextSizes.fieldLabel >= 14, "Form labels should be readable");
  assert.ok(readableTextSizes.consent >= 13, "Consent text should be readable");
  assert.ok(readableTextSizes.footer >= 14, "Footer text should be readable");
  // Next.js lazy-loads below-the-fold photographs; visit each before checking it.
  for (const image of await page.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((img) => img.decode());
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  const allImagesLoaded = await page
    .locator("img")
    .evaluateAll((images) =>
      images.every((img) => img.complete && img.naturalWidth > 0),
    );
  assert.ok(allImagesLoaded, "All images should load");
  await page.screenshot({
    caret: "initial",
    path: "test-results/desktop-full.png",
    fullPage: true,
  });
  await page.screenshot({
    caret: "initial",
    path: "test-results/desktop-hero.png",
  });

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await fs.writeFile(
    "test-results/accessibility-desktop.json",
    JSON.stringify(axe.violations, null, 2),
  );
  console.log(
    "Desktop accessibility:",
    axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  );

  await page
    .getByRole("button", { name: "Поръчай DECUCARE", exact: true })
    .click();
  assert.equal(
    await page.locator("#order-product").inputValue(),
    "decucare-150",
  );
  assert.ok(await page.locator(".order-summary").isVisible());
  assert.equal(
    (await page.getByTestId("order-total").innerText()).trim(),
    "13.90 €",
  );
  await page
    .locator(".order-summary")
    .screenshot({ caret: "initial", path: "test-results/desktop-order-summary.png" });
  await page.getByRole("button", { name: "Увеличи количеството" }).click();
  assert.equal(await page.locator("#order-quantity").inputValue(), "2");
  assert.equal(
    (await page.getByTestId("order-total").innerText()).trim(),
    "27.80 €",
  );
  await page.locator("#order-quantity").fill("3");
  assert.equal(
    (await page.getByTestId("order-total").innerText()).trim(),
    "41.70 €",
  );
  await page.getByRole("button", { name: "Намали количеството" }).click();
  assert.equal(await page.locator("#order-quantity").inputValue(), "2");
  await page.getByRole("button", { name: "Намали количеството" }).click();
  assert.equal(await page.locator("#order-quantity").inputValue(), "1");
  assert.equal(
    (await page.getByTestId("order-total").innerText()).trim(),
    "13.90 €",
  );
  await page.locator("#customer-name").fill("Тест Потребител");
  await page.locator("#customer-email").fill("test@example.com");
  await page.locator("#customer-phone").fill("+359881234567");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Изпрати заявката" }).click();
  await page.locator(".form-result-success").waitFor();
  assert.ok(
    (await page.locator(".form-result-success").innerText()).includes(
      "DC-TEST-1001",
    ),
  );
  assert.ok(
    (await page.getByTestId("success-total").innerText()).includes("13.90 €"),
  );
  assert.equal(orderPayloads.length, 1);
  assert.equal(orderPayloads[0].kind, "order");
  assert.equal(orderPayloads[0].product, "decucare-150");
  assert.equal(orderPayloads[0].quantity, 1);
  assert.equal(orderPayloads[0].consent, true);
  assert.equal(orderPayloads[0].website, "");
  assert.ok(orderPayloads[0].idempotencyKey);
  assert.ok(
    submittedRequests.every((entry) => entry.endsWith("/api/orders")),
    "Only the order API may receive POST requests in this test",
  );
  await page.getByRole("button", { name: "Въпрос", exact: true }).click();
  assert.equal(await page.locator("#order-quantity").count(), 0);
  assert.equal(await page.locator(".order-summary").count(), 0);
  assert.equal(
    await page.locator("#customer-message").getAttribute("required"),
    "",
  );
  await page.locator("#customer-name").fill("Тест Потребител");
  await page.locator("#customer-email").fill("test@example.com");
  await page.locator("#customer-message").fill("Тестов въпрос за продукта.");
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: "Изпрати въпроса" }).click();
  await page.locator(".form-result-success").waitFor();
  assert.equal(orderPayloads.length, 2);
  assert.equal(orderPayloads[1].kind, "question");
  await page.getByRole("button", { name: "Поръчка", exact: true }).click();
  await page
    .locator("#decucare details")
    .filter({
      has: page.locator("summary").filter({ hasText: "Какво съдържа?" }),
    })
    .first()
    .locator("> summary")
    .click();
  assert.ok(await page.locator(".ingredient-list").isVisible());
  await page.locator(".inci-details summary").click();
  assert.ok(await page.locator(".inci-details p").isVisible());

  for (const width of [320, 375, 390, 768, 1024, 1240, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(baseURL, { waitUntil: "networkidle" });
    if (width === 1240) {
      const captionGap = await page.evaluate(() => {
        const note = document.querySelector(".hero-photo-note").getBoundingClientRect();
        const caption = document.querySelector(".image-disclaimer").getBoundingClientRect();
        return caption.top - note.bottom;
      });
      assert.ok(
        captionGap >= 8,
        "The product-photo caption must remain below the floating photo note at 1240px",
      );
    }
    await page
      .getByRole("button", { name: "Поръчай DECUCARE", exact: true })
      .click();
    await page.getByTestId("order-total").waitFor();
    const overflow = await page.evaluate(() => ({
      screen: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    assert.ok(
      overflow.document <= width && overflow.body <= width,
      `Horizontal overflow at ${width}: ${JSON.stringify(overflow)}`,
    );
    console.log(`No overflow at ${width}px`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.screenshot({
    caret: "initial",
    path: "test-results/mobile-full.png",
    fullPage: true,
  });
  await page.screenshot({
    caret: "initial",
    path: "test-results/mobile-hero.png",
  });
  const mobileHeroCaptionLayout = await page.evaluate(() => {
    const note = document.querySelector(".hero-photo-note").getBoundingClientRect();
    const caption = document.querySelector(".image-disclaimer").getBoundingClientRect();
    return caption.top - note.bottom;
  });
  assert.ok(
    mobileHeroCaptionLayout >= 8,
    "The product-photo caption must not overlap the floating photo note on mobile",
  );
  await page.locator("#retailers").scrollIntoViewIfNeeded();
  await page.locator("#retailers").screenshot({
    caret: "initial",
    path: "test-results/mobile-retailers.png",
  });
  const retailerMetrics = await page.locator(".retailer-card").evaluateAll((cards) =>
    cards.map((card) => {
      const logo = card.querySelector(".retailer-logo");
      return {
        height: card.getBoundingClientRect().height,
        logoHeight: logo.getBoundingClientRect().height,
      };
    }),
  );
  const retailerLogoHeights = retailerMetrics.map((retailer) => retailer.logoHeight);
  const retailerHeights = retailerMetrics.map((retailer) => retailer.height);
  assert.ok(
    Math.max(...retailerLogoHeights) - Math.min(...retailerLogoHeights) < 0.1,
    "Partner logos should use one display height on a 390px-wide phone",
  );
  assert.ok(
    Math.max(...retailerHeights) - Math.min(...retailerHeights) < 0.1,
    "Partner cards should have matching heights on a 390px-wide phone",
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.getByRole("button", { name: "Отвори менюто" }).click();
  assert.ok(await page.locator("#mobile-navigation").isVisible());
  assert.ok(
    await page
      .locator("#mobile-navigation")
      .getByRole("link", { name: "Партньори" })
      .isVisible(),
  );
  await page
    .locator("#mobile-navigation")
    .getByRole("link", { name: "Предимства" })
    .click();
  assert.equal(await page.locator("#mobile-navigation").isVisible(), false);
  await page.getByRole("button", { name: "Отвори менюто" }).click();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#mobile-navigation").isVisible(), false);
  await page
    .getByRole("button", { name: "Поръчай DECUCARE", exact: true })
    .click();
  assert.equal(
    await page.locator("#order-product").inputValue(),
    "decucare-150",
  );
  assert.equal(
    (await page.getByTestId("order-total").innerText()).trim(),
    "13.90 €",
  );
  await page
    .locator(".order-summary")
    .screenshot({ caret: "initial", path: "test-results/mobile-order-summary.png" });
  await page
    .locator(".form-card")
    .screenshot({ caret: "initial", path: "test-results/mobile-form.png" });
  const mobileAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await fs.writeFile(
    "test-results/accessibility-mobile.json",
    JSON.stringify(mobileAxe.violations, null, 2),
  );
  console.log(
    "Mobile accessibility:",
    mobileAxe.violations.map((v) => ({ id: v.id, count: v.nodes.length })),
  );
  await page.goto(`${baseURL}/privacy`, { waitUntil: "networkidle" });
  assert.ok(
    await page
      .getByRole("heading", { name: "Вашата поверителност." })
      .isVisible(),
  );
  assert.deepEqual(errors, [], "No browser runtime errors");
  assert.ok(
    submittedRequests.every((entry) => entry.endsWith("/api/orders")),
    "No unexpected personal-data submissions",
  );
  console.log(
    "PASS: owner photos/logo, no order-button arrows, sections, images, quantity, live order total, preselection, mocked order/question submission, real reviews, delivery/payment terms, phone/Facebook, manufacturer, mobile navigation, privacy.",
  );
  console.log(
    "Accessibility violation counts:",
    axe.violations.length,
    mobileAxe.violations.length,
  );
  assert.equal(
    axe.violations.length,
    0,
    "Desktop accessibility checks must pass",
  );
  assert.equal(
    mobileAxe.violations.length,
    0,
    "Mobile accessibility checks must pass",
  );
} finally {
  await browser.close();
}
