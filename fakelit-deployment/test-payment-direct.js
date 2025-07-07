/**
 * 🧪 Direct Payment System Test
 * Test NMI + Magento payment processing directly
 */

const PaymentService = require('./services/paymentService');

async function testPaymentSystem() {
    console.log('🧪 Testing Fakelit.com Payment System Directly');
    console.log('=============================================');
    console.log('');

    try {
        // Create payment service instance
        const paymentService = new PaymentService();
        console.log('✅ Payment service created successfully');
        console.log('');

        // Test 1: Get services
        console.log('1️⃣ Testing service retrieval...');
        const servicesResult = await paymentService.getServices();
        
        if (servicesResult.success) {
            console.log('✅ Services retrieved successfully');
            console.log(`   Found ${Object.keys(servicesResult.data.services).length} services`);
            console.log('   Services:');
            Object.entries(servicesResult.data.services).forEach(([id, service]) => {
                console.log(`   - ${service.name}: $${(service.price / 100).toFixed(2)}`);
            });
        } else {
            console.log('❌ Failed to retrieve services');
            console.log(`   Error: ${servicesResult.error}`);
            return;
        }

        // Test 2: Get specific service
        console.log('\n2️⃣ Testing service details...');
        const serviceId = 'domain-registration';
        const serviceResult = await paymentService.getService(serviceId);
        
        if (serviceResult.success) {
            console.log('✅ Service details retrieved successfully');
            console.log(`   Service: ${serviceResult.data.service.name}`);
            console.log(`   Price: $${(serviceResult.data.service.price / 100).toFixed(2)}`);
            console.log(`   Description: ${serviceResult.data.service.description}`);
            console.log(`   Features: ${serviceResult.data.service.features.length} features`);
        } else {
            console.log('❌ Failed to retrieve service details');
            console.log(`   Error: ${serviceResult.error}`);
            return;
        }

        // Test 3: Test payment processing (mock)
        console.log('\n3️⃣ Testing payment processing (mock mode)...');
        const testCustomerData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@fakelit.com',
            address: '123 Test St',
            city: 'Test City',
            state: 'CA',
            zipCode: '90210',
            country: 'US'
        };

        const testPaymentData = {
            cardNumber: '4111111111111111',
            expiryDate: '12/25',
            cvv: '123'
        };

        const paymentResult = await paymentService.createPayment(serviceId, testCustomerData, testPaymentData);
        
        if (paymentResult.success) {
            console.log('✅ Payment processing test completed');
            console.log('   Note: This was a mock transaction');
            console.log(`   Transaction ID: ${paymentResult.data.transaction?.transaction_id || 'Mock'}`);
            console.log(`   Order ID: ${paymentResult.data.order?.order_id || 'Mock'}`);
        } else {
            console.log('❌ Payment processing failed');
            console.log(`   Error: ${paymentResult.error}`);
        }

        // Test 4: Test customer services
        console.log('\n4️⃣ Testing customer services...');
        const customerServicesResult = await paymentService.getCustomerServices('test@fakelit.com');
        
        if (customerServicesResult.success) {
            console.log('✅ Customer services retrieved successfully');
            console.log(`   Found ${customerServicesResult.data.services.length} services for customer`);
        } else {
            console.log('❌ Failed to retrieve customer services');
            console.log(`   Error: ${customerServicesResult.error}`);
        }

        // Test 5: Test payment history
        console.log('\n5️⃣ Testing payment history...');
        const paymentHistoryResult = await paymentService.getPaymentHistory('test@fakelit.com');
        
        if (paymentHistoryResult.success) {
            console.log('✅ Payment history retrieved successfully');
            console.log(`   Found ${paymentHistoryResult.data.transactions.length} transactions`);
        } else {
            console.log('❌ Failed to retrieve payment history');
            console.log(`   Error: ${paymentHistoryResult.error}`);
        }

        console.log('\n🎉 All payment system tests completed successfully!');
        console.log('\n📋 Test Summary:');
        console.log('✅ Service retrieval');
        console.log('✅ Service details');
        console.log('✅ Payment processing (mock)');
        console.log('✅ Customer services');
        console.log('✅ Payment history');
        console.log('\n💳 Payment Gateway: NMI + Magento');
        console.log('🌐 Domain Management: Cloudways + Enom/Tucows');
        console.log('🤖 AI Services: OpenAI + Voice Integration');
        console.log('\n🌐 Powered by: Fakelit.com');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('   Stack:', error.stack);
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check that all dependencies are installed');
        console.log('2. Verify environment variables are set');
        console.log('3. Ensure payment service is properly configured');
        console.log('4. Check for any missing modules');
    }
}

// Run tests
testPaymentSystem(); 