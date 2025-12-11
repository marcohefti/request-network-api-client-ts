import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { createHttpClient } from "../../src/core/http/client.factory";
import { requestJson } from "../../src/core/http/operation.helper";
import type { ClientIdCreateBody } from "../../src/domains/client-ids/client-ids.facade";
import { createRequestClient } from "../../src/request.client";
import { ValidationError } from "../../src/validation/zod.helpers";
import { server } from "../msw/setup";
import { TEST_BASE_URL } from "../utils/test-env";

import "../../src/validation/generated/groups/client-ids.schemas.generated";

const LABEL_INVALID_RESPONSE = "invalid-response" as const;
const LABEL_TRIGGER_ERROR = "trigger-error" as const;
const FEE_PERCENTAGE = "0" as const;
const FEE_ADDRESS = "0xfee" as const;
const NOT_AN_ARRAY = "not-an-array";

describe("runtime validation toggles", () => {
  it("rejects invalid request payload before dispatch", async () => {
    const client = createRequestClient({ baseUrl: TEST_BASE_URL });
    const handler = vi.fn();

    server.use(
      http.post(`${TEST_BASE_URL}/v2/client-ids`, () => {
        handler();
        return HttpResponse.json({ id: "noop" }, { status: 201 });
      }),
    );

    const invalidBody = { allowedDomains: [] } as unknown as ClientIdCreateBody;

    await expect(client.clientIds.create(invalidBody)).rejects.toBeInstanceOf(ValidationError);
    expect(handler).not.toHaveBeenCalled();
  });

  it("validates response payloads by default", async () => {
    const client = createRequestClient({ baseUrl: TEST_BASE_URL });
    const body = { label: LABEL_INVALID_RESPONSE, allowedDomains: [], feePercentage: FEE_PERCENTAGE, feeAddress: FEE_ADDRESS } satisfies ClientIdCreateBody;

    await expect(client.clientIds.create(body)).rejects.toBeInstanceOf(ValidationError);
  });

  it("allows disabling response validation per request", async () => {
    const httpClient = createHttpClient({ baseUrl: TEST_BASE_URL });
    const body = { label: LABEL_INVALID_RESPONSE, allowedDomains: [], feePercentage: FEE_PERCENTAGE, feeAddress: FEE_ADDRESS } satisfies ClientIdCreateBody;

    const result = await requestJson<unknown>(httpClient, {
      operationId: "ClientIdV2Controller_create_v2",
      method: "POST",
      path: "/v2/client-ids",
      body,
      requestSchemaKey: { operationId: "ClientIdV2Controller_create_v2", kind: "request", variant: "application/json" },
      schemaKey: { operationId: "ClientIdV2Controller_create_v2", kind: "response", status: 201 },
      validation: { responses: false },
    });

    expect((result as Record<string, unknown>).allowedDomains).toBe(NOT_AN_ARRAY);
  });

  it("validates error envelopes before mapping to RequestApiError", async () => {
    const client = createRequestClient({ baseUrl: TEST_BASE_URL });
    const body = { label: LABEL_TRIGGER_ERROR, allowedDomains: [], feePercentage: FEE_PERCENTAGE, feeAddress: FEE_ADDRESS } satisfies ClientIdCreateBody;

    await expect(client.clientIds.create(body)).rejects.toBeInstanceOf(ValidationError);
  });

  it("disables validations globally when configured", async () => {
    const client = createRequestClient({ baseUrl: TEST_BASE_URL, runtimeValidation: false });
    const body = { label: LABEL_INVALID_RESPONSE, allowedDomains: [], feePercentage: FEE_PERCENTAGE, feeAddress: FEE_ADDRESS } satisfies ClientIdCreateBody;

    const response = (await client.clientIds.create(body)) as unknown as Record<string, unknown>;
    expect(response.allowedDomains).toBe(NOT_AN_ARRAY);
  });
});
