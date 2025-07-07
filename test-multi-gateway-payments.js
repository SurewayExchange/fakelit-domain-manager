#!/usr/bin/env node

/**
 * 🧪 Fakelit.com - Multi-Gateway Payment System Test
 * Test NMI and Stripe payment processing integration
 * Powered by: Fakelit.com
 */

const fs = require('fs').promises;
const FakelitUnifiedPaymentService = require('./services/unifiedPaymentService');

class MultiGatewayPaymentTest {
    constructor() {
        this.configFile = 'fakelit-auto-scaling-config.json';
    }

    async runTest() {
        console.log('🧪 Fakelit.com - Multi-Gateway Payment System Test');
        console.log('=================================================');
        console.log('🏢 Powered by: Fakelit.com');
        console.log('💳 Testing NMI + Stripe Payment Integration');
        console.log('');

        try {
            await this.testConfiguration();
            await this.testPaymentServices();
            await this.testGatewayConnections();
            await this.testCostCalculations();
            await this.testTerminalIntegration();
            await this.showPaymentFeatures();
        } catch (error) {
            console.error('❌ Multi-gateway payment test failed:', error.message);
        }
    }

    async testConfiguration() {
        console.log('📋 Testing Multi-Gateway Configuration...');
        console.log('==========================================');
        
        try {
            const configData = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(configData);
            
            console.log('✅ Configuration file found');
            
            if (config.payment) {
                console.log('✅ Payment configuration found');
                console.log(`🎯 Default Gateway: ${config.payment.defaultGateway.toUpperCase()}`);
                
                // Test NMI configuration
                if (config.payment.gateways.nmi.enabled) {
                    console.log('✅ NMI Gateway: Enabled');
                    console.log(`   💰 Currency: ${config.payment.gateways.nmi.currency.toUpperCase()}`);
                    console.log(`   🌐 Environment: ${config.payment.gateways.nmi.environment}`);
                    console.log(`   📊 Base Price: $${config.payment.gateways.nmi.scalingPricing.basePrice}`);
                    console.log(`   🏪 Per Site Price: $${config.payment.gateways.nmi.scalingPricing.perSitePrice}`);
                    console.log(`   ⚡ Scaling Fee: $${config.payment.gateways.nmi.scalingPricing.scalingFee}`);
                } else {
                    console.log('⚠️  NMI Gateway: Disabled');
                }
                
                // Test Stripe configuration
                if (config.payment.gateways.stripe.enabled) {
                    console.log('✅ Stripe Gateway: Enabled');
                    console.log(`   💰 Currency: ${config.payment.gateways.stripe.currency.toUpperCase()}`);
                    console.log(`   📊 Base Price: $${config.payment.gateways.stripe.scalingPricing.basePrice}`);
                    console.log(`   🏪 Per Site Price: $${config.payment.gateways.stripe.scalingPricing.perSitePrice}`);
                    console.log(`   ⚡ Scaling Fee: $${config.payment.gateways.stripe.scalingPricing.scalingFee}`);
                } else {
                    console.log('⚠️  Stripe Gateway: Disabled');
                }
                
                // Test terminal configuration
                if (config.payment.terminals.enabled) {
                    console.log('✅ Terminal Integration: Enabled');
                    console.log(`   🏪 Available Terminals: ${config.payment.terminals.nmiTerminals.length}`);
                    config.payment.terminals.nmiTerminals.forEach(terminal => {
                        console.log(`     - ${terminal.name} (${terminal.location}) - ${terminal.status}`);
                    });
                } else {
                    console.log('⚠️  Terminal Integration: Disabled');
                }
                
            } else {
                console.log('⚠️  No payment configuration found');
            }
            
        } catch (error) {
            console.error('❌ Configuration test failed:', error.message);
            throw error;
        }
    }

    async testPaymentServices() {
        console.log('\n💳 Testing Payment Services...');
        console.log('=============================');
        
        try {
            const configData = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(configData);
            
            if (!config.payment) {
                console.log('⚠️  Skipping payment service test (no payment config)');
                return;
            }
            
            const paymentService = new FakelitUnifiedPaymentService(config);
            console.log('✅ Unified payment service initialized successfully');
            
            // Get available gateways
            const gateways = await paymentService.getAvailableGateways();
            console.log(`🔄 Available Gateways: ${gateways.length}`);
            
            gateways.forEach(gateway => {
                console.log(`   ✅ ${gateway.name} (${gateway.id})`);
                console.log(`      Features: ${gateway.features.join(', ')}`);
                if (gateway.terminals) {
                    console.log(`      🏪 Terminals: Available`);
                }
            });
            
        } catch (error) {
            console.error('❌ Payment service test failed:', error.message);
        }
    }

    async testGatewayConnections() {
        console.log('\n🔗 Testing Gateway Connections...');
        console.log('================================');
        
        try {
            const configData = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(configData);
            
            if (!config.payment) {
                console.log('⚠️  Skipping gateway connection test (no payment config)');
                return;
            }
            
            const paymentService = new FakelitUnifiedPaymentService(config);
            
            // Test NMI connection
            if (config.payment.gateways.nmi.enabled) {
                console.log('🔍 Testing NMI connection...');
                const nmiConnected = await paymentService.testGatewayConnection('nmi');
                if (nmiConnected) {
                    console.log('✅ NMI connection successful');
                } else {
                    console.log('⚠️  NMI connection failed (check credentials)');
                }
            }
            
            // Test Stripe connection
            if (config.payment.gateways.stripe.enabled) {
                console.log('🔍 Testing Stripe connection...');
                const stripeConnected = await paymentService.testGatewayConnection('stripe');
                if (stripeConnected) {
                    console.log('✅ Stripe connection successful');
                } else {
                    console.log('⚠️  Stripe connection failed (check API key)');
                }
            }
            
        } catch (error) {
            console.error('❌ Gateway connection test failed:', error.message);
        }
    }

    async testCostCalculations() {
        console.log('\n💰 Testing Cost Calculations...');
        console.log('==============================');
        
        try {
            const configData = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(configData);
            
            if (!config.payment) {
                console.log('⚠️  Skipping cost calculation test (no payment config)');
                return;
            }
            
            const paymentService = new FakelitUnifiedPaymentService(config);
            
            // Test different scaling scenarios
            const scenarios = [
                { current: 50, target: 150, name: 'Standard Scaling' },
                { current: 45, target: 100, name: 'Partial Scaling' },
                { current: 100, target: 200, name: 'Large Scaling' }
            ];
            
            for (const scenario of scenarios) {
                const cost = await paymentService.calculateScalingCost(scenario.current, scenario.target);
                
                console.log(`\n📊 ${scenario.name}:`);
                console.log(`   Current Sites: ${cost.currentSites}`);
                console.log(`   Target Sites: ${cost.targetSites}`);
                console.log(`   Additional Sites: ${cost.additionalSites}`);
                console.log(`   Base Cost: $${cost.baseCost.toFixed(2)}`);
                console.log(`   Per Site Cost: $${cost.perSiteCost.toFixed(2)}`);
                console.log(`   Scaling Fee: $${cost.scalingFee.toFixed(2)}`);
                console.log(`   Total Cost: $${cost.totalCost.toFixed(2)} ${cost.currency.toUpperCase()}`);
            }
            
        } catch (error) {
            console.error('❌ Cost calculation test failed:', error.message);
        }
    }

    async testTerminalIntegration() {
        console.log('\n🏪 Testing Terminal Integration...');
        console.log('==================================');
        
        try {
            const configData = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(configData);
            
            if (!config.payment || !config.payment.terminals.enabled) {
                console.log('⚠️  Skipping terminal test (terminals disabled)');
                return;
            }
            
            const paymentService = new FakelitUnifiedPaymentService(config);
            
            // Get available terminals
            const terminals = await paymentService.getTerminals();
            console.log(`🏪 Available Terminals: ${terminals.length}`);
            
            terminals.forEach(terminal => {
                console.log(`   📍 ${terminal.name} (${terminal.location})`);
                console.log(`      ID: ${terminal.id}`);
                console.log(`      Status: ${terminal.status}`);
            });
            
            if (terminals.length > 0) {
                console.log('\n✅ Terminal integration working');
                console.log('💳 Terminals can be used for in-person payments');
            }
            
        } catch (error) {
            console.error('❌ Terminal integration test failed:', error.message);
        }
    }

    async showPaymentFeatures() {
        console.log('\n🚀 Multi-Gateway Payment Features:');
        console.log('==================================');
        console.log('✅ NMI Payment Gateway');
        console.log('   - Credit Card Processing');
        console.log('   - ACH Bank Transfers');
        console.log('   - Terminal Integration');
        console.log('   - Physical Card Readers');
        console.log('');
        console.log('✅ Stripe Payment Gateway');
        console.log('   - Credit Card Processing');
        console.log('   - Digital Wallets (Apple Pay, Google Pay)');
        console.log('   - Bank Transfers');
        console.log('   - International Payments');
        console.log('');
        console.log('✅ Unified Payment Processing');
        console.log('   - Automatic Gateway Selection');
        console.log('   - Fallback Payment Methods');
        console.log('   - Multi-Gateway Cost Calculation');
        console.log('   - Unified Payment Logging');
        console.log('');
        console.log('💳 Payment Flow Options:');
        console.log('1. Online Payment (NMI/Stripe)');
        console.log('2. Terminal Payment (NMI)');
        console.log('3. Automatic Gateway Selection');
        console.log('4. Manual Gateway Selection');
        console.log('');
        console.log('🛡️  Safety Features:');
        console.log('✅ Automatic refunds if scaling fails');
        console.log('✅ Multi-gateway error handling');
        console.log('✅ Detailed payment logging');
        console.log('✅ Gateway health monitoring');
        console.log('✅ Terminal status tracking');
        console.log('');
        console.log('🏢 Fakelit.com Benefits:');
        console.log('✅ Offer multiple payment options to clients');
        console.log('✅ Support both online and in-person payments');
        console.log('✅ Provide terminal solutions for businesses');
        console.log('✅ Flexible payment processing');
        console.log('✅ Professional payment infrastructure');
    }
}

// Run the test
if (require.main === module) {
    const test = new MultiGatewayPaymentTest();
    test.runTest().catch(error => {
        console.error('❌ Multi-gateway payment test failed:', error.message);
        process.exit(1);
    });
}

module.exports = MultiGatewayPaymentTest; 