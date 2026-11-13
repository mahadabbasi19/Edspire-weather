import { test, expect } from "@playwright/test";
const weather = {
  timezone: "Asia/Karachi",
  utc_offset_seconds: 18000,
  current: {
    temperature_2m: 27,
    apparent_temperature: 29,
    relative_humidity_2m: 50,
    wind_speed_10m: 12,
    weather_code: 1,
    is_day: 1,
  },
  daily: {
    time: [
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
      "2026-11-16",
      "2026-11-17",
    ],
    temperature_2m_max: [28, 29, 30, 29, 28],
    temperature_2m_min: [20, 20, 21, 20, 19],
    weather_code: [1, 2, 3, 0, 1],
  },
};
test.beforeEach(async ({ page }) => {
  await page.route("https://api.openweathermap.org/**", (route) =>
    route.fulfill({ status: 429, json: {} }),
  );
  await page.route("https://wft-geo-db.p.rapidapi.com/**", (route) =>
    route.fulfill({
      json: {
        data: [
          {
            city: "Paris",
            country: "France",
            region: "Île-de-France",
            latitude: 48.85,
            longitude: 2.35,
          },
        ],
      },
    }),
  );

  await page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ json: weather }),
  );
  await page.route("https://geocoding-api.open-meteo.com/**", (route) =>
    route.fulfill({
      json: {
        results: [
          {
            id: 1,
            name: "Paris",
            country: "France",
            admin1: "Île-de-France",
            latitude: 48.85,
            longitude: 2.35,
            timezone: "Europe/Paris",
          },
        ],
      },
    }),
  );
});
test("search, five forecasts, favourites persist and removal confirms", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".forecast-day")).toHaveCount(5);
  await page.getByRole("combobox").fill("Paris");
  await page.getByRole("option").click();
  await expect(page.locator(".location")).toHaveText("Paris, France");
  await page.getByRole("button", { name: "Save city", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove Paris", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove Paris", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove Paris", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove Paris", exact: true }).click();
  await page.getByRole("button", { name: "Remove city", exact: true }).click();
  await expect(page.getByText("Keep your places close.")).toBeVisible();
});
test("offline production reload restores shell and saved weather", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.locator(".forecast-day")).toHaveCount(5);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.reload();
  await expect(page.locator(".forecast-day")).toHaveCount(5);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText(
      "You're offline. Showing the last saved weather for Karachi.",
    ),
  ).toBeVisible();
  await expect(page.locator(".forecast-day")).toHaveCount(5);
  await expect(page.locator(".weather-status")).toContainText("Saved forecast");
});
for (const width of [375, 600, 768, 1024, 1280])
  test(`responsive layout and units at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.locator(".forecast-day")).toHaveCount(5);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "°F", exact: true }).click();
    await expect(page.locator(".temperature")).toContainText("81°");
    await page.getByRole("button", { name: /Switch to .* theme/ }).click();
    await page.screenshot({
      path: `docs/screenshots/weatherboard-${width}.png`,
      fullPage: true,
    });
  });
test("weather errors and search empty and permission denial are explicit", async ({
  page,
}) => {
  await page.route("https://api.open-meteo.com/**", (r) =>
    r.fulfill({ status: 429, json: {} }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Request limit reached");
  await page
    .getByRole("button", { name: "Search cities", exact: true })
    .click();
  await expect(page.getByText("Enter a city name.")).toBeVisible();
  await page.getByRole("combobox").press("Escape");
  await page.addInitScript(() => {
    Object.defineProperty(Notification, "permission", { get: () => "denied" });
    Notification.requestPermission = async () => "denied";
  });
  await page.reload();
  await page.getByRole("button", { name: "Allow active-app reminder" }).click();
  await expect(page.getByText(/Notifications are not allowed/)).toBeVisible();
});
test("stale search results cannot replace the newest query", async ({
  page,
}) => {
  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    const old = /(?:name|namePrefix)=Lon/.test(route.request().url());
    if (old) await new Promise((r) => setTimeout(r, 800));
    await route
      .fulfill({
        json: {
          data: [
            {
              city: old ? "London" : "Paris",
              country: old ? "UK" : "France",
              latitude: old ? 51 : 48,
              longitude: old ? 0 : 2,
            },
          ],
          results: [
            {
              name: old ? "London" : "Paris",
              country: old ? "UK" : "France",
              latitude: old ? 51 : 48,
              longitude: old ? 0 : 2,
            },
          ],
        },
      })
      .catch(() => {});
  });
  await page.goto("/");
  const input = page.getByRole("combobox");
  await input.fill("Lon");
  await page.waitForTimeout(400);
  await input.fill("Paris");
  await expect(page.getByRole("option")).toContainText("Paris");
  await page.waitForTimeout(900);
  await expect(page.getByRole("option")).toContainText("Paris");
});

test("keyboard search dismissal, dialog focus, unit and theme persistence", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".forecast-day")).toHaveCount(5);
  const search = page.getByRole("combobox");
  await search.fill("Paris");
  await page.getByRole("option").waitFor();
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(page.locator(".location")).toContainText("Paris");
  await page.getByRole("button", { name: "Save city", exact: true }).click();
  const remove = page.getByRole("button", {
    name: "Remove Paris",
    exact: true,
  });
  await remove.click();
  await expect(
    page.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(remove).toBeFocused();
  await page.getByRole("button", { name: "°F", exact: true }).click();
  await page.getByRole("button", { name: /Switch to dark theme/ }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "°F", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
test("storage failures do not break weather or favourites", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await expect(page.locator(".forecast-day")).toHaveCount(5);
  await expect(page.getByText(/Browser storage is unavailable/)).toBeVisible();
  await page.getByRole("button", { name: "Save city", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove Karachi", exact: true }),
  ).toBeVisible();
});
test("first-use offline state and unsupported notifications remain usable", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    delete (window as unknown as Record<string, unknown>).Notification;
  });
  await page.goto("/");
  await expect(page.locator(".forecast-day")).toHaveCount(5);
  await page.getByRole("button", { name: "Allow active-app reminder" }).click();
  await expect(
    page.getByText(/Notifications need a supported browser/),
  ).toBeVisible();
  await page.evaluate(() => localStorage.removeItem("wb-snapshot"));
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText(/Connect once to save a forecast/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "No forecast available" }),
  ).toBeVisible();
});

test("notification delivery failure is surfaced without breaking weather", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["notifications"]);
  await page.addInitScript(() => {
    Object.defineProperty(Notification, "permission", { get: () => "granted" });
    ServiceWorkerRegistration.prototype.showNotification = async () => {
      throw new Error("Browser notification delivery is blocked.");
    };
  });
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.getByRole("button", { name: "Allow active-app reminder" }).click();
  await expect(
    page.getByRole("button", { name: "Turn off active-app reminder" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send a test notification" }).click();
  await expect(
    page.getByText("Browser notification delivery is blocked."),
  ).toBeVisible();
  await expect(page.locator(".forecast-day")).toHaveCount(5);
});

test("connection failure is visible even when the browser reports online", async ({
  page,
  context,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "onLine", { get: () => true }),
  );
  await page.goto("/");
  await expect(page.locator(".forecast-day")).toHaveCount(5);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.unroute("https://api.open-meteo.com/**");
  await page.unroute("https://api.openweathermap.org/**");
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText(
      "Connection unavailable. Showing the last saved weather for Karachi.",
    ),
  ).toBeVisible();
  await expect(page.locator(".forecast-day")).toHaveCount(5);
});
