# Request API Client – Endpoint Notes

This reference supplements the OpenAPI spec with behavioural notes, prerequisites, and known quirks discovered while integrating the Request Network API through `@request-suite/request-api-client`.

## Client IDs

### `GET /v2/client-ids`
- List all client IDs
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `POST /v2/client-ids`
- Create a new client ID
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `DELETE /v2/client-ids/{id}`
- Revoke a client ID
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v2/client-ids/{id}`
- Get a specific client ID
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `PUT /v2/client-ids/{id}`
- Update a client ID
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

## Currencies

### `GET /v1/currencies`
- Get currencies
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v1/currencies/{currencyId}/conversion-routes`
- Get conversion routes for a specific currency
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v2/currencies`
- Get currencies
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v2/currencies/{currencyId}/conversion-routes`
- Get conversion routes for a specific currency
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

## Pay

### `POST /v1/pay`
- Initiate a payment
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `POST /v2/payouts`
- Initiate a payment
- When using crypto-to-fiat payouts, ensure the target user is compliant and has approved payment details.

### `POST /v2/payouts/batch`
- Pay multiple requests in one transaction
- All requests in the batch must target the same network and respect individual request prerequisites (including compliance when applicable).

### `GET /v2/payouts/recurring/{id}`
- Get the status of a recurring payment
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `PATCH /v2/payouts/recurring/{id}`
- Update a recurring payment
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `POST /v2/payouts/recurring/{id}`
- Submit a recurring payment signature
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

## Payer

### `POST /v1/payer`
- Create compliance data for a user
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v1/payer/{clientUserId}`
- Get compliance status for a user
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `PATCH /v1/payer/{clientUserId}`
- Update agreement status
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v1/payer/{clientUserId}/payment-details`
- Get payment details for a user
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `POST /v1/payer/{clientUserId}/payment-details`
- Create payment details
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `POST /v2/payer`
- Create compliance data for a user
- Create or update compliance data for a client user. Make sure required identity fields are supplied per the schema.

### `GET /v2/payer/{clientUserId}`
- Get compliance status for a user
- Returns 404 when the client user has not been registered yet. Treat that as `not_started`.

### `PATCH /v2/payer/{clientUserId}`
- Update agreement status
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v2/payer/{clientUserId}/payment-details`
- Get payment details for a user
- Returns only payment details that were created after KYC approval. The list is empty for non-compliant users.

### `POST /v2/payer/{clientUserId}/payment-details`
- Create payment details
- Requires the payer to have completed KYC. Otherwise the upstream service currently returns HTTP 500 instead of a descriptive 4xx.
- Provide currency/rails-specific fields (e.g., account/routing numbers for USD local rails).

## Request

### `POST /v1/request`
- Create a new request
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `POST /v1/request/{paymentIntentId}/send`
- Send a payment intent
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v1/request/{paymentReference}`
- Get request status
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v1/request/{paymentReference}/pay`
- Get payment calldata
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v1/request/{paymentReference}/routes`
- Get payment routes
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `PATCH /v1/request/{paymentReference}/stop-recurrence`
- Stop a recurring request
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `POST /v2/request`
- Create a new request
- Set `isCryptoToFiatAvailable=true` only if the payee has registered payment details. Otherwise downstream payment calls will fail.

### `POST /v2/request/payment-intents/{paymentIntentId}`
- Send a payment intent
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v2/request/{requestId}`
- Get request status
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `PATCH /v2/request/{requestId}`
- Update a recurring request
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

### `GET /v2/request/{requestId}/pay`
- Get payment calldata
- Crypto-to-fiat flows require `clientUserId` and `paymentDetailsId` query params pointing to compliant users and approved payment details.

### `GET /v2/request/{requestId}/routes`
- Get payment routes
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._

## V2/Payments

### `GET /v2/payments`
- Search payments with advanced filtering
- _No additional notes yet. Add prerequisites or behaviour details here as they are discovered._
