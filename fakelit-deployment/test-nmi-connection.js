/**
 * 💳 Fakelit.com NMI Connection Test
 * Test NMI payment gateway connection with actual credentials
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load NMI configuration
const configPath = path.join(__dirname, 'config', 'nmi-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const nmiConfig = config.nmi;

async function testNMIConnection() {
    console.log('💳 Fakelit.com NMI Connection Test');
    console.log('=====================================');
    console.log('');
    
    console.log('🔧 NMI Configuration:');
    console.log(`   Gateway ID: ${nmiConfig.gatewayId}`);
    console.log(`   Username: ${nmiConfig.username}`);
    console.log(`   API Key: ${nmiConfig.apiKey}`);
    console.log(`   Endpoint: ${nmiConfig.endpoint}`);
    console.log(`   Sandbox: ${nmiConfig.sandbox ? 'Yes' : 'No'}`);
    console.log(`   Brand: ${nmiConfig.brandName}`);
    console.log('');

    try {
        console.log('🧪 Testing NMI Connection...');
        
        // Create test transaction payload
        const testPayload = {
            gateway_id: nmiConfig.gatewayId,
            username: nmiConfig.username,
            password: nmiConfig.password,
            api_key: nmiConfig.apiKey,
            type: 'sale',
            amount: '1.00',
            ccnumber: '4111111111111111', // Test card
            ccexp: '1225',
            cvv: '123',
            firstname: 'Test',
            lastname: 'User',
            address1: '123 Test St',
            city: 'Test City',
            state: 'CA',
            zip: '12345',
            country: 'US',
            phone: '555-123-4567',
            email: 'test@fakelit.com',
            description: 'Fakelit.com - NMI Connection Test'
        };

        console.log('📤 Sending test transaction to NMI...');
        
        const response = await axios.post(nmiConfig.endpoint, testPayload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Fakelit.com-NMI-Test/1.0'
            },
            timeout: 30000
        });

        console.log('📥 NMI Response Received:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${response.data}`);
        
        // Parse NMI response
        const responseData = parseNMIResponse(response.data);
        
        if (responseData.success) {
            console.log('');
            console.log('✅ NMI Connection Test Successful!');
            console.log(`   Transaction ID: ${responseData.transaction_id}`);
            console.log(`   Response Code: ${responseData.response_code}`);
            console.log(`   Response Text: ${responseData.response_text}`);
            console.log('');
            console.log('🎉 Your NMI credentials are working correctly!');
            console.log('💳 Fakelit.com payment processing is ready.');
            console.log('🌐 Deploy to: https://fakelit.com');
            console.log('☁️ Cloudways: https://your-app.cloudwaysapps.com');
        } else {
            console.log('');
            console.log('❌ NMI Connection Test Failed:');
            console.log(`   Error: ${responseData.response_text}`);
            console.log(`   Code: ${responseData.response_code}`);
            console.log('');
            console.log('🔧 Troubleshooting:');
            console.log('1. Verify your NMI credentials are correct');
            console.log('2. Check if your NMI account is active');
            console.log('3. Ensure you have proper permissions');
            console.log('4. Contact NMI support if issues persist');
        }

    } catch (error) {
        console.log('');
        console.log('❌ NMI Connection Test Failed:');
        console.log(`   Error: ${error.message}`);
        
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Response: ${error.response.data}`);
        }
        
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check your internet connection');
        console.log('2. Verify NMI endpoint is accessible');
        console.log('3. Check firewall settings');
        console.log('4. Contact NMI support for assistance');
    }
}

function parseNMIResponse(responseText) {
    const lines = responseText.split('\n');
    const result = {};
    
    lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            result[key.trim()] = value.trim();
        }
    });
    
    result.success = result.response === '1';
    return result;
}

// Run the test
testNMIConnection().catch(console.error); 