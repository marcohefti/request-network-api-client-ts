import { z } from "zod";

import { schemaRegistry } from "../schema.registry";

const FlexibleRoutesSchema = z
  .object({
    routes: z.array(
      z
        .object({
          fee: z.union([z.number(), z.string()]).optional(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

schemaRegistry.register({
  key: { operationId: "RequestControllerV2_getRequestPaymentRoutes_v2", kind: "response", status: 200 },
  schema: FlexibleRoutesSchema,
});
