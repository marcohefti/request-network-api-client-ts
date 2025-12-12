#!/usr/bin/env node

/**
 * Complete Invoice Flow Example
 *
 * This example demonstrates the complete flow of creating a payment request,
 * retrieving payment routes, getting payment calldata, and checking status.
 *
 * Prerequisites:
 * - REQUEST_API_KEY environment variable
 * - REQUEST_PAYEE_WALLET (your wallet address to receive payment)
 * - REQUEST_PAYER_WALLET (wallet that will pay the request)
 *
 * Run: node examples/invoice-flow/create-and-pay.mjs
 */

import { createRequestClient, isRequestApiError } from '@marcohefti/request-network-api-client';

async function main() {
  // 1. Create the client
  console.log('📦 Initializing Request Network client...\n');

  const client = createRequestClient({
    baseUrl: process.env.REQUEST_API_URL, // Optional, defaults to production
    apiKey: process.env.REQUEST_API_KEY,
  });

  if (!process.env.REQUEST_API_KEY) {
    console.error('❌ REQUEST_API_KEY is required');
    process.exit(1);
  }

  if (!process.env.REQUEST_PAYEE_WALLET || !process.env.REQUEST_PAYER_WALLET) {
    console.error('❌ REQUEST_PAYEE_WALLET and REQUEST_PAYER_WALLET are required');
    process.exit(1);
  }

  try {
    // 2. Create a payment request
    console.log('📝 Creating payment request...');
    const request = await client.requests.create({
      amount: '12.50',
      invoiceCurrency: 'USD',
      paymentCurrency: 'USDC-sepolia',
      payee: process.env.REQUEST_PAYEE_WALLET,
      payer: process.env.REQUEST_PAYER_WALLET,
      reason: 'Example Invoice #12345',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    });

    console.log('✅ Request created successfully!');
    console.log(`   Request ID: ${request.requestId}`);
    console.log(`   Payment Reference: ${request.paymentReference}\n`);

    // 3. Get payment routes
    console.log('🔍 Fetching available payment routes...');
    const routes = await client.requests.getPaymentRoutes(request.requestId, {
      wallet: process.env.REQUEST_PAYER_WALLET,
    });

    console.log(`✅ Found ${routes.routes.length} payment route(s):`);
    routes.routes.forEach((route, index) => {
      console.log(`   ${index + 1}. Chain: ${route.chain}`);
      console.log(`      Estimated Gas: ${route.estimatedGas || 'N/A'}`);
    });
    console.log();

    // 4. Get payment calldata
    if (routes.routes.length > 0) {
      console.log('📋 Fetching payment calldata for first route...');
      const payment = await client.requests.getPaymentCalldata(request.requestId, {
        chain: routes.routes[0].chain,
      });

      if (payment.kind === 'calldata') {
        console.log('✅ Payment calldata retrieved:');
        console.log(`   Type: Direct transaction calldata`);
        console.log(`   Transactions: ${payment.transactions.length}`);
        payment.transactions.forEach((tx, index) => {
          console.log(`   Transaction ${index + 1}:`);
          console.log(`     To: ${tx.to}`);
          console.log(`     Value: ${tx.value}`);
          console.log(`     Data length: ${tx.data?.length || 0} bytes`);
        });
      } else if (payment.kind === 'paymentIntent') {
        console.log('✅ Payment intent created:');
        console.log(`   Type: Payment intent (requires signature)`);
        console.log(`   Payment Intent ID: ${payment.paymentIntentId}`);
        console.log(`   Note: User must sign this intent before submission`);
      }
      console.log();
    }

    // 5. Check request status
    console.log('📊 Checking request status...');
    const status = await client.requests.getRequestStatus(request.requestId);

    console.log(`✅ Request status: ${status.kind}`);
    if (status.kind === 'pending') {
      console.log('   Status: Awaiting payment');
    } else if (status.kind === 'paid') {
      console.log(`   Status: Paid!`);
      console.log(`   Transaction: ${status.txHash}`);
    }
    console.log();

    // 6. Summary
    console.log('📊 Summary:');
    console.log(`   Request ID: ${request.requestId}`);
    console.log(`   Amount: 12.50 USD`);
    console.log(`   Payment Currency: USDC-sepolia`);
    console.log(`   Status: ${status.kind}`);
    console.log(`   Available Routes: ${routes.routes.length}`);
    console.log();

    console.log('✨ Example completed successfully!');
    console.log();
    console.log('💡 Next steps:');
    console.log('   1. Use the payment calldata with a wallet provider (e.g., MetaMask)');
    console.log('   2. Execute the transaction on the Sepolia testnet');
    console.log('   3. Check the request status again to see it marked as "paid"');

  } catch (err) {
    console.error('\n❌ Error occurred:');

    if (isRequestApiError(err)) {
      console.error(`   Status: ${err.status}`);
      console.error(`   Code: ${err.code}`);
      console.error(`   Message: ${err.message}`);
      if (err.requestId) {
        console.error(`   Request ID: ${err.requestId}`);
      }
      if (err.errors && err.errors.length > 0) {
        console.error('   Validation errors:');
        err.errors.forEach((error) => {
          console.error(`     - ${error.field}: ${error.message}`);
        });
      }
    } else {
      console.error(`   ${err.message}`);
    }

    process.exitCode = 1;
  }
}

main();
