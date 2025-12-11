import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

export const requestsHandlers = [
  http.post(`${TEST_BASE_URL}/v2/request`, async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { paymentReference: "pay-ref", requestId: payload.reference ?? "req-123" },
      { status: 201 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v2/request/:requestId/routes`, ({ params }) => {
    const { requestId } = params as { requestId: string };
    return HttpResponse.json({
      requestId,
      routes: [
        {
          id: "direct",
          fee: 0,
          speed: "FAST",
          chain: "ETHEREUM",
          token: "ETH",
        },
      ],
    });
  }),
  http.get(`${TEST_BASE_URL}/v2/request/:requestId/pay`, ({ params, request }) => {
    const { requestId } = params as { requestId: string };
    const url = new URL(request.url);
    const chain = url.searchParams.get("chain");
    if (chain && chain !== "ETHEREUM") {
      return HttpResponse.json(
        {
          paymentIntentId: `pi-${requestId}`,
          paymentIntent: "0xintent",
          approvalPermitPayload: null,
          metadata: { supportsEIP2612: true },
        },
        { status: 200 },
      );
    }
    return HttpResponse.json({
      transactions: [
        {
          data: "0xabc",
          to: "0xcontract",
          value: { type: "BigNumber", hex: "0x0" },
        },
      ],
      metadata: {
        stepsRequired: 1,
        needsApproval: false,
        hasEnoughBalance: true,
        hasEnoughGas: true,
      },
    });
  }),
  http.patch(`${TEST_BASE_URL}/v2/request/:requestId`, () => HttpResponse.json({}, { status: 200 })),
  http.post(`${TEST_BASE_URL}/v2/request/payment-intents/:paymentIntentId`, () => HttpResponse.json({}, { status: 200 })),
  http.get(`${TEST_BASE_URL}/v2/request/:requestId`, ({ params }) => {
    const { requestId } = params as { requestId: string };

    if (requestId === "req-paid") {
      return HttpResponse.json(
        {
          requestId,
          paymentReference: "ref-paid",
          hasBeenPaid: true,
          txHash: "0xpaid",
          status: "paid",
          customerInfo: {
            firstName: "Alice",
            email: "alice@example.com",
            address: { country: "US" },
          },
          reference: "ORDER-PAID",
          payments: [{ id: "payment-paid" }],
        },
        { status: 200 },
      );
    }

    if (requestId === "req-cancelled") {
      return HttpResponse.json(
        {
          requestId,
          paymentReference: "ref-cancelled",
          hasBeenPaid: false,
          status: "cancelled",
          isRecurrenceStopped: true,
          recurrence: { frequency: "WEEKLY" },
        },
        { status: 200 },
      );
    }

    return HttpResponse.json(
      {
        requestId,
        paymentReference: "ref-pending",
        hasBeenPaid: false,
        status: "pending",
        isListening: true,
        isCryptoToFiatAvailable: true,
      },
      { status: 200 },
    );
  }),
  http.post(`${TEST_BASE_URL}/v1/request`, async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        paymentReference: payload.paymentReference ?? "legacy-pay-ref",
        requestID: "legacy-req-123",
      },
      { status: 201 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v1/request/:paymentReference/routes`, ({ params }) => {
    const { paymentReference } = params as { paymentReference: string };
    return HttpResponse.json(
      {
        paymentReference,
        routes: [
          {
            id: "direct",
            fee: 0,
            speed: "FAST",
            chain: "ETHEREUM",
            token: "ETH",
          },
        ],
      },
      { status: 200 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v1/request/:paymentReference/pay`, ({ params, request }) => {
    const { paymentReference } = params as { paymentReference: string };
    const url = new URL(request.url);
    const chain = url.searchParams.get("chain");

    if (chain && chain !== "ETHEREUM") {
      return HttpResponse.json(
        {
          paymentIntentId: `legacy-pi-${paymentReference}`,
          paymentIntent: "0xintent",
          signedApprovalPermit: null,
          metadata: { supportsEIP2612: true },
        },
        { status: 200 },
      );
    }

    return HttpResponse.json(
      {
        transactions: [
          {
            data: "0xabc",
            to: "0xlegacy",
            value: { type: "BigNumber", hex: "0x0" },
          },
        ],
        metadata: {
          stepsRequired: 1,
          needsApproval: false,
          approvalTransactionIndex: null,
          hasEnoughBalance: true,
          hasEnoughGas: true,
        },
      },
      { status: 200 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v1/request/:paymentReference`, ({ params }) => {
    const { paymentReference } = params as { paymentReference: string };
    if (paymentReference === "paid-ref") {
      return HttpResponse.json(
        {
          hasBeenPaid: true,
          paymentReference,
          requestId: "legacy-req-paid",
          txHash: "0xtx",
        },
        { status: 200 },
      );
    }

    return HttpResponse.json(
      {
        hasBeenPaid: false,
        isListening: true,
        paymentReference,
        requestId: "legacy-req-pending",
      },
      { status: 200 },
    );
  }),
  http.post(`${TEST_BASE_URL}/v1/request/:paymentIntentId/send`, () => HttpResponse.json({}, { status: 200 })),
  http.patch(`${TEST_BASE_URL}/v1/request/:paymentReference/stop-recurrence`, () => HttpResponse.json({}, { status: 200 })),
];
