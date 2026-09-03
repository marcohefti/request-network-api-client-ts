export {
  createOperationsApi,
  type OperationArguments,
  type OperationInput,
  type OperationResponse,
  type OperationsApi,
} from "./operations.facade";
export { operationDefinitions, type OperationId } from "../../generated/openapi-operations";

// The all-operation facade can execute any domain, so its subpath must register
// the complete generated schema catalog even when consumers do not import the
// root client or an individual domain barrel first.
import "../../validation/generated/openapi.schemas.generated";
