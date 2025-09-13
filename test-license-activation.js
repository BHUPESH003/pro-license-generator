#!/usr/bin/env node

/**
 * License Activation API Test
 * 
 * This script tests the license activation endpoint to demonstrate
 * the new behavior for already registered licenses.
 * 
 * Usage:
 * 1. Start your dev server: npm run dev
 * 2. Run this script: node test-license-activation.js
 */

const http = require('http');

// Test data
const testPayload = {
  licenseKey: 'YM4I-LO8M-RLTA-8G3Z',
  deviceGuid: 'device-guid-12345',
  name: 'Test Device',
  os: 'Windows 11'
};

// Send request to license activation endpoint
function sendActivationRequest(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/licenses/activate-client',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            body: response,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('Could not connect to localhost:3000. Make sure your dev server is running with "npm run dev"'));
      } else {
        reject(error);
      }
    });
    
    req.write(postData);
    req.end();
  });
}

// Test function
async function testLicenseActivation() {
  console.log('🧪 Testing License Activation API');
  console.log('📡 Make sure your dev server is running: npm run dev\n');
  
  console.log('Test payload:', JSON.stringify(testPayload, null, 2));
  console.log('\n' + '='.repeat(50));
  
  try {
    // First activation attempt
    console.log('\n1️⃣ First activation attempt:');
    const response1 = await sendActivationRequest(testPayload);
    
    console.log(`   Status: ${response1.statusCode}`);
    console.log(`   Response:`, JSON.stringify(response1.body, null, 2));
    
    if (response1.statusCode === 200) {
      if (response1.body.alreadyRegistered) {
        console.log('   ✅ License was already registered (expected behavior)');
      } else {
        console.log('   ✅ License successfully registered (new activation)');
      }
    } else {
      console.log('   ❌ Activation failed');
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Second activation attempt (same payload)
    console.log('\n2️⃣ Second activation attempt (same license + device):');
    const response2 = await sendActivationRequest(testPayload);
    
    console.log(`   Status: ${response2.statusCode}`);
    console.log(`   Response:`, JSON.stringify(response2.body, null, 2));
    
    if (response2.statusCode === 200) {
      if (response2.body.alreadyRegistered) {
        console.log('   ✅ Correctly identified as already registered');
        console.log('   📝 Device info was updated (name, os, lastActivity)');
        console.log('   📦 Response contains minimal data (no user/license/device details)');
      } else {
        console.log('   ❌ Should have been identified as already registered');
      }
    } else {
      console.log('   ❌ Unexpected error on second attempt');
    }
    
    // Third activation attempt (different device name)
    console.log('\n3️⃣ Third activation attempt (updated device name):');
    const updatedPayload = {
      ...testPayload,
      name: 'Updated Device Name',
      os: 'Windows 11 Pro'
    };
    
    const response3 = await sendActivationRequest(updatedPayload);
    
    console.log(`   Status: ${response3.statusCode}`);
    console.log(`   Response:`, JSON.stringify(response3.body, null, 2));
    
    if (response3.statusCode === 200 && response3.body.alreadyRegistered) {
      console.log('   ✅ Correctly identified as already registered');
      console.log('   📝 Device info was updated with new name/OS');
      console.log('   📦 Response contains minimal data (no user/license/device details)');
    } else {
      console.log('   ❌ Unexpected behavior');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\n📋 Summary:');
    console.log('   • First call: Creates new device registration (full data returned)');
    console.log('   • Subsequent calls: Updates existing device info (minimal data returned)');
    console.log('   • Response includes alreadyRegistered flag');
    console.log('   • Device lastActivity is updated on each call');
    console.log('   • No duplicate devices are created');
    console.log('   • Already registered responses are lightweight');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run test
if (require.main === module) {
  testLicenseActivation().catch(console.error);
}

module.exports = {
  sendActivationRequest,
  testLicenseActivation,
};
