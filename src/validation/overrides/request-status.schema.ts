import { z } from "zod";

import { RequestControllerV2_getRequestStatus_v2_200 as BaseRequestStatusSchema } from "../generated/groups/request.schemas.generated";
import { schemaRegistry } from "../schema.registry";

const NullableRequestStatusSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object") {
    return value;
  }

  const next = { ...value } as Record<string, unknown>;

  if (next.recurrence === null) {
    delete next.recurrence;
  }

  if (next.originalRequestId === null) {
    next.originalRequestId = undefined;
  }

  if (next.originalRequestPaymentReference === null) {
    next.originalRequestPaymentReference = undefined;
  }

  return next;
}, BaseRequestStatusSchema);

schemaRegistry.register({
  key: { operationId: "RequestControllerV2_getRequestStatus_v2", kind: "response", status: 200 },
  schema: NullableRequestStatusSchema,
});
