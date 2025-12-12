import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../../src/core/errors/request-api.error";
import { createRequestClient } from "../../../src/request.client";
import { server } from "../../msw/setup";
import { TEST_BASE_URL } from "../../utils/test-env";

const PAYEE = "0xpayee" as const;
const INVOICE_CURRENCY = "USD" as const;
const PAYMENT_CURRENCY = "ETH-sepolia-sepolia" as const;

describe("Payouts facade", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });

  it("creates a payout", async () => {
    const response = await client.payouts.create({
      payee: PAYEE,
      amount: "100",
      invoiceCurrency: INVOICE_CURRENCY,
      paymentCurrency: PAYMENT_CURRENCY,
    });

    expect(response.requestId).toBe("payout-1");
  });

  it("creates a batch payout", async () => {
    const response = await client.payouts.createBatch({
      requests: [
        {
          payee: PAYEE,
          amount: "10",
          invoiceCurrency: INVOICE_CURRENCY,
          paymentCurrency: PAYMENT_CURRENCY,
        },
      ],
    });

    expect(response.ERC20BatchPaymentTransaction?.to).toBe("0xbridge");
  });

  it("fetches recurring payout status", async () => {
    const status = await client.payouts.getRecurringStatus("rec-1");
    expect((status as { status?: string }).status).toBe("active");
  });

  it("submits recurring signature", async () => {
    const result = await client.payouts.submitRecurringSignature("rec-1", { permitSignature: "0xdead" });
    expect((result as { accepted?: boolean }).accepted).toBe(true);
  });

  it("maps failures for recurring status", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v2/payouts/recurring/:id`, () =>
        HttpResponse.json({ message: "missing" }, { status: 404 }),
      ),
    );

    await expect(client.payouts.getRecurringStatus("missing")).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      return true;
    });
  });
});
