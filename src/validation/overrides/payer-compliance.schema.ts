import { z } from "zod";

import {
  PayerV1Controller_getComplianceData_v1_200 as PayerComplianceDataV1,
  PayerV2Controller_getComplianceData_v2_200 as PayerComplianceDataV2,
} from "../generated/groups/payer.schemas.generated";
import { schemaRegistry } from "../schema.registry";

const EXTRA_AGREEMENT_STATUSES = ["pending", "signed"] as const;
const EXTRA_KYC_STATUSES = ["initiated"] as const;

const PatchedComplianceV1 = PayerComplianceDataV1.extend({
  status: PayerComplianceDataV1.shape.status.extend({
    agreementStatus: PayerComplianceDataV1.shape.status.shape.agreementStatus.or(z.enum(EXTRA_AGREEMENT_STATUSES)),
    kycStatus: PayerComplianceDataV1.shape.status.shape.kycStatus.or(z.enum(EXTRA_KYC_STATUSES)),
  }),
});
schemaRegistry.register({
  key: { operationId: "PayerV1Controller_getComplianceData_v1", kind: "response", status: 200 },
  schema: PatchedComplianceV1,
});

const PatchedComplianceV2 = PayerComplianceDataV2.extend({
  status: PayerComplianceDataV2.shape.status.extend({
    agreementStatus: PayerComplianceDataV2.shape.status.shape.agreementStatus.or(z.enum(EXTRA_AGREEMENT_STATUSES)),
    kycStatus: PayerComplianceDataV2.shape.status.shape.kycStatus.or(z.enum(EXTRA_KYC_STATUSES)),
  }),
});
schemaRegistry.register({
  key: { operationId: "PayerV2Controller_getComplianceData_v2", kind: "response", status: 200 },
  schema: PatchedComplianceV2,
});
