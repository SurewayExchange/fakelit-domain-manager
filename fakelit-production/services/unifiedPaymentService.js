/**
 * 💳 Fakelit.com - Unified Payment Processing Service
 * Handles both NMI and Stripe payment gateways for auto-scaling operations
 * Powered by: Fakelit.com
 */

const FakelitStripePaymentService = require('./stripePaymentService');
const FakelitNMIPaymentService = require('./nmiPaymentService');

class FakelitUnifiedPaymentService {
    constructor(config) {
        this.config = config;
        this.paymentLogs = [];
        this.initialize();
    }

    initialize() {
        console.log('💳 Fakelit.com - Unified Payment Service Initialized');
        console.log('🏢 Powered by: Fakelit.com');
        console.log('🔄 Supporting Multiple Payment Gateways');
        console.log('');

        // Initialize payment services
        this.initializePaymentServices();
        
        // Set default gateway
        this.defaultGateway = this.config.payment.defaultGateway || 'nmi';
        console.log(`🎯 Default Gateway: ${this.defaultGateway.toUpperCase()}`);
        console.log('');
    }

    initializePaymentServices() {
        this.services = {};

        // Initialize NMI service
        if (this.config.payment.gateways.nmi.enabled) {
            try {
                this.services.nmi = new FakelitNMIPaymentService(this.config);
                console.log('✅ NMI Payment Service: Enabled');
            } catch (error) {
                console.error('❌ NMI Payment Service: Failed to initialize', error.message);
            }
        } else {
            console.log('⚠️  NMI Payment Service: Disabled');
        }

        // Initialize Stripe service
        if (this.config.payment.gateways.stripe.enabled) {
            try {
                this.services.stripe = new FakelitStripePaymentService(this.config);
                console.log('✅ Stripe Payment Service: Enabled');
            } catch (error) {
                console.error('❌ Stripe Payment Service: Failed to initialize', error.message);
            }
        } else {
            console.log('⚠️  Stripe Payment Service: Disabled');
        }

        // Check if any services are available
        if (Object.keys(this.services).length === 0) {
            throw new Error('No payment services available');
        }
    }

    async calculateScalingCost(currentSites, targetSites, gateway = null) {
        const selectedGateway = gateway || this.defaultGateway;
        
        if (!this.services[selectedGateway]) {
            throw new Error(`Payment gateway not available: ${selectedGateway}`);
        }

        return await this.services[selectedGateway].calculateScalingCost(currentSites, targetSites);
    }

    async processPayment(scalingCost, gateway = null, paymentMethod = 'auto') {
        const selectedGateway = gateway || this.defaultGateway;
        
        if (!this.services[selectedGateway]) {
            throw new Error(`Payment gateway not available: ${selectedGateway}`);
        }

        console.log(`💳 Processing payment via ${selectedGateway.toUpperCase()}...`);

        try {
            let paymentResult;

            if (selectedGateway === 'nmi') {
                if (paymentMethod === 'terminal') {
                    // Use first available terminal
                    const terminals = await this.services.nmi.getAllTerminals();
                    const activeTerminal = terminals.find(t => t.status === 'active');
                    
                    if (!activeTerminal) {
                        throw new Error('No active terminals available');
                    }

                    paymentResult = await this.services.nmi.processTerminalPayment(scalingCost, activeTerminal.id);
                } else {
                    paymentResult = await this.services.nmi.createTransaction(scalingCost);
                }
            } else if (selectedGateway === 'stripe') {
                const paymentIntent = await this.services.stripe.createPaymentIntent(scalingCost);
                paymentResult = await this.services.stripe.processPayment(paymentIntent.id);
            }

            await this.logPayment('PAYMENT_PROCESSED', {
                gateway: selectedGateway,
                paymentMethod: paymentMethod,
                amount: scalingCost.totalCost,
                currency: scalingCost.currency,
                scalingDetails: scalingCost,
                result: paymentResult
            });

            return {
                success: true,
                gateway: selectedGateway,
                paymentMethod: paymentMethod,
                result: paymentResult
            };

        } catch (error) {
            console.error(`❌ Payment processing failed via ${selectedGateway}:`, error.message);
            
            await this.logPayment('PAYMENT_FAILED', {
                gateway: selectedGateway,
                paymentMethod: paymentMethod,
                error: error.message,
                scalingDetails: scalingCost
            });

            throw error;
        }
    }

    async refundPayment(paymentId, gateway = null, reason = 'Auto-scaling failed') {
        const selectedGateway = gateway || this.defaultGateway;
        
        if (!this.services[selectedGateway]) {
            throw new Error(`Payment gateway not available: ${selectedGateway}`);
        }

        console.log(`🔄 Processing refund via ${selectedGateway.toUpperCase()}...`);

        try {
            let refundResult;

            if (selectedGateway === 'nmi') {
                refundResult = await this.services.nmi.refundTransaction(paymentId, reason);
            } else if (selectedGateway === 'stripe') {
                refundResult = await this.services.stripe.refundPayment(paymentId, reason);
            }

            await this.logPayment('PAYMENT_REFUNDED', {
                gateway: selectedGateway,
                paymentId: paymentId,
                reason: reason,
                result: refundResult
            });

            return {
                success: true,
                gateway: selectedGateway,
                result: refundResult
            };

        } catch (error) {
            console.error(`❌ Refund failed via ${selectedGateway}:`, error.message);
            
            await this.logPayment('REFUND_FAILED', {
                gateway: selectedGateway,
                paymentId: paymentId,
                error: error.message,
                reason: reason
            });

            throw error;
        }
    }

    async getAvailableGateways() {
        const gateways = [];
        
        if (this.services.nmi) {
            gateways.push({
                name: 'NMI',
                id: 'nmi',
                enabled: true,
                features: ['credit_card', 'terminal', 'ach'],
                terminals: this.config.payment.terminals.enabled
            });
        }
        
        if (this.services.stripe) {
            gateways.push({
                name: 'Stripe',
                id: 'stripe',
                enabled: true,
                features: ['credit_card', 'digital_wallet', 'bank_transfer']
            });
        }

        return gateways;
    }

    async getTerminals() {
        if (this.services.nmi && this.config.payment.terminals.enabled) {
            return await this.services.nmi.getAllTerminals();
        }
        return [];
    }

    async testGatewayConnection(gateway) {
        if (!this.services[gateway]) {
            throw new Error(`Gateway not available: ${gateway}`);
        }

        if (gateway === 'nmi') {
            return await this.services.nmi.testConnection();
        } else if (gateway === 'stripe') {
            try {
                const account = await this.services.stripe.stripe.accounts.retrieve();
                return true;
            } catch (error) {
                return false;
            }
        }

        return false;
    }

    async logPayment(event, data) {
        const paymentLog = {
            timestamp: new Date().toISOString(),
            event: event,
            data: data,
            service: 'Fakelit.com Unified Auto-Scaling',
            version: '2.0'
        };

        this.paymentLogs.push(paymentLog);

        try {
            const fs = require('fs').promises;
            await fs.writeFile(
                this.config.monitoring.paymentLogFile,
                JSON.stringify(this.paymentLogs, null, 2)
            );
        } catch (error) {
            console.error('❌ Failed to save unified payment log:', error.message);
        }
    }

    async getPaymentHistory() {
        return this.paymentLogs;
    }

    async generateReceipt(paymentId, gateway) {
        if (!this.services[gateway]) {
            throw new Error(`Gateway not available: ${gateway}`);
        }

        if (gateway === 'nmi') {
            return await this.services.nmi.generateReceipt(paymentId);
        } else if (gateway === 'stripe') {
            return await this.services.stripe.generateInvoice(paymentId);
        }

        throw new Error(`Receipt generation not supported for gateway: ${gateway}`);
    }

    async createCustomer(email, name, gateway = null) {
        const selectedGateway = gateway || this.defaultGateway;
        
        if (!this.services[selectedGateway]) {
            throw new Error(`Gateway not available: ${selectedGateway}`);
        }

        if (selectedGateway === 'nmi') {
            return await this.services.nmi.createCustomer(email, name);
        } else if (selectedGateway === 'stripe') {
            return await this.services.stripe.createCustomer(email, name);
        }

        throw new Error(`Customer creation not supported for gateway: ${selectedGateway}`);
    }

    async handleWebhook(event, gateway) {
        if (!this.services[gateway]) {
            throw new Error(`Gateway not available: ${gateway}`);
        }

        if (gateway === 'stripe') {
            return await this.services.stripe.handleWebhook(event);
        }

        throw new Error(`Webhook handling not supported for gateway: ${gateway}`);
    }

    getServiceStatus() {
        const status = {
            defaultGateway: this.defaultGateway,
            availableGateways: Object.keys(this.services),
            services: {}
        };

        Object.keys(this.services).forEach(gateway => {
            status.services[gateway] = {
                enabled: true,
                initialized: true
            };
        });

        return status;
    }
}

module.exports = FakelitUnifiedPaymentService; 