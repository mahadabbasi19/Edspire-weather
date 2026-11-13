import { afterEach, expect, it, vi } from "vitest";
import { aggregateForecast, loadWeather, normalizeMeteo } from "./weather";
const city = {
  id: "test",
  name: "Karachi",
  country: "Pakistan",
  latitude: 24.86,
  longitude: 67.01,
};
const payload = {
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
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("normalizes Open-Meteo data and rejects incomplete payloads", () => {
  const result = normalizeMeteo(payload, city);
  expect(result.forecast).toHaveLength(5);
  expect(result.current.temperature).toBe(27);
  expect(result.timezone).toBe("Asia/Karachi");
  expect(() => normalizeMeteo({ ...payload, current: {} }, city)).toThrow();
  expect(() =>
    normalizeMeteo({ ...payload, daily: { ...payload.daily, time: [] } }, city),
  ).toThrow();
});
it("groups three-hour samples by city date across UTC midnight", () => {
  const entry = (dt: string, t: number) => ({
    dt: Date.parse(dt) / 1000,
    main: { temp_min: t - 1, temp_max: t + 1 },
    weather: [{ id: 800, description: "clear sky" }],
  });
  const result = aggregateForecast(
    [
      entry("2026-11-13T18:00:00Z", 20),
      entry("2026-11-13T21:00:00Z", 25),
      entry("2026-11-14T00:00:00Z", 23),
    ],
    18000,
  );
  expect(result.map((d) => d.date)).toEqual(["2026-11-13", "2026-11-14"]);
  expect(result[1]).toMatchObject({ high: 26, low: 22, sampled: true });
});
it.each([429, 401, 503])(
  "falls back when primary responds %s",
  async (status) => {
    vi.stubEnv("VITE_OPENWEATHER_API_KEY", "test-key");
    const mock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status }))
      .mockResolvedValueOnce(new Response("{}", { status }))
      .mockResolvedValueOnce(new Response(JSON.stringify(payload)));
    vi.stubGlobal("fetch", mock);
    const fallback = vi.fn();
    const result = await loadWeather(
      city,
      new AbortController().signal,
      fallback,
    );
    expect(result.provider).toBe("Open-Meteo");
    expect(result.notice).toContain("OpenWeather unavailable");
    expect(fallback).toHaveBeenCalledOnce();
    expect(mock).toHaveBeenCalledTimes(3);
  },
);
it("does not fall back on user cancellation", async () => {
  vi.stubEnv("VITE_OPENWEATHER_API_KEY", "test-key");
  const controller = new AbortController();
  controller.abort();
  const mock = vi
    .fn()
    .mockRejectedValue(new DOMException("Aborted", "AbortError"));
  vi.stubGlobal("fetch", mock);
  await expect(loadWeather(city, controller.signal)).rejects.toThrow("Aborted");
  expect(mock).toHaveBeenCalledTimes(2);
});
it("falls back after invalid primary payloads", async () => {
  vi.stubEnv("VITE_OPENWEATHER_API_KEY", "test");
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(new Response("{}"))
      .mockResolvedValueOnce(new Response("{}"))
      .mockResolvedValueOnce(new Response(JSON.stringify(payload))),
  );
  expect((await loadWeather(city, new AbortController().signal)).provider).toBe(
    "Open-Meteo",
  );
});

it("normalizes a successful OpenWeather current and five-day response", async () => {
  vi.stubEnv("VITE_OPENWEATHER_API_KEY", "fixture-key");
  const start = Date.parse("2026-11-13T00:00:00Z") / 1000;
  const current = {
    dt: start + 3600 * 12,
    timezone: 18000,
    main: { temp: 24, feels_like: 25, humidity: 60 },
    wind: { speed: 5 },
    weather: [{ id: 721, description: "haze" }],
    sys: { sunrise: start, sunset: start + 3600 * 18 },
  };
  const forecast = {
    list: Array.from({ length: 40 }, (_, i) => ({
      dt: start + i * 10800,
      main: { temp_min: 20 + (i % 3), temp_max: 25 + (i % 4) },
      weather: [{ id: 801 }],
    })),
  };
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation((url: string) =>
        Promise.resolve(
          new Response(
            JSON.stringify(url.includes("/weather?") ? current : forecast),
          ),
        ),
      ),
  );
  const result = await loadWeather(city, new AbortController().signal);
  expect(result.provider).toBe("OpenWeather");
  expect(result.current.description).toBe("Haze");
  expect(result.current).toMatchObject({
    temperature: 24,
    humidity: 60,
    wind: 18,
    code: 45,
    isDay: true,
  });
  expect(result.forecast).toHaveLength(5);
  expect(result.forecast[0].date).toBe("2026-11-13");
  expect(result.forecast.every((d) => d.sampled)).toBe(true);
});
