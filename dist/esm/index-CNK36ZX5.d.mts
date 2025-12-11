import { o as operations, b as HttpClient } from './openapi-types-CtUFCrk4.mjs';

type ClientIdListResponse = operations["ClientIdV2Controller_findAll_v2"]["responses"][200]["content"]["application/json"];
type ClientIdCreateBody = operations["ClientIdV2Controller_create_v2"]["requestBody"]["content"]["application/json"];
type ClientIdResponse = operations["ClientIdV2Controller_findOne_v2"]["responses"][200]["content"]["application/json"];
type ClientIdUpdateBody = operations["ClientIdV2Controller_update_v2"]["requestBody"]["content"]["application/json"];
interface ClientIdsApi {
    list(): Promise<ClientIdListResponse>;
    create(body: ClientIdCreateBody): Promise<ClientIdResponse>;
    findOne(id: string): Promise<ClientIdResponse>;
    update(id: string, body: ClientIdUpdateBody): Promise<ClientIdResponse>;
    revoke(id: string): Promise<void>;
}
declare function createClientIdsApi(http: HttpClient): ClientIdsApi;

type index_ClientIdCreateBody = ClientIdCreateBody;
type index_ClientIdListResponse = ClientIdListResponse;
type index_ClientIdResponse = ClientIdResponse;
type index_ClientIdUpdateBody = ClientIdUpdateBody;
type index_ClientIdsApi = ClientIdsApi;
declare const index_createClientIdsApi: typeof createClientIdsApi;
declare namespace index {
  export { type index_ClientIdCreateBody as ClientIdCreateBody, type index_ClientIdListResponse as ClientIdListResponse, type index_ClientIdResponse as ClientIdResponse, type index_ClientIdUpdateBody as ClientIdUpdateBody, type index_ClientIdsApi as ClientIdsApi, index_createClientIdsApi as createClientIdsApi };
}

export { type ClientIdsApi as C, type ClientIdResponse as a, type ClientIdListResponse as b, createClientIdsApi as c, type ClientIdCreateBody as d, type ClientIdUpdateBody as e, index as i };
