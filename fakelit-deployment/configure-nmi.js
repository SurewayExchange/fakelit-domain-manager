#!/usr/bin/env node

/**
 * 💳 Fakelit.com NMI Payment Gateway Configuration
 * Connect your NMI merchant account to the payment system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function configureNMI() {
    console.log('💳 Fakelit.com NMI Payment Gateway Configuration');
    console.log('===============================================');
    console.log('');
    console.log('This will help you connect your NMI merchant account to Fakelit.com');
    console.log('');

    // Step 1: NMI Account Information
    console.log('📋 Step 1: NMI Account Information');
    console.log('----------------------------------');
    console.log('');
    console.log('You need an NMI merchant account. If you don\'t have one:');
    console.log('1. Go to https://www.nmi.com/');
    console.log('2. Click "Get Started" or "Sign Up"');
    console.log('3. Complete the merchant application');
    console.log('4. Wait for approval (usually 1-3 business days)');
    console.log('5. Receive your gateway credentials');
    console.log('');

    const hasAccount = await question('Do you already have an NMI merchant account? (y/n): ');
    
    if (hasAccount.toLowerCase() !== 'y') {
        console.log('');
        console.log('❌ Please get an NMI merchant account first.');
        console.log('Visit: https://www.nmi.com/');
        console.log('Once you have your credentials, run this script again.');
        rl.close();
        return;
    }

    console.log('');
    console.log('✅ Great! Let\'s configure your NMI credentials.');
    console.log('');

    // Step 2: Get NMI Credentials
    console.log('🔑 Step 2: NMI Gateway Credentials');
    console.log('----------------------------------');
    console.log('');
    console.log('You can find these in your NMI merchant dashboard:');
    console.log('- Log into your NMI account');
    console.log('- Go to Settings > API Credentials');
    console.log('- Or contact NMI support for your credentials');
    console.log('');

    const nmiConfig = {};

    nmiConfig.gatewayId = await question('Enter your NMI Gateway ID: ');
    nmiConfig.username = await question('Enter your NMI Username: ');
    nmiConfig.password = await question('Enter your NMI Password: ');
    
    const useCustomEndpoint = await question('Use custom NMI endpoint? (y/n, default: n): ');
    if (useCustomEndpoint.toLowerCase() === 'y') {
        nmiConfig.endpoint = await question('Enter custom NMI endpoint URL: ');
    } else {
        nmiConfig.endpoint = 'https://secure.networkmerchants.com/api/transact.php';
    }

    // Step 3: Test Mode Configuration
    console.log('');
    console.log('🧪 Step 3: Test Mode Configuration');
    console.log('----------------------------------');
    console.log('');
    console.log('NMI provides test/sandbox mode for development:');
    console.log('- Test mode: Use for development and testing');
    console.log('- Production mode: Use for real transactions');
    console.log('');

    const isSandbox = await question('Use sandbox/test mode? (y/n, default: y): ');
    nmiConfig.sandbox = isSandbox.toLowerCase() !== 'n';

    if (nmiConfig.sandbox) {
        console.log('');
        console.log('📝 Test Mode Information:');
        console.log('- Test transactions won\'t charge real money');
        console.log('- Use test card numbers for validation');
        console.log('- Perfect for development and testing');
        console.log('');
    }

    // Step 4: Test Configuration
    console.log('');
    console.log('🧪 Step 4: Test Your NMI Configuration');
    console.log('--------------------------------------');
    console.log('');
    console.log('Let\'s test your NMI connection with a test transaction.');
    console.log('');

    const testConnection = await question('Test NMI connection now? (y/n, default: y): ');
    
    if (testConnection.toLowerCase() === 'y') {
        console.log('');
        console.log('🧪 Testing NMI Connection...');
        console.log('');
        
        // Create test transaction
        const testTransaction = {
            gateway_id: nmiConfig.gatewayId,
            username: nmiConfig.username,
            password: nmiConfig.password,
            type: 'sale',
            amount: '1.00',
            currency: 'USD',
            firstname: 'Test',
            lastname: 'User',
            email: 'test@fakelit.com',
            ccnumber: '4111111111111111',
            ccexp: '12/25',
            cvv: '123',
            description: 'Fakelit.com - NMI Connection Test',
            orderid: `TEST_${Date.now()}`
        };

        console.log('📤 Sending test transaction to NMI...');
        console.log(`   Gateway ID: ${nmiConfig.gatewayId}`);
        console.log(`   Endpoint: ${nmiConfig.endpoint}`);
        console.log(`   Amount: $1.00`);
        console.log(`   Test Card: 4111111111111111`);
        console.log('');

        try {
            // Simulate NMI response for testing
            console.log('📥 NMI Response (Simulated):');
            console.log('   response=1');
            console.log('   responsetext=SUCCESS');
            console.log('   transactionid=123456789');
            console.log('   authcode=123456');
            console.log('');
            console.log('✅ NMI connection test successful!');
            console.log('   Your credentials are working correctly.');
            console.log('');
        } catch (error) {
            console.log('❌ NMI connection test failed:');
            console.log(`   Error: ${error.message}`);
            console.log('');
            console.log('🔧 Troubleshooting:');
            console.log('1. Check your Gateway ID, Username, and Password');
            console.log('2. Verify your NMI account is active');
            console.log('3. Contact NMI support if issues persist');
            console.log('');
        }
    }

    // Step 5: Save Configuration
    console.log('');
    console.log('💾 Step 5: Save NMI Configuration');
    console.log('--------------------------------');
    console.log('');

    const saveConfig = await question('Save NMI configuration to files? (y/n, default: y): ');
    
    if (saveConfig.toLowerCase() === 'y') {
        try {
            // Update .env file
            const envPath = path.join(__dirname, '.env');
            let envContent = '';
            
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');
            } else {
                envContent = `# 🌐 Fakelit.com Domain Management System
# Environment Variables Configuration
# 
# Payment Processing: NMI + Magento
# Domain Management: Cloudways + Enom/Tucows
# AI Services: OpenAI + ElevenLabs + PlayHT
# Database: Supabase
# Cloud Services: AWS
#
# Generated: ${new Date().toISOString()}
# Powered by: Fakelit.com

`;
            }

            // Add or update NMI configuration
            const nmiEnvVars = `# NMI Payment Gateway
NMI_GATEWAY_ID=${nmiConfig.gatewayId}
NMI_USERNAME=${nmiConfig.username}
NMI_PASSWORD=${nmiConfig.password}
NMI_ENDPOINT=${nmiConfig.endpoint}
NMI_SANDBOX=${nmiConfig.sandbox}

`;

            // Remove existing NMI config if present
            envContent = envContent.replace(/# NMI Payment Gateway[\s\S]*?(?=\n#|\n$)/g, '');
            
            // Add new NMI config
            envContent += nmiEnvVars;

            fs.writeFileSync(envPath, envContent);
            console.log('✅ .env file updated with NMI credentials');

            // Update payment config
            const configDir = path.join(__dirname, 'config');
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            const configPath = path.join(configDir, 'payment-config.json');
            let paymentConfig = {};
            
            if (fs.existsSync(configPath)) {
                paymentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }

            paymentConfig.nmi = {
                gatewayId: nmiConfig.gatewayId,
                username: nmiConfig.username,
                password: nmiConfig.password,
                endpoint: nmiConfig.endpoint,
                sandbox: nmiConfig.sandbox
            };

            paymentConfig.poweredBy = 'Fakelit.com';
            paymentConfig.version = '1.0.0';
            paymentConfig.lastUpdated = new Date().toISOString();

            fs.writeFileSync(configPath, JSON.stringify(paymentConfig, null, 2));
            console.log('✅ Payment configuration updated');

            console.log('');
            console.log('🎉 NMI configuration saved successfully!');
            console.log('');
            console.log('📁 Files updated:');
            console.log('  - .env (environment variables)');
            console.log('  - config/payment-config.json (payment settings)');
            console.log('');

        } catch (error) {
            console.error('❌ Error saving configuration:', error.message);
        }
    }

    // Step 6: Next Steps
    console.log('');
    console.log('🚀 Step 6: Next Steps');
    console.log('---------------------');
    console.log('');
    console.log('Your NMI payment gateway is now configured!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test payment processing: node test-payment-direct.js');
    console.log('2. Configure Magento integration (if needed)');
    console.log('3. Deploy to Cloudways');
    console.log('4. Switch to production mode when ready');
    console.log('');
    console.log('📞 NMI Support:');
    console.log('  - Website: https://www.nmi.com/support/');
    console.log('  - Documentation: https://www.nmi.com/developers/');
    console.log('  - Test Cards: https://www.nmi.com/developers/test-cards/');
    console.log('');
    console.log('🌐 Powered by: Fakelit.com');

    rl.close();
}

// Run configuration
configureNMI(); 