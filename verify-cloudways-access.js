#!/usr/bin/env node

/**
 * Verify Cloudways API Access
 * Troubleshoot authentication issues
 */

const axios = require('axios');

async function verifyCloudwaysAccess() {
    console.log('🔍 Cloudways API Access Verification');
    console.log('====================================\n');

    const apiKey = 'IRF4eMEfcZ01UNWWNTESY6E0WhT8hT';
    const email = 'marquibelbrooks@gmail.com';
    const baseUrl = 'https://api.cloudways.com/api/v1';

    console.log('📋 Current Credentials:');
    console.log(`🔑 API Key: ${apiKey}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🌐 API URL: ${baseUrl}\n`);

    // Test different authentication methods
    const authMethods = [
        {
            name: 'Bearer Token Method',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        {
            name: 'API Key Header Method',
            headers: {
                'Authorization': `API ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        },
        {
            name: 'Email + API Key Method',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'X-Email': email,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    ];

    for (const method of authMethods) {
        console.log(`🧪 Testing: ${method.name}`);
        
        try {
            const response = await axios.get(`${baseUrl}/server`, {
                headers: method.headers,
                timeout: 10000
            });

            console.log(`✅ ${method.name} - SUCCESS!`);
            console.log(`📊 Found ${response.data.servers?.length || 0} servers`);
            
            if (response.data.servers && response.data.servers.length > 0) {
                console.log('📋 Servers found:');
                response.data.servers.forEach((server, index) => {
                    console.log(`${index + 1}. ${server.label} - IP: ${server.public_ip || 'N/A'}`);
                });
            }
            
            console.log('\n🎉 Authentication successful!');
            console.log('💡 Use this method for your domain addition script');
            return method;
            
        } catch (error) {
            console.log(`❌ ${method.name} - FAILED`);
            console.log(`   Status: ${error.response?.status || 'No response'}`);
            console.log(`   Error: ${error.response?.data?.error || error.message}`);
        }
    }

    console.log('\n❌ All authentication methods failed');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Log into Cloudways: https://platform.cloudways.com/');
    console.log('2. Go to Account > API Keys');
    console.log('3. Check if the API key is active');
    console.log('4. Generate a new API key if needed');
    console.log('5. Make sure you have API access enabled');
    console.log('6. Verify your email address is correct');
    
    console.log('\n📞 If issues persist:');
    console.log('- Contact Cloudways support');
    console.log('- Check your account permissions');
    console.log('- Verify your subscription status');
}

// Run the verification
if (require.main === module) {
    verifyCloudwaysAccess();
}

module.exports = verifyCloudwaysAccess; 