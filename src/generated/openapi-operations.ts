/** Auto-generated from @marcohefti/request-network-api-contracts. Do not edit. */
import type { HttpMethod } from "../core/http/http.types";
import type { operations } from "./openapi-types";

export const operationDefinitions = {
  "HealthController_check_v2": {
    "method": "GET",
    "path": "/v2/health",
    "successStatus": 200,
    "hasJsonResponse": false
  },
  "CurrenciesV1Controller_getNetworkTokens_v1": {
    "method": "GET",
    "path": "/v1/currencies",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "CurrenciesV1Controller_getConversionRoutes_v1": {
    "method": "GET",
    "path": "/v1/currencies/{currencyId}/conversion-routes",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "CurrenciesV2Controller_getNetworkTokens_v2": {
    "method": "GET",
    "path": "/v2/currencies",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "CurrenciesV2Controller_getConversionRoutes_v2": {
    "method": "GET",
    "path": "/v2/currencies/{currencyId}/conversion-routes",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "ClientIdV2Controller_create_v2": {
    "method": "POST",
    "path": "/v2/client-ids",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "ClientIdV2Controller_findAll_v2": {
    "method": "GET",
    "path": "/v2/client-ids",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "ClientIdV2Controller_findOne_v2": {
    "method": "GET",
    "path": "/v2/client-ids/{id}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "ClientIdV2Controller_update_v2": {
    "method": "PUT",
    "path": "/v2/client-ids/{id}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "ClientIdV2Controller_delete_v2": {
    "method": "DELETE",
    "path": "/v2/client-ids/{id}",
    "successStatus": 200,
    "hasJsonResponse": false
  },
  "RequestControllerV1_createRequest_v1": {
    "method": "POST",
    "path": "/v1/request",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "RequestControllerV1_getRequestStatus_v1": {
    "method": "GET",
    "path": "/v1/request/{paymentReference}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "RequestControllerV1_stopRecurrenceRequest_v1": {
    "method": "PATCH",
    "path": "/v1/request/{paymentReference}/stop-recurrence",
    "successStatus": 200,
    "hasJsonResponse": false
  },
  "RequestControllerV1_getPaymentCalldata_v1": {
    "method": "GET",
    "path": "/v1/request/{paymentReference}/pay",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "RequestControllerV1_getRequestPaymentRoutes_v1": {
    "method": "GET",
    "path": "/v1/request/{paymentReference}/routes",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "RequestControllerV2_listRequests_v2": {
    "method": "GET",
    "path": "/v2/request",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "RequestControllerV2_createRequest_v2": {
    "method": "POST",
    "path": "/v2/request",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "RequestControllerV2_getRequestStatus_v2": {
    "method": "GET",
    "path": "/v2/request/{requestId}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "RequestControllerV2_updateRequest_v2": {
    "method": "PATCH",
    "path": "/v2/request/{requestId}",
    "successStatus": 200,
    "hasJsonResponse": false
  },
  "RequestControllerV2_getPaymentCalldata_v2": {
    "method": "GET",
    "path": "/v2/request/{requestId}/pay",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "RequestControllerV2_getRequestPaymentRoutes_v2": {
    "method": "GET",
    "path": "/v2/request/{requestId}/routes",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayerV1Controller_getComplianceData_v1": {
    "method": "POST",
    "path": "/v1/payer",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayerV1Controller_updateComplianceStatus_v1": {
    "method": "PATCH",
    "path": "/v1/payer/{clientUserId}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayerV1Controller_getComplianceStatus_v1": {
    "method": "GET",
    "path": "/v1/payer/{clientUserId}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayerV1Controller_createPaymentDetails_v1": {
    "method": "POST",
    "path": "/v1/payer/{clientUserId}/payment-details",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "PayerV1Controller_getPaymentDetails_v1": {
    "method": "GET",
    "path": "/v1/payer/{clientUserId}/payment-details",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayerV2Controller_getComplianceData_v2": {
    "method": "POST",
    "path": "/v2/payer",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayerV2Controller_updateComplianceStatus_v2": {
    "method": "PATCH",
    "path": "/v2/payer/{clientUserId}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayerV2Controller_getComplianceStatus_v2": {
    "method": "GET",
    "path": "/v2/payer/{clientUserId}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayerV2Controller_createPaymentDetails_v2": {
    "method": "POST",
    "path": "/v2/payer/{clientUserId}/payment-details",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "PayerV2Controller_getPaymentDetails_v2": {
    "method": "GET",
    "path": "/v2/payer/{clientUserId}/payment-details",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "SecurePaymentController_createSecurePayment_v2": {
    "method": "POST",
    "path": "/v2/secure-payments",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "SecurePaymentController_findSecurePayment_v2": {
    "method": "GET",
    "path": "/v2/secure-payments",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "SecurePaymentController_createPayoutSecurePayment_v2": {
    "method": "POST",
    "path": "/v2/secure-payments/payouts",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "SecurePaymentController_previewFees_v2": {
    "method": "POST",
    "path": "/v2/secure-payments/fees/preview",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "SecurePaymentController_createBatchPayoutSecurePayment_v2": {
    "method": "POST",
    "path": "/v2/secure-payments/batch-payouts",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "SecurePaymentController_getSecurePaymentByToken_v2": {
    "method": "GET",
    "path": "/v2/secure-payments/{token}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "SecurePaymentController_getSecurePaymentCalldataByToken_v2": {
    "method": "GET",
    "path": "/v2/secure-payments/{token}/pay",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "SecurePaymentController_broadcastTronTransaction_v2": {
    "method": "POST",
    "path": "/v2/secure-payments/{token}/tron/broadcast",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "SecurePaymentController_refreshStepTransaction_v2": {
    "method": "POST",
    "path": "/v2/secure-payments/{token}/refresh-step-transaction",
    "successStatus": 200,
    "hasJsonResponse": false
  },
  "SecurePaymentController_recordIntent_v2": {
    "method": "POST",
    "path": "/v2/secure-payments/{token}/intent",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "SecurePaymentController_recordMulticallIntent_v2": {
    "method": "POST",
    "path": "/v2/secure-payments/{token}/multicall-intent",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "SecurePaymentController_recordUserEvent_v2": {
    "method": "POST",
    "path": "/v2/secure-payments/{token}/events",
    "successStatus": 202,
    "hasJsonResponse": true
  },
  "SecurePaymentMulticallController_createMulticallPayout_v2": {
    "method": "POST",
    "path": "/v2/secure-payments/multicall-payouts",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "SecurePaymentMulticallController_getMulticallPayout_v2": {
    "method": "GET",
    "path": "/v2/secure-payments/multicall-payouts/{token}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayV1Controller_payRequest_v1": {
    "method": "POST",
    "path": "/v1/pay",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "PaymentV2Controller_searchPayments_v2": {
    "method": "GET",
    "path": "/v2/payments",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayoutV2Controller_payRequest_v2": {
    "method": "POST",
    "path": "/v2/payouts",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "PayoutV2Controller_payBatchRequest_v2": {
    "method": "POST",
    "path": "/v2/payouts/batch",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "PayoutV2Controller_submitRecurringPaymentSignature_v2": {
    "method": "POST",
    "path": "/v2/payouts/recurring/{id}",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "PayoutV2Controller_getRecurringPaymentStatus_v2": {
    "method": "GET",
    "path": "/v2/payouts/recurring/{id}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "PayoutV2Controller_updateRecurringPayment_v2": {
    "method": "PATCH",
    "path": "/v2/payouts/recurring/{id}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "RequestExportController_exportRequests_v2": {
    "method": "GET",
    "path": "/v2/dashboard/requests/export",
    "successStatus": 200,
    "hasJsonResponse": false
  },
  "JourneyController_createJourney_v2": {
    "method": "POST",
    "path": "/v2/journey",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "JourneyController_createJourneyEvent_v2": {
    "method": "POST",
    "path": "/v2/journey/{queryId}",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "JourneyController_getJourney_v2": {
    "method": "GET",
    "path": "/v2/journey/{journeyId}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "TransactionHistoryController_getHistory_v2": {
    "method": "GET",
    "path": "/v2/transaction-history",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "CommercePaymentsController_generateAuthorizeCalldata_v2": {
    "method": "POST",
    "path": "/v2/commerce-payments/authorize/calldata",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "CommercePaymentsController_getPaymentStatus_v2": {
    "method": "GET",
    "path": "/v2/commerce-payments/{requestId}/status",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "CommercePaymentsController_authorizePayment_v2": {
    "method": "POST",
    "path": "/v2/commerce-payments/{requestId}/authorize",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "CommercePaymentsController_generateCaptureCalldata_v2": {
    "method": "POST",
    "path": "/v2/commerce-payments/{requestId}/capture/calldata",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "CommercePaymentsController_generateVoidCalldata_v2": {
    "method": "POST",
    "path": "/v2/commerce-payments/{requestId}/void/calldata",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "CommercePaymentsController_capturePayment_v2": {
    "method": "POST",
    "path": "/v2/commerce-payments/{requestId}/capture",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "CommercePaymentsController_voidPayment_v2": {
    "method": "POST",
    "path": "/v2/commerce-payments/{requestId}/void",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_createOrchestrator_v2": {
    "method": "POST",
    "path": "/v2/orchestrators",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "OrchestratorController_listLinkedClientIds_v2": {
    "method": "GET",
    "path": "/v2/orchestrators/client-ids",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_linkClientId_v2": {
    "method": "POST",
    "path": "/v2/orchestrators/client-ids",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "OrchestratorController_createLinkIntent_v2": {
    "method": "POST",
    "path": "/v2/orchestrators/client-id-link-intents",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "OrchestratorController_unlinkClientId_v2": {
    "method": "DELETE",
    "path": "/v2/orchestrators/client-ids/{clientId}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_createFeeConfig_v2": {
    "method": "POST",
    "path": "/v2/orchestrators/fee-configs",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "OrchestratorController_listFeeConfigs_v2": {
    "method": "GET",
    "path": "/v2/orchestrators/fee-configs",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_updateFeeConfig_v2": {
    "method": "PATCH",
    "path": "/v2/orchestrators/fee-configs/{id}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_disableFeeConfig_v2": {
    "method": "DELETE",
    "path": "/v2/orchestrators/fee-configs/{id}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_createBranding_v2": {
    "method": "POST",
    "path": "/v2/orchestrators/branding",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "OrchestratorController_getBranding_v2": {
    "method": "GET",
    "path": "/v2/orchestrators/branding",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_updateBranding_v2": {
    "method": "PATCH",
    "path": "/v2/orchestrators/branding",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_removeBranding_v2": {
    "method": "DELETE",
    "path": "/v2/orchestrators/branding",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_createWebhook_v2": {
    "method": "POST",
    "path": "/v2/orchestrators/webhooks",
    "successStatus": 201,
    "hasJsonResponse": true
  },
  "OrchestratorController_listWebhooks_v2": {
    "method": "GET",
    "path": "/v2/orchestrators/webhooks",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_deactivateWebhook_v2": {
    "method": "DELETE",
    "path": "/v2/orchestrators/webhooks/{id}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_activateWebhook_v2": {
    "method": "PATCH",
    "path": "/v2/orchestrators/webhooks/{id}",
    "successStatus": 200,
    "hasJsonResponse": true
  },
  "OrchestratorController_testWebhook_v2": {
    "method": "POST",
    "path": "/v2/orchestrators/webhooks/test",
    "successStatus": 200,
    "hasJsonResponse": true
  }
} as const satisfies Record<string, { method: HttpMethod; path: string; successStatus: number; hasJsonResponse: boolean }>;

export type OperationId = keyof typeof operationDefinitions & keyof operations;
