import type { HttpRequest } from "../http.types";

export function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}

interface ResolveSignalOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

function resolveSignal(options: ResolveSignalOptions): { signal?: AbortSignal; dispose: () => void } {
  const { signal, timeoutMs } = options;
  if (timeoutMs === undefined) {
    return { signal, dispose: () => {} };
  }

  const controller = new AbortController();
  let timer: NodeJS.Timeout | undefined;

  const abortForTimeout = () => {
    controller.abort(new Error(`Request timed out after ${String(timeoutMs)}ms`));
  };

  if (timeoutMs <= 0) {
    abortForTimeout();
  } else {
    timer = setTimeout(abortForTimeout, timeoutMs);
  }

  const cleanupTimer = () => {
    if (timer) clearTimeout(timer);
  };

  controller.signal.addEventListener("abort", cleanupTimer, { once: true });

  let removeAbortListener: (() => void) | undefined;
  if (signal) {
    if (signal.aborted) {
      cleanupTimer();
      controller.abort(signal.reason);
    } else {
      const onAbort = () => {
        cleanupTimer();
        controller.abort(signal.reason);
      };
      signal.addEventListener("abort", onAbort, { once: true });
      removeAbortListener = () => { signal.removeEventListener("abort", onAbort); };
    }
  }

  const dispose = () => {
    cleanupTimer();
    if (removeAbortListener) {
      removeAbortListener();
    }
  };

  return { signal: controller.signal, dispose };
}

export function createFetchInit(request: HttpRequest): { init: RequestInit; dispose: () => void } {
  const headers: Record<string, string> = { ...(request.headers ?? {}) };
  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.body !== undefined) {
    const body = request.body as unknown;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
    const isUint8 = body instanceof Uint8Array;
    const isArrayBuffer = typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer;
    if (typeof body === "string" || isFormData || isBlob || isUint8 || isArrayBuffer) {
      init.body = body as BodyInit;
    } else {
      init.body = JSON.stringify(body);
      headers["content-type"] ??= "application/json";
    }
  }

  const { signal, dispose } = resolveSignal({ signal: request.signal, timeoutMs: request.timeoutMs });
  if (signal) {
    init.signal = signal;
  }

  return { init, dispose };
}
