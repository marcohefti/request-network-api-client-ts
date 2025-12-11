import { createPayV1Api, type PayV1Api, type PayV1OperationOptions } from "./v1";
import type { HttpClient } from "../../core/http/http.types";

export type PayOperationOptions = PayV1OperationOptions;

export interface PayApi extends PayV1Api {
  legacy: PayV1Api;
}

export { type PayV1Api, type PayV1OperationOptions };

export function createPayApi(http: HttpClient): PayApi {
  const legacy = createPayV1Api(http);
  return {
    ...legacy,
    legacy,
  };
}
