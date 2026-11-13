import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const base = process.argv[2];
if (!base?.startsWith("https://"))
  throw new Error("An HTTPS deployment URL is required.");
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 1000 },
});
const page = await context.newPage();
const errors = [],
  responses = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", (r) => {
  if (r.url().includes("open-meteo.com"))
    responses.push({ url: r.url(), status: r.status() });
});
const response = await page.goto(base);
await page.locator(".forecast-day").first().waitFor({ timeout: 30000 });
await page.getByRole("combobox").fill("London");
await page.getByRole("option").first().waitFor({ timeout: 20000 });
await page.getByRole("option").first().click();
await page.waitForFunction(
  () =>
    document.querySelector(".location")?.textContent?.includes("London") &&
    document
      .querySelector(".weather-status")
      ?.textContent?.includes("Current conditions"),
);
await page.evaluate(async () => {
  await navigator.serviceWorker.ready;
});
await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
const manifestResponse = await context.request.get(
  base + "/manifest.webmanifest",
);
const manifest = await manifestResponse.json();
const cdp = await context.newCDPSession(page);
let installability;
try {
  installability = await cdp.send("Page.getInstallabilityErrors");
} catch (e) {
  installability = { unavailable: e.message };
}
await page.screenshot({
  path: "docs/screenshots/deployed-desktop.png",
  fullPage: true,
});
await page.setViewportSize({ width: 375, height: 900 });
const noOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth <= window.innerWidth,
);
await page.screenshot({
  path: "docs/screenshots/deployed-mobile.png",
  fullPage: true,
});
await context.setOffline(true);
await page.reload();
const offline = await page
  .getByText("You're offline. Showing the last saved weather for London.")
  .isVisible();
const forecastCards = await page.locator(".forecast-day").count();
await writeFile(
  "docs/deployment-check.json",
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      url: base,
      httpStatus: response.status(),
      manifestStatus: manifestResponse.status(),
      manifest,
      installability,
      workerControlled: await page.evaluate(
        () => !!navigator.serviceWorker.controller,
      ),
      responses,
      noOverflowAt375: noOverflow,
      offlineReload: offline,
      offlineForecastCards: forecastCards,
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
if (!offline || forecastCards !== 5 || errors.length) process.exitCode = 1;
