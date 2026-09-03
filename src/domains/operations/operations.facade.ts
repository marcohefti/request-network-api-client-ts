import type { HttpClient, RequestOptions, RuntimeValidationOption } from "../../core/http/http.types";
import { requestJson, requestVoid } from "../../core/http/operation.helper";
import { buildPath } from "../../core/http/path.builder";
import { operationDefinitions, type OperationId } from "../../generated/openapi-operations";
import type { operations } from "../../generated/openapi-types";

type JsonContent<T> = T extends { content: { "application/json": infer Content } } ? Content : unknown;
type OperationResponses<Id extends OperationId> = operations[Id] extends { responses: infer Responses } ? Responses : never;
type OperationRequest<Id extends OperationId> = operations[Id] extends { requestBody?: { content: { "application/json": infer Body } } } ? Body : never;
type PathPlaceholders<Path extends string> = Path extends `${string}{${infer Parameter}}${infer Rest}` ? Parameter | PathPlaceholders<Rest> : never;
type OperationQuery<Id extends OperationId> = operations[Id] extends { parameters: { query?: infer Query } } ? Query : Record<string, never>;
type RequiredKeys<Value> = {
  [Key in keyof Value]-?: Record<string, never> extends Pick<Value, Key> ? never : Key;
}[keyof Value];
type PathInput<Id extends OperationId> = [PathPlaceholders<(typeof operationDefinitions)[Id]["path"]>] extends [never]
  ? { path?: Record<string, never> }
  : { path: Record<PathPlaceholders<(typeof operationDefinitions)[Id]["path"]>, string | number> };
type QueryInput<Id extends OperationId> = [RequiredKeys<OperationQuery<Id>>] extends [never]
  ? { query?: OperationQuery<Id> }
  : { query: OperationQuery<Id> };
type BodyInput<Id extends OperationId> = operations[Id] extends { requestBody: { content: { "application/json": infer Body } } }
  ? { body: Body }
  : { body?: OperationRequest<Id> };

/** The typed JSON response of a published Request API operation. */
export type OperationResponse<Id extends OperationId> =
  typeof operationDefinitions[Id]["hasJsonResponse"] extends true
    ? JsonContent<OperationResponses<Id>[typeof operationDefinitions[Id]["successStatus"] & keyof OperationResponses<Id>]>
    : undefined;

/**
 * Generic operation input. `path` and `query` retain the generated OpenAPI
 * parameter types; `body` is the generated JSON request type when present.
 */
export type OperationInput<Id extends OperationId> = PathInput<Id> & QueryInput<Id> & BodyInput<Id> & {
  /** Route placeholders are always explicit, including upstream paths whose parameter is misdeclared as query-only. */
  headers?: operations[Id] extends { parameters: { header?: infer Headers } } ? Headers : Record<string, never>;
  body?: OperationRequest<Id>;
  signal?: AbortSignal;
  timeoutMs?: number;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
};

export type OperationArguments<Id extends OperationId> = Record<string, never> extends OperationInput<Id>
  ? [input?: OperationInput<Id>]
  : [input: OperationInput<Id>];

export interface OperationsApi {
  /**
   * Executes any operation in the released Request API contract. Prefer a
   * domain facade where one exists; this keeps new API domains available on
   * day one without adding untyped escape hatches.
   */
  execute<Id extends OperationId>(operationId: Id, ...args: OperationArguments<Id>): Promise<OperationResponse<Id>>;
}

export function createOperationsApi(http: HttpClient): OperationsApi {
  async function execute<Id extends OperationId>(operationId: Id, ...args: OperationArguments<Id>): Promise<OperationResponse<Id>> {
    const input = (args[0] ?? {}) as OperationInput<Id>;
    const definition = operationDefinitions[operationId];
    const inferredPath = (input.path ?? {}) as Record<string, string | number>;
    const path = buildPath(definition.path, inferredPath);
    if (!definition.hasJsonResponse) {
      await requestVoid(http, {
        operationId,
        method: definition.method,
        path,
        query: input.query as RequestOptions["query"],
        headers: input.headers as Record<string, string>,
        body: input.body,
        requestSchemaKey: { operationId, kind: "request", variant: "application/json" },
        signal: input.signal,
        timeoutMs: input.timeoutMs,
        validation: input.validation,
        meta: input.meta,
      });
      return undefined as OperationResponse<Id>;
    }
    return requestJson<OperationResponse<Id>>(http, {
      operationId,
      method: definition.method,
      path,
      query: input.query as RequestOptions["query"],
      headers: input.headers as Record<string, string>,
      body: input.body,
      requestSchemaKey: { operationId, kind: "request", variant: "application/json" },
      schemaKey: { operationId, kind: "response", status: definition.successStatus },
      description: operationId,
      signal: input.signal,
      timeoutMs: input.timeoutMs,
      validation: input.validation,
      meta: input.meta,
    });
  }

  return {
    execute,
  };
}
