import { afterEach, expect, it, vi } from "vitest";
import { json } from "./http";
afterEach(() => vi.unstubAllGlobals());
it.each([401, 403, 429, 503])(
  "reports HTTP %s without concealing the cause",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status })),
    );
    await expect(
      json("https://example.test", new AbortController().signal),
    ).rejects.toThrow(
      status === 401 || status === 403
        ? /authorization/
        : status === 429
          ? /limit/
          : /503/,
    );
  },
);
it("reports network failure", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network")));
  await expect(
    json("https://example.test", new AbortController().signal),
  ).rejects.toThrow(/reach the provider/);
});
it("reports invalid JSON as an unusable provider response", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not-json")));
  await expect(
    json("https://example.test", new AbortController().signal),
  ).rejects.toThrow();
});
