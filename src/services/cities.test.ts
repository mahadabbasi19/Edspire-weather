import { afterEach, expect, it, vi } from "vitest";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});
it("uses the GeoDB contract when a project key is configured", async () => {
  vi.stubEnv("VITE_GEODB_API_KEY", "fixture-key");
  const mock = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        data: [
          {
            city: "Paris",
            country: "France",
            region: "Île-de-France",
            latitude: 48.85,
            longitude: 2.35,
          },
        ],
      }),
    ),
  );
  vi.stubGlobal("fetch", mock);
  const { searchCities } = await import("./cities");
  const cities = await searchCities(" Paris ", new AbortController().signal);
  expect(mock.mock.calls[0][0]).toContain("namePrefix=Paris");
  expect(mock.mock.calls[0][1].headers["X-RapidAPI-Key"]).toBe("fixture-key");
  expect(cities[0]).toMatchObject({
    name: "Paris",
    latitude: 48.85,
    longitude: 2.35,
  });
});
it("returns zero results from an empty provider result", async () => {
  vi.stubEnv("VITE_GEODB_API_KEY", "");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
  const { searchCities } = await import("./cities");
  expect(await searchCities("zzzzz", new AbortController().signal)).toEqual([]);
});
