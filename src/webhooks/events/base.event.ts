import type { WebhookDispatchContext, WebhookDispatcher } from "../dispatcher.webhook";
import type { ParsedWebhookEvent } from "../parser.webhook";
import type { WebhookEventName, WebhookPayload } from "../schemas.webhook";

export interface WebhookEventHandlerContext<E extends WebhookEventName> {
  event: ParsedWebhookEvent<E>;
  dispatchContext: WebhookDispatchContext;
}

export type WebhookEventHandler<E extends WebhookEventName> = (
  payload: WebhookPayload<E>,
  context: WebhookEventHandlerContext<E>,
) => void | Promise<void>;

export function registerEventHandler<E extends WebhookEventName>(
  dispatcher: WebhookDispatcher,
  event: E,
  handler: WebhookEventHandler<E>,
): () => void {
  return dispatcher.on(event, async (parsed, dispatchContext) => {
    await handler(parsed.payload, { event: parsed, dispatchContext });
  });
}

export function createEventPredicate<E extends WebhookEventName>(event: E) {
  return (parsed: ParsedWebhookEvent): parsed is ParsedWebhookEvent<E> => parsed.event === event;
}
