export type WebhookSignatureErrorReason =
  | "missing_signature"
  | "invalid_format"
  | "invalid_signature"
  | "tolerance_exceeded";

export interface RequestWebhookSignatureErrorOptions {
  readonly headerName: string;
  readonly signature?: string | null;
  readonly timestamp?: number | null;
  readonly reason: WebhookSignatureErrorReason;
  readonly cause?: unknown;
}

/**
 * Error thrown when webhook signature verification fails.
 * Consumers can narrow on this error to differentiate between auth failures
 * and downstream application exceptions.
 */
export class RequestWebhookSignatureError extends Error {
  static readonly code = "ERR_REQUEST_WEBHOOK_SIGNATURE_VERIFICATION_FAILED";

  readonly code = RequestWebhookSignatureError.code;
  readonly statusCode = 401;
  readonly headerName: string;
  readonly signature?: string | null;
  readonly timestamp?: number | null;
  readonly reason: WebhookSignatureErrorReason;

  constructor(message: string, options: RequestWebhookSignatureErrorOptions) {
    const { headerName, signature, timestamp, reason, cause } = options;
    super(message, { cause });
    this.name = "RequestWebhookSignatureError";
    this.headerName = headerName;
    this.signature = signature;
    this.timestamp = timestamp ?? null;
    this.reason = reason;
  }
}

export function isRequestWebhookSignatureError(error: unknown): error is RequestWebhookSignatureError {
  return error instanceof RequestWebhookSignatureError;
}
