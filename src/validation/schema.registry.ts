import type { ZodTypeAny } from "zod";

export type SchemaKind = "request" | "response" | "webhook";

export interface SchemaKey {
  operationId: string;
  kind: SchemaKind;
  variant?: string;
  status?: number;
}

export interface SchemaEntry<TSchema extends ZodTypeAny = ZodTypeAny> {
  key: SchemaKey;
  schema: TSchema;
}

function serialiseKey(key: SchemaKey): string {
  const variant = key.variant ?? "default";
  const status = key.status?.toString() ?? "any";
  return `${key.operationId}|${key.kind}|${variant}|${status}`;
}

/**
 * Lightweight registry that associates OpenAPI operation IDs with validation schemas.
 * Generators can populate this map while domain modules retrieve the schemas at runtime.
 */
export class SchemaRegistry {
  private readonly store = new Map<string, SchemaEntry>();

  register(entry: SchemaEntry): void {
    const id = serialiseKey(entry.key);
    this.store.set(id, entry);
  }

  get(key: SchemaKey): ZodTypeAny | undefined {
    const id = serialiseKey(key);
    return this.store.get(id)?.schema;
  }

  /**
   * Removes every registered schema — primarily useful in tests.
   */
  clear(): void {
    this.store.clear();
  }
}

export const schemaRegistry = new SchemaRegistry();
