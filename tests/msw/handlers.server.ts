import { clientIdHandlers } from "./domains/client-ids.handlers";
import { currenciesHandlers } from "./domains/currencies.handlers";
import { miscHandlers } from "./domains/misc.handlers";
import { payHandlers } from "./domains/pay.handlers";
import { payerHandlers } from "./domains/payer.handlers";
import { paymentsHandlers } from "./domains/payments.handlers";
import { payoutsHandlers } from "./domains/payouts.handlers";
import { requestsHandlers } from "./domains/requests.handlers";

export const handlers = [
  ...currenciesHandlers,
  ...requestsHandlers,
  ...payHandlers,
  ...payerHandlers,
  ...paymentsHandlers,
  ...payoutsHandlers,
  ...clientIdHandlers,
  ...miscHandlers,
];
