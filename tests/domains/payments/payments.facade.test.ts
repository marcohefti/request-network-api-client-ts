import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../../src/core/errors/request-api.error";
import { createPaymentsApi } from "../../../src/domains/payments";
import { createRequestClient } from "../../../src/request.client";
import { server } from "../../msw/setup";
import { TEST_BASE_URL } from "../../utils/test-env";

describe("Payments search facade", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });
  const payments = createPaymentsApi(client.http);
  const PAYMENT_CURRENCY = "ETH-sepolia-sepolia";

  it("searches payments with pagination metadata", async () => {
    const result = await client.payments.search({ limit: "1", offset: "0" });
    expect(result.payments).toHaveLength(1);
    expect(result.pagination.hasMore).toBe(true);
    expect(result.payments[0]?.request?.requestId).toBe("req-paid");
  });

  it("returns empty array when no payments match", async () => {
    const result = await payments.search({ paymentReference: "EMPTY" });
    expect(result.payments).toHaveLength(0);
    expect(result.pagination.hasMore).toBe(false);
    expect(result.pagination.total).toBe(0);
  });

  it("accepts fees with null amounts", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v2/payments`, () =>
        HttpResponse.json({
          payments: [
            {
              id: "pay-1",
              amount: "0.01",
              sourceNetwork: "sepolia",
              destinationNetwork: "sepolia",
              timestamp: new Date().toISOString(),
              type: "direct",
              currency: "USD",
              paymentCurrency: PAYMENT_CURRENCY,
              fees: [
                { type: "gas", stage: "sending", amount: null, currency: PAYMENT_CURRENCY },
                { type: "platform", stage: "receiving", amountInUSD: null, currency: "USD" },
              ],
              request: { requestId: "req-paid", paymentReference: "0xabc", hasBeenPaid: true },
            },
          ],
          pagination: { hasMore: false, offset: 0, limit: 10, total: 1 },
        }),
      ),
    );

    const result = await client.payments.search({ limit: "1", offset: "0" });
    expect(result.payments).toHaveLength(1);
    expect(result.payments[0]?.fees?.[0]?.amount).toBeNull();
  });

  it("maps 429 responses to RequestApiError with retry metadata", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v2/payments`, () =>
        HttpResponse.json({ message: "Too many requests" }, { status: 429, headers: { "retry-after": "3" } }),
      ),
    );

    await expect(
      client.payments.search({ walletAddress: "0xretry" }, { meta: { retry: { maxAttempts: 1 } } }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      if (isRequestApiError(error)) {
        expect(error.retryAfterMs).toBeGreaterThan(0);
      }
      return true;
    });
  });

  it("forwards search filters including requestId and pagination", async () => {
    let capturedUrl: URL | undefined;

    server.use(
      http.get(`${TEST_BASE_URL}/v2/payments`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({ payments: [], pagination: { hasMore: false, offset: 0, limit: 10, total: 0 } });
      }),
    );

    const requestId = "req-123";
    const walletAddress = "0xabc";
    const limit = "10";
    const offset = "5";
    const paymentCurrency = PAYMENT_CURRENCY;
    const type = "direct" as const;

    await payments.search({
      requestId,
      walletAddress,
      limit,
      offset,
      type,
      paymentCurrency,
    });

    expect(capturedUrl?.searchParams.get("requestId")).toBe(requestId);
    expect(capturedUrl?.searchParams.get("walletAddress")).toBe(walletAddress);
    expect(capturedUrl?.searchParams.get("limit")).toBe(limit);
    expect(capturedUrl?.searchParams.get("offset")).toBe(offset);
    expect(capturedUrl?.searchParams.get("paymentCurrency")).toBe(paymentCurrency);
    expect(capturedUrl?.searchParams.get("type")).toBe(type);
  });
});
