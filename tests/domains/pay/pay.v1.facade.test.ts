import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../../src/core/errors/request-api.error";
import { createPayV1Api } from "../../../src/domains/pay/v1";
import { createRequestClient } from "../../../src/request.client";
import { server } from "../../msw/setup";
import { TEST_BASE_URL } from "../../utils/test-env";

describe("Pay v1 facade", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });
  const legacyPay = createPayV1Api(client.http);

  const payload = {
    payee: "0x1234567890abcdef",
    amount: "10",
    invoiceCurrency: "USD",
    paymentCurrency: "ETH-mainnet",
  };
  const LEGACY_PREFIX = "legacy-pay";

  it("initiates a legacy payment via all entrypoints", async () => {
    const response = await client.pay.payRequest(payload);
    expect(response.requestId).toContain(LEGACY_PREFIX);

    const viaLegacy = await client.pay.legacy.payRequest(payload);
    expect(viaLegacy.requestId).toContain(LEGACY_PREFIX);

    const viaFactory = await legacyPay.payRequest(payload);
    expect(viaFactory.requestId).toContain(LEGACY_PREFIX);
  });

  it("maps 429 responses to RequestApiError with retry metadata", async () => {
    server.use(
      http.post(`${TEST_BASE_URL}/v1/pay`, () =>
        HttpResponse.json({ message: "Too many requests" }, { status: 429, headers: { "retry-after": "5" } }),
      ),
    );

    await expect(client.pay.payRequest(payload)).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      if (isRequestApiError(error)) {
        expect(error.retryAfterMs).toBeGreaterThan(0);
      }
      return true;
    });
  });
});
