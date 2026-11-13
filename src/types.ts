export interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}
export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  code: number;
  sampled: boolean;
}
export interface WeatherSnapshot {
  city: City;
  provider: "OpenWeather" | "Open-Meteo";
  updatedAt: number;
  timezone: string;
  offset: number;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    wind: number;
    code: number;
    isDay: boolean;
  };
  forecast: ForecastDay[];
  notice?: string;
}
export type Unit = "C" | "F";
