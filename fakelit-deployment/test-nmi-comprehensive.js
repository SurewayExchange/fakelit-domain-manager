/**
 * 💳 Fakelit.com Comprehensive NMI Test
 * Test multiple authentication methods with API key
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load NMI configuration
const configPath = path.join(__dirname, 'config', 'nmi-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const nmiConfig = config.nmi;

async function testNMIAuthentication() {
    console.log('💳 Fakelit.com Comprehensive NMI Test');
    console.log('======================================');
    console.log('');
    
    console.log('🔧 NMI Configuration:');
    console.log(`   Gateway ID: ${nmiConfig.gatewayId}`);
    console.log(`   Username: ${nmiConfig.username}`);
    console.log(`   API Key: ${nmiConfig.apiKey}`);
    console.log(`   Endpoint: ${nmiConfig.endpoint}`);
    console.log('');

    const testMethods = [
        {
            name: 'Method 1: Standard with API Key',
            payload: {
                gateway_id: nmiConfig.gatewayId,
                username: nmiConfig.username,
                password: nmiConfig.password,
                api_key: nmiConfig.apiKey,
                type: 'sale',
                amount: '1.00',
                ccnumber: '4111111111111111',
                ccexp: '1225',
                cvv: '123',
                description: 'Fakelit.com - Test 1'
            }
        },
        {
            name: 'Method 2: API Key as Username',
            payload: {
                gateway_id: nmiConfig.gatewayId,
                username: nmiConfig.apiKey,
                password: nmiConfig.password,
                type: 'sale',
                amount: '1.00',
                ccnumber: '4111111111111111',
                ccexp: '1225',
                cvv: '123',
                description: 'Fakelit.com - Test 2'
            }
        },
        {
            name: 'Method 3: API Key as Password',
            payload: {
                gateway_id: nmiConfig.gatewayId,
                username: nmiConfig.username,
                password: nmiConfig.apiKey,
                type: 'sale',
                amount: '1.00',
                ccnumber: '4111111111111111',
                ccexp: '1225',
                cvv: '123',
                description: 'Fakelit.com - Test 3'
            }
        },
        {
            name: 'Method 4: API Key Only',
            payload: {
                gateway_id: nmiConfig.gatewayId,
                api_key: nmiConfig.apiKey,
                type: 'sale',
                amount: '1.00',
                ccnumber: '4111111111111111',
                ccexp: '1225',
                cvv: '123',
                description: 'Fakelit.com - Test 4'
            }
        },
        {
            name: 'Method 5: IP-based Authentication',
            payload: {
                gateway_id: nmiConfig.gatewayId,
                username: nmiConfig.username,
                password: nmiConfig.password,
                type: 'sale',
                amount: '1.00',
                ccnumber: '4111111111111111',
                ccexp: '1225',
                cvv: '123',
                description: 'Fakelit.com - Test 5'
            },
            headers: {
                'X-Forwarded-For': nmiConfig.apiKey,
                'X-Real-IP': nmiConfig.apiKey
            }
        },
        {
            name: 'Method 6: Token-based Authentication',
            payload: {
                gateway_id: nmiConfig.gatewayId,
                username: nmiConfig.username,
                password: nmiConfig.password,
                token: nmiConfig.apiKey,
                type: 'sale',
                amount: '1.00',
                ccnumber: '4111111111111111',
                ccexp: '1225',
                cvv: '123',
                description: 'Fakelit.com - Test 6'
            }
        }
    ];

    for (let i = 0; i < testMethods.length; i++) {
        const method = testMethods[i];
        console.log(`🧪 Test ${i + 1}: ${method.name}`);
        
        try {
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Fakelit.com-NMI-Test/1.0'
            };

            // Add custom headers if specified
            if (method.headers) {
                Object.assign(headers, method.headers);
            }

            const response = await axios.post(nmiConfig.endpoint, method.payload, {
                headers: headers,
                timeout: 30000
            });

            console.log(`📥 Response: ${response.data}`);
            
            // Parse response
            const responseData = parseNMIResponse(response.data);
            
            if (responseData.success) {
                console.log('✅ SUCCESS! This method works!');
                console.log(`   Transaction ID: ${responseData.transaction_id}`);
                console.log(`   Response Code: ${responseData.response_code}`);
                console.log('');
                console.log('🎉 Found working authentication method!');
                console.log('💳 Fakelit.com payment processing is ready.');
                console.log('🌐 Deploy to: https://fakelit.com');
                console.log('☁️ Cloudways: https://your-app.cloudwaysapps.com');
                return method;
            } else {
                console.log(`❌ Failed: ${responseData.response_text}`);
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log('');
    }

    console.log('🔧 All authentication methods failed.');
    console.log('');
    console.log('📞 Next Steps:');
    console.log('1. Contact NMI support: 1-866-509-7199');
    console.log('2. Provide your merchant account details');
    console.log('3. Request proper API authentication method');
    console.log('4. Verify account status and permissions');
    console.log('');
    console.log('💳 Payment Gateway: NMI + Magento');
    console.log('🏢 Powered by: Fakelit.com');
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

// Run comprehensive test
testNMIAuthentication().catch(console.error); 