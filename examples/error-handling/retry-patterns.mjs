#!/usr/bin/env node

/**
 * Error Handling and Retry Patterns Example
 *
 * This example demonstrates:
 * - Handling different types of errors
 * - Custom retry policies
 * - Graceful error recovery
 * - Using error metadata for debugging
 *
 * Run: node examples/error-handling/retry-patterns.mjs
 */

import { createRequestClient, RequestEnvironment, isRequestApiError } from '@marcohefti/request-network-api-client';

async function main() {
  console.log('🔧 Error Handling Examples\n');

  const client = createRequestClient({
    baseUrl: process.env.REQUEST_API_URL || RequestEnvironment.production,
    apiKey: process.env.REQUEST_API_KEY,
  });

  // Example 1: Basic error handling
  console.log('1️⃣  Basic Error Handling');
  console.log('─────────────────────────');
  try {
    await client.currencies.list({ network: 'sepolia' });
    console.log('✅ Successfully fetched currencies\n');
  } catch (err) {
    if (isRequestApiError(err)) {
      console.error('❌ API Error:');
      console.error(`   Status: ${err.status}`);
      console.error(`   Code: ${err.code}`);
      console.error(`   Message: ${err.message}`);
      console.error(`   Request ID: ${err.requestId || 'N/A'}\n`);
    } else {
      console.error('❌ Unexpected error:', err.message, '\n');
    }
  }

  // Example 2: Handling specific error codes
  console.log('2️⃣  Handling Specific Error Codes');
  console.log('─────────────────────────────────');
  try {
    // This will fail if API key is invalid
    await client.clientIds.list();
    console.log('✅ Successfully fetched client IDs\n');
  } catch (err) {
    if (isRequestApiError(err)) {
      switch (err.code) {
        case 'UNAUTHORIZED':
        case 'HTTP_401':
          console.error('❌ Authentication failed');
          console.error('   Your API key is invalid or expired');
          console.error('   Please check REQUEST_API_KEY environment variable\n');
          break;

        case 'FORBIDDEN':
        case 'HTTP_403':
          console.error('❌ Permission denied');
          console.error('   Your API key doesn\'t have permission for this operation\n');
          break;

        case 'RATE_LIMITED':
        case 'HTTP_429':
          console.error('❌ Rate limited');
          console.error(`   Retry after: ${err.retryAfterMs || 'unknown'} ms`);
          console.error('   The client will automatically retry with backoff\n');
          break;

        case 'NOT_FOUND':
        case 'HTTP_404':
          console.error('❌ Resource not found\n');
          break;

        default:
          console.error(`❌ Error (${err.code}): ${err.message}\n`);
      }
    }
  }

  // Example 3: Custom retry policy
  console.log('3️⃣  Custom Retry Policy');
  console.log('──────────────────────');
  try {
    const currencies = await client.currencies.list(
      { network: 'sepolia' },
      {
        meta: {
          retry: {
            maxAttempts: 5,       // Retry up to 5 times
            baseDelayMs: 1000,    // Start with 1 second delay
            maxDelayMs: 30000,    // Cap at 30 seconds
          },
        },
      }
    );
    console.log(`✅ Fetched ${currencies.length} currencies with custom retry policy\n`);
  } catch (err) {
    if (isRequestApiError(err)) {
      console.error(`❌ Failed after retries: ${err.message}\n`);
    }
  }

  // Example 4: Timeout handling
  console.log('4️⃣  Timeout Handling');
  console.log('───────────────────');
  try {
    const currencies = await client.currencies.list(
      { network: 'sepolia' },
      {
        timeoutMs: 5000, // 5 second timeout
      }
    );
    console.log(`✅ Fetched ${currencies.length} currencies within timeout\n`);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('❌ Request timed out after 5 seconds\n');
    } else if (isRequestApiError(err)) {
      console.error(`❌ API error: ${err.message}\n`);
    }
  }

  // Example 5: Validation error handling
  console.log('5️⃣  Validation Error Handling');
  console.log('────────────────────────────');
  try {
    // Intentionally invalid request (missing required fields)
    await client.requests.create({
      amount: 'invalid',
      invoiceCurrency: '',
      paymentCurrency: '',
    });
  } catch (err) {
    if (isRequestApiError(err)) {
      console.error('❌ Validation failed:');
      if (err.errors && err.errors.length > 0) {
        err.errors.forEach((error) => {
          console.error(`   - ${error.field || 'unknown'}: ${error.message}`);
        });
      } else {
        console.error(`   ${err.message}`);
      }
      console.log();
    }
  }

  // Example 6: Structured logging with toJSON()
  console.log('6️⃣  Structured Error Logging');
  console.log('───────────────────────────');
  try {
    await client.requests.getRequestStatus('invalid-request-id');
  } catch (err) {
    if (isRequestApiError(err)) {
      console.error('❌ Error details (JSON):');
      console.error(JSON.stringify(err.toJSON(), null, 2));
      console.log();
    }
  }

  // Example 7: Graceful degradation
  console.log('7️⃣  Graceful Degradation');
  console.log('───────────────────────');
  let currencies = [];
  try {
    currencies = await client.currencies.list({ network: 'sepolia' });
    console.log(`✅ Fetched ${currencies.length} currencies from API`);
  } catch (err) {
    console.warn('⚠️  Failed to fetch currencies, using fallback');
    // Fallback to hardcoded list
    currencies = [
      { symbol: 'USDC', network: 'sepolia', address: '0x...' },
      { symbol: 'ETH', network: 'sepolia', address: '0x...' },
    ];
    console.log(`   Using ${currencies.length} fallback currencies`);
  }
  console.log();

  // Example 8: AbortController for cancellation
  console.log('8️⃣  Request Cancellation with AbortController');
  console.log('─────────────────────────────────────────────');
  const controller = new AbortController();

  // Cancel after 100ms
  setTimeout(() => {
    console.log('   Cancelling request...');
    controller.abort();
  }, 100);

  try {
    await client.currencies.list(
      { network: 'sepolia' },
      { signal: controller.signal }
    );
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('❌ Request was cancelled by user\n');
    }
  }

  console.log('✨ Error handling examples completed!\n');

  console.log('💡 Best Practices:');
  console.log('   1. Always check if error is RequestApiError with isRequestApiError()');
  console.log('   2. Use err.requestId for debugging and support tickets');
  console.log('   3. Handle rate limiting (429) by respecting err.retryAfterMs');
  console.log('   4. Log errors with err.toJSON() for structured logging');
  console.log('   5. Implement fallbacks for critical functionality');
  console.log('   6. Use AbortController for user-initiated cancellations');
  console.log('   7. Set appropriate timeouts for your use case');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
