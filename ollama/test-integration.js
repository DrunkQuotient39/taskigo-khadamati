#!/usr/bin/env node

/**
 * Test Script for Ollama Integration with Taskego
 * This script tests the Ollama API directly to ensure it's working
 */

const http = require('http');

// Configuration
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const TEST_MODEL = process.env.OLLAMA_MODEL || 'llama2:7b';

console.log('🧪 Testing Ollama Integration with Taskego');
console.log('==========================================');
console.log(`Ollama URL: ${OLLAMA_URL}`);
console.log(`Test Model: ${TEST_MODEL}`);
console.log('');

// Test 1: Check if Ollama is running
async function testConnection() {
    console.log('1️⃣ Testing Ollama connection...');
    
    try {
        const response = await makeRequest('/api/tags', 'GET');
        if (response) {
            console.log('✅ Ollama is running and responding');
            console.log('📋 Available models:', response.models?.map(m => m.name).join(', ') || 'None');
        } else {
            console.log('❌ Ollama is not responding');
            return false;
        }
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        return false;
    }
    
    return true;
}

// Test 2: Test basic text generation
async function testTextGeneration() {
    console.log('\n2️⃣ Testing text generation...');
    
    const testPrompt = "Hello, can you help me find cleaning services on Taskego?";
    console.log(`📝 Test prompt: "${testPrompt}"`);
    
    try {
        const response = await makeRequest('/api/generate', 'POST', {
            model: TEST_MODEL,
            prompt: testPrompt,
            stream: false
        });
        
        if (response && response.response) {
            console.log('✅ Text generation working');
            console.log('📝 Response preview:', response.response.substring(0, 100) + '...');
        } else {
            console.log('❌ Text generation failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Text generation error:', error.message);
        return false;
    }
    
    return true;
}

// Test 3: Test Taskego-specific prompt
async function testTaskegoPrompt() {
    console.log('\n3️⃣ Testing Taskego-specific prompt...');
    
    const taskegoPrompt = `You are Taskego's AI assistant. You can ONLY help with:
- Website navigation and features
- Service recommendations and comparisons  
- Booking assistance and guidance
- Basic customer support questions
- Service pricing and availability

User question: "What is the weather like today?"

Remember: You can ONLY answer Taskego-related questions.`;
    
    console.log('📝 Testing with Taskego system prompt...');
    
    try {
        const response = await makeRequest('/api/generate', 'POST', {
            model: TEST_MODEL,
            prompt: taskegoPrompt,
            stream: false
        });
        
        if (response && response.response) {
            console.log('✅ Taskego prompt working');
            const responseText = response.response.toLowerCase();
            
            // Check if response follows Taskego restrictions
            if (responseText.includes('taskego') || 
                responseText.includes('website') || 
                responseText.includes('service') ||
                responseText.includes('cannot') ||
                responseText.includes('only')) {
                console.log('✅ Response follows Taskego restrictions');
            } else {
                console.log('⚠️  Response may not follow Taskego restrictions');
            }
            
            console.log('📝 Response preview:', response.response.substring(0, 150) + '...');
        } else {
            console.log('❌ Taskego prompt failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Taskego prompt error:', error.message);
        return false;
    }
    
    return true;
}

// Test 4: Performance test
async function testPerformance() {
    console.log('\n4️⃣ Testing performance...');
    
    const startTime = Date.now();
    
    try {
        const response = await makeRequest('/api/generate', 'POST', {
            model: TEST_MODEL,
            prompt: "Hello, how can I book a service on Taskego?",
            stream: false
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        if (response && response.response) {
            console.log(`✅ Response time: ${responseTime}ms`);
            
            if (responseTime < 5000) {
                console.log('✅ Performance: Good (< 5 seconds)');
            } else if (responseTime < 10000) {
                console.log('⚠️  Performance: Acceptable (5-10 seconds)');
            } else {
                console.log('❌ Performance: Slow (> 10 seconds)');
            }
        } else {
            console.log('❌ Performance test failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Performance test error:', error.message);
        return false;
    }
    
    return true;
}

// Helper function to make HTTP requests
function makeRequest(path, method, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, OLLAMA_URL);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const response = JSON.parse(body);
                        resolve(response);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Main test function
async function runTests() {
    console.log('🚀 Starting Ollama integration tests...\n');
    
    const tests = [
        { name: 'Connection Test', fn: testConnection },
        { name: 'Text Generation Test', fn: testTextGeneration },
        { name: 'Taskego Prompt Test', fn: testTaskegoPrompt },
        { name: 'Performance Test', fn: testPerformance }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) passed++;
        } catch (error) {
            console.log(`❌ ${test.name} failed with error:`, error.message);
        }
    }
    
    console.log('\n📊 Test Results');
    console.log('===============');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n🎉 All tests passed! Ollama is ready for Taskego integration.');
        console.log('\n💡 Next steps:');
        console.log('   1. Set OLLAMA_BASE_URL in your .env file');
        console.log('   2. Start your Taskego backend');
        console.log('   3. Test the chat interface');
    } else {
        console.log('\n⚠️  Some tests failed. Check Ollama configuration and try again.');
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Ensure Ollama is running: docker-compose up -d');
        console.log('   2. Check if models are loaded: ollama list');
        console.log('   3. Verify port 11434 is accessible');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, testConnection, testTextGeneration, testTaskegoPrompt, testPerformance };
