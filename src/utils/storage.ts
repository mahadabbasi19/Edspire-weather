import type { City, WeatherSnapshot } from "../types";
// Storage fail ho to app chalegi; purana ya kharab data fresh nahi dikhayenge.
export function read<T>(
  key: string,
  valid: (value: unknown) => value is T,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data: unknown = JSON.parse(raw);
    return valid(data) ? data : fallback;
  } catch {
    return fallback;
  }
}
export function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    window.dispatchEvent(new Event("storage-failed"));
    return false;
  }
}
export const isCity = (v: unknown): v is City => {
  if (!v || typeof v !== "object") return false;
  const c = v as City;
  return (
    typeof c.id === "string" &&
    typeof c.name === "string" &&
    typeof c.country === "string" &&
    (c.region === undefined || typeof c.region === "string") &&
    (c.timezone === undefined || typeof c.timezone === "string") &&
    Number.isFinite(c.latitude) &&
    Math.abs(c.latitude) <= 90 &&
    Number.isFinite(c.longitude) &&
    Math.abs(c.longitude) <= 180
  );
};
export function isSnapshot(v: unknown): v is WeatherSnapshot {
  if (!v || typeof v !== "object") return false;
  const s = v as WeatherSnapshot;
  try {
    new Intl.DateTimeFormat("en", { timeZone: s.timezone }).format();
  } catch {
    return false;
  }
  return (
    isCity(s.city) &&
    (s.provider === "OpenWeather" || s.provider === "Open-Meteo") &&
    Number.isFinite(s.updatedAt) &&
    s.updatedAt <= Date.now() + 60000 &&
    Date.now() - s.updatedAt < 7 * 86400000 &&
    typeof s.timezone === "string" &&
    Number.isFinite(s.offset) &&
    !!s.current &&
    ["temperature", "feelsLike", "humidity", "wind", "code"].every((k) =>
      Number.isFinite(s.current[k as keyof typeof s.current]),
    ) &&
    typeof s.current.isDay === "boolean" &&
    (s.current.description === undefined ||
      typeof s.current.description === "string") &&
    (s.notice === undefined || typeof s.notice === "string") &&
    Array.isArray(s.forecast) &&
    s.forecast.length === 5 &&
    s.forecast.every(
      (d) =>
        !!d &&
        typeof d === "object" &&
        typeof d.sampled === "boolean" &&
        /^\d{4}-\d{2}-\d{2}$/.test(d.date) &&
        [d.high, d.low, d.code].every(Number.isFinite) &&
        (d.description === undefined || typeof d.description === "string"),
    )
  );
}
export function loadFavourites(): City[] {
  const cities = read(
    "wb-favourites",
    (v): v is City[] => Array.isArray(v) && v.every(isCity),
    [],
  );
  return cities
    .filter((c, i) => cities.findIndex((x) => x.id === c.id) === i)
    .slice(0, 5);
}
export function addFavourite(cities: City[], city: City): City[] {
  return cities.some((c) => c.id === city.id) || cities.length >= 5
    ? cities
    : [...cities, city];
}
export const temperature = (v: number, u: "C" | "F") =>
  Math.round(u === "F" ? (v * 9) / 5 + 32 : v);
export const cityError = (query: string, selected: boolean) =>
  !query.trim()
    ? "Enter a city name."
    : !selected
      ? "Choose a city from the suggestions."
      : "";
