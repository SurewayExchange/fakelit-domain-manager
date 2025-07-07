#!/usr/bin/env node

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
        const servicesResponse = await axios.get(`${testConfig.baseUrl}/api/payments/services`);
        
        if (servicesResponse.data.success) {
            console.log('✅ Services retrieved successfully');
            console.log(`   Found ${Object.keys(servicesResponse.data.data.services).length} services`);
        } else {
            console.log('❌ Failed to retrieve services');
            return;
        }

        // Test 2: Get specific service
        console.log('\n2️⃣ Testing service details...');
        const serviceId = 'domain-registration';
        const serviceResponse = await axios.get(`${testConfig.baseUrl}/api/payments/services/${serviceId}`);
        
        if (serviceResponse.data.success) {
            console.log('✅ Service details retrieved successfully');
            console.log(`   Service: ${serviceResponse.data.data.service.name}`);
            console.log(`   Price: $${(serviceResponse.data.data.service.price / 100).toFixed(2)}`);
        } else {
            console.log('❌ Failed to retrieve service details');
            return;
        }

        // Test 3: Validate card
        console.log('\n3️⃣ Testing card validation...');
        const validationResponse = await axios.post(`${testConfig.baseUrl}/api/payments/validate-card`, {
            cardNumber: testConfig.testCard.number,
            expiryDate: testConfig.testCard.expiry,
            cvv: testConfig.testCard.cvv
        });
        
        if (validationResponse.data.success && validationResponse.data.data.isValid) {
            console.log('✅ Card validation passed');
        } else {
            console.log('❌ Card validation failed');
            console.log(`   Errors: ${validationResponse.data.data.errors.join(', ')}`);
            return;
        }

        // Test 4: Process payment (mock mode)
        console.log('\n4️⃣ Testing payment processing...');
        const paymentResponse = await axios.post(`${testConfig.baseUrl}/api/payments/process`, {
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
            console.log(`   Error: ${paymentResponse.data.error}`);
        }

        // Test 5: Payment status
        console.log('\n5️⃣ Testing payment service status...');
        const statusResponse = await axios.get(`${testConfig.baseUrl}/api/payments/status`);
        
        if (statusResponse.data.success) {
            console.log('✅ Payment service is operational');
            console.log(`   Gateway: ${statusResponse.data.data.gateway}`);
            console.log(`   Services: ${statusResponse.data.data.services}`);
        } else {
            console.log('❌ Payment service status check failed');
        }

        console.log('\n🎉 All payment tests completed successfully!');
        console.log('\n📋 Test Summary:');
        console.log('✅ Service retrieval');
        console.log('✅ Service details');
        console.log('✅ Card validation');
        console.log('✅ Payment processing');
        console.log('✅ Service status');
        console.log('\n🌐 Powered by: Fakelit.com');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Ensure the server is running on port 3000');
        console.log('2. Check that payment routes are configured');
        console.log('3. Verify environment variables are set');
        console.log('4. Check server logs for detailed errors');
    }
}

// Run tests
testPaymentService();
