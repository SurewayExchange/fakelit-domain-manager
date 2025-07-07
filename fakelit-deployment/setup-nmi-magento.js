#!/usr/bin/env node

/**
 * 🔧 Fakelit.com NMI + Magento Setup Script
 * Interactive configuration for payment processing
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

async function setupNMIMagento() {
    console.log('🌐 Fakelit.com NMI + Magento Configuration');
    console.log('==========================================');
    console.log('');
    console.log('This script will help you configure NMI payment gateway and Magento integration.');
    console.log('');

    // NMI Configuration
    console.log('💳 NMI Payment Gateway Configuration');
    console.log('------------------------------------');
    
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
    
    const isSandbox = await question('Use sandbox/test mode? (y/n, default: y): ');
    nmiConfig.sandbox = isSandbox.toLowerCase() !== 'n';
    
    console.log('');
    
    // Magento Configuration
    console.log('🛒 Magento E-commerce Configuration');
    console.log('----------------------------------');
    
    const magentoConfig = {};
    
    magentoConfig.baseUrl = await question('Enter your Magento store URL (e.g., https://your-store.com): ');
    magentoConfig.consumerKey = await question('Enter Magento Consumer Key: ');
    magentoConfig.consumerSecret = await question('Enter Magento Consumer Secret: ');
    magentoConfig.accessToken = await question('Enter Magento Access Token: ');
    magentoConfig.accessTokenSecret = await question('Enter Magento Access Token Secret: ');
    
    console.log('');
    
    // Additional Configuration
    console.log('🔧 Additional Configuration');
    console.log('---------------------------');
    
    const additionalConfig = {};
    
    additionalConfig.corsOrigin = await question('CORS Origin (default: https://fakelit.com): ') || 'https://fakelit.com';
    additionalConfig.logLevel = await question('Log Level (default: info): ') || 'info';
    
    console.log('');
    
    // Review Configuration
    console.log('📋 Configuration Review');
    console.log('=======================');
    console.log('');
    console.log('NMI Configuration:');
    console.log(`  Gateway ID: ${nmiConfig.gatewayId}`);
    console.log(`  Username: ${nmiConfig.username}`);
    console.log(`  Password: ${'*'.repeat(nmiConfig.password.length)}`);
    console.log(`  Endpoint: ${nmiConfig.endpoint}`);
    console.log(`  Sandbox Mode: ${nmiConfig.sandbox ? 'Yes' : 'No'}`);
    console.log('');
    console.log('Magento Configuration:');
    console.log(`  Base URL: ${magentoConfig.baseUrl}`);
    console.log(`  Consumer Key: ${magentoConfig.consumerKey}`);
    console.log(`  Consumer Secret: ${'*'.repeat(magentoConfig.consumerSecret.length)}`);
    console.log(`  Access Token: ${magentoConfig.accessToken}`);
    console.log(`  Access Token Secret: ${'*'.repeat(magentoConfig.accessTokenSecret.length)}`);
    console.log('');
    console.log('Additional Configuration:');
    console.log(`  CORS Origin: ${additionalConfig.corsOrigin}`);
    console.log(`  Log Level: ${additionalConfig.logLevel}`);
    console.log('');
    
    const confirm = await question('Save this configuration? (y/n): ');
    
    if (confirm.toLowerCase() !== 'y') {
        console.log('Configuration cancelled.');
        rl.close();
        return;
    }
    
    // Save Configuration
    try {
        // Create .env file
        const envContent = `# 🌐 Fakelit.com Domain Management System
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

# Core Application
PORT=3000
NODE_ENV=production
JWT_SECRET=${generateSecret()}
SESSION_SECRET=${generateSecret()}

# NMI Payment Gateway
NMI_GATEWAY_ID=${nmiConfig.gatewayId}
NMI_USERNAME=${nmiConfig.username}
NMI_PASSWORD=${nmiConfig.password}
NMI_ENDPOINT=${nmiConfig.endpoint}
NMI_SANDBOX=${nmiConfig.sandbox}

# Magento E-commerce
MAGENTO_BASE_URL=${magentoConfig.baseUrl}
MAGENTO_CONSUMER_KEY=${magentoConfig.consumerKey}
MAGENTO_CONSUMER_SECRET=${magentoConfig.consumerSecret}
MAGENTO_ACCESS_TOKEN=${magentoConfig.accessToken}
MAGENTO_ACCESS_TOKEN_SECRET=${magentoConfig.accessTokenSecret}

# Database & Authentication
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
PLAYHT_API_KEY=your_playht_api_key
PLAYHT_USER_ID=your_playht_user_id

# Domain Management
CLOUDWAYS_EMAIL=your_cloudways_email
CLOUDWAYS_API_KEY=your_cloudways_api_key
ENOM_USERNAME=your_enom_username
ENOM_PASSWORD=your_enom_password
ENOM_URL=https://reseller.enom.com/interface.asp

# Cloud Services
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Additional Configuration
CORS_ORIGIN=${additionalConfig.corsOrigin}
LOG_LEVEL=${additionalConfig.logLevel}
MAX_FILE_SIZE=10485760
SESSION_TIMEOUT=3600000
`;

        const envPath = path.join(__dirname, '.env');
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created successfully!');
        
        // Create payment config
        const paymentConfig = {
            nmi: {
                gatewayId: nmiConfig.gatewayId,
                username: nmiConfig.username,
                password: nmiConfig.password,
                endpoint: nmiConfig.endpoint,
                sandbox: nmiConfig.sandbox
            },
            magento: {
                baseUrl: magentoConfig.baseUrl,
                consumerKey: magentoConfig.consumerKey,
                consumerSecret: magentoConfig.consumerSecret,
                accessToken: magentoConfig.accessToken,
                accessTokenSecret: magentoConfig.accessTokenSecret,
                apiVersion: 'V1'
            },
            poweredBy: 'Fakelit.com',
            version: '1.0.0',
            lastUpdated: new Date().toISOString()
        };
        
        const configDir = path.join(__dirname, 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        const configPath = path.join(configDir, 'payment-config.json');
        fs.writeFileSync(configPath, JSON.stringify(paymentConfig, null, 2));
        console.log('✅ Payment configuration file created successfully!');
        
        // Create deployment checklist
        const checklist = `# 🚀 Fakelit.com Deployment Checklist

## ✅ Configuration Complete
- [x] NMI payment gateway configured
- [x] Magento e-commerce integration configured
- [x] Environment variables set
- [x] Payment configuration saved

## 🔧 Next Steps

### 1. Cloudways Deployment
- [ ] Upload all files to Cloudways application
- [ ] Set environment variables in Cloudways dashboard
- [ ] Install dependencies: \`npm install\`
- [ ] Start application: \`npm start\`

### 2. NMI Gateway Testing
- [ ] Test with sandbox credentials first
- [ ] Verify payment processing
- [ ] Check transaction responses
- [ ] Switch to production credentials

### 3. Magento Integration Testing
- [ ] Verify Magento store connectivity
- [ ] Test order creation
- [ ] Check customer management
- [ ] Validate product configuration

### 4. Domain Management Setup
- [ ] Configure Cloudways credentials
- [ ] Set up Enom/Tucows integration
- [ ] Test domain registration
- [ ] Verify DNS management

### 5. Final Testing
- [ ] Test complete payment flow
- [ ] Verify service activation
- [ ] Check customer notifications
- [ ] Monitor system performance

## 📞 Support
- **Fakelit.com Support**: support@fakelit.com
- **NMI Support**: https://www.nmi.com/support/
- **Magento Support**: https://devdocs.magento.com/

🌐 Powered by: Fakelit.com
💳 Payment Gateway: NMI + Magento
🏢 Domain Management: Cloudways + Enom/Tucows
`;

        const checklistPath = path.join(__dirname, 'DEPLOYMENT_CHECKLIST.md');
        fs.writeFileSync(checklistPath, checklist);
        console.log('✅ Deployment checklist created successfully!');
        
        console.log('');
        console.log('🎉 Configuration completed successfully!');
        console.log('');
        console.log('📁 Files created:');
        console.log('  - .env (environment variables)');
        console.log('  - config/payment-config.json (payment settings)');
        console.log('  - DEPLOYMENT_CHECKLIST.md (deployment guide)');
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('1. Update remaining environment variables (Supabase, AI services, etc.)');
        console.log('2. Deploy to Cloudways');
        console.log('3. Test payment processing');
        console.log('4. Monitor system performance');
        console.log('');
        console.log('🌐 Powered by: Fakelit.com');
        
    } catch (error) {
        console.error('❌ Error saving configuration:', error.message);
    }
    
    rl.close();
}

function generateSecret() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Run setup
setupNMIMagento(); 