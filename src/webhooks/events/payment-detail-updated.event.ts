import type { WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookPayload } from "../schemas.webhook";
import { createEventPredicate, registerEventHandler, type WebhookEventHandler, type WebhookEventHandlerContext } from "./base.event";

export const PAYMENT_DETAIL_UPDATED_EVENT = "payment_detail.updated" as const;

export type PaymentDetailUpdatedEventName = typeof PAYMENT_DETAIL_UPDATED_EVENT;

export type PaymentDetailUpdatedPayload = WebhookPayload<PaymentDetailUpdatedEventName>;

export type PaymentDetailUpdatedContext = WebhookEventHandlerContext<PaymentDetailUpdatedEventName>;

export type PaymentDetailUpdatedHandler = WebhookEventHandler<PaymentDetailUpdatedEventName>;

export type PaymentDetailStatus = PaymentDetailUpdatedPayload["status"];

export const PAYMENT_DETAIL_STATUSES = Object.freeze([
  "approved",
  "failed",
  "pending",
  "verified",
] as const satisfies readonly PaymentDetailStatus[]);

export const isPaymentDetailUpdatedEvent = createEventPredicate<PaymentDetailUpdatedEventName>(PAYMENT_DETAIL_UPDATED_EVENT);

export function onPaymentDetailUpdated(dispatcher: WebhookDispatcher, handler: PaymentDetailUpdatedHandler): () => void {
  return registerEventHandler(dispatcher, PAYMENT_DETAIL_UPDATED_EVENT, handler);
}

export function assertPaymentDetailUpdatedEvent(event: ParsedWebhookEvent): asserts event is ParsedWebhookEvent<PaymentDetailUpdatedEventName> {
  if (event.event !== PAYMENT_DETAIL_UPDATED_EVENT) {
    throw new TypeError(`Expected payment_detail.updated event. Received ${event.event}.`);
  }
}

export function isPaymentDetailApproved(payload: Pick<PaymentDetailUpdatedPayload, "status">): payload is PaymentDetailUpdatedPayload & {
  status: "approved";
} {
  return payload.status === "approved";
}

export function isPaymentDetailRejected(payload: Pick<PaymentDetailUpdatedPayload, "status">): payload is PaymentDetailUpdatedPayload & {
  status: "failed";
} {
  return payload.status === "failed";
}

export function isPaymentDetailPending(payload: Pick<PaymentDetailUpdatedPayload, "status">): payload is PaymentDetailUpdatedPayload & {
  status: "pending";
} {
  return payload.status === "pending";
}

export function isPaymentDetailVerified(payload: Pick<PaymentDetailUpdatedPayload, "status">): payload is PaymentDetailUpdatedPayload & {
  status: "verified";
} {
  return payload.status === "verified";
}
