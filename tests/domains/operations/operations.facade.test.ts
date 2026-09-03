import { describe, expect, it } from "vitest";

import type { HttpAdapter, HttpRequest } from "../../../src/core/http/http.types";
import { createRequestClient } from "../../../src/request.client";
import { ValidationError } from "../../../src/validation/zod.helpers";

const BASE_URL = "https://api.example";

describe("Operations facade", () => {
  it("registers schemas when imported through the operations facade", async () => {
    const adapter: HttpAdapter = {
      send() {
        return Promise.resolve({
          status: 201,
          ok: true,
          headers: {},
          data: { requestIds: ["req-1"], securePaymentUrl: "https://secure.request.network/token", token: "token" },
        });
      },
    };
    const client = createRequestClient({ baseUrl: BASE_URL, adapter });

    await expect(
      client.operations.execute("SecurePaymentController_createSecurePayment_v2", {
        body: { requests: [{ amount: "10" }] },
      }),
    ).resolves.toMatchObject({ requestIds: ["req-1"] });
  });

  it("uses an explicit route token rather than the source-asset query token", async () => {
    let captured: HttpRequest | undefined;
    const adapter: HttpAdapter = {
      send(request) {
        captured = request;
        return Promise.resolve({ status: 200, ok: true, headers: {}, data: {} });
      },
    };
    const client = createRequestClient({ baseUrl: BASE_URL, adapter, runtimeValidation: false });

    await client.operations.execute("SecurePaymentController_getSecurePaymentByToken_v2", {
      path: { token: "secure-bearer-token" },
      query: { token: "USDC" },
    });

    expect(captured?.url).toContain("/v2/secure-payments/secure-bearer-token");
    expect(captured?.url).toContain("token=USDC");
  });

  it("validates request bodies for operations with empty responses", async () => {
    let dispatched = false;
    const adapter: HttpAdapter = {
      send() {
        dispatched = true;
        return Promise.resolve({ status: 200, ok: true, headers: {} });
      },
    };
    const client = createRequestClient({ baseUrl: BASE_URL, adapter });

    await expect(
      client.operations.execute("RequestControllerV2_updateRequest_v2", {
        path: { requestId: "req-1" },
        body: { isRecurrenceStopped: "not-a-boolean" } as never,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(dispatched).toBe(false);
  });
});
