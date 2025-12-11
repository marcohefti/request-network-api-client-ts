import { z } from "zod";

import "../../validation/generated/groups/v2/payments.schemas.generated";
import { schemaRegistry } from "../../validation/schema.registry";

export const OP_SEARCH_PAYMENTS = "PaymentV2Controller_searchPayments_v2";

const AddressSchema = z
  .object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  })
  .passthrough();

export const CustomerInfoSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    address: AddressSchema.optional(),
  })
  .passthrough();

export const FeeSchema = z
  .object({
    type: z.enum(["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"]).optional(),
    stage: z.enum(["sending", "receiving", "proxying", "refunding"]).optional(),
    provider: z.string().optional(),
    amount: z.string().optional(),
    amountInUSD: z.string().optional(),
    currency: z.string().optional(),
    receiverAddress: z.string().optional(),
    network: z.string().optional(),
    rateProvider: z.string().optional(),
  })
  .passthrough();

export const RequestInfoSchema = z
  .object({
    requestId: z.string().optional(),
    paymentReference: z.string().optional(),
    hasBeenPaid: z.boolean().optional(),
    customerInfo: CustomerInfoSchema.nullable().optional(),
    reference: z.string().nullable().optional(),
  })
  .passthrough();

export const PaymentRecordSchema = z
  .object({
    id: z.string(),
    amount: z.string(),
    sourceNetwork: z.string(),
    destinationNetwork: z.string(),
    sourceTxHash: z.string().nullable().optional(),
    destinationTxHash: z.string().nullable().optional(),
    timestamp: z.string(),
    type: z.enum(["direct", "conversion", "crosschain", "recurring"]),
    conversionRateSource: z.string().nullable().optional(),
    conversionRateDestination: z.string().nullable().optional(),
    convertedAmountSource: z.string().nullable().optional(),
    convertedAmountDestination: z.string().nullable().optional(),
    currency: z.string(),
    paymentCurrency: z.string(),
    fees: z.array(FeeSchema).nullable().optional(),
    recurringPaymentId: z.string().nullable().optional(),
    rateProvider: z.enum(["lifi", "chainlink", "coingecko", "unknown"]).nullable().optional(),
    request: RequestInfoSchema.optional(),
  })
  .passthrough();

export const PaginationSchema = z
  .object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  })
  .passthrough();

export const PaymentSearchResponseSchema = z
  .object({
    payments: z.array(PaymentRecordSchema),
    pagination: PaginationSchema,
  })
  .passthrough();

export type PaymentRecord = z.infer<typeof PaymentRecordSchema>;
export type PaymentFee = z.infer<typeof FeeSchema>;
export type PaymentSearchResponse = z.infer<typeof PaymentSearchResponseSchema>;
export type PaymentSearchPagination = z.infer<typeof PaginationSchema>;

schemaRegistry.register({
  key: { operationId: OP_SEARCH_PAYMENTS, kind: "response", status: 200 },
  schema: PaymentSearchResponseSchema,
});
