export {
  createClientIdsApi,
  type ClientIdsApi,
  type ClientIdListResponse,
  type ClientIdCreateBody,
  type ClientIdResponse,
  type ClientIdUpdateBody,
} from "./client-ids.facade";
// Register only client-ids schemas at import time
import "../../validation/generated/groups/client-ids.schemas.generated";

