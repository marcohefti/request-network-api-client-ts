import { describe, expect, it, vi } from "vitest";

import { composeInterceptors } from "../../src/core/http/http.types";
import type { HttpRequest, Interceptor, NextHandler } from "../../src/core/http/http.types";

describe("composeInterceptors", () => {
  it("invokes interceptors in the defined order", async () => {
    const events: string[] = [];
    const interceptorA: Interceptor = async (req, next) => {
      events.push(`a-before:${req.headers?.["x-chain"] ?? ""}`);
      const res = await next({ ...req, headers: { ...req.headers, "x-chain": `${req.headers?.["x-chain"] ?? ""}a` } });
      events.push("a-after");
      return res;
    };
    const interceptorB: Interceptor = async (req, next) => {
      events.push(`b-before:${req.headers?.["x-chain"] ?? ""}`);
      const res = await next({ ...req, headers: { ...req.headers, "x-chain": `${req.headers?.["x-chain"] ?? ""}b` } });
      events.push("b-after");
      return res;
    };
    const terminal = vi.fn<NextHandler>((req: HttpRequest) => {
      events.push(`terminal:${req.headers?.["x-chain"] ?? ""}`);
      return Promise.resolve({ status: 200, ok: true, headers: {}, data: { chain: req.headers?.["x-chain"] } });
    });

    const chain = composeInterceptors(terminal, [interceptorA, interceptorB]);
    const response = await chain({ method: "GET", url: "https://api.request.network", headers: {} });

    expect(response.data).toEqual({ chain: "ab" });
    expect(events).toEqual(["a-before:", "b-before:a", "terminal:ab", "b-after", "a-after"]);
    expect(terminal).toHaveBeenCalledTimes(1);
  });
});
