import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const refs = [
  ["linear", "https://linear.app"],
  ["vercel", "https://vercel.com/docs/deployments/managing-deployments"],
  ["stripe", "https://stripe.com/payments/checkout"],
  ["mercury", "https://demo.mercury.com/dashboard"],
  ["dribbble", "https://dribbble.com/search/weather-dashboard"],
  ["mobbin", "https://mobbin.com/discover/apps/ios"],
];
const results = [];
for (const [name, url] of refs) {
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 25000,
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `docs/references/${name}.png` });
    results.push({
      name,
      url: page.url(),
      status: response?.status(),
      title: await page.title(),
      text: (await page.locator("body").innerText()).slice(0, 1800),
    });
  } catch (error) {
    results.push({ name, error: error.message });
  }
}
await writeFile(
  "docs/references/results.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
