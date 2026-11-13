import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const base = process.argv[2];
if (
  !base ||
  (!base.startsWith("https://") && !base.startsWith("http://127.0.0.1:"))
)
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
  if (/open-meteo.com|openweathermap.org|p.rapidapi.com/.test(r.url())) {
    const url = new URL(r.url());
    if (url.searchParams.has("appid"))
      url.searchParams.set("appid", "REDACTED");
    responses.push({ url: url.toString(), status: r.status() });
  }
});
const response = await page.goto(base.replace(/\/?$/, "/"));
await page.locator(".forecast-day").first().waitFor({ timeout: 30000 });
await page.getByRole("combobox").fill("London");
await page.getByRole("option").first().waitFor({ timeout: 20000 });
await page
  .getByRole("option")
  .filter({ has: page.locator("strong", { hasText: /^London$/ }) })
  .first()
  .click();
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
  base.replace(/\/$/, "") + "/manifest.webmanifest",
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
const offlineBanner = page.getByText(
  /(?:You're offline|Connection unavailable)\. Showing the last saved weather for London\./,
);
await offlineBanner
  .waitFor({ state: "visible", timeout: 10000 })
  .catch(async (error) => {
    console.log(
      JSON.stringify({
        body: (await page.locator("body").innerText()).slice(0, 2600),
        state: await page.evaluate(() => ({
          online: navigator.onLine,
          city: JSON.parse(localStorage.getItem("wb-snapshot") ?? "null")?.city,
        })),
      }),
    );
    throw error;
  });
const offline = await offlineBanner.isVisible();
const forecastCards = await page.locator(".forecast-day").count();
await writeFile(
  process.argv[3] || "docs/deployment-check.json",
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
      browserOnlineHint: await page.evaluate(() => navigator.onLine),
      offlineBanner: await offlineBanner.innerText(),
      offlineForecastCards: forecastCards,
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
if (!offline || forecastCards !== 5 || errors.length) process.exitCode = 1;
