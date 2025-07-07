/**
 * 🔧 Fakelit.com NMI Troubleshooting Script
 * Diagnose and fix NMI authentication issues
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load NMI configuration
const configPath = path.join(__dirname, 'config', 'nmi-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const nmiConfig = config.nmi;

async function troubleshootNMI() {
    console.log('🔧 Fakelit.com NMI Troubleshooting');
    console.log('===================================');
    console.log('');
    
    console.log('📋 Current Configuration:');
    console.log(`   Gateway ID: ${nmiConfig.gatewayId}`);
    console.log(`   Username: ${nmiConfig.username}`);
    console.log(`   Endpoint: ${nmiConfig.endpoint}`);
    console.log(`   Sandbox: ${nmiConfig.sandbox ? 'Yes' : 'No'}`);
    console.log('');

    // Test 1: Check if credentials are in correct format
    console.log('🧪 Test 1: Credential Format Check');
    console.log('   Gateway ID length:', nmiConfig.gatewayId.length);
    console.log('   Username length:', nmiConfig.username.length);
    console.log('   Password length:', nmiConfig.password.length);
    console.log('');

    // Test 2: Try sandbox endpoint
    console.log('🧪 Test 2: Sandbox Endpoint Test');
    const sandboxEndpoint = 'https://secure.networkmerchants.com/api/transact.php';
    
    try {
        const sandboxPayload = {
            gateway_id: nmiConfig.gatewayId,
            username: nmiConfig.username,
            password: nmiConfig.password,
            type: 'sale',
            amount: '1.00',
            ccnumber: '4111111111111111',
            ccexp: '1225',
            cvv: '123',
            firstname: 'Test',
            lastname: 'User',
            description: 'Fakelit.com - Sandbox Test'
        };

        console.log('📤 Testing sandbox endpoint...');
        const response = await axios.post(sandboxEndpoint, sandboxPayload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Fakelit.com-NMI-Test/1.0'
            },
            timeout: 30000
        });

        console.log('📥 Sandbox Response:', response.data);
        console.log('');

    } catch (error) {
        console.log('❌ Sandbox test failed:', error.message);
        console.log('');
    }

    // Test 3: Try different authentication methods
    console.log('🧪 Test 3: Alternative Authentication Methods');
    
    const testMethods = [
        {
            name: 'Standard Method',
            payload: {
                gateway_id: nmiConfig.gatewayId,
                username: nmiConfig.username,
                password: nmiConfig.password,
                type: 'sale',
                amount: '1.00',
                ccnumber: '4111111111111111',
                ccexp: '1225',
                cvv: '123',
                description: 'Fakelit.com - Standard Test'
            }
        },
        {
            name: 'Username Only',
            payload: {
                gateway_id: nmiConfig.gatewayId,
                username: nmiConfig.username,
                type: 'sale',
                amount: '1.00',
                ccnumber: '4111111111111111',
                ccexp: '1225',
                cvv: '123',
                description: 'Fakelit.com - Username Only Test'
            }
        }
    ];

    for (const method of testMethods) {
        try {
            console.log(`📤 Testing: ${method.name}`);
            const response = await axios.post(nmiConfig.endpoint, method.payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Fakelit.com-NMI-Test/1.0'
                },
                timeout: 30000
            });

            console.log(`📥 ${method.name} Response:`, response.data);
            console.log('');

        } catch (error) {
            console.log(`❌ ${method.name} failed:`, error.message);
            console.log('');
        }
    }

    // Provide troubleshooting recommendations
    console.log('🔧 Troubleshooting Recommendations:');
    console.log('');
    console.log('1. **Verify NMI Account Status**:');
    console.log('   - Log into your NMI merchant dashboard');
    console.log('   - Check if your account is active and approved');
    console.log('   - Verify your account has API access enabled');
    console.log('');
    
    console.log('2. **Check Credential Format**:');
    console.log('   - Gateway ID should be numeric (e.g., 17449)');
    console.log('   - Username should match your NMI login');
    console.log('   - Password should be your NMI account password');
    console.log('');
    
    console.log('3. **Contact NMI Support**:');
    console.log('   - Call NMI support: 1-866-509-7199');
    console.log('   - Email: support@nmi.com');
    console.log('   - Provide your merchant account details');
    console.log('');
    
    console.log('4. **Alternative Setup**:');
    console.log('   - Consider using NMI\'s sandbox/test environment first');
    console.log('   - Request API credentials from NMI support');
    console.log('   - Verify IP whitelist if required');
    console.log('');
    
    console.log('💳 Payment Gateway: NMI + Magento');
    console.log('🏢 Powered by: Fakelit.com');
}

// Run troubleshooting
troubleshootNMI().catch(console.error); 