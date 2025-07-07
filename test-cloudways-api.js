#!/usr/bin/env node

/**
 * 🧪 Fakelit.com - Cloudways API Test
 * Test different authentication methods
 * Powered by: Fakelit.com
 */

const axios = require('axios');

async function testCloudwaysAPI() {
    const email = 'marquibelbrooks@gmail.com';
    const apiKey = 'D4z2jyEOEJUmU5jhTjdMiz5ZQs9eZi';
    
    console.log('🧪 Fakelit.com - Cloudways API Test');
    console.log('===================================');
    console.log('🏢 Powered by: Fakelit.com');
    console.log('');
    console.log('🔍 Testing different authentication methods...');
    console.log('');
    
    const testMethods = [
        {
            name: 'Bearer Token Method',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        },
        {
            name: 'API Key Header Method',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            }
        },
        {
            name: 'Email + API Key Method',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${email}:${apiKey}`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        }
    ];

    for (const method of testMethods) {
        console.log(`🔍 Testing: ${method.name}`);
        try {
            const response = await axios.get(
                'https://api.cloudways.com/api/v1/server',
                {
                    headers: method.headers,
                    timeout: 10000
                }
            );

            console.log(`✅ ${method.name} - SUCCESS!`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Servers found: ${response.data.servers ? response.data.servers.length : 0}`);
            
            if (response.data.servers && response.data.servers.length > 0) {
                console.log('   Server IDs:');
                response.data.servers.forEach(server => {
                    console.log(`     - ${server.label || 'Unnamed'} (${server.public_ip}) - ID: ${server.id}`);
                });
            }
            
            return method; // Found working method
            
        } catch (error) {
            console.log(`❌ ${method.name} - FAILED`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Error: ${error.response.statusText}`);
                if (error.response.data) {
                    console.log(`   Details: ${JSON.stringify(error.response.data)}`);
                }
            } else {
                console.log(`   Error: ${error.message}`);
            }
        }
        console.log('');
    }

    console.log('❌ All authentication methods failed');
    console.log('');
    console.log('🔧 Troubleshooting Tips:');
    console.log('1. Check if API key is correct and complete');
    console.log('2. Verify API key has server read permissions');
    console.log('3. Make sure API key is not expired');
    console.log('4. Try regenerating the API key in Cloudways dashboard');
    console.log('5. Check if your Cloudways account is active');
}

// Run the test
testCloudwaysAPI(); 