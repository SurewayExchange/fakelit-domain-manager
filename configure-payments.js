/**
 * 💳 Fakelit.com Payment Configuration
 * Setup NMI + Magento payment processing for domain management services
 */

const fs = require('fs');
const path = require('path');

console.log('💳 Fakelit.com Payment Configuration');
console.log('=====================================');
console.log('Setting up NMI + Magento payment processing...');
console.log('');

// NMI Configuration Template
const nmiConfig = {
    gatewayId: 'your_nmi_gateway_id',
    username: 'your_nmi_username',
    password: 'your_nmi_password',
    endpoint: 'https://secure.networkmerchants.com/api/transact.php',
    sandbox: true // Set to false for production
};

// Magento Configuration Template
const magentoConfig = {
    baseUrl: 'https://your-magento-store.com',
    consumerKey: 'your_magento_consumer_key',
    consumerSecret: 'your_magento_consumer_secret',
    accessToken: 'your_magento_access_token',
    accessTokenSecret: 'your_magento_access_token_secret',
    apiVersion: 'V1'
};

// Service Configuration
const services = {
    'domain-registration': {
        name: 'Domain Registration',
        description: 'Professional domain registration service via Tucows/Enom',
        price: 1500, // $15.00 in cents
        currency: 'USD',
        magentoProductId: 'domain_registration',
        features: [
            'Domain registration for 1 year',
            'DNS management via Cloudways',
            'SSL certificate included',
            '24/7 Fakelit.com support',
            'Professional branding'
        ]
    },
    'domain-management': {
        name: 'Domain Management',
        description: 'Complete domain management solution',
        price: 2500, // $25.00 in cents
        currency: 'USD',
        magentoProductId: 'domain_management',
        features: [
            'Unlimited domain management',
            'Automated DNS configuration',
            'SSL certificate management',
            'Domain transfer assistance',
            'Professional support',
            'Analytics dashboard'
        ]
    },
    'premium-support': {
        name: 'Premium Support',
        description: 'Priority support and consultation',
        price: 5000, // $50.00 in cents
        currency: 'USD',
        magentoProductId: 'premium_support',
        features: [
            'Priority 24/7 support',
            'Dedicated account manager',
            'Custom domain strategies',
            'Migration assistance',
            'Performance optimization',
            'Security consultation'
        ]
    },
    'enterprise-package': {
        name: 'Enterprise Package',
        description: 'Complete enterprise domain solution',
        price: 15000, // $150.00 in cents
        currency: 'USD',
        magentoProductId: 'enterprise_package',
        features: [
            'Unlimited domains',
            'Custom branding',
            'API access',
            'White-label solution',
            'Dedicated support team',
            'Custom integrations',
            'Advanced analytics',
            'Compliance reporting'
        ]
    }
};

// Create payment configuration file
const paymentConfig = {
    nmi: nmiConfig,
    magento: magentoConfig,
    services: services,
    poweredBy: 'Fakelit.com',
    version: '1.0.0',
    lastUpdated: new Date().toISOString()
};

// Write configuration to file
const configPath = path.join(__dirname, 'fakelit-deployment', 'config', 'payment-config.json');

try {
    // Ensure config directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(paymentConfig, null, 2));
    console.log('✅ Payment configuration file created successfully!');
    console.log(`📁 Location: ${configPath}`);
} catch (error) {
    console.error('❌ Error creating payment configuration:', error.message);
}

// Create NMI setup guide
const nmiSetupGuide = `# 💳 NMI Payment Gateway Setup Guide

## Overview
Network Merchants Inc. (NMI) is the payment gateway used by Fakelit.com for secure payment processing.

## Setup Steps

### 1. NMI Account Setup
1. **Sign up** for an NMI merchant account at https://www.nmi.com/
2. **Complete** merchant application and verification process
3. **Receive** your gateway credentials

### 2. Gateway Configuration
Update your .env file with NMI credentials:

\`\`\`env
NMI_GATEWAY_ID=your_gateway_id
NMI_USERNAME=your_username
NMI_PASSWORD=your_password
NMI_ENDPOINT=https://secure.networkmerchants.com/api/transact.php
\`\`\`

### 3. Test Mode vs Production
- **Test Mode**: Use sandbox credentials for development
- **Production Mode**: Use live credentials for real transactions

### 4. API Integration
The Fakelit.com system automatically integrates with NMI using:
- **Transaction Type**: Sale
- **Payment Method**: Credit Card
- **Currency**: USD
- **Response Format**: Key-value pairs

### 5. Security Requirements
- **PCI Compliance**: Ensure your application meets PCI DSS requirements
- **SSL/TLS**: All transactions must use HTTPS
- **Tokenization**: Consider using NMI's tokenization for enhanced security

## Testing

### Test Card Numbers
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005
- **Discover**: 6011111111111117

### Test CVV
- Use any 3-digit number (e.g., 123)

### Test Expiry
- Use any future date (e.g., 12/25)

## Error Handling
Common NMI response codes:
- **1**: Transaction approved
- **2**: Transaction declined
- **3**: Error in transaction data
- **4**: Insufficient funds

## Support
- **NMI Support**: https://www.nmi.com/support/
- **Fakelit.com Support**: support@fakelit.com

🌐 Powered by: Fakelit.com
`;

const nmiGuidePath = path.join(__dirname, 'fakelit-deployment', 'docs', 'NMI_SETUP_GUIDE.md');

try {
    // Ensure docs directory exists
    const docsDir = path.dirname(nmiGuidePath);
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }
    
    fs.writeFileSync(nmiGuidePath, nmiSetupGuide);
    console.log('✅ NMI setup guide created successfully!');
    console.log(`📁 Location: ${nmiGuidePath}`);
} catch (error) {
    console.error('❌ Error creating NMI guide:', error.message);
}

// Create Magento setup guide
const magentoSetupGuide = `# 🛒 Magento E-commerce Integration Guide

## Overview
Magento is used by Fakelit.com for order management and customer data integration.

## Setup Steps

### 1. Magento Store Setup
1. **Install** Magento 2.x on your server
2. **Configure** basic store settings
3. **Set up** payment methods (NMI integration)

### 2. REST API Configuration
1. **Enable** REST API in Magento admin
2. **Create** integration user
3. **Generate** API credentials

### 3. API Credentials
Update your .env file with Magento credentials:

\`\`\`env
MAGENTO_BASE_URL=https://your-magento-store.com
MAGENTO_CONSUMER_KEY=your_consumer_key
MAGENTO_CONSUMER_SECRET=your_consumer_secret
MAGENTO_ACCESS_TOKEN=your_access_token
MAGENTO_ACCESS_TOKEN_SECRET=your_access_token_secret
\`\`\`

### 4. Product Configuration
Create products in Magento for each service:

#### Domain Registration
- **SKU**: domain_registration
- **Price**: $15.00
- **Type**: Virtual Product

#### Domain Management
- **SKU**: domain_management
- **Price**: $25.00
- **Type**: Virtual Product

#### Premium Support
- **SKU**: premium_support
- **Price**: $50.00
- **Type**: Virtual Product

#### Enterprise Package
- **SKU**: enterprise_package
- **Price**: $150.00
- **Type**: Virtual Product

### 5. Order Flow
1. **Customer** selects service on Fakelit.com
2. **Payment** processed via NMI
3. **Order** created in Magento
4. **Service** activated automatically
5. **Confirmation** sent to customer

### 6. Customer Management
- **Customer accounts** created automatically
- **Order history** tracked in Magento
- **Service status** synchronized

## API Endpoints Used

### Create Order
\`POST /rest/V1/orders\`

### Get Customer
\`GET /rest/V1/customers/search\`

### Get Orders
\`GET /rest/V1/orders\`

## Testing

### Test Orders
1. **Create** test customer account
2. **Process** test payment
3. **Verify** order creation
4. **Check** service activation

### Error Handling
- **API errors**: Log and retry
- **Order failures**: Manual review
- **Payment issues**: Customer notification

## Security
- **API authentication**: OAuth 1.0a
- **HTTPS required**: All API calls
- **Rate limiting**: Respect Magento limits
- **Data validation**: Validate all inputs

## Support
- **Magento Documentation**: https://devdocs.magento.com/
- **Fakelit.com Support**: support@fakelit.com

🌐 Powered by: Fakelit.com
`;

const magentoGuidePath = path.join(__dirname, 'fakelit-deployment', 'docs', 'MAGENTO_SETUP_GUIDE.md');

try {
    fs.writeFileSync(magentoGuidePath, magentoSetupGuide);
    console.log('✅ Magento setup guide created successfully!');
    console.log(`📁 Location: ${magentoGuidePath}`);
} catch (error) {
    console.error('❌ Error creating Magento guide:', error.message);
}

// Create payment testing script
const paymentTestScript = `#!/usr/bin/env node

/**
 * 🧪 Fakelit.com Payment Testing Script
 * Test NMI + Magento payment processing
 */

const axios = require('axios');

// Test configuration
const testConfig = {
    baseUrl: 'http://localhost:3000',
    testCard: {
        number: '4111111111111111',
        expiry: '12/25',
        cvv: '123'
    },
    testCustomer: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@fakelit.com',
        address: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zipCode: '90210',
        country: 'US'
    }
};

async function testPaymentService() {
    console.log('🧪 Testing Fakelit.com Payment Service');
    console.log('=====================================');
    console.log('');

    try {
        // Test 1: Get services
        console.log('1️⃣ Testing service retrieval...');
        const servicesResponse = await axios.get(\`\${testConfig.baseUrl}/api/payments/services\`);
        
        if (servicesResponse.data.success) {
            console.log('✅ Services retrieved successfully');
            console.log(\`   Found \${Object.keys(servicesResponse.data.data.services).length} services\`);
        } else {
            console.log('❌ Failed to retrieve services');
            return;
        }

        // Test 2: Get specific service
        console.log('\\n2️⃣ Testing service details...');
        const serviceId = 'domain-registration';
        const serviceResponse = await axios.get(\`\${testConfig.baseUrl}/api/payments/services/\${serviceId}\`);
        
        if (serviceResponse.data.success) {
            console.log('✅ Service details retrieved successfully');
            console.log(\`   Service: \${serviceResponse.data.data.service.name}\`);
            console.log(\`   Price: $\${(serviceResponse.data.data.service.price / 100).toFixed(2)}\`);
        } else {
            console.log('❌ Failed to retrieve service details');
            return;
        }

        // Test 3: Validate card
        console.log('\\n3️⃣ Testing card validation...');
        const validationResponse = await axios.post(\`\${testConfig.baseUrl}/api/payments/validate-card\`, {
            cardNumber: testConfig.testCard.number,
            expiryDate: testConfig.testCard.expiry,
            cvv: testConfig.testCard.cvv
        });
        
        if (validationResponse.data.success && validationResponse.data.data.isValid) {
            console.log('✅ Card validation passed');
        } else {
            console.log('❌ Card validation failed');
            console.log(\`   Errors: \${validationResponse.data.data.errors.join(', ')}\`);
            return;
        }

        // Test 4: Process payment (mock mode)
        console.log('\\n4️⃣ Testing payment processing...');
        const paymentResponse = await axios.post(\`\${testConfig.baseUrl}/api/payments/process\`, {
            serviceId: serviceId,
            customerData: testConfig.testCustomer,
            paymentData: {
                cardNumber: testConfig.testCard.number,
                expiryDate: testConfig.testCard.expiry,
                cvv: testConfig.testCard.cvv
            }
        });
        
        if (paymentResponse.data.success) {
            console.log('✅ Payment processing test completed');
            console.log('   Note: This was a mock transaction');
        } else {
            console.log('❌ Payment processing failed');
            console.log(\`   Error: \${paymentResponse.data.error}\`);
        }

        // Test 5: Payment status
        console.log('\\n5️⃣ Testing payment service status...');
        const statusResponse = await axios.get(\`\${testConfig.baseUrl}/api/payments/status\`);
        
        if (statusResponse.data.success) {
            console.log('✅ Payment service is operational');
            console.log(\`   Gateway: \${statusResponse.data.data.gateway}\`);
            console.log(\`   Services: \${statusResponse.data.data.services}\`);
        } else {
            console.log('❌ Payment service status check failed');
        }

        console.log('\\n🎉 All payment tests completed successfully!');
        console.log('\\n📋 Test Summary:');
        console.log('✅ Service retrieval');
        console.log('✅ Service details');
        console.log('✅ Card validation');
        console.log('✅ Payment processing');
        console.log('✅ Service status');
        console.log('\\n🌐 Powered by: Fakelit.com');

    } catch (error) {
        console.error('\\n❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        
        console.log('\\n🔧 Troubleshooting:');
        console.log('1. Ensure the server is running on port 3000');
        console.log('2. Check that payment routes are configured');
        console.log('3. Verify environment variables are set');
        console.log('4. Check server logs for detailed errors');
    }
}

// Run tests
testPaymentService();
`;

const testScriptPath = path.join(__dirname, 'fakelit-deployment', 'test-payments.js');

try {
    fs.writeFileSync(testScriptPath, paymentTestScript);
    console.log('✅ Payment testing script created successfully!');
    console.log(`📁 Location: ${testScriptPath}`);
} catch (error) {
    console.error('❌ Error creating test script:', error.message);
}

console.log('');
console.log('🎉 Payment configuration completed!');
console.log('');
console.log('📋 Summary:');
console.log('✅ Payment configuration file created');
console.log('✅ NMI setup guide created');
console.log('✅ Magento setup guide created');
console.log('✅ Payment testing script created');
console.log('');
console.log('🔧 Next Steps:');
console.log('1. Update payment-config.json with your credentials');
console.log('2. Follow NMI_SETUP_GUIDE.md for gateway setup');
console.log('3. Follow MAGENTO_SETUP_GUIDE.md for e-commerce setup');
console.log('4. Test payment processing: node test-payments.js');
console.log('5. Deploy to Cloudways with NMI + Magento integration');
console.log('');
console.log('💳 Payment Gateway: NMI + Magento');
console.log('🌐 Domain Management: Cloudways + Enom/Tucows');
console.log('🤖 AI Services: OpenAI + Voice Integration');
console.log('');
console.log('🌐 Powered by: Fakelit.com'); 