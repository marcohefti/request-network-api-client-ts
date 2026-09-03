import { describe, expect, it } from "vitest";

import type { HttpAdapter, HttpRequest } from "../../../src/core/http/http.types";
import { createRequestClient } from "../../../src/request.client";

const BASE_URL = "https://api.example";
const CLIENT_ID = "connector-client-id";
const ORCHESTRATOR_KEY = "partner-orchestrator-key";

describe("Orchestrator credential routing", () => {
  it("sends the orchestrator key but never the client ID for management operations", async () => {
    let captured: HttpRequest | undefined;
    const adapter: HttpAdapter = {
      send(request) {
        captured = request;
        return Promise.resolve({ status: 200, ok: true, headers: {}, data: [] });
      },
    };
    const client = createRequestClient({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      orchestratorKey: ORCHESTRATOR_KEY,
      adapter,
      runtimeValidation: false,
    });

    await client.orchestrators.clientIds.list();

    expect(captured?.headers).toMatchObject({ "x-orchestrator-key": ORCHESTRATOR_KEY });
    expect(captured?.headers).not.toHaveProperty("x-client-id");
  });

  it("retains paired client and orchestrator credentials for Secure Payment operations", async () => {
    let captured: HttpRequest | undefined;
    const adapter: HttpAdapter = {
      send(request) {
        captured = request;
        return Promise.resolve({ status: 201, ok: true, headers: {}, data: {} });
      },
    };
    const client = createRequestClient({
      baseUrl: BASE_URL,
      clientId: CLIENT_ID,
      orchestratorKey: ORCHESTRATOR_KEY,
      adapter,
      runtimeValidation: false,
    });

    await client.securePayments.execute("SecurePaymentController_createSecurePayment_v2", {
      body: {} as never,
    });

    expect(captured?.headers).toMatchObject({
      "x-client-id": CLIENT_ID,
      "x-orchestrator-key": ORCHESTRATOR_KEY,
    });
  });
});
