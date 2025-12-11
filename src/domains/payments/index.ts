export {
  createPaymentsApi,
  type PaymentsApi,
  type PaymentSearchOptions,
  type PaymentSearchResult,
  type PaymentSearchQuery,
  type PaymentRecord,
  type PaymentSearchPagination,
} from "./payments.facade";

import "../../validation/generated/groups/v2/payments.schemas.generated";
