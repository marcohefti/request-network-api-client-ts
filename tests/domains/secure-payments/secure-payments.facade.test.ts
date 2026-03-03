import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../../src/core/errors/request-api.error";
import { createRequestClient } from "../../../src/request.client";
import { TEST_BASE_URL } from "../../utils/test-env";

describe("Secure payments facade", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });

  it("creates a secure payment", async () => {
    const response = await client.securePayments.create({
      requests: [
        {
          destinationId:
            "0x6923831ACf5c327260D7ac7C9DfF5b1c3cB3C7D7@eip155:11155111#A1B2C3D4:0x370DE27fdb7D1Ff1e1BaA7D11c5820a324Cf623C",
          amount: "10",
        },
      ],
    });

    expect(response.token).toBeDefined();
    expect(response.requestIds.length).toBe(1);
    expect(response.securePaymentUrl).toContain("secure.request.network");
  });

  it("finds a secure payment by request ID", async () => {
    const response = await client.securePayments.findByRequestId("req-secure-1");
    expect(response.status).toBe("pending");
    expect(response.paymentType).toBe("single");
  });

  it("gets secure payment details by token", async () => {
    const response = await client.securePayments.getByToken("01SECUREPAYMENTTOKEN", {
      wallet: "0xwallet",
    });
    expect(response.paymentType).toBe("single");
    expect(response.status).toBe("pending");
    expect(response.transactions).toEqual([]);
  });

  it("maps upstream 404 errors on find", async () => {
    await expect(client.securePayments.findByRequestId("missing")).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      return true;
    });
  });

  it("maps upstream 403 errors on token lookup", async () => {
    await expect(client.securePayments.getByToken("expired")).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      return true;
    });
  });
});
