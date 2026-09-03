import type { HttpClient } from "../../core/http/http.types";
import { createOperationsApi, type OperationArguments, type OperationResponse, type OperationsApi } from "../operations";

type CreateId = "OrchestratorController_createOrchestrator_v2";
type ListLinkedId = "OrchestratorController_listLinkedClientIds_v2";
type LinkId = "OrchestratorController_linkClientId_v2";
type LinkIntentId = "OrchestratorController_createLinkIntent_v2";
type UnlinkId = "OrchestratorController_unlinkClientId_v2";
type CreateFeeId = "OrchestratorController_createFeeConfig_v2";
type ListFeesId = "OrchestratorController_listFeeConfigs_v2";
type UpdateFeeId = "OrchestratorController_updateFeeConfig_v2";
type DisableFeeId = "OrchestratorController_disableFeeConfig_v2";
type CreateBrandingId = "OrchestratorController_createBranding_v2";
type GetBrandingId = "OrchestratorController_getBranding_v2";
type UpdateBrandingId = "OrchestratorController_updateBranding_v2";
type RemoveBrandingId = "OrchestratorController_removeBranding_v2";
type CreateWebhookId = "OrchestratorController_createWebhook_v2";
type ListWebhooksId = "OrchestratorController_listWebhooks_v2";
type DeactivateWebhookId = "OrchestratorController_deactivateWebhook_v2";
type ActivateWebhookId = "OrchestratorController_activateWebhook_v2";
type TestWebhookId = "OrchestratorController_testWebhook_v2";

type Operation<Id extends Parameters<OperationsApi["execute"]>[0]> = (...args: OperationArguments<Id>) => Promise<OperationResponse<Id>>;

/** First-class access to the current Request Network orchestrator API. */
export interface OrchestratorsApi {
  create: Operation<CreateId>;
  clientIds: {
    list: Operation<ListLinkedId>;
    link: Operation<LinkId>;
    createLinkIntent: Operation<LinkIntentId>;
    unlink: Operation<UnlinkId>;
  };
  fees: {
    create: Operation<CreateFeeId>;
    list: Operation<ListFeesId>;
    update: Operation<UpdateFeeId>;
    disable: Operation<DisableFeeId>;
  };
  branding: {
    create: Operation<CreateBrandingId>;
    get: Operation<GetBrandingId>;
    update: Operation<UpdateBrandingId>;
    remove: Operation<RemoveBrandingId>;
  };
  webhooks: {
    create: Operation<CreateWebhookId>;
    list: Operation<ListWebhooksId>;
    deactivate: Operation<DeactivateWebhookId>;
    activate: Operation<ActivateWebhookId>;
    test: Operation<TestWebhookId>;
  };
}

export function createOrchestratorsApi(http: HttpClient): OrchestratorsApi {
  const operations = createOperationsApi(http);
  const operation = <Id extends Parameters<OperationsApi["execute"]>[0]>(id: Id): Operation<Id> => (...args) => operations.execute(id, ...args);

  return {
    create: operation<CreateId>("OrchestratorController_createOrchestrator_v2"),
    clientIds: {
      list: operation<ListLinkedId>("OrchestratorController_listLinkedClientIds_v2"),
      link: operation<LinkId>("OrchestratorController_linkClientId_v2"),
      createLinkIntent: operation<LinkIntentId>("OrchestratorController_createLinkIntent_v2"),
      unlink: operation<UnlinkId>("OrchestratorController_unlinkClientId_v2"),
    },
    fees: {
      create: operation<CreateFeeId>("OrchestratorController_createFeeConfig_v2"),
      list: operation<ListFeesId>("OrchestratorController_listFeeConfigs_v2"),
      update: operation<UpdateFeeId>("OrchestratorController_updateFeeConfig_v2"),
      disable: operation<DisableFeeId>("OrchestratorController_disableFeeConfig_v2"),
    },
    branding: {
      create: operation<CreateBrandingId>("OrchestratorController_createBranding_v2"),
      get: operation<GetBrandingId>("OrchestratorController_getBranding_v2"),
      update: operation<UpdateBrandingId>("OrchestratorController_updateBranding_v2"),
      remove: operation<RemoveBrandingId>("OrchestratorController_removeBranding_v2"),
    },
    webhooks: {
      create: operation<CreateWebhookId>("OrchestratorController_createWebhook_v2"),
      list: operation<ListWebhooksId>("OrchestratorController_listWebhooks_v2"),
      deactivate: operation<DeactivateWebhookId>("OrchestratorController_deactivateWebhook_v2"),
      activate: operation<ActivateWebhookId>("OrchestratorController_activateWebhook_v2"),
      test: operation<TestWebhookId>("OrchestratorController_testWebhook_v2"),
    },
  };
}
