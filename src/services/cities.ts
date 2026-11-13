import type { City } from "../types";
import { array, json, num, object, str } from "./http";
export const geoConfigured = !!import.meta.env.VITE_GEODB_API_KEY?.trim();
export async function searchCities(
  query: string,
  signal: AbortSignal,
): Promise<City[]> {
  if (geoConfigured) {
    const data = object(
      await json(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(query.trim())}&limit=5&sort=-population&types=CITY`,
        signal,
        {
          "X-RapidAPI-Key": import.meta.env.VITE_GEODB_API_KEY,
          "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        },
      ),
    );
    return array(data.data).map((v) => {
      const c = object(v);
      return {
        id: `${num(c.latitude).toFixed(3)},${num(c.longitude).toFixed(3)}`,
        name: str(c.city),
        country: str(c.country),
        region: typeof c.region === "string" ? c.region : undefined,
        latitude: num(c.latitude),
        longitude: num(c.longitude),
      };
    });
  }
  const data = object(
    await json(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`,
      signal,
    ),
  );
  return array(data.results ?? []).map((v) => {
    const c = object(v);
    return {
      id: `${num(c.latitude).toFixed(3)},${num(c.longitude).toFixed(3)}`,
      name: str(c.name),
      country: str(c.country),
      region: typeof c.admin1 === "string" ? c.admin1 : undefined,
      latitude: num(c.latitude),
      longitude: num(c.longitude),
      timezone: typeof c.timezone === "string" ? c.timezone : undefined,
    };
  });
}
