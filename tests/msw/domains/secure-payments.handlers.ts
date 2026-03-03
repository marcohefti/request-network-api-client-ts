import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

export const securePaymentsHandlers = [
  http.post(`${TEST_BASE_URL}/v2/secure-payments`, async ({ request }) => {
    const payload = (await request.json()) as {
      requests?: Array<{ destinationId?: string; amount?: string }>;
    };
    const requestIds = (payload.requests ?? []).map((_, index) => `req-secure-${String(index + 1)}`);

    return HttpResponse.json(
      {
        requestIds,
        securePaymentUrl: "https://secure.request.network/01SECUREPAYMENTTOKEN",
        token: "01SECUREPAYMENTTOKEN",
      },
      { status: 201 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v2/secure-payments`, ({ request }) => {
    const url = new URL(request.url);
    const requestId = url.searchParams.get("requestId");
    if (!requestId) {
      return HttpResponse.json({ message: "Missing requestId" }, { status: 400 });
    }

    if (requestId === "missing") {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }

    return HttpResponse.json(
      {
        token: "01SECUREPAYMENTTOKEN",
        securePaymentUrl: `https://secure.request.network/?token=01SECUREPAYMENTTOKEN`,
        status: "pending",
        paymentType: "single",
        createdAt: "2025-01-15T10:30:00.000Z",
        expiresAt: "2025-01-15T10:45:00.000Z",
      },
      { status: 200 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v2/secure-payments/:token`, ({ params, request }) => {
    const { token } = params as { token: string };
    if (token === "expired") {
      return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    if (token === "missing") {
      return HttpResponse.json({ message: "Not Found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const wallet = url.searchParams.get("wallet");

    return HttpResponse.json(
      {
        paymentType: "single",
        payee: wallet ?? "0x6923831ACf5c327260D7ac7C9DfF5b1c3cB3C7D7",
        network: "sepolia",
        amount: "10",
        paymentCurrency: "FAU-sepolia",
        isNativeCurrency: false,
        status: "pending",
        destination: {
          destinationId: "0x6923831ACf5c327260D7ac7C9DfF5b1c3cB3C7D7@eip155:11155111#A1B2C3D4:0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C",
          payeeAddress: "0x6923831ACf5c327260D7ac7C9DfF5b1c3cB3C7D7@eip155:11155111#A1B2C3D4",
          tokenAddress: "0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C",
          walletAddress: "0x6923831ACf5c327260D7ac7C9DfF5b1c3cB3C7D7",
          network: "sepolia",
        },
        transactions: [],
        metadata: {
          stepsRequired: 1,
          needsApproval: false,
          paymentTransactionIndex: 0,
        },
      },
      { status: 200 },
    );
  }),
];
