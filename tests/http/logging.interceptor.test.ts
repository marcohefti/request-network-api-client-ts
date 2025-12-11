import { describe, expect, it, vi } from "vitest";

import { createHttpClient } from "../../src/core/http/client.factory";
import type { HttpAdapter } from "../../src/core/http/http.types";

const BASE_URL = "https://api.request.network" as const;
const PATH_SUCCESS = "/logging/success" as const;
const PATH_SILENT = "/logging/silent" as const;
const PATH_FAILURE = "/logging/failure" as const;
const EVENT_RESPONSE = "request:response";
const EVENT_ERROR = "request:error";
const METHOD_GET = "GET" as const;
const NETWORK_DOWN_ERROR = "network down";

describe("Logging interceptor", () => {
  it("emits response events at info level", async () => {
    const logger = vi.fn();
    const adapter: HttpAdapter = {
      send: () => Promise.resolve({ status: 200, ok: true, headers: {}, data: { ok: true } }),
    };
    const client = createHttpClient({
      baseUrl: BASE_URL,
      adapter,
      logger,
      logLevel: "info",
      retry: { config: { maxAttempts: 1 } },
    });

    const res = await client.get(PATH_SUCCESS);
    expect(res.status).toBe(200);
      expect(logger).toHaveBeenCalledWith(
        EVENT_RESPONSE,
        expect.objectContaining({ status: 200, ok: true, method: METHOD_GET }),
      );
  });

  it("suppresses logs when level is silent", async () => {
    const logger = vi.fn();
    const adapter: HttpAdapter = {
      send: () => Promise.resolve({ status: 200, ok: true, headers: {}, data: { ok: true } }),
    };
    const client = createHttpClient({
      baseUrl: BASE_URL,
      adapter,
      logger,
      logLevel: "silent",
      retry: { config: { maxAttempts: 1 } },
    });

    const res = await client.get(PATH_SILENT);
    expect(res.status).toBe(200);
    expect(logger).not.toHaveBeenCalled();
  });

  it("logs errors when level is error", async () => {
    const logger = vi.fn();
    const adapter: HttpAdapter = {
      send: () => Promise.reject(new Error(NETWORK_DOWN_ERROR)),
    };
    const client = createHttpClient({
      baseUrl: BASE_URL,
      adapter,
      logger,
      logLevel: "error",
      retry: { config: { maxAttempts: 1 } },
    });

    await expect(client.get(PATH_FAILURE)).rejects.toThrowError(NETWORK_DOWN_ERROR);
    expect(logger).toHaveBeenCalledWith(
      EVENT_ERROR,
      expect.objectContaining({ method: METHOD_GET }),
    );
    expect(logger).not.toHaveBeenCalledWith(EVENT_RESPONSE, expect.anything());
  });
});
