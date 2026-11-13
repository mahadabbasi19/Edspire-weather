import type { City, ForecastDay, WeatherSnapshot } from "../types";
import { array, json, num, object, str, ApiError } from "./http";
export function condition(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}
export function owmCode(id: number): number {
  if (id === 800) return 0;
  if (id === 801) return 1;
  if (id === 802) return 2;
  if (id >= 803) return 3;
  if (id >= 700) return 45;
  if (id >= 600) return 73;
  if (id >= 500) return 63;
  if (id >= 300) return 51;
  return 95;
}
function providerDescription(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
// UTC samples ko shehar ke offset se local calendar din mein jama kar rahe hain.
export function aggregateForecast(
  list: unknown[],
  offset: number,
): ForecastDay[] {
  const days = new Map<
    string,
    { temps: number[]; code: number; distance: number; description?: string }
  >();
  for (const value of list) {
    const item = object(value);
    const date = new Date((num(item.dt) + offset) * 1000);
    const key = date.toISOString().slice(0, 10);
    const distance = Math.abs(date.getUTCHours() - 12);
    const main = object(item.main);
    const weather = object(array(item.weather)[0]);
    const code = owmCode(num(weather.id));
    const day = days.get(key) ?? { temps: [], code, distance: Infinity };
    day.temps.push(num(main.temp_min), num(main.temp_max));
    if (distance < day.distance) {
      day.code = code;
      day.description = providerDescription(weather.description);
      day.distance = distance;
    }
    days.set(key, day);
  }
  return [...days].slice(0, 5).map(([date, d]) => ({
    date,
    high: Math.max(...d.temps),
    low: Math.min(...d.temps),
    code: d.code,
    sampled: true,
    description: d.description,
  }));
}
export function normalizeMeteo(raw: unknown, city: City): WeatherSnapshot {
  const d = object(raw),
    c = object(d.current),
    daily = object(d.daily);
  const dates = array(daily.time),
    high = array(daily.temperature_2m_max),
    low = array(daily.temperature_2m_min),
    codes = array(daily.weather_code);
  const timezone = str(d.timezone);
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format();
  } catch {
    throw new ApiError("Provider returned an invalid timezone.");
  }
  const forecast = dates.slice(0, 5).map((date, i) => ({
    date: str(date),
    high: num(high[i]),
    low: num(low[i]),
    code: num(codes[i]),
    sampled: false,
  }));
  if (
    forecast.length !== 5 ||
    new Set(forecast.map((d) => d.date)).size !== 5 ||
    forecast.some(
      (d) =>
        !/^\d{4}-\d{2}-\d{2}$/.test(d.date) ||
        !Number.isFinite(Date.parse(d.date)),
    )
  )
    throw new ApiError("Provider returned fewer than five forecast days.");
  return {
    city,
    provider: "Open-Meteo",
    updatedAt: Date.now(),
    timezone,
    offset: num(d.utc_offset_seconds),
    current: {
      temperature: num(c.temperature_2m),
      feelsLike: num(c.apparent_temperature),
      humidity: num(c.relative_humidity_2m),
      wind: num(c.wind_speed_10m),
      code: num(c.weather_code),
      isDay: num(c.is_day) === 1,
    },
    forecast,
  };
}
async function meteo(city: City, signal: AbortSignal) {
  return normalizeMeteo(
    await json(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`,
      signal,
    ),
    city,
  );
}
async function openWeather(
  city: City,
  signal: AbortSignal,
): Promise<WeatherSnapshot> {
  const base = `lat=${city.latitude}&lon=${city.longitude}&units=metric&appid=${encodeURIComponent(import.meta.env.VITE_OPENWEATHER_API_KEY)}`;
  const [current, forecast] = await Promise.all([
    json(`https://api.openweathermap.org/data/2.5/weather?${base}`, signal),
    json(`https://api.openweathermap.org/data/2.5/forecast?${base}`, signal),
  ]);
  const c = object(current),
    f = object(forecast),
    m = object(c.main),
    sys = object(c.sys);
  const offset = num(c.timezone),
    days = aggregateForecast(array(f.list), offset);
  if (days.length !== 5)
    throw new ApiError("OpenWeather returned fewer than five forecast days.");
  return {
    city,
    provider: "OpenWeather",
    timezone: city.timezone ?? "UTC",
    offset,
    updatedAt: Date.now(),
    current: {
      temperature: num(m.temp),
      feelsLike: num(m.feels_like),
      humidity: num(m.humidity),
      wind: num(object(c.wind).speed) * 3.6,
      code: owmCode(num(object(array(c.weather)[0]).id)),
      description: providerDescription(object(array(c.weather)[0]).description),
      isDay: num(c.dt) >= num(sys.sunrise) && num(c.dt) < num(sys.sunset),
    },
    forecast: days,
  };
}
export async function loadWeather(
  city: City,
  signal: AbortSignal,
  onFallback?: () => void,
): Promise<WeatherSnapshot> {
  let notice: string;
  if (import.meta.env.VITE_OPENWEATHER_API_KEY?.trim()) {
    try {
      return await openWeather(city, signal);
    } catch (error) {
      if (signal.aborted) throw error;
      notice = `OpenWeather unavailable: ${error instanceof Error ? error.message : "Invalid response."} Using Open-Meteo.`;
      onFallback?.();
    }
  } else notice = "OpenWeather key is not configured. Using Open-Meteo.";
  const data = await meteo(city, signal);
  return { ...data, notice };
}
