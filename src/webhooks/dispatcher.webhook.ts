import type { ParsedWebhookEvent } from "./parser.webhook";
import type { WebhookEventName, WebhookPayload } from "./schemas.webhook";

export type WebhookDispatchContext = Record<string, unknown>;

export type WebhookHandler<E extends WebhookEventName = WebhookEventName> = (
  event: ParsedWebhookEvent<E>,
  context: WebhookDispatchContext,
) => void | Promise<void>;

function ensureHandlerSet(
  store: Map<WebhookEventName, Set<WebhookHandler>>,
  event: WebhookEventName,
): Set<WebhookHandler> {
  let set = store.get(event);
  if (!set) {
    set = new Set();
    store.set(event, set);
  }
  return set;
}

export class WebhookDispatcher {
  private readonly handlers = new Map<WebhookEventName, Set<WebhookHandler>>();

  on<E extends WebhookEventName>(event: E, handler: WebhookHandler<E>): () => void {
    const set = ensureHandlerSet(this.handlers, event);
    const wrapped = handler as WebhookHandler;
    set.add(wrapped);

    return () => {
      const existing = this.handlers.get(event);
      if (!existing) return;
      existing.delete(wrapped);
      if (existing.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  once<E extends WebhookEventName>(event: E, handler: WebhookHandler<E>): () => void {
    const disposeRef: { dispose?: () => void } = {};
    const wrapped: WebhookHandler<E> = async (evt, context) => {
      disposeRef.dispose?.();
      await handler(evt, context);
    };
    const dispose = this.on(event, wrapped);
    disposeRef.dispose = dispose;
    return dispose;
  }

  off<E extends WebhookEventName>(event: E, handler: WebhookHandler<E>): void {
    const set = this.handlers.get(event);
    if (!set) return;
    set.delete(handler as WebhookHandler);
    if (set.size === 0) {
      this.handlers.delete(event);
    }
  }

  clear(): void {
    this.handlers.clear();
  }

  handlerCount(event?: WebhookEventName): number {
    if (event) {
      return this.handlers.get(event)?.size ?? 0;
    }
    let total = 0;
    for (const set of this.handlers.values()) {
      total += set.size;
    }
    return total;
  }

  async dispatch<E extends WebhookEventName>(
    event: ParsedWebhookEvent<E>,
    context: WebhookDispatchContext = {},
  ): Promise<void> {
    const set = this.handlers.get(event.event);
    if (!set || set.size === 0) {
      return;
    }

    const handlers = Array.from(set) as WebhookHandler<E>[];
    for (const handler of handlers) {
      await handler(event, context);
    }
  }

  /**
   * Syntactic sugar for strongly typed handler registration that returns the original handler for chaining.
   */
  register<E extends WebhookEventName>(event: E, handler: WebhookHandler<E>): WebhookHandler<E> {
    this.on(event, handler);
    return handler;
  }
}

export function createWebhookDispatcher(): WebhookDispatcher {
  return new WebhookDispatcher();
}

export type InferDispatcherPayload<T extends WebhookEventName> = WebhookPayload<T>;
