import { o as operations, a as RuntimeValidationOption, c as RequestOptions, b as HttpClient } from './openapi-types-CtUFCrk4.mjs';

declare const OP_CREATE_COMPLIANCE$1: "PayerV1Controller_getComplianceData_v1";
declare const OP_GET_STATUS$1: "PayerV1Controller_getComplianceStatus_v1";
declare const OP_UPDATE_STATUS$1: "PayerV1Controller_updateComplianceStatus_v1";
declare const OP_CREATE_PAYMENT_DETAILS$1: "PayerV1Controller_createPaymentDetails_v1";
declare const OP_GET_PAYMENT_DETAILS$1: "PayerV1Controller_getPaymentDetails_v1";
type CreateComplianceBody$1 = operations[typeof OP_CREATE_COMPLIANCE$1]["requestBody"]["content"]["application/json"];
type CreateComplianceResponse$1 = operations[typeof OP_CREATE_COMPLIANCE$1]["responses"][200]["content"]["application/json"];
type ComplianceStatusResponse$1 = operations[typeof OP_GET_STATUS$1]["responses"][200]["content"]["application/json"];
type UpdateComplianceBody$1 = operations[typeof OP_UPDATE_STATUS$1]["requestBody"]["content"]["application/json"];
type UpdateComplianceResponse$1 = operations[typeof OP_UPDATE_STATUS$1]["responses"][200]["content"]["application/json"];
type CreatePaymentDetailsBody$1 = operations[typeof OP_CREATE_PAYMENT_DETAILS$1]["requestBody"]["content"]["application/json"];
type CreatePaymentDetailsResponse$1 = operations[typeof OP_CREATE_PAYMENT_DETAILS$1]["responses"][201]["content"]["application/json"];
type GetPaymentDetailsResponse$1 = operations[typeof OP_GET_PAYMENT_DETAILS$1]["responses"][200]["content"]["application/json"];
interface PayerV1OperationOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    validation?: RuntimeValidationOption;
    meta?: RequestOptions["meta"];
}
interface PayerV1Api {
    createComplianceData(body: CreateComplianceBody$1, options?: PayerV1OperationOptions): Promise<CreateComplianceResponse$1>;
    getComplianceStatus(clientUserId: string, options?: PayerV1OperationOptions): Promise<ComplianceStatusResponse$1>;
    updateComplianceStatus(clientUserId: string, body: UpdateComplianceBody$1, options?: PayerV1OperationOptions): Promise<UpdateComplianceResponse$1>;
    createPaymentDetails(clientUserId: string, body: CreatePaymentDetailsBody$1, options?: PayerV1OperationOptions): Promise<CreatePaymentDetailsResponse$1>;
    getPaymentDetails(clientUserId: string, options?: PayerV1OperationOptions): Promise<GetPaymentDetailsResponse$1>;
}
declare function createPayerV1Api(http: HttpClient): PayerV1Api;

declare const OP_CREATE_COMPLIANCE: "PayerV2Controller_getComplianceData_v2";
declare const OP_GET_STATUS: "PayerV2Controller_getComplianceStatus_v2";
declare const OP_UPDATE_STATUS: "PayerV2Controller_updateComplianceStatus_v2";
declare const OP_CREATE_PAYMENT_DETAILS: "PayerV2Controller_createPaymentDetails_v2";
declare const OP_GET_PAYMENT_DETAILS: "PayerV2Controller_getPaymentDetails_v2";
type CreateComplianceBody = operations[typeof OP_CREATE_COMPLIANCE]["requestBody"]["content"]["application/json"];
type CreateComplianceResponse = operations[typeof OP_CREATE_COMPLIANCE]["responses"][200]["content"]["application/json"];
type ComplianceStatusResponse = operations[typeof OP_GET_STATUS]["responses"][200]["content"]["application/json"];
type UpdateComplianceBody = operations[typeof OP_UPDATE_STATUS]["requestBody"]["content"]["application/json"];
type UpdateComplianceResponse = operations[typeof OP_UPDATE_STATUS]["responses"][200]["content"]["application/json"];
type CreatePaymentDetailsBody = operations[typeof OP_CREATE_PAYMENT_DETAILS]["requestBody"]["content"]["application/json"];
type CreatePaymentDetailsResponse = operations[typeof OP_CREATE_PAYMENT_DETAILS]["responses"][201]["content"]["application/json"];
type GetPaymentDetailsResponse = operations[typeof OP_GET_PAYMENT_DETAILS]["responses"][200]["content"]["application/json"];
interface PayerV2OperationOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    validation?: RuntimeValidationOption;
    meta?: RequestOptions["meta"];
}
interface PayerV2Api {
    createComplianceData(body: CreateComplianceBody, options?: PayerV2OperationOptions): Promise<CreateComplianceResponse>;
    getComplianceStatus(clientUserId: string, options?: PayerV2OperationOptions): Promise<ComplianceStatusResponse>;
    updateComplianceStatus(clientUserId: string, body: UpdateComplianceBody, options?: PayerV2OperationOptions): Promise<UpdateComplianceResponse>;
    createPaymentDetails(clientUserId: string, body: CreatePaymentDetailsBody, options?: PayerV2OperationOptions): Promise<CreatePaymentDetailsResponse>;
    getPaymentDetails(clientUserId: string, options?: PayerV2OperationOptions): Promise<GetPaymentDetailsResponse>;
}
declare function createPayerV2Api(http: HttpClient): PayerV2Api;

type PayerOperationOptions = PayerV2OperationOptions;
interface PayerApi extends PayerV2Api {
    legacy: PayerV1Api;
}

declare function createPayerApi(http: HttpClient): PayerApi;

type index_PayerApi = PayerApi;
type index_PayerOperationOptions = PayerOperationOptions;
type index_PayerV1Api = PayerV1Api;
type index_PayerV1OperationOptions = PayerV1OperationOptions;
type index_PayerV2Api = PayerV2Api;
type index_PayerV2OperationOptions = PayerV2OperationOptions;
declare const index_createPayerApi: typeof createPayerApi;
declare const index_createPayerV1Api: typeof createPayerV1Api;
declare const index_createPayerV2Api: typeof createPayerV2Api;
declare namespace index {
  export { type index_PayerApi as PayerApi, type index_PayerOperationOptions as PayerOperationOptions, type index_PayerV1Api as PayerV1Api, type index_PayerV1OperationOptions as PayerV1OperationOptions, type index_PayerV2Api as PayerV2Api, type index_PayerV2OperationOptions as PayerV2OperationOptions, index_createPayerApi as createPayerApi, index_createPayerV1Api as createPayerV1Api, index_createPayerV2Api as createPayerV2Api };
}

export { type PayerV1Api as P, type PayerV1OperationOptions as a, type PayerV2Api as b, createPayerV1Api as c, type PayerV2OperationOptions as d, createPayerV2Api as e, type PayerApi as f, createPayerApi as g, type PayerOperationOptions as h, index as i };
