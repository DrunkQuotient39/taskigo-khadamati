/**
 * Local Authentication Test Script
 * 
 * This script:
 * 1. Starts the local server
 * 2. Tests the authentication flow with a test token
 * 3. Shuts down the server when done
 * 
 * Usage:
 * node test-local-auth.js <test-token>
 */

import { spawn } from 'child_process';
import fetch from 'node-fetch';
import { setTimeout } from 'timers/promises';

// Configuration
const SERVER_PORT = 5000;
const SERVER_START_TIMEOUT = 5000; // 5 seconds to wait for server to start
const TEST_TOKEN = process.argv[2];

if (!TEST_TOKEN) {
  console.error('Error: Firebase token is required');
  console.log('Usage: node test-local-auth.js <firebase-token>');
  process.exit(1);
}

// Start the server
console.log('🚀 Starting local server...');
const server = spawn('node', ['server/index.js'], {
  stdio: 'pipe',
  env: { ...process.env, PORT: SERVER_PORT }
});

// Handle server output
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(`Server: ${output.trim()}`);
  
  // Look for server ready message
  if (output.includes('Server running') || output.includes('listening on port')) {
    runTests();
  }
});

server.stderr.on('data', (data) => {
  console.error(`Server Error: ${data.toString().trim()}`);
});

// Run tests after server starts
async function runTests() {
  try {
    // Give the server a moment to fully initialize
    await setTimeout(SERVER_START_TIMEOUT);
    
    console.log('\n🔍 Testing authentication flow...');
    
    // Test 1: Check if server is reachable
    console.log('\n📡 Testing server connectivity...');
    const healthResponse = await fetch(`http://localhost:${SERVER_PORT}/health`);
    
    if (healthResponse.ok) {
      console.log('✅ Server is reachable');
    } else {
      console.log(`❌ Server returned non-200 status: ${healthResponse.status}`);
      await cleanup(1);
      return;
    }
    
    // Test 2: Test authentication endpoint
    console.log('\n📡 Testing /api/auth/me-firebase endpoint...');
    
    const authResponse = await fetch(`http://localhost:${SERVER_PORT}/api/auth/me-firebase`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const status = authResponse.status;
    console.log(`📊 Status code: ${status}`);
    
    try {
      const data = await authResponse.json();
      
      if (status === 200) {
        console.log('✅ Authentication successful!');
        console.log('👤 User data:');
        console.log(`   - ID: ${data.id}`);
        console.log(`   - Email: ${data.email}`);
        console.log(`   - Role: ${data.role}`);
        console.log(`   - Name: ${data.firstName} ${data.lastName}`);
        console.log(`   - Request ID: ${data.requestId}`);
        
        await cleanup(0);
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
        
        await cleanup(1);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error);
      await cleanup(1);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await cleanup(1);
  }
}

// Clean up and exit
async function cleanup(exitCode = 0) {
  console.log('\n🧹 Cleaning up...');
  
  // Kill the server process
  if (server && !server.killed) {
    console.log('Shutting down server...');
    server.kill();
  }
  
  // Exit after a short delay to allow for cleanup
  await setTimeout(1000);
  process.exit(exitCode);
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted');
  await cleanup();
});

// Set a timeout in case the server never starts
setTimeout(SERVER_START_TIMEOUT * 2).then(() => {
  console.error(`❌ Server did not start within ${SERVER_START_TIMEOUT * 2}ms`);
  cleanup(1);
}); 