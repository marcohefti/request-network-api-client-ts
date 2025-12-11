export type HeaderValue = string | number | boolean | null | undefined | string[];

export type HeaderRecord = Record<string, HeaderValue>;

export type WebhookHeaders = HeaderRecord | Headers;

export type NormalisedHeaders = Record<string, string>;

function coerceHeaderValue(value: HeaderValue): string | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    const first = value.find((item) => item.length > 0);
    return first ?? undefined;
  }
  return typeof value === "string" ? value : String(value);
}

function isFetchHeaders(input: unknown): input is Headers {
  return typeof Headers !== "undefined" && input instanceof Headers;
}

export function normaliseHeaders(headers: WebhookHeaders | undefined): NormalisedHeaders {
  const result: NormalisedHeaders = {};
  if (!headers) return result;

  if (isFetchHeaders(headers)) {
    headers.forEach((value, key) => {
      result[key.toLowerCase()] = value;
    });
    return result;
  }

  for (const [key, value] of Object.entries(headers)) {
    const coerced = coerceHeaderValue(value);
    if (coerced != null) {
      result[key.toLowerCase()] = coerced;
    }
  }

  return result;
}

export function pickHeader(headers: WebhookHeaders | NormalisedHeaders | undefined, headerName: string): string | undefined {
  if (!headers) return undefined;
  const lower = headerName.toLowerCase();

  if (isFetchHeaders(headers)) {
    const value = headers.get(headerName);
    return value ?? undefined;
  }

  const record = headers as Record<string, HeaderValue | string>;
  const direct = record[headerName];
  if (typeof direct === "string") {
    return direct;
  }
  if (direct != null) {
    const coercedDirect = coerceHeaderValue(direct);
    if (coercedDirect) return coercedDirect;
  }

  const fallback = record[lower];
  if (typeof fallback === "string") {
    return fallback;
  }
  if (fallback != null) {
    return coerceHeaderValue(fallback);
  }
  return undefined;
}
