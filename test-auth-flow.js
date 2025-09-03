/**
 * Taskigo Authentication Flow Test Script
 * 
 * This script tests the complete authentication flow:
 * 1. Get a Firebase token (you need to provide this manually)
 * 2. Call /api/auth/me-firebase to verify the token
 * 3. Check the response for proper user data
 * 
 * Usage:
 * 1. Start the server: npm run dev
 * 2. Get a Firebase token from the browser console:
 *    - Open the app in browser
 *    - In console type: await window.auth.currentUser.getIdToken()
 *    - Copy the token
 * 3. Run this script with the token:
 *    node test-auth-flow.js <your-token>
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const FIREBASE_TOKEN = process.argv[2];

if (!FIREBASE_TOKEN) {
  console.error('Error: Firebase token is required');
  console.log('Usage: node test-auth-flow.js <firebase-token>');
  process.exit(1);
}

async function testAuthFlow() {
  console.log('🔍 Starting authentication flow test');
  console.log(`🌐 API URL: ${API_URL}`);
  console.log('🔑 Firebase token provided: Yes (first 15 chars):', FIREBASE_TOKEN.substring(0, 15) + '...');
  
  try {
    // Step 1: Test /api/auth/me-firebase endpoint
    console.log('\n📡 Testing /api/auth/me-firebase endpoint...');
    
    const response = await fetch(`${API_URL}/api/auth/me-firebase`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FIREBASE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const status = response.status;
    console.log(`📊 Status code: ${status}`);
    
    const data = await response.json();
    
    if (status === 200) {
      console.log('✅ Authentication successful!');
      console.log('👤 User data:');
      console.log(`   - ID: ${data.id}`);
      console.log(`   - Email: ${data.email}`);
      console.log(`   - Role: ${data.role}`);
      console.log(`   - Name: ${data.firstName} ${data.lastName}`);
      console.log(`   - Request ID: ${data.requestId}`);
      
      // Step 2: Test another authenticated endpoint
      console.log('\n📡 Testing another authenticated endpoint...');
      const servicesResponse = await fetch(`${API_URL}/api/services`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${FIREBASE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      const servicesStatus = servicesResponse.status;
      console.log(`📊 Status code: ${servicesStatus}`);
      
      if (servicesStatus === 200) {
        const servicesData = await servicesResponse.json();
        console.log(`✅ Services endpoint returned ${servicesData.length} services`);
      } else {
        console.log('❌ Services endpoint failed');
        try {
          const errorData = await servicesResponse.json();
          console.log('   Error:', errorData);
        } catch (e) {
          console.log('   Could not parse error response');
        }
      }
    } else {
      console.log('❌ Authentication failed');
      console.log('Error response:', data);
      
      // Additional diagnostics
      console.log('\n🔍 Diagnostic information:');
      if (status === 401) {
        console.log('   - 401 Unauthorized: The token is invalid, expired, or missing');
        console.log('   - Check that your Firebase token is valid and not expired');
        console.log('   - Verify that FIREBASE_PROJECT_ID and other Firebase env vars are correct');
      } else if (status === 429) {
        console.log('   - 429 Too Many Requests: Rate limiting is active');
        console.log('   - The server is throttling requests, wait and try again');
      } else if (status === 500) {
        console.log('   - 500 Server Error: Check server logs for details');
        console.log('   - Verify Firebase Admin SDK initialization in server logs');
      }
      
      // Test server connectivity without auth
      console.log('\n📡 Testing server connectivity (no auth)...');
      try {
        const healthResponse = await fetch(`${API_URL}/health`);
        if (healthResponse.ok) {
          console.log('✅ Server is reachable');
        } else {
          console.log('❌ Server returned non-200 status:', healthResponse.status);
        }
      } catch (e) {
        console.log('❌ Server is unreachable:', e.message);
      }
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testAuthFlow(); 