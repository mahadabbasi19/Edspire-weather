import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
const responses = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (/open-meteo.com|openweathermap.org|p.rapidapi.com/.test(r.url())) {
    const url = new URL(r.url());
    if (url.searchParams.has("appid"))
      url.searchParams.set("appid", "REDACTED");
    responses.push({ url: url.toString(), status: r.status() });
  }
});
await page.goto("http://127.0.0.1:4173");
await page
  .locator(".forecast-day")
  .first()
  .waitFor({ timeout: 30000 })
  .catch(() => {});
await page.getByRole("combobox").fill("London");
await page
  .getByRole("option")
  .first()
  .waitFor({ timeout: 20000 })
  .catch(() => {});
const suggestions = await page.getByRole("option").allTextContents();
if (suggestions.length) {
  await page.getByRole("option").first().click();
  await page.waitForTimeout(2500);
}
await page.getByRole("combobox").press("Escape");
await page.screenshot({
  path: "docs/screenshots/live-desktop.png",
  fullPage: true,
});
await writeFile(
  "docs/live-check.json",
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      responses,
      suggestions,
      forecastCards: await page.locator(".forecast-day").count(),
      location: await page.locator(".location").innerText(),
      errors,
      body: (await page.locator("body").innerText()).slice(0, 2500),
    },
    null,
    2,
  ),
);
await browser.close();
