import { z } from "zod";

import { schemaRegistry } from "../validation/schema.registry";

type WebhookSpec = typeof import("@marcohefti/request-network-api-contracts/specs/webhooks/request-network-webhooks.json");

export type WebhookEventName = Extract<keyof WebhookSpec["webhooks"], string>;

type PaymentFailedAllOf = WebhookSpec["components"]["schemas"]["PaymentFailedEvent"]["allOf"][1];
type PaymentFailedSubStatusValues = NonNullable<PaymentFailedAllOf["properties"]>["subStatus"] extends { enum: readonly string[] }
  ? NonNullable<PaymentFailedAllOf["properties"]>["subStatus"]["enum"][number]
  : never;

type PaymentProcessingAllOf = WebhookSpec["components"]["schemas"]["PaymentProcessingEvent"]["allOf"][1];
type PaymentProcessingSubStatusValues = NonNullable<PaymentProcessingAllOf["properties"]>["subStatus"] extends { enum: readonly string[] }
  ? NonNullable<PaymentProcessingAllOf["properties"]>["subStatus"]["enum"][number]
  : never;

type PaymentDetailAllOf = WebhookSpec["components"]["schemas"]["PaymentDetailUpdatedEvent"]["allOf"][1];
type PaymentDetailStatusValues = NonNullable<PaymentDetailAllOf["properties"]>["status"] extends { enum: readonly string[] }
  ? NonNullable<PaymentDetailAllOf["properties"]>["status"]["enum"][number]
  : never;

// The shared contract currently enumerates only `not_started` and `completed`
// for compliance status values. Legacy webhook payloads have reported a richer
// set historically, so we keep a superset here until the upstream schema
// expands.
const COMPLIANCE_KYC_STATUSES = [
  "not_started",
  "initiated",
  "pending",
  "approved",
  "rejected",
  "failed",
  "completed",
] as const;
type ComplianceKycStatusValues = (typeof COMPLIANCE_KYC_STATUSES)[number];
const COMPLIANCE_AGREEMENT_STATUSES = [
  "not_started",
  "pending",
  "completed",
  "rejected",
  "failed",
  "signed",
] as const;
type ComplianceAgreementStatusValues = (typeof COMPLIANCE_AGREEMENT_STATUSES)[number];

const PAYMENT_FAILED_SUB_STATUSES = ["failed", "bounced", "insufficient_funds"] as const satisfies readonly PaymentFailedSubStatusValues[];
const PAYMENT_PROCESSING_SUB_STATUSES = [
  "initiated",
  "pending_internal_assessment",
  "ongoing_checks",
  "sending_fiat",
  "fiat_sent",
  "bounced",
  "retry_required",
  "processing",
] as const satisfies readonly PaymentProcessingSubStatusValues[];
const PAYMENT_DETAIL_STATUSES = ["approved", "failed", "pending", "verified"] as const satisfies readonly PaymentDetailStatusValues[];

// Base webhook schema: require `event` and allow all other fields through
// without strict typing so manual webhook payloads from the Request API do
// not get rejected when the upstream shape evolves. Domain code is
// responsible for narrowing specific fields when needed.
const webhookBaseSchema = z
  .object({
    event: z.string(),
  })
  .passthrough();

const paymentConfirmedSchema = webhookBaseSchema.extend({
  event: z.literal("payment.confirmed"),
});

const paymentFailedSchema = webhookBaseSchema.extend({
  event: z.literal("payment.failed"),
  subStatus: z.enum(PAYMENT_FAILED_SUB_STATUSES as unknown as [PaymentFailedSubStatusValues, ...PaymentFailedSubStatusValues[]]).optional(),
  failureReason: z.string().optional(),
  retryAfter: z.string().optional(),
});

const paymentProcessingSchema = webhookBaseSchema.extend({
  event: z.literal("payment.processing"),
  subStatus: z.enum(PAYMENT_PROCESSING_SUB_STATUSES as unknown as [PaymentProcessingSubStatusValues, ...PaymentProcessingSubStatusValues[]]),
});

const paymentDetailUpdatedSchema = webhookBaseSchema.extend({
  event: z.literal("payment_detail.updated"),
  status: z.enum(PAYMENT_DETAIL_STATUSES as unknown as [PaymentDetailStatusValues, ...PaymentDetailStatusValues[]]),
  paymentDetailsId: z.string().optional(),
  paymentAccountId: z.string().optional(),
  rejectionMessage: z.string().optional(),
});

const complianceUpdatedSchema = webhookBaseSchema.extend({
  event: z.literal("compliance.updated"),
  kycStatus: z.enum(COMPLIANCE_KYC_STATUSES as unknown as [ComplianceKycStatusValues, ...ComplianceKycStatusValues[]]).optional(),
  agreementStatus: z.enum(COMPLIANCE_AGREEMENT_STATUSES as unknown as [ComplianceAgreementStatusValues, ...ComplianceAgreementStatusValues[]]).optional(),
  isCompliant: z.boolean().optional(),
});

const paymentPartialSchema = webhookBaseSchema.extend({
  event: z.literal("payment.partial"),
});

const paymentRefundedSchema = webhookBaseSchema.extend({
  event: z.literal("payment.refunded"),
  refundedTo: z.string(),
  refundAmount: z.string(),
});

const requestRecurringSchema = webhookBaseSchema.extend({
  event: z.literal("request.recurring"),
  originalRequestId: z.string(),
  originalRequestPaymentReference: z.string(),
});

const webhookEventSchemas = {
  "payment.confirmed": paymentConfirmedSchema,
  "payment.failed": paymentFailedSchema,
  "payment.processing": paymentProcessingSchema,
  "payment_detail.updated": paymentDetailUpdatedSchema,
  "compliance.updated": complianceUpdatedSchema,
  "payment.partial": paymentPartialSchema,
  "payment.refunded": paymentRefundedSchema,
  "request.recurring": requestRecurringSchema,
} as const;

type WebhookEventSchemaMap = typeof webhookEventSchemas;

export type WebhookEventSchema<E extends WebhookEventName = WebhookEventName> = WebhookEventSchemaMap[E];

export type WebhookPayloadMap = {
  [E in WebhookEventName]: z.infer<WebhookEventSchema<E>>;
};

export type WebhookPayload<E extends WebhookEventName = WebhookEventName> = WebhookPayloadMap[E];

export const WEBHOOK_EVENT_NAMES = Object.freeze(Object.keys(webhookEventSchemas) as WebhookEventName[]);

for (const [eventName, schema] of Object.entries(webhookEventSchemas) as [WebhookEventName, WebhookEventSchema][]) {
  schemaRegistry.register({
    key: { operationId: eventName, kind: "webhook" },
    schema,
  });
}

export function getWebhookSchema<E extends WebhookEventName>(event: E): WebhookEventSchema<E> | undefined {
  return webhookEventSchemas[event];
}
