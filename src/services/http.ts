export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}
export async function json(
  url: string,
  signal: AbortSignal,
  headers?: HeadersInit,
): Promise<unknown> {
  const timeout = AbortSignal.timeout(12000);
  try {
    const response = await fetch(url, {
      signal: AbortSignal.any([signal, timeout]),
      headers,
    });
    if (!response.ok)
      throw new ApiError(
        response.status === 429
          ? "Request limit reached. Please wait before trying again."
          : response.status === 401 || response.status === 403
            ? "Provider authorization failed. Check the configured API key."
            : `Weather service unavailable (HTTP ${response.status}).`,
        response.status,
      );
    return await response.json();
  } catch (error) {
    if (signal.aborted) throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      timeout.aborted
        ? "The request timed out. Please try again."
        : navigator.onLine
          ? "Could not reach the provider. Check your connection and retry."
          : "Your device is offline. Connect to search or refresh.",
    );
  }
}
export const object = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new ApiError("The provider returned an invalid response.");
  return v as Record<string, unknown>;
};
export const num = (v: unknown): number => {
  if (typeof v !== "number" || !Number.isFinite(v))
    throw new ApiError("The provider returned incomplete weather data.");
  return v;
};
export const array = (v: unknown): unknown[] => {
  if (!Array.isArray(v))
    throw new ApiError("The provider returned invalid forecast data.");
  return v;
};
export const str = (v: unknown): string => {
  if (typeof v !== "string")
    throw new ApiError("The provider returned invalid location data.");
  return v;
};
