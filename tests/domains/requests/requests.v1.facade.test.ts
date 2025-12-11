import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { createRequestsV1Api } from "../../../src/domains/requests/v1";
import { createRequestClient } from "../../../src/request.client";
import { ValidationError } from "../../../src/validation/zod.helpers";
import { server } from "../../msw/setup";
import { TEST_BASE_URL } from "../../utils/test-env";

describe("Requests v1 facade", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });
  const legacyRequests = createRequestsV1Api(client.http);
  const LEGACY_REF = "legacy-ref";
  const PAID_REF = "paid-ref";

  it("creates a legacy request", async () => {
    const response = await legacyRequests.create({
      payee: "0xpayee",
      amount: "10",
      invoiceCurrency: "USD",
      paymentCurrency: "ETH-sepolia",
    });

    expect(response.paymentReference).toBe("legacy-pay-ref");
    expect(response.requestID).toBe("legacy-req-123");
  });

  it("lists payment routes", async () => {
    const routes = await legacyRequests.getPaymentRoutes(LEGACY_REF, { wallet: "0xabc" });

    expect(Array.isArray(routes.routes)).toBe(true);
    expect(routes.routes[0]?.id).toBe("direct");
  });

  it("returns discriminated union for payment calldata", async () => {
    const calldata = await legacyRequests.getPaymentCalldata(LEGACY_REF);
    expect(calldata.kind).toBe("calldata");
    if (calldata.kind === "calldata") {
      expect(calldata.transactions).toHaveLength(1);
    }

    const intent = await legacyRequests.getPaymentCalldata(LEGACY_REF, { chain: "OPTIMISM" });
    expect(intent.kind).toBe("paymentIntent");
    if (intent.kind === "paymentIntent") {
      expect(intent.paymentIntentId).toBe(`legacy-pi-${LEGACY_REF}`);
    }
  });

  it("normalises request status payloads", async () => {
    const pending = await legacyRequests.getRequestStatus(LEGACY_REF);
    expect(pending.kind).toBe("pending");
    expect(pending.requestId).toBe("legacy-req-pending");

    const paid = await legacyRequests.getRequestStatus(PAID_REF);
    expect(paid.kind).toBe("paid");
    expect(paid.txHash).toBe("0xtx");
  });

  it("sends payment intents and stops recurrence", async () => {
    await expect(
      legacyRequests.sendPaymentIntent("legacy-pi-1", {
        signedPaymentIntent: { signature: "0x1", nonce: "1", deadline: "999" },
      }),
    ).resolves.toBeUndefined();

    await expect(legacyRequests.stopRecurrence(LEGACY_REF)).resolves.toBeUndefined();
  });

  it("throws validation error on malformed routes payload", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v1/request/:paymentReference/routes`, () =>
        HttpResponse.json({ routes: "not-an-array" }, { status: 200 }),
      ),
    );

    await expect(legacyRequests.getPaymentRoutes(LEGACY_REF, { wallet: "0xabc" })).rejects.toBeInstanceOf(ValidationError);
  });
});
