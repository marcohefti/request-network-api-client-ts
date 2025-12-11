export {
  createPayerApi,
  type PayerApi,
  type PayerOperationOptions,
} from "./payer.facade";
export {
  createPayerV1Api,
  type PayerV1Api,
  type PayerV1OperationOptions,
} from "./v1";
export {
  createPayerV2Api,
  type PayerV2Api,
  type PayerV2OperationOptions,
} from "./v2";

import "../../validation/generated/groups/payer.schemas.generated";
