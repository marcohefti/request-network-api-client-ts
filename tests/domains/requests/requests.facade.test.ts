import { http, HttpResponse } from "msw";
import { describe, expect, expectTypeOf, it } from "vitest";

import { isRequestApiError } from "../../../src/core/errors/request-api.error";
import { type ClientIdResponse } from "../../../src/domains/client-ids";
import { type CurrencyToken } from "../../../src/domains/currencies";
import {
  type PaymentCalldataResult,
  type PaymentRoute,
  type PaymentRoutesResponse,
  type RequestStatusResult,
} from "../../../src/domains/requests";
import { createRequestClient } from "../../../src/request.client";
import { ValidationError } from "../../../src/validation/zod.helpers";
import { server } from "../../msw/setup";
import { TEST_BASE_URL } from "../../utils/test-env";

describe("Requests facade", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });

  it("creates a request", async () => {
    const response = await client.requests.create({
      amount: "10",
      invoiceCurrency: "USD",
      paymentCurrency: "ETH-sepolia",
    });

    expect(response.paymentReference).toBeDefined();
    expect(response.requestId).toBeDefined();
  });

  it("exposes Request REST shapes for downstream consumers", () => {
    const routes: PaymentRoutesResponse = {
      routes: [
        {
          id: "route-1",
          fee: 0.1,
          speed: "FAST",
          chain: "base",
          token: "USDC",
          price_impact: 0.01,
          feeBreakdown: [{ amountInUSD: "1.23" }],
        },
      ],
    };

    expect(routes.routes[0]?.id).toBe("route-1");
    expectTypeOf(routes.routes[0]).toMatchObjectType<PaymentRoute>();

    const calldata: PaymentCalldataResult = {
      kind: "calldata",
      transactions: [{ to: "0x0", data: "0x", value: { hex: "0x0" } }],
      metadata: {
        stepsRequired: 1,
        needsApproval: false,
        approvalTransactionIndex: null,
        hasEnoughBalance: true,
        hasEnoughGas: true,
      },
    };

    expect(calldata.kind).toBe("calldata");

    const status: RequestStatusResult = {
      kind: "pending",
      txHash: null,
      hasBeenPaid: false,
      paymentReference: "pay_ref",
      requestId: "req-123",
      status: "pending",
    };

    expect(status.kind).toBe("pending");

    const currency: CurrencyToken = {
      id: "USDC-mainnet",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    };

    expect(currency.symbol).toBe("USDC");

    const clientId: ClientIdResponse = {
      id: "1",
      clientId: "client-1",
      label: "ExampleStore",
      allowedDomains: ["https://example.com"],
      status: "active",
      createdAt: "2025-01-01T00:00:00.000Z",
    };

    expect(clientId.clientId).toBe("client-1");
  });

  it("retrieves payment routes", async () => {
    const routes = await client.requests.getPaymentRoutes("req-123", { wallet: "0xabc" });
    expect(Array.isArray(routes.routes)).toBe(true);
    expect(routes.routes[0]?.id).toBe("direct");
  });

  it("returns discriminated union for payment calldata", async () => {
    const direct = await client.requests.getPaymentCalldata("req-123");
    expect(direct.kind).toBe("calldata");
    expect("transactions" in direct).toBe(true);

    const bridged = await client.requests.getPaymentCalldata("req-123", { chain: "OPTIMISM" });
    expect(bridged.kind).toBe("paymentIntent");
    expect("paymentIntentId" in bridged).toBe(true);
  });

  it("forwards optional query params when fetching payment routes", async () => {
    const requestId = "req-optional";
    const wallet = "0xabc";
    const amount = "42.5";
    const feePercentage = "2.75";
    const feeAddress = "0xfee";

    let capturedUrl: URL | undefined;

    server.use(
      http.get(`${TEST_BASE_URL}/v2/request/:requestId/routes`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({ requestId, routes: [] });
      }),
    );

    await client.requests.getPaymentRoutes(requestId, {
      wallet,
      amount,
      feePercentage,
      feeAddress,
    });

    expect(capturedUrl?.searchParams.get("wallet")).toBe(wallet);
    expect(capturedUrl?.searchParams.get("amount")).toBe(amount);
    expect(capturedUrl?.searchParams.get("feePercentage")).toBe(feePercentage);
    expect(capturedUrl?.searchParams.get("feeAddress")).toBe(feeAddress);
  });

  it("forwards optional query params when fetching payment calldata", async () => {
    const amount = "10";
    const chain = "OPTIMISM";
    const token = "USDC";
    const clientUserId = "client-user-id";
    const paymentDetailsId = "details-id";
    const feePercentage = "1.5";
    const feeAddress = "0xfee";

    let capturedUrl: URL | undefined;

    server.use(
      http.get(`${TEST_BASE_URL}/v2/request/:requestId/pay`, ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json(
          {
            paymentIntentId: "pi-captured",
            paymentIntent: "0xintent",
            approvalPermitPayload: null,
            metadata: { supportsEIP2612: true },
          },
          { status: 200 },
        );
      }),
    );

    const result = await client.requests.getPaymentCalldata("req-params", {
      wallet: "0xwallet",
      amount,
      chain,
      token,
      clientUserId,
      paymentDetailsId,
      feePercentage,
      feeAddress,
    });

    expect(result.kind).toBe("paymentIntent");
    expect(capturedUrl?.searchParams.get("wallet")).toBe("0xwallet");
    expect(capturedUrl?.searchParams.get("amount")).toBe(amount);
    expect(capturedUrl?.searchParams.get("chain")).toBe(chain);
    expect(capturedUrl?.searchParams.get("token")).toBe(token);
    expect(capturedUrl?.searchParams.get("clientUserId")).toBe(clientUserId);
    expect(capturedUrl?.searchParams.get("paymentDetailsId")).toBe(paymentDetailsId);
    expect(capturedUrl?.searchParams.get("feePercentage")).toBe(feePercentage);
    expect(capturedUrl?.searchParams.get("feeAddress")).toBe(feeAddress);
  });

  it("throws ValidationError when payment calldata payload is unrecognised", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v2/request/:requestId/pay`, () =>
        HttpResponse.json({ unexpected: true }, { status: 200 }),
      ),
    );

    await expect(client.requests.getPaymentCalldata("req-unknown")).rejects.toBeInstanceOf(ValidationError);
  });

  it("maps 404 responses to RequestApiError", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v2/request/:requestId/routes`, () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 }),
      ),
    );

    await expect(client.requests.getPaymentRoutes("missing", { wallet: "0xabc" })).rejects.toSatisfy((err: unknown) => {
      expect(isRequestApiError(err)).toBe(true);
      return true;
    });
  });

  it("propagates validation overrides for sendPaymentIntent", async () => {
    await expect(
      client.requests.sendPaymentIntent(
        "pi-123",
        {
          signedPaymentIntent: { signature: "0x1", nonce: "1", deadline: "999" },
        },
        { validation: false },
      ),
    ).resolves.toBeUndefined();
  });

  it("sends update requests to the v2 endpoint", async () => {
    let capturedMethod: string | undefined;

    server.use(
      http.patch(`${TEST_BASE_URL}/v2/request/:requestId`, ({ request }) => {
        capturedMethod = request.method;
        return HttpResponse.json({}, { status: 200 });
      }),
    );

    await expect(client.requests.update("req-update")).resolves.toBeUndefined();
    expect(capturedMethod).toBe("PATCH");
  });

  it("normalises paid request status responses", async () => {
    const status = await client.requests.getRequestStatus("req-paid");
    expect(status.kind).toBe("paid");
    expect(status.txHash).toBe("0xpaid");
    expect(status.customerInfo?.firstName).toBe("Alice");
    expect(status.hasBeenPaid).toBe(true);
  });

  it("maps cancelled request status responses", async () => {
    const status = await client.requests.getRequestStatus("req-cancelled");
    expect(status.kind).toBe("cancelled");
    expect(status.isRecurrenceStopped).toBe(true);
    expect(status.recurrence).toBeDefined();
  });

  it("defaults to pending for active requests", async () => {
    const status = await client.requests.getRequestStatus("req-pending");
    expect(status.kind).toBe("pending");
    expect(status.isListening).toBe(true);
    expect(status.isCryptoToFiatAvailable).toBe(true);
  });
});
