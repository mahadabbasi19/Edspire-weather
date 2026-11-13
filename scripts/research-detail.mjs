import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const notes = [];
for (const [name, url, scroll] of [
  ["linear-detail", "https://linear.app", 650],
  [
    "vercel-detail",
    "https://vercel.com/docs/deployments/managing-deployments",
    600,
  ],
  ["mercury-detail", "https://mercury.com", 850],
  ["mobbin-detail", "https://mobbin.com", 1200],
]) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(4000);
    await page.mouse.wheel(0, scroll);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `docs/references/${name}.png` });
    notes.push({
      name,
      text: (await page.locator("body").innerText()).slice(0, 1000),
    });
  } catch (e) {
    notes.push({ name, error: e.message });
  }
}
try {
  await page.goto("https://stripe.com/payments/checkout", {
    waitUntil: "domcontentloaded",
  });
  await page
    .getByRole("link", { name: /Try the demo/ })
    .first()
    .click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: "docs/references/stripe-demo.png" });
  notes.push({
    name: "stripe-demo",
    url: page.url(),
    text: (await page.locator("body").innerText()).slice(0, 2000),
  });
} catch (e) {
  notes.push({ name: "stripe-demo", error: e.message });
}
await writeFile(
  "docs/references/detail-results.json",
  JSON.stringify(notes, null, 2),
);
await browser.close();
