import { describe, expect, it } from "vitest";

import type { HttpAdapter, HttpRequest } from "../../../src/core/http/http.types";
import { createRequestClient } from "../../../src/request.client";

const ORCHESTRATOR_KEY = "orc-test";
const BASE_URL = "https://api.example";

describe("Orchestrators facade", () => {
  it("registers orchestrator schemas under default runtime validation", async () => {
    const adapter: HttpAdapter = {
      send() {
        return Promise.resolve({ status: 200, ok: true, headers: {}, data: {} });
      },
    };
    const client = createRequestClient({ baseUrl: BASE_URL, orchestratorKey: ORCHESTRATOR_KEY, adapter });

    await expect(client.orchestrators.branding.get()).resolves.toEqual({});
  });

  it("maps every current orchestrator operation to its published endpoint", async () => {
    const captured: HttpRequest[] = [];
    const adapter: HttpAdapter = {
      send(request) {
        captured.push(request);
        return Promise.resolve({ status: 200, ok: true, headers: {}, data: {} });
      },
    };
    const client = createRequestClient({
      baseUrl: BASE_URL,
      orchestratorKey: ORCHESTRATOR_KEY,
      adapter,
      runtimeValidation: false,
    });

    await client.orchestrators.create({ body: {} });
    await client.orchestrators.clientIds.list();
    await client.orchestrators.clientIds.link({ body: {} });
    await client.orchestrators.clientIds.createLinkIntent({ body: {} });
    await client.orchestrators.clientIds.unlink({ path: { clientId: "client-1" } });
    await client.orchestrators.fees.create({ body: "fee-config" });
    await client.orchestrators.fees.list();
    await client.orchestrators.fees.update({ path: { id: "fee-1" }, body: {} });
    await client.orchestrators.fees.disable({ path: { id: "fee-1" } });
    await client.orchestrators.branding.create({ body: "branding" });
    await client.orchestrators.branding.get();
    await client.orchestrators.branding.update({ body: {} });
    await client.orchestrators.branding.remove();
    await client.orchestrators.webhooks.create({ body: {} });
    await client.orchestrators.webhooks.list();
    await client.orchestrators.webhooks.deactivate({ path: { id: "hook-1" } });
    await client.orchestrators.webhooks.activate({ path: { id: "hook-1" } });
    await client.orchestrators.webhooks.test({ body: {} });

    expect(captured.map((request) => request.meta?.operationId)).toEqual([
      "OrchestratorController_createOrchestrator_v2",
      "OrchestratorController_listLinkedClientIds_v2",
      "OrchestratorController_linkClientId_v2",
      "OrchestratorController_createLinkIntent_v2",
      "OrchestratorController_unlinkClientId_v2",
      "OrchestratorController_createFeeConfig_v2",
      "OrchestratorController_listFeeConfigs_v2",
      "OrchestratorController_updateFeeConfig_v2",
      "OrchestratorController_disableFeeConfig_v2",
      "OrchestratorController_createBranding_v2",
      "OrchestratorController_getBranding_v2",
      "OrchestratorController_updateBranding_v2",
      "OrchestratorController_removeBranding_v2",
      "OrchestratorController_createWebhook_v2",
      "OrchestratorController_listWebhooks_v2",
      "OrchestratorController_deactivateWebhook_v2",
      "OrchestratorController_activateWebhook_v2",
      "OrchestratorController_testWebhook_v2",
    ]);
    expect(captured.every((request) => request.headers?.["x-orchestrator-key"] === ORCHESTRATOR_KEY)).toBe(true);
  });
});
