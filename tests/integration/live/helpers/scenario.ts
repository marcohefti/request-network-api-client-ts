import { ensureComplianceData, ensurePaymentDetails } from "./payer-provisioner";
import type { ScenarioLogger } from "./types";
import type { RequestClient } from "../../../../src";
import { createClientFromEnv } from "../../../utils/env.utils";
import type { SuiteEnv } from "../../../utils/env.utils";

interface LiveScenarioOptions {
  env: SuiteEnv;
  logger?: ScenarioLogger;
  clientUserId?: string;
  initialPaymentDetailsId?: string;
  payoutWallet?: string;
  offRampEnabled?: boolean;
}

interface RequestCreationParams {
  payeeWallet: string;
  amount: string;
  invoiceCurrency: string;
  paymentCurrency: string;
  reference: string;
  recurrence?: {
    startDate: string;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  };
}

interface PaymentRouteParams {
  requestId: string;
  wallet: string;
  amount: string;
}

interface PaymentCalldataParams {
  requestId: string;
  wallet: string;
  amount?: string;
}

interface PayoutParams {
  payoutWallet: string;
  amount: string;
  invoiceCurrency: string;
  paymentCurrency: string;
  reference: string;
  payerWallet: string;
}

interface ScenarioState {
  requestId?: string;
  paymentReference?: string;
  paymentIntentId?: string;
  paymentDetailsId?: string;
  complianceProvisioned: boolean;
}

type RequestsApi = RequestClient["requests"];
type PaymentsApi = RequestClient["payments"];
type PayoutsApi = RequestClient["payouts"];

type RequestStatusResponse = Awaited<ReturnType<RequestsApi["getRequestStatus"]>>;
type PaymentRoutesResponse = Awaited<ReturnType<RequestsApi["getPaymentRoutes"]>>;
type PaymentCalldataResponse = Awaited<ReturnType<RequestsApi["getPaymentCalldata"]>>;
type PaymentsSearchResponse = Awaited<ReturnType<PaymentsApi["search"]>>;
type PayoutCreateResponse = Awaited<ReturnType<PayoutsApi["create"]>>;

export class LiveScenario {
  private readonly log: ScenarioLogger;
  private readonly client: RequestClient;
  private readonly clientUserId?: string;
  private readonly payoutWallet?: string;
  private readonly offRampEnabled: boolean;
  private state: ScenarioState;

  static async initialise(options: LiveScenarioOptions): Promise<LiveScenario> {
    const client = createClientFromEnv(options.env);
    const scenario = new LiveScenario({
      client,
      logger: options.logger,
      clientUserId: options.clientUserId,
      payoutWallet: options.payoutWallet,
      initialPaymentDetailsId: options.initialPaymentDetailsId,
      offRampEnabled: options.offRampEnabled ?? false,
    });
    await scenario.ensurePayerPrerequisites();
    return scenario;
  }

  private constructor(params: {
    client: RequestClient;
    logger?: ScenarioLogger;
    clientUserId?: string;
    payoutWallet?: string;
    initialPaymentDetailsId?: string;
    offRampEnabled?: boolean;
  }) {
    this.client = params.client;
    this.clientUserId = params.clientUserId ? params.clientUserId.trim() : undefined;
    this.payoutWallet = params.payoutWallet ? params.payoutWallet.trim() : undefined;
    this.offRampEnabled = params.offRampEnabled ?? false;
    this.state = {
      paymentDetailsId: params.initialPaymentDetailsId ? params.initialPaymentDetailsId.trim() : undefined,
      complianceProvisioned: false,
    };
    this.log = params.logger ?? (() => {});
  }

  get clientInstance(): RequestClient {
    return this.client;
  }

  get requestId(): string | undefined {
    return this.state.requestId;
  }

  get paymentReference(): string | undefined {
    return this.state.paymentReference;
  }

  get paymentIntentId(): string | undefined {
    return this.state.paymentIntentId;
  }

  get paymentDetailsId(): string | undefined {
    return this.state.paymentDetailsId;
  }

  get isOffRampEnabled(): boolean {
    return this.offRampEnabled;
  }

  async ensurePayerPrerequisites(): Promise<void> {
    if (!this.offRampEnabled || !this.clientUserId) {
      return;
    }

    await ensureComplianceData({
      client: this.client,
      clientUserId: this.clientUserId,
      logger: this.log,
      state: this.state,
    });
    await ensurePaymentDetails({
      client: this.client,
      clientUserId: this.clientUserId,
      logger: this.log,
      state: this.state,
    });
  }

  async createRequest(params: RequestCreationParams): Promise<{ requestId?: string; paymentReference?: string }> {
    const response = await this.client.requests.create({
      payee: params.payeeWallet,
      amount: params.amount,
      invoiceCurrency: params.invoiceCurrency,
      paymentCurrency: params.paymentCurrency,
      reference: params.reference,
      recurrence: params.recurrence,
    });

    this.state.requestId = response.requestId ?? undefined;
    this.state.paymentReference = response.paymentReference ?? undefined;

    this.log("info", "request.created", {
      requestId: this.state.requestId,
      paymentReference: this.state.paymentReference,
      reference: params.reference,
      amount: params.amount,
      invoiceCurrency: params.invoiceCurrency,
      paymentCurrency: params.paymentCurrency,
    });

    return {
      requestId: this.state.requestId,
      paymentReference: this.state.paymentReference,
    };
  }

  async getRequestStatus(requestId: string): Promise<RequestStatusResponse> {
    return this.client.requests.getRequestStatus(requestId);
  }

  async getPaymentRoutes(params: PaymentRouteParams): Promise<PaymentRoutesResponse> {
    return this.client.requests.getPaymentRoutes(params.requestId, {
      wallet: params.wallet,
      amount: params.amount,
    });
  }

  async getPaymentCalldata(params: PaymentCalldataParams): Promise<PaymentCalldataResponse> {
    const options: Parameters<RequestsApi["getPaymentCalldata"]>[1] = {
      wallet: params.wallet,
      amount: params.amount,
    };

    if (this.offRampEnabled && this.clientUserId) {
      options.clientUserId = this.clientUserId;
      const paymentDetailsId = await ensurePaymentDetails({
        client: this.client,
        clientUserId: this.clientUserId,
        logger: this.log,
        state: this.state,
      });
      if (paymentDetailsId) {
        options.paymentDetailsId = paymentDetailsId;
      } else {
        this.log("warn", "paymentDetails.missing", {
          clientUserId: this.clientUserId,
        });
      }
    }

    const raw = await this.client.requests.getPaymentCalldata(params.requestId, options);
    if ("paymentIntentId" in raw && typeof raw.paymentIntentId === "string") {
      this.state.paymentIntentId = raw.paymentIntentId;
      this.log("info", "paymentIntent.prepared", {
        requestId: params.requestId,
        paymentIntentId: raw.paymentIntentId,
      });
    }

    return raw;
  }

  async searchPayments(requestId: string): Promise<PaymentsSearchResponse> {
    return this.client.payments.search({ requestId });
  }

  async createPayout(params: PayoutParams): Promise<PayoutCreateResponse | undefined> {
    if (!this.offRampEnabled || !this.payoutWallet) {
      return undefined;
    }
    return this.client.payouts.create({
      payee: params.payoutWallet,
      amount: params.amount,
      invoiceCurrency: params.invoiceCurrency,
      paymentCurrency: params.paymentCurrency,
      reference: params.reference,
      payerWallet: params.payerWallet,
    });
  }
}
