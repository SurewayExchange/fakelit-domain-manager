#!/usr/bin/env node

/**
 * 🔧 Fakelit.com Environment Variables Setup
 * Configure NMI + Magento payment processing for domain management services
 */

const fs = require('fs');
const path = require('path');

// NMI Payment Gateway Configuration
const nmiConfig = {
    NMI_GATEWAY_ID: 'your_nmi_gateway_id',
    NMI_USERNAME: 'your_nmi_username', 
    NMI_PASSWORD: 'your_nmi_password',
    NMI_ENDPOINT: 'https://secure.networkmerchants.com/api/transact.php'
};

// Magento E-commerce Configuration
const magentoConfig = {
    MAGENTO_BASE_URL: 'https://your-magento-store.com',
    MAGENTO_CONSUMER_KEY: 'your_magento_consumer_key',
    MAGENTO_CONSUMER_SECRET: 'your_magento_consumer_secret',
    MAGENTO_ACCESS_TOKEN: 'your_magento_access_token',
    MAGENTO_ACCESS_TOKEN_SECRET: 'your_magento_access_token_secret'
};

// Core Application Configuration
const coreConfig = {
    PORT: '3000',
    NODE_ENV: 'production',
    JWT_SECRET: 'your_jwt_secret_key_here',
    SESSION_SECRET: 'your_session_secret_here'
};

// Supabase Configuration (for user management)
const supabaseConfig = {
    SUPABASE_URL: 'your_supabase_url',
    SUPABASE_ANON_KEY: 'your_supabase_anon_key',
    SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key'
};

// AI Services Configuration
const aiConfig = {
    OPENAI_API_KEY: 'your_openai_api_key',
    ELEVENLABS_API_KEY: 'your_elevenlabs_api_key',
    PLAYHT_API_KEY: 'your_playht_api_key',
    PLAYHT_USER_ID: 'your_playht_user_id'
};

// Cloudways Configuration
const cloudwaysConfig = {
    CLOUDWAYS_EMAIL: 'your_cloudways_email',
    CLOUDWAYS_API_KEY: 'your_cloudways_api_key'
};

// Enom/Tucows Configuration
const enomConfig = {
    ENOM_USERNAME: 'your_enom_username',
    ENOM_PASSWORD: 'your_enom_password',
    ENOM_URL: 'https://reseller.enom.com/interface.asp'
};

// AWS Configuration (for voice processing)
const awsConfig = {
    AWS_ACCESS_KEY_ID: 'your_aws_access_key',
    AWS_SECRET_ACCESS_KEY: 'your_aws_secret_key',
    AWS_REGION: 'us-east-1'
};

// Combine all configurations
const envVariables = {
    // Core Application
    ...coreConfig,
    
    // Payment Processing (NMI + Magento)
    ...nmiConfig,
    ...magentoConfig,
    
    // Database & Authentication
    ...supabaseConfig,
    
    // AI Services
    ...aiConfig,
    
    // Domain Management
    ...cloudwaysConfig,
    ...enomConfig,
    
    // Cloud Services
    ...awsConfig
};

// Generate .env file content
const envContent = Object.entries(envVariables)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

// Add header comment
const fullEnvContent = `# 🌐 Fakelit.com Domain Management System
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

${envContent}

# Additional Configuration
CORS_ORIGIN=https://fakelit.com
LOG_LEVEL=info
MAX_FILE_SIZE=10485760
SESSION_TIMEOUT=3600000
`;

// Write to .env file
const envPath = path.join(__dirname, 'fakelit-deployment', '.env');

try {
    fs.writeFileSync(envPath, fullEnvContent);
    console.log('✅ Environment variables file created successfully!');
    console.log(`📁 Location: ${envPath}`);
    console.log('');
    console.log('🔧 Next Steps:');
    console.log('1. Update the .env file with your actual credentials');
    console.log('2. Configure NMI payment gateway settings');
    console.log('3. Set up Magento e-commerce integration');
    console.log('4. Configure Cloudways and Enom/Tucows credentials');
    console.log('5. Set up AI service API keys');
    console.log('');
    console.log('🌐 Powered by: Fakelit.com');
} catch (error) {
    console.error('❌ Error creating environment variables file:', error.message);
}

// Create configuration guide
const configGuide = `# 🔧 Fakelit.com Configuration Guide

## Payment Processing Setup (NMI + Magento)

### NMI Payment Gateway
1. **Gateway ID**: Your NMI merchant account gateway ID
2. **Username**: NMI account username
3. **Password**: NMI account password
4. **Endpoint**: NMI API endpoint (default: https://secure.networkmerchants.com/api/transact.php)

### Magento E-commerce
1. **Base URL**: Your Magento store URL
2. **Consumer Key**: Magento REST API consumer key
3. **Consumer Secret**: Magento REST API consumer secret
4. **Access Token**: Magento REST API access token
5. **Access Token Secret**: Magento REST API access token secret

## Domain Management Setup

### Cloudways
1. **Email**: Your Cloudways account email
2. **API Key**: Cloudways API key from dashboard

### Enom/Tucows
1. **Username**: Your Enom reseller username
2. **Password**: Your Enom reseller password
3. **URL**: Enom API endpoint

## AI Services Setup

### OpenAI
- **API Key**: Your OpenAI API key for chatbot functionality

### Voice Services
- **ElevenLabs**: API key for AI voice generation
- **PlayHT**: API key and user ID for voice synthesis

## Database Setup (Supabase)
1. **URL**: Your Supabase project URL
2. **Anon Key**: Supabase anonymous key
3. **Service Role Key**: Supabase service role key

## Security Configuration
1. **JWT Secret**: Strong secret for JWT token signing
2. **Session Secret**: Secret for session management
3. **CORS Origin**: Allowed origins for CORS

## Deployment Notes
- Set NODE_ENV=production for production deployment
- Configure proper CORS origins for your domain
- Ensure all API keys are kept secure
- Test payment processing in sandbox mode first

🌐 Powered by: Fakelit.com
`;

const guidePath = path.join(__dirname, 'fakelit-deployment', 'CONFIGURATION_GUIDE.md');

try {
    fs.writeFileSync(guidePath, configGuide);
    console.log('✅ Configuration guide created successfully!');
    console.log(`📁 Location: ${guidePath}`);
} catch (error) {
    console.error('❌ Error creating configuration guide:', error.message);
}

// Create quick setup script
const quickSetupScript = `#!/bin/bash
# 🚀 Fakelit.com Quick Setup Script
# Automated environment configuration for NMI + Magento payment processing

echo "🌐 Fakelit.com Domain Management System Setup"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run setup-env-variables.js first."
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for required environment variables
echo "🔍 Checking environment configuration..."

required_vars=(
    "NMI_GATEWAY_ID"
    "NMI_USERNAME" 
    "NMI_PASSWORD"
    "MAGENTO_BASE_URL"
    "MAGENTO_CONSUMER_KEY"
    "MAGENTO_ACCESS_TOKEN"
    "CLOUDWAYS_EMAIL"
    "CLOUDWAYS_API_KEY"
    "ENOM_USERNAME"
    "ENOM_PASSWORD"
)

missing_vars=()

for var in "\${required_vars[@]}"; do
    if ! grep -q "^$var=" .env; then
        missing_vars+=("$var")
    fi
done

if [ \${#missing_vars[@]} -gt 0 ]; then
    echo "⚠️  Missing required environment variables:"
    for var in "\${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please update your .env file with the required values."
    echo "See CONFIGURATION_GUIDE.md for detailed instructions."
    exit 1
fi

echo "✅ All required environment variables are configured"
echo ""

# Test configuration
echo "🧪 Testing configuration..."
node -e "
const dotenv = require('dotenv');
dotenv.config();

const required = [
    'NMI_GATEWAY_ID', 'NMI_USERNAME', 'NMI_PASSWORD',
    'MAGENTO_BASE_URL', 'MAGENTO_CONSUMER_KEY', 'MAGENTO_ACCESS_TOKEN',
    'CLOUDWAYS_EMAIL', 'CLOUDWAYS_API_KEY', 'ENOM_USERNAME', 'ENOM_PASSWORD'
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    process.exit(1);
}

console.log('✅ Configuration test passed');
console.log('🌐 Payment Gateway: NMI + Magento');
console.log('🏢 Domain Management: Cloudways + Enom/Tucows');
console.log('🤖 AI Services: OpenAI + Voice Integration');
console.log('💾 Database: Supabase');
console.log('');
console.log('🚀 Ready to start Fakelit.com Domain Management System');
console.log('🌐 Powered by: Fakelit.com');
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "🚀 To start the application:"
    echo "   npm start"
    echo ""
    echo "🔧 To run in development mode:"
    echo "   npm run dev"
    echo ""
    echo "📊 Health check:"
    echo "   http://localhost:3000/health"
    echo ""
    echo "💳 Payment processing: NMI + Magento"
    echo "🌐 Domain management: Cloudways + Enom/Tucows"
    echo "🤖 AI chatbot: OpenAI integration"
    echo ""
    echo "🌐 Powered by: Fakelit.com"
else
    echo "❌ Configuration test failed"
    exit 1
fi
`;

const scriptPath = path.join(__dirname, 'fakelit-deployment', 'setup.sh');

try {
    fs.writeFileSync(scriptPath, quickSetupScript);
    // Make script executable
    fs.chmodSync(scriptPath, '755');
    console.log('✅ Quick setup script created successfully!');
    console.log(`📁 Location: ${scriptPath}`);
    console.log('');
    console.log('🚀 To run quick setup:');
    console.log('   cd fakelit-deployment && ./setup.sh');
} catch (error) {
    console.error('❌ Error creating setup script:', error.message);
}

console.log('');
console.log('🎉 Environment setup completed!');
console.log('');
console.log('📋 Summary:');
console.log('✅ .env file created with NMI + Magento configuration');
console.log('✅ Configuration guide created');
console.log('✅ Quick setup script created');
console.log('');
console.log('🔧 Next Steps:');
console.log('1. Update .env file with your actual credentials');
console.log('2. Run: cd fakelit-deployment && ./setup.sh');
console.log('3. Start the application: npm start');
console.log('');
console.log('🌐 Powered by: Fakelit.com'); 