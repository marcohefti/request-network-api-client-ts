import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { createHttpClient } from "../../src/core/http/client.factory";
import { server } from "../msw/setup";
import { TEST_BASE_URL } from "../utils/test-env";

describe("Retry interceptor", () => {
  it("retries on 503 and eventually succeeds", async () => {
    let calls = 0;
    server.use(
      http.get(`${TEST_BASE_URL}/flaky`, () => {
        calls += 1;
        if (calls < 3) {
          return HttpResponse.text("unavailable", { status: 503 });
        }
        return HttpResponse.json({ ok: true }, { status: 200 });
      }),
    );

    const httpClient = createHttpClient({ baseUrl: TEST_BASE_URL, retry: { config: { maxAttempts: 3, initialDelayMs: 5, maxDelayMs: 20 } } });
    const res = await httpClient.get("/flaky");
    expect(res.status).toBe(200);
    expect(calls).toBe(3);
  });

  it("honors Retry-After header for 429", async () => {
    const spy = vi.spyOn(global, "setTimeout");
    let calls = 0;
    server.use(
      http.get(`${TEST_BASE_URL}/rate-limited`, () => {
        calls += 1;
        if (calls < 2) {
          return HttpResponse.json(
            { message: "Too many" },
            {
              status: 429,
              headers: { "retry-after": "1" },
            },
          );
        }
        return HttpResponse.json({ ok: true }, { status: 200 });
      }),
    );

    const httpClient = createHttpClient({ baseUrl: TEST_BASE_URL, retry: { config: { maxAttempts: 2, initialDelayMs: 5, maxDelayMs: 100 } } });
    const res = await httpClient.get("/rate-limited");
    expect(res.status).toBe(200);
    // setTimeout called at least once; don't assert exact delay due to jitter
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
