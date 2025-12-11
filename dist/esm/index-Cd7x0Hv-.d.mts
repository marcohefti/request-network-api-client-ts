import { o as operations, a as RuntimeValidationOption, c as RequestOptions, b as HttpClient } from './openapi-types-CtUFCrk4.mjs';

declare const OP_CREATE: "PayoutV2Controller_payRequest_v2";
declare const OP_CREATE_BATCH: "PayoutV2Controller_payBatchRequest_v2";
declare const OP_RECURRING_STATUS: "PayoutV2Controller_getRecurringPaymentStatus_v2";
declare const OP_SUBMIT_SIGNATURE: "PayoutV2Controller_submitRecurringPaymentSignature_v2";
declare const OP_UPDATE_RECURRING: "PayoutV2Controller_updateRecurringPayment_v2";
type CreatePayoutBody = operations[typeof OP_CREATE]["requestBody"]["content"]["application/json"];
type CreatePayoutResponse = operations[typeof OP_CREATE]["responses"][201]["content"]["application/json"];
type CreateBatchBody = operations[typeof OP_CREATE_BATCH]["requestBody"]["content"]["application/json"];
type CreateBatchResponse = operations[typeof OP_CREATE_BATCH]["responses"][201]["content"]["application/json"];
type RecurringStatusResponse = operations[typeof OP_RECURRING_STATUS]["responses"][200]["content"]["application/json"];
type SubmitRecurringSignatureBody = operations[typeof OP_SUBMIT_SIGNATURE]["requestBody"]["content"]["application/json"];
type SubmitRecurringSignatureResponse = operations[typeof OP_SUBMIT_SIGNATURE]["responses"][201]["content"]["application/json"];
type UpdateRecurringBody = operations[typeof OP_UPDATE_RECURRING]["requestBody"]["content"]["application/json"];
type UpdateRecurringResponse = operations[typeof OP_UPDATE_RECURRING]["responses"][200]["content"]["application/json"];
interface PayoutOperationOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    validation?: RuntimeValidationOption;
    meta?: RequestOptions["meta"];
}
interface PayoutsApi {
    create(body: CreatePayoutBody, options?: PayoutOperationOptions): Promise<CreatePayoutResponse>;
    createBatch(body: CreateBatchBody, options?: PayoutOperationOptions): Promise<CreateBatchResponse>;
    getRecurringStatus(recurringId: string, options?: PayoutOperationOptions): Promise<RecurringStatusResponse>;
    submitRecurringSignature(recurringId: string, body: SubmitRecurringSignatureBody, options?: PayoutOperationOptions): Promise<SubmitRecurringSignatureResponse>;
    updateRecurring(recurringId: string, body: UpdateRecurringBody, options?: PayoutOperationOptions): Promise<UpdateRecurringResponse>;
}
declare function createPayoutsApi(http: HttpClient): PayoutsApi;

type index_PayoutOperationOptions = PayoutOperationOptions;
type index_PayoutsApi = PayoutsApi;
declare const index_createPayoutsApi: typeof createPayoutsApi;
declare namespace index {
  export { type index_PayoutOperationOptions as PayoutOperationOptions, type index_PayoutsApi as PayoutsApi, index_createPayoutsApi as createPayoutsApi };
}

export { type PayoutsApi as P, type PayoutOperationOptions as a, createPayoutsApi as c, index as i };
