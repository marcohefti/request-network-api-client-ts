import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../../src/core/errors/request-api.error";
import { createRequestClient } from "../../../src/request.client";
import { TEST_BASE_URL } from "../../utils/test-env";

const DESTINATION_ID = "base:0xabc:0xdef" as const;

describe("Payee destination facade", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });

  it("gets signing data", async () => {
    const response = await client.payeeDestination.getSigningData({
      walletAddress: "0x123",
      action: "add",
      tokenAddress: "0x456",
      chainId: "8453",
    });

    expect(response).toMatchObject({ nonce: "nonce-1", walletAddress: "0x123" });
  });

  it("gets active payee destination", async () => {
    const response = await client.payeeDestination.getActive("0xabc");
    expect(response).toMatchObject({ active: true, walletAddress: "0xabc" });
  });

  it("creates a payee destination", async () => {
    const response = await client.payeeDestination.create({
      signature: "0xsignature",
      nonce: "nonce-1",
    });
    expect(response).toMatchObject({ created: true, nonce: "nonce-1" });
  });

  it("gets payee destination by ID", async () => {
    const response = await client.payeeDestination.getById(DESTINATION_ID);
    expect(response).toMatchObject({ active: true });
  });

  it("deactivates payee destination", async () => {
    const response = await client.payeeDestination.deactivate(DESTINATION_ID, {
      signature: "0xsignature",
      nonce: "nonce-2",
    });
    expect(response).toMatchObject({ deactivated: true, nonce: "nonce-2" });
  });

  it("maps upstream 404 errors", async () => {
    await expect(client.payeeDestination.getById("missing")).rejects.toSatisfy((error: unknown) => {
      expect(isRequestApiError(error)).toBe(true);
      return true;
    });
  });
});
