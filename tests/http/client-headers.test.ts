import { describe, expect, it } from "vitest";

import { createHttpClient } from "../../src/core/http/client.factory";
import type { HttpAdapter, HttpRequest, HttpResponse } from "../../src/core/http/http.types";

const BASE_URL = "https://api.request.network" as const;
const API_KEY = "api-123";
const CLIENT_ID = "client-xyz";
const ORIGIN = "https://app.example";
const USER_AGENT = "request-api-client-tests";
const SDK_NAME = "request-sdk";
const SDK_VERSION = "1.2.3";
const TRACE_ID = "trace-1";

describe("HTTP client headers", () => {
  it("merges credential, telemetry, and custom headers", async () => {
    let captured: HttpRequest | undefined;
    const adapter: HttpAdapter = {
      send: (request) => {
        captured = request;
        const response: HttpResponse = { status: 200, ok: true, headers: {}, data: { ok: true } };
        return Promise.resolve(response);
      },
    };

    const client = createHttpClient({
      baseUrl: BASE_URL,
      adapter,
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      origin: ORIGIN,
      userAgent: USER_AGENT,
      sdkInfo: { name: SDK_NAME, version: SDK_VERSION },
      headers: { "x-trace-id": TRACE_ID },
      retry: { config: { maxAttempts: 1 } },
    });

    const res = await client.get("/headers");
    expect(res.status).toBe(200);
    expect(captured?.headers).toMatchObject({
      "x-api-key": API_KEY,
      "x-client-id": CLIENT_ID,
      Origin: ORIGIN,
      "user-agent": USER_AGENT,
      "x-sdk": `${SDK_NAME}/${SDK_VERSION}`,
      "x-trace-id": TRACE_ID,
    });
  });
});
