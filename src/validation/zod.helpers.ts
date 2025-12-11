import { type SafeParseReturnType, type ZodTypeAny } from "zod";

import type { SchemaKey } from "./schema.registry";
import { schemaRegistry } from "./schema.registry";

export type SchemaOutput<TSchema extends ZodTypeAny> = TSchema["_output"];

export interface ParseWithSchemaOptions<TSchema extends ZodTypeAny> {
  schema: TSchema;
  value: unknown;
  description?: string;
}

export interface ParseRegistryOptions {
  key: SchemaKey;
  value: unknown;
  description?: string;
  skipOnMissingSchema?: boolean;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
}

export class ValidationError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message, { cause });
    this.name = "ClientValidationError";
  }
}

export function parseWithSchema<TSchema extends ZodTypeAny>(
  options: ParseWithSchemaOptions<TSchema>,
): ParseResult<SchemaOutput<TSchema>> {
  const { schema, value, description } = options;
  const outcome: SafeParseReturnType<unknown, SchemaOutput<TSchema>> = schema.safeParse(value);
  if (outcome.success) {
    return { success: true, data: outcome.data };
  }

  const error = new ValidationError(description ?? "Validation failed", outcome.error);
  return { success: false, error };
}

export function parseWithRegistry<TSchema extends ZodTypeAny>(options: ParseRegistryOptions): ParseResult<SchemaOutput<TSchema>> {
  const schema = schemaRegistry.get(options.key) as TSchema | undefined;
  if (!schema) {
    if (options.skipOnMissingSchema) {
      return { success: true, data: options.value as SchemaOutput<TSchema> };
    }
    return { success: false, error: new ValidationError(`No schema registered for ${options.key.operationId}`) };
  }

  return parseWithSchema({ schema, value: options.value, description: options.description });
}
