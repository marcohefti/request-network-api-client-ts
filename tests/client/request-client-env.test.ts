import { afterEach, describe, expect, it, vi } from "vitest";

import { RequestEnvironment } from "../../src/core/config/request-environment.config";
import * as httpFactory from "../../src/core/http/client.factory";
import type { HttpClient } from "../../src/core/http/http.types";
import { createRequestClientFromEnv } from "../../src/request.client";

function createHttpClientStub(): HttpClient {
  const resolved = Promise.resolve({ status: 200, headers: {}, data: undefined });
  const noop = () => resolved;
  return {
    request: () => resolved,
    get: noop,
    post: noop,
    put: noop,
    patch: noop,
    delete: () => resolved,
    head: noop,
    options: noop,
    getRuntimeValidationConfig: () => ({ requests: true, responses: true, errors: true }),
  };
}

const CUSTOM_API_URL = "https://custom.request.network";
const MODERN_API_KEY = "api-key";
const MODERN_CLIENT_ID = "client-id";
const LEGACY_API_KEY = "legacy-api-key";
const LEGACY_CLIENT_ID = "legacy-client";

describe("createRequestClientFromEnv", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prefers modern environment variables", () => {
    const spy = vi.spyOn(httpFactory, "createHttpClient").mockReturnValue(createHttpClientStub());
    const env = {
      REQUEST_API_URL: CUSTOM_API_URL,
      REQUEST_API_KEY: MODERN_API_KEY,
      REQUEST_CLIENT_ID: MODERN_CLIENT_ID,
    };

    createRequestClientFromEnv({ env });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: CUSTOM_API_URL,
        apiKey: MODERN_API_KEY,
        clientId: MODERN_CLIENT_ID,
      }),
    );
  });

  it("falls back to legacy SDK variables", () => {
    const spy = vi.spyOn(httpFactory, "createHttpClient").mockReturnValue(createHttpClientStub());
    const env = {
      REQUEST_SDK_BASE_URL: RequestEnvironment.staging,
      REQUEST_SDK_API_KEY: LEGACY_API_KEY,
      REQUEST_SDK_CLIENT_ID: LEGACY_CLIENT_ID,
    };

    createRequestClientFromEnv({ env });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: RequestEnvironment.staging,
        apiKey: LEGACY_API_KEY,
        clientId: LEGACY_CLIENT_ID,
      }),
    );
  });
});
