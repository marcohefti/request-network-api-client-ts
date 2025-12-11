import { afterEach, describe, expect, it, vi } from "vitest";

import { createFetchInit, headersToRecord } from "../../src/core/http/adapters/adapter.utils";
import type { HttpRequest } from "../../src/core/http/http.types";

const BASE_URL = "https://api.request.network" as const;
const POST_METHOD = "POST";
const EXPECTED_SIGNAL_MESSAGE = "Expected AbortSignal to be defined";

describe("fetch adapter utils", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stringifies object bodies and sets content-type", () => {
    const request: HttpRequest = {
      method: POST_METHOD,
      url: BASE_URL,
      headers: {},
      body: { foo: "bar" },
    };
    const { init } = createFetchInit(request);
    expect(init.body).toBe(JSON.stringify({ foo: "bar" }));
    const headers = init.headers as Record<string, string>;
    expect(headers["content-type"]).toBe("application/json");
  });

  it("preserves binary and text bodies without forcing JSON", () => {
    const request: HttpRequest = {
      method: POST_METHOD,
      url: BASE_URL,
      headers: {},
      body: "raw-body",
    };
    const { init } = createFetchInit(request);
    expect(init.body).toBe("raw-body");
    const headers = init.headers as Record<string, string>;
    expect(headers["content-type"]).toBeUndefined();
  });

  it("aborts automatically when timeout expires", () => {
    vi.useFakeTimers();
    const request: HttpRequest = {
      method: "GET",
      url: BASE_URL,
      timeoutMs: 5,
    };
    const { init, dispose } = createFetchInit(request);
    const { signal } = init;
    expect(signal).toBeInstanceOf(AbortSignal);
    if (!signal) {
      throw new Error(EXPECTED_SIGNAL_MESSAGE);
    }
    expect(signal.aborted).toBe(false);
    vi.advanceTimersByTime(5);
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBeInstanceOf(Error);
    dispose();
  });

  it("links external abort signals", () => {
    const controller = new AbortController();
    const request: HttpRequest = {
      method: "GET",
      url: BASE_URL,
      signal: controller.signal,
    };
    const { init, dispose } = createFetchInit(request);
    controller.abort("boom");
    const { signal } = init;
    expect(signal).toBeInstanceOf(AbortSignal);
    if (!signal) {
      throw new Error(EXPECTED_SIGNAL_MESSAGE);
    }
    expect(signal.aborted).toBe(true);
    expect(signal.reason).toBe("boom");
    dispose();
  });

  it("normalizes Headers into lowercase record", () => {
    const headers = new Headers();
    headers.set("X-Test", "value");
    const record = headersToRecord(headers);
    expect(record).toEqual({ "x-test": "value" });
  });
});
