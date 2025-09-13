#!/usr/bin/env node

/**
 * Simple Webhook Testing Script (No Jest Required)
 * 
 * This script tests your webhook endpoints by sending real HTTP requests
 * to your local development server. Much simpler than Jest configuration!
 * 
 * Usage:
 * 1. Start your dev server: npm run dev
 * 2. Run this script: node test-webhook-logic.js
 */

const crypto = require('crypto');
const http = require('http');

// Test events based on real Stripe webhook payloads
const testEvents = {
  newPurchase: {
    id: 'evt_test_new_purchase',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_new_purchase',
        mode: 'payment',
        customer: 'cus_test_123',
        customer_details: {
          email: 'test@example.com',
          name: 'Test User',
        },
        metadata: {
          mode: 'payment',
          plan: 'monthly',
          licenseId: '', // Empty = new purchase
        },
        subscription: null,
        invoice: null,
        payment_status: 'paid',
      },
    },
  },
  
  licenseRenewal: {
    id: 'evt_test_renewal',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_renewal',
        mode: 'payment',
        customer: 'cus_test_123',
        customer_details: {
          email: 'test@example.com',
          name: 'Test User',
        },
        metadata: {
          mode: 'payment',
          plan: 'yearly',
          licenseId: 'license_test_123', // Has licenseId = renewal
        },
        subscription: null,
        invoice: 'in_test_renewal',
        payment_status: 'paid',
      },
    },
  },
  
  subscriptionCreation: {
    id: 'evt_test_subscription',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_subscription',
        mode: 'subscription',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        customer_details: {
          email: 'test@example.com',
          name: 'Test User',
        },
        metadata: {
          mode: 'subscription',
          plan: 'monthly',
          licenseId: '', // New subscription
        },
        payment_status: 'paid',
      },
    },
  },
  
  subscriptionRenewal: {
    id: 'evt_test_invoice_renewal',
    type: 'invoice.paid',
    data: {
      object: {
        id: 'in_test_renewal',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        billing_reason: 'subscription_cycle',
        amount_paid: 2999,
        amount_due: 2999,
        status: 'paid',
        period_start: Math.floor(Date.now() / 1000),
        period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
      },
    },
  },
  
  oneTimeInvoice: {
    id: 'evt_test_onetime_invoice',
    type: 'invoice.paid',
    data: {
      object: {
        id: 'in_test_onetime',
        customer: 'cus_test_123',
        subscription: null, // No subscription = one-time payment
        billing_reason: 'manual',
        amount_paid: 9999,
        amount_due: 9999,
        status: 'paid',
        collection_method: 'send_invoice',
      },
    },
  },
  
  subscriptionCancellation: {
    id: 'evt_test_sub_canceled',
    type: 'customer.subscription.deleted',
    data: {
      object: {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
      },
    },
  },
  
  paymentFailure: {
    id: 'evt_test_payment_failed',
    type: 'invoice.payment_failed',
    data: {
      object: {
        id: 'in_test_failed',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        billing_reason: 'subscription_cycle',
        amount_due: 2999,
        status: 'open',
        attempt_count: 1,
      },
    },
  },
};

// Generate Stripe webhook signature
function generateStripeSignature(payload, secret, timestamp) {
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

// Send webhook request to local server
function sendWebhookRequest(payload, signature, webhookUrl = 'http://localhost:3000/api/stripe/webhook') {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Stripe-Signature': signature,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('Could not connect to localhost:3000. Make sure your dev server is running with "npm run dev"'));
      } else {
        reject(error);
      }
    });
    
    req.write(payload);
    req.end();
  });
}

// Test individual webhook
async function testWebhook(eventName, event, webhookSecret = 'whsec_1d59e1c6c486fd313816fd1f626bf4e4a7902f32a123d692b5585f33a0523cd6') {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify(event);
  const signature = generateStripeSignature(payload, webhookSecret, timestamp);
  
  console.log(`\n🧪 Testing: ${eventName}`);
  console.log(`   Event ID: ${event.id}`);
  console.log(`   Event Type: ${event.type}`);
  
  try {
    const response = await sendWebhookRequest(payload, signature);
    
    if (response.statusCode === 200) {
      console.log('   ✅ SUCCESS - Webhook processed correctly');
      try {
        const body = JSON.parse(response.body);
        console.log(`   📄 Response: ${JSON.stringify(body)}`);
      } catch {
        console.log(`   📄 Response: ${response.body}`);
      }
    } else {
      console.log(`   ❌ FAILED - Status: ${response.statusCode}`);
      console.log(`   📄 Response: ${response.body}`);
    }
  } catch (error) {
    console.log(`   💥 ERROR - ${error.message}`);
  }
}

// Test invalid signature
async function testInvalidSignature() {
  const event = testEvents.newPurchase;
  const payload = JSON.stringify(event);
  const invalidSignature = 't=123456789,v1=invalid_signature_here';
  
  console.log(`\n🧪 Testing: Invalid Signature`);
  console.log(`   Should return 400 error`);
  
  try {
    const response = await sendWebhookRequest(payload, invalidSignature);
    
    if (response.statusCode === 400) {
      console.log('   ✅ SUCCESS - Correctly rejected invalid signature');
    } else {
      console.log(`   ❌ FAILED - Expected 400, got ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   💥 ERROR - ${error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Webhook Tests');
  console.log('📡 Make sure your dev server is running: npm run dev');
  console.log('🔧 Using webhook endpoint: http://localhost:3000/api/stripe/webhook\n');
  
  const tests = [
    ['New Purchase (First-time)', testEvents.newPurchase],
    ['License Renewal (One-time)', testEvents.licenseRenewal],
    ['Subscription Creation', testEvents.subscriptionCreation],
    ['Subscription Renewal (Invoice)', testEvents.subscriptionRenewal],
    ['One-time Payment Invoice', testEvents.oneTimeInvoice],
    ['Subscription Cancellation', testEvents.subscriptionCancellation],
    ['Payment Failure', testEvents.paymentFailure],
  ];
  
  // Test valid webhooks
  for (const [testName, event] of tests) {
    await testWebhook(testName, event);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  // Test error case
  await testInvalidSignature();
  
  console.log('\n✨ All webhook tests completed!');
  console.log('\n📋 What to check:');
  console.log('   • All tests should return 200 status');
  console.log('   • Check your database for created/updated records');
  console.log('   • Check console logs for any errors');
  console.log('   • Verify email notifications are queued');
  console.log('\n🔍 Pro tip: Check your webhook handler logs for detailed processing info');
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Webhook Testing Script

Usage:
  node test-webhook-logic.js                    # Run all tests
  node test-webhook-logic.js --test <name>      # Run specific test
  node test-webhook-logic.js --list             # List available tests
  
Available tests:
  new-purchase         # Test new license purchase
  renewal             # Test license renewal
  subscription        # Test subscription creation  
  invoice-renewal     # Test subscription renewal
  onetime-invoice     # Test one-time payment invoice
  cancellation        # Test subscription cancellation
  payment-failed      # Test payment failure
  invalid-signature   # Test invalid signature handling

Examples:
  node test-webhook-logic.js --test new-purchase
  node test-webhook-logic.js --test onetime-invoice
`);
  process.exit(0);
}

if (args.includes('--list')) {
  console.log('Available webhook tests:');
  Object.keys(testEvents).forEach(key => {
    console.log(`  ${key} - ${testEvents[key].type}`);
  });
  process.exit(0);
}

const testArg = args.find(arg => arg === '--test');
if (testArg) {
  const testName = args[args.indexOf(testArg) + 1];
  const testMap = {
    'new-purchase': ['New Purchase', testEvents.newPurchase],
    'renewal': ['License Renewal', testEvents.licenseRenewal],
    'subscription': ['Subscription Creation', testEvents.subscriptionCreation],
    'invoice-renewal': ['Subscription Renewal', testEvents.subscriptionRenewal],
    'onetime-invoice': ['One-time Invoice', testEvents.oneTimeInvoice],
    'cancellation': ['Subscription Cancellation', testEvents.subscriptionCancellation],
    'payment-failed': ['Payment Failure', testEvents.paymentFailure],
    'invalid-signature': ['Invalid Signature', null],
  };
  
  if (testMap[testName]) {
    const [displayName, event] = testMap[testName];
    if (testName === 'invalid-signature') {
      testInvalidSignature().catch(console.error);
    } else {
      testWebhook(displayName, event).catch(console.error);
    }
  } else {
    console.error(`Unknown test: ${testName}`);
    console.error('Use --list to see available tests');
    process.exit(1);
  }
} else {
  // Run all tests
  runAllTests().catch(console.error);
}

module.exports = {
  testEvents,
  generateStripeSignature,
  sendWebhookRequest,
  testWebhook,
};
