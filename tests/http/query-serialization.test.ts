import { describe, expect, it } from "vitest";

import { createHttpClient } from "../../src/core/http/client.factory";
import type { HttpAdapter, HttpResponse } from "../../src/core/http/http.types";

const BASE_URL = "https://api.request.network";
const NETWORKS_PARAM = "nets";
const NETWORK_VALUES = ["sepolia", "mainnet"] as const;

function createCaptureAdapter(captured: { url: string }): HttpAdapter {
  const response: HttpResponse = { status: 200, ok: true, headers: {}, data: { ok: true } };
  return {
    send: (request) => {
      captured.url = request.url;
      return Promise.resolve(response);
    },
  };
}

describe("Query serialization", () => {
  it("serializes array values as comma-separated by default", async () => {
    const captured = { url: "" };
    const client = createHttpClient({ baseUrl: BASE_URL, adapter: createCaptureAdapter(captured), retry: { config: { maxAttempts: 1 } } });
    await client.get("/qs", { query: { [NETWORKS_PARAM]: [...NETWORK_VALUES] } });
    const url = new URL(captured.url);
    expect(url.searchParams.get(NETWORKS_PARAM)).toBe(NETWORK_VALUES.join(","));
  });

  it("supports repeat serializer", async () => {
    const captured = { url: "" };
    const client = createHttpClient({ baseUrl: BASE_URL, adapter: createCaptureAdapter(captured), retry: { config: { maxAttempts: 1 } } });
    await client.get("/qs-repeat", { query: { [NETWORKS_PARAM]: [...NETWORK_VALUES] }, querySerializer: "repeat" });
    const url = new URL(captured.url);
    expect(url.searchParams.getAll(NETWORKS_PARAM)).toEqual([...NETWORK_VALUES]);
  });

  it("supports custom serializer functions", async () => {
    const captured = { url: "" };
    const client = createHttpClient({ baseUrl: BASE_URL, adapter: createCaptureAdapter(captured), retry: { config: { maxAttempts: 1 } } });
    await client.get("/qs-custom", {
      query: { [NETWORKS_PARAM]: [...NETWORK_VALUES] },
      querySerializer: ({ key, value, append }) => {
        append(`${key}[]`, value.toString());
      },
    });
    const url = new URL(captured.url);
    expect(url.searchParams.getAll("nets[]")).toEqual(["sepolia,mainnet"]);
  });
});
