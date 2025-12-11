import type { HttpClient, HttpMethod, RequestOptions, RuntimeValidationOption } from "./http.types";
import { mergeRuntimeValidation } from "./validation.config";
import type { SchemaKey } from "../../validation/schema.registry";
import { parseWithRegistry } from "../../validation/zod.helpers";

type Query = NonNullable<RequestOptions["query"]>;

export interface RequestJsonParams {
  operationId: string;
  method: HttpMethod;
  path: string;
  query?: Query;
  body?: unknown;
  schemaKey: SchemaKey;
  requestSchemaKey?: SchemaKey;
  description?: string;
  querySerializer?: RequestOptions["querySerializer"];
  signal?: RequestOptions["signal"];
  timeoutMs?: RequestOptions["timeoutMs"];
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export async function requestJson<T>(http: HttpClient, params: RequestJsonParams): Promise<T> {
  const {
    operationId,
    method,
    path,
    query,
    body,
    schemaKey,
    requestSchemaKey,
    description,
    querySerializer,
    signal,
    timeoutMs,
    validation,
    meta,
  } = params;

  const runtimeValidation = mergeRuntimeValidation(http.getRuntimeValidationConfig(), validation);

  let requestBody = body;
  if (runtimeValidation.requests && requestSchemaKey && body !== undefined) {
    const parsedRequest = parseWithRegistry({
      key: requestSchemaKey,
      value: body,
      description: `${description ?? operationId} request`,
      skipOnMissingSchema: true,
    });
    if (!parsedRequest.success) {
      throw parsedRequest.error;
    }
    requestBody = parsedRequest.data;
  }

  const metaValidation = validation ?? meta?.validation;
  const requestMeta: RequestOptions["meta"] = {
    ...(meta ?? {}),
    operationId,
    validation: metaValidation,
  };

  const res = await http.request({
    method,
    path,
    query,
    body: requestBody,
    querySerializer,
    signal,
    timeoutMs,
    meta: requestMeta,
  });

  if (!runtimeValidation.responses) {
    return res.data as T;
  }

  const parsedResponse = parseWithRegistry({ key: schemaKey, value: res.data, description });
  if (!parsedResponse.success) throw parsedResponse.error;
  return parsedResponse.data as T;
}

export interface RequestVoidParams {
  operationId: string;
  method: HttpMethod;
  path: string;
  query?: Query;
  body?: unknown;
  querySerializer?: RequestOptions["querySerializer"];
  signal?: RequestOptions["signal"];
  timeoutMs?: RequestOptions["timeoutMs"];
  requestSchemaKey?: SchemaKey;
  validation?: RuntimeValidationOption;
  meta?: RequestOptions["meta"];
}

export async function requestVoid(http: HttpClient, params: RequestVoidParams): Promise<void> {
  const { operationId, method, path, query, body, querySerializer, signal, timeoutMs, requestSchemaKey, validation, meta } = params;

  const runtimeValidation = mergeRuntimeValidation(http.getRuntimeValidationConfig(), validation);

  let requestBody = body;
  if (runtimeValidation.requests && requestSchemaKey && body !== undefined) {
    const parsedRequest = parseWithRegistry({
      key: requestSchemaKey,
      value: body,
      description: `${operationId} request`,
      skipOnMissingSchema: true,
    });
    if (!parsedRequest.success) {
      throw parsedRequest.error;
    }
    requestBody = parsedRequest.data;
  }

  const metaValidation = validation ?? meta?.validation;
  const requestMeta: RequestOptions["meta"] = {
    ...(meta ?? {}),
    operationId,
    validation: metaValidation,
  };

  await http.request({
    method,
    path,
    query,
    body: requestBody,
    querySerializer,
    signal,
    timeoutMs,
    meta: requestMeta,
  });
}
