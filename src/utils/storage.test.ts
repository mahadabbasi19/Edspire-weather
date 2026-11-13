import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addFavourite,
  cityError,
  isSnapshot,
  loadFavourites,
  read,
  temperature,
  write,
} from "./storage";
import type { City } from "../types";
const city = (i: number): City => ({
  id: String(i),
  name: "Springfield",
  country: "US",
  latitude: i,
  longitude: i,
});
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("safe persistence", () => {
  it("recovers corrupted JSON and invalid schemas", () => {
    localStorage.setItem("wb-favourites", "{");
    expect(loadFavourites()).toEqual([]);
    localStorage.setItem("wb-favourites", "[{}]");
    expect(loadFavourites()).toEqual([]);
  });
  it("deduplicates and limits stored cities", () => {
    localStorage.setItem(
      "wb-favourites",
      JSON.stringify([
        city(0),
        city(0),
        ...Array.from({ length: 7 }, (_, i) => city(i + 1)),
      ]),
    );
    expect(loadFavourites()).toHaveLength(5);
  });
  it("survives blocked reads and quota errors", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(read("x", (v): v is string => typeof v === "string", "safe")).toBe(
      "safe",
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(write("x", {})).toBe(false);
  });
  it("rejects malformed and expired snapshots", () => {
    expect(isSnapshot({ city: city(1) })).toBe(false);
    expect(isSnapshot(null)).toBe(false);
  });
});
it("prevents duplicate and sixth favourites while distinguishing namesakes", () => {
  let list: City[] = [];
  for (let i = 0; i < 6; i++) list = addFavourite(list, city(i));
  expect(list).toHaveLength(5);
  expect(addFavourite(list, city(0))).toBe(list);
  expect(list[0].name).toBe(list[1].name);
});
it("validates empty, whitespace and unresolved city input", () => {
  expect(cityError("", false)).toBe("Enter a city name.");
  expect(cityError("   ", false)).toBe("Enter a city name.");
  expect(cityError("Paris", false)).toMatch(/suggestions/);
  expect(cityError("Paris", true)).toBe("");
});
it("converts from normalized Celsius once", () => {
  expect(temperature(0, "F")).toBe(32);
  expect(temperature(100, "F")).toBe(212);
  expect(temperature(-10, "C")).toBe(-10);
});

it("rejects corrupted optional snapshot text instead of rendering objects", () => {
  const snapshot = {
    city: city(1),
    provider: "OpenWeather",
    updatedAt: Date.now(),
    timezone: "UTC",
    offset: 0,
    current: {
      temperature: 20,
      feelsLike: 20,
      humidity: 50,
      wind: 10,
      code: 0,
      isDay: true,
      description: { invalid: true },
    },
    forecast: Array.from({ length: 5 }, (_, i) => ({
      date: `2026-11-${13 + i}`,
      high: 25,
      low: 20,
      code: 0,
      sampled: true,
    })),
  };
  expect(isSnapshot(snapshot)).toBe(false);
  expect(
    isSnapshot({
      ...snapshot,
      current: { ...snapshot.current, description: "Clear sky" },
    }),
  ).toBe(true);
});
