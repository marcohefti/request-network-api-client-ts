import { createFetchInit, headersToRecord } from "./adapter.utils";
import { type HttpAdapter, type HttpRequest, type HttpResponse } from "../http.types";

export const browserFetchAdapter: HttpAdapter = {
  async send(request: HttpRequest): Promise<HttpResponse> {
    const { init, dispose } = createFetchInit(request);
    try {
      const res = await fetch(request.url, init);
      const respHeaders = headersToRecord(res.headers);
      const contentType = respHeaders["content-type"] ?? "";
      let data: unknown;
      let text: string | undefined;
      if (res.status !== 204) {
        try {
          if (contentType.toLowerCase().includes("json")) {
            data = await res.json();
          } else {
            text = await res.text();
          }
        } catch {
          // ignore parse errors
        }
      }

      const normalized: HttpResponse = {
        status: res.status,
        ok: res.ok,
        headers: respHeaders,
        data,
        text,
      };
      return normalized;
    } finally {
      dispose();
    }
  },
};
