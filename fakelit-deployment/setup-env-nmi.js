/**
 * 🌐 Fakelit.com Environment Setup for NMI
 * Configure environment variables for NMI payment processing
 */

const fs = require('fs');
const path = require('path');

// NMI Configuration (from user input)
const nmiConfig = {
    NMI_GATEWAY_ID: '17449',
    NMI_USERNAME: 'BrooksM1874',
    NMI_PASSWORD: 'chgM110171b$',
    NMI_API_KEY: '104.175.148.157',
    NMI_ENDPOINT: 'https://secure.networkmerchants.com/api/transact.php',
    NMI_SANDBOX: 'false'
};

// Complete environment configuration
const envContent = `# 🌐 Fakelit.com Environment Configuration
# Domain Management & Payment Processing

# Server Configuration
PORT=80
NODE_ENV=production
APP_NAME=Fakelit.com Domain Manager
DOMAIN=fakelit.com
CLOUDWAYS_DOMAIN=your-app.cloudwaysapps.com

# Database Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
PLAYHT_API_KEY=your_playht_api_key
HEYGEN_API_KEY=your_heygen_api_key

# Avatar Services
READY_PLAYER_ME_API_KEY=your_ready_player_me_api_key
D_ID_API_KEY=your_d_id_api_key

# Domain Management
CLOUDWAYS_API_KEY=your_cloudways_api_key
CLOUDWAYS_EMAIL=your_cloudways_email
ENOM_USERNAME=your_enom_username
ENOM_PASSWORD=your_enom_password

# Payment Processing: NMI + Magento
NMI_GATEWAY_ID=${nmiConfig.NMI_GATEWAY_ID}
NMI_USERNAME=${nmiConfig.NMI_USERNAME}
NMI_PASSWORD=${nmiConfig.NMI_PASSWORD}
NMI_API_KEY=${nmiConfig.NMI_API_KEY}
NMI_ENDPOINT=${nmiConfig.NMI_ENDPOINT}
NMI_SANDBOX=${nmiConfig.NMI_SANDBOX}

# Magento Configuration
MAGENTO_BASE_URL=https://fakelit.com
MAGENTO_CONSUMER_KEY=your_magento_consumer_key
MAGENTO_CONSUMER_SECRET=your_magento_consumer_secret
MAGENTO_ACCESS_TOKEN=your_magento_access_token
MAGENTO_ACCESS_TOKEN_SECRET=your_magento_access_token_secret

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# Logging
LOG_LEVEL=info
ENABLE_DEBUG_LOGGING=false

# Branding
BRAND_NAME=Fakelit.com
POWERED_BY=Fakelit.com
`;

function setupEnvironment() {
    console.log('🌐 Fakelit.com Environment Setup');
    console.log('================================');
    console.log('');
    
    console.log('💳 NMI Configuration:');
    console.log(`   Gateway ID: ${nmiConfig.NMI_GATEWAY_ID}`);
    console.log(`   Username: ${nmiConfig.NMI_USERNAME}`);
    console.log(`   API Key: ${nmiConfig.NMI_API_KEY}`);
    console.log(`   Endpoint: ${nmiConfig.NMI_ENDPOINT}`);
    console.log(`   Sandbox: ${nmiConfig.NMI_SANDBOX}`);
    console.log('');

    try {
        // Create .env file
        const envPath = path.join(__dirname, '.env');
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ Environment file created successfully!');
        console.log(`📁 Location: ${envPath}`);
        console.log('');
        
        console.log('🔧 Next Steps:');
        console.log('1. Review the .env file and update other credentials as needed');
        console.log('2. Run: node test-nmi-connection.js (to test NMI connection)');
        console.log('3. Run: npm start (to start the server)');
        console.log('');
        
        console.log('💳 Payment Gateway: NMI + Magento');
        console.log('🏢 Powered by: Fakelit.com');
        
    } catch (error) {
        console.error('❌ Error creating environment file:', error.message);
        console.log('');
        console.log('🔧 Manual Setup:');
        console.log('1. Create a .env file in the fakelit-deployment directory');
        console.log('2. Copy the environment content above into the file');
        console.log('3. Update other credentials as needed');
    }
}

// Run setup
setupEnvironment(); 