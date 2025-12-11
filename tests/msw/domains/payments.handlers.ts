import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

export const paymentsHandlers = [
  http.get(`${TEST_BASE_URL}/v2/payments`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("paymentReference") === "EMPTY") {
      return HttpResponse.json(
        {
          payments: [],
          pagination: { total: 0, limit: 0, offset: 0, hasMore: false },
        },
        { status: 200 },
      );
    }

    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    const parsedLimit = Number.parseInt(limitParam ?? "", 10);
    const parsedOffset = Number.parseInt(offsetParam ?? "", 10);
    const limit = Number.isNaN(parsedLimit) ? 2 : parsedLimit;
    const offset = Number.isNaN(parsedOffset) ? 0 : parsedOffset;

    const samplePayments = [
      {
        id: "payment-1",
        amount: "120",
        sourceNetwork: "ethereum",
        destinationNetwork: "ethereum",
        sourceTxHash: null,
        destinationTxHash: "0xtx",
        timestamp: new Date().toISOString(),
        type: "direct" as const,
        currency: "USD",
        paymentCurrency: "ETH",
        fees: [
          {
            type: "platform",
            stage: "sending",
            provider: "request",
            amount: "1",
            amountInUSD: "1.2",
            currency: "USD",
          },
        ],
        rateProvider: "chainlink" as const,
        request: {
          requestId: "req-paid",
          paymentReference: "ref-paid",
          hasBeenPaid: true,
          customerInfo: {
            firstName: "Alice",
            lastName: "Doe",
            email: "alice@example.com",
            address: { country: "US" },
          },
          reference: "ORDER-PAID",
        },
      },
      {
        id: "payment-2",
        amount: "50",
        sourceNetwork: "polygon",
        destinationNetwork: "ethereum",
        sourceTxHash: "0xsource",
        destinationTxHash: "0xdest",
        timestamp: new Date().toISOString(),
        type: "conversion" as const,
        currency: "EUR",
        paymentCurrency: "USDC",
        fees: null,
        recurringPaymentId: null,
        rateProvider: "coingecko" as const,
        request: {
          requestId: "req-pending",
          paymentReference: "ref-pending",
          hasBeenPaid: false,
          customerInfo: null,
          reference: null,
        },
      },
    ];

    const slice = samplePayments.slice(offset, offset + Math.max(limit, 0));
    return HttpResponse.json(
      {
        payments: slice,
        pagination: {
          total: samplePayments.length,
          limit,
          offset,
          hasMore: offset + Math.max(limit, 0) < samplePayments.length,
        },
      },
      { status: 200 },
    );
  }),
];
