import type { HttpClient } from "../../core/http/http.types";
import { requestJson, requestVoid } from "../../core/http/operation.helper";
import { buildPath } from "../../core/http/path.builder";
import type { operations } from "../../generated/openapi-types";

export type ClientIdListResponse = operations["ClientIdV2Controller_findAll_v2"]["responses"][200]["content"]["application/json"]; // array
export type ClientIdCreateBody = operations["ClientIdV2Controller_create_v2"]["requestBody"]["content"]["application/json"]; // input
export type ClientIdResponse = operations["ClientIdV2Controller_findOne_v2"]["responses"][200]["content"]["application/json"]; // single
export type ClientIdUpdateBody = operations["ClientIdV2Controller_update_v2"]["requestBody"]["content"]["application/json"]; // input

export interface ClientIdsApi {
  list(): Promise<ClientIdListResponse>;
  create(body: ClientIdCreateBody): Promise<ClientIdResponse>;
  findOne(id: string): Promise<ClientIdResponse>;
  update(id: string, body: ClientIdUpdateBody): Promise<ClientIdResponse>;
  revoke(id: string): Promise<void>;
}

export function createClientIdsApi(http: HttpClient): ClientIdsApi {
  const PATH_BASE = "/v2/client-ids" as const;
  return {
    async list() {
      const OP = "ClientIdV2Controller_findAll_v2" as const;
      return requestJson<ClientIdListResponse>(http, {
        operationId: OP,
        method: "GET",
        path: PATH_BASE,
        schemaKey: { operationId: OP, kind: "response", status: 200 },
        description: "List client IDs",
      });
    },
    async create(body) {
      const OP = "ClientIdV2Controller_create_v2" as const;
      return requestJson<ClientIdResponse>(http, {
        operationId: OP,
        method: "POST",
        path: PATH_BASE,
        body,
        requestSchemaKey: { operationId: OP, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP, kind: "response", status: 201 },
        description: "Create client ID",
      });
    },
    async findOne(id) {
      const path = buildPath(`${PATH_BASE}/{id}`, { id });
      const OP = "ClientIdV2Controller_findOne_v2" as const;
      return requestJson<ClientIdResponse>(http, {
        operationId: OP,
        method: "GET",
        path,
        schemaKey: { operationId: OP, kind: "response", status: 200 },
        description: "Get client ID",
      });
    },
    async update(id, body) {
      const path = buildPath(`${PATH_BASE}/{id}`, { id });
      const OP = "ClientIdV2Controller_update_v2" as const;
      return requestJson<ClientIdResponse>(http, {
        operationId: OP,
        method: "PUT",
        path,
        body,
        requestSchemaKey: { operationId: OP, kind: "request", variant: "application/json" },
        schemaKey: { operationId: OP, kind: "response", status: 200 },
        description: "Update client ID",
      });
    },
    async revoke(id) {
      const path = buildPath(`${PATH_BASE}/{id}`, { id });
      const OP = "ClientIdV2Controller_delete_v2" as const;
      await requestVoid(http, {
        operationId: OP,
        method: "DELETE",
        path,
      });
    },
  };
}
