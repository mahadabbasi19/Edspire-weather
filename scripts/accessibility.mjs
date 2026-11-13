import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 900 },
});
const page = await context.newPage();
await page.goto("http://127.0.0.1:4173");
await page.locator(".forecast-day").first().waitFor({ timeout: 25000 });
const results = [];
for (const mode of ["light", "dark"]) {
  await page.evaluate(
    (mode) => (document.documentElement.dataset.theme = mode),
    mode,
  );
  for (const night of [false, true]) {
    await page
      .locator(".current-card")
      .evaluate((card, night) => card.classList.toggle("night", night), night);
    const result = await new AxeBuilder({ page }).analyze();
    results.push({
      mode,
      night,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
}
await writeFile("docs/accessibility.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
