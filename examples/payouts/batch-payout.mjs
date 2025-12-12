#!/usr/bin/env node

/**
 * Batch Payout Example
 *
 * This example demonstrates how to create multiple payouts in a single batch,
 * useful for payroll, vendor payments, or reward distribution.
 *
 * Prerequisites:
 * - REQUEST_API_KEY environment variable
 *
 * Run: node examples/payouts/batch-payout.mjs
 */

import { createRequestClient, isRequestApiError } from '@marcohefti/request-network-api-client';

async function main() {
  console.log('💰 Batch Payout Example\n');

  const client = createRequestClient({
    baseUrl: process.env.REQUEST_API_URL, // Optional, defaults to production
    apiKey: process.env.REQUEST_API_KEY,
  });

  if (!process.env.REQUEST_API_KEY) {
    console.error('❌ REQUEST_API_KEY is required');
    process.exit(1);
  }

  try {
    // Example payees (in production, these would come from your database)
    const payees = [
      {
        name: 'Alice (Contractor)',
        wallet: '0x1111111111111111111111111111111111111111',
        amount: '500.00',
        reason: 'November contracting work',
      },
      {
        name: 'Bob (Freelancer)',
        wallet: '0x2222222222222222222222222222222222222222',
        amount: '750.00',
        reason: 'Design services',
      },
      {
        name: 'Carol (Developer)',
        wallet: '0x3333333333333333333333333333333333333333',
        amount: '1200.00',
        reason: 'Backend development Q4',
      },
    ];

    console.log(`📋 Preparing batch payout for ${payees.length} recipients:`);
    payees.forEach((payee, index) => {
      console.log(`   ${index + 1}. ${payee.name}: $${payee.amount} USD`);
    });
    console.log();

    // Calculate total
    const total = payees.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    console.log(`💵 Total payout amount: $${total.toFixed(2)} USD\n`);

    // Create batch payout
    console.log('🚀 Creating batch payout...');
    const batch = await client.payouts.createBatch({
      requests: payees.map((payee) => ({
        payee: payee.wallet,
        amount: payee.amount,
        invoiceCurrency: 'USD',
        paymentCurrency: 'USDC-mainnet',
        reason: payee.reason,
      })),
    });

    console.log('✅ Batch payout created successfully!\n');

    console.log('📊 Batch Details:');
    console.log(`   Total requests: ${batch.requests?.length || 0}`);
    console.log(`   Batch ID: ${batch.id || 'N/A'}`);
    console.log();

    if (batch.requests && batch.requests.length > 0) {
      console.log('📝 Individual Payouts:');
      batch.requests.forEach((request, index) => {
        console.log(`   ${index + 1}. ${payees[index].name}`);
        console.log(`      Request ID: ${request.requestId || 'N/A'}`);
        console.log(`      Amount: $${payees[index].amount}`);
        console.log(`      Status: ${request.status || 'pending'}`);
      });
      console.log();
    }

    console.log('✨ Batch payout example completed!\n');

    console.log('💡 Next steps:');
    console.log('   1. Each payee will receive a payment request');
    console.log('   2. Payees can view their requests and payment details');
    console.log('   3. Execute the batch payment transaction on-chain');
    console.log('   4. Monitor individual request statuses');
    console.log();

    console.log('📌 Important notes:');
    console.log('   - All payouts in a batch must use the same payment currency');
    console.log('   - Batch sizes may be limited by network constraints');
    console.log('   - Consider gas costs when batching many small payments');
    console.log('   - Batch operations are atomic - all succeed or all fail');

  } catch (err) {
    console.error('\n❌ Error occurred:');

    if (isRequestApiError(err)) {
      console.error(`   Status: ${err.status}`);
      console.error(`   Code: ${err.code}`);
      console.error(`   Message: ${err.message}`);

      if (err.errors && err.errors.length > 0) {
        console.error('\n   Validation errors:');
        err.errors.forEach((error) => {
          console.error(`     - ${error.field}: ${error.message}`);
        });
      }

      if (err.requestId) {
        console.error(`\n   Request ID for support: ${err.requestId}`);
      }
    } else {
      console.error(`   ${err.message}`);
    }

    process.exitCode = 1;
  }
}

main();
