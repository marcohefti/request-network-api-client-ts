import {
  createPayerV1Api,
  type PayerV1Api,
  type PayerV1OperationOptions,
} from "./v1";
import {
  createPayerV2Api,
  type PayerV2Api,
  type PayerV2OperationOptions,
} from "./v2";
import type { HttpClient } from "../../core/http/http.types";

export type PayerOperationOptions = PayerV2OperationOptions;

export interface PayerApi extends PayerV2Api {
  legacy: PayerV1Api;
}

export { type PayerV1Api, type PayerV2Api, type PayerV1OperationOptions, type PayerV2OperationOptions };

export function createPayerApi(http: HttpClient): PayerApi {
  const v2 = createPayerV2Api(http);
  const legacy = createPayerV1Api(http);
  return Object.assign({ legacy }, v2);
}
