/**
 * 💳 Fakelit.com - Stripe Payment Processing Service
 * Handles payment processing for auto-scaling operations
 * Powered by: Fakelit.com
 */

const stripe = require('stripe');

class FakelitStripePaymentService {
    constructor(config) {
        this.config = config;
        this.stripe = stripe(config.stripe.apiKey);
        this.paymentLogs = [];
        this.initialize();
    }

    initialize() {
        console.log('💳 Fakelit.com - Stripe Payment Service Initialized');
        console.log('🏢 Powered by: Fakelit.com');
        console.log(`💰 Currency: ${this.config.stripe.currency.toUpperCase()}`);
        console.log(`📊 Base Price: $${this.config.stripe.scalingPricing.basePrice}`);
        console.log(`🏪 Per Site Price: $${this.config.stripe.scalingPricing.perSitePrice}`);
        console.log(`⚡ Scaling Fee: $${this.config.stripe.scalingPricing.scalingFee}`);
        console.log('');
    }

    async calculateScalingCost(currentSites, targetSites) {
        const additionalSites = targetSites - currentSites;
        const baseCost = this.config.stripe.scalingPricing.basePrice;
        const perSiteCost = additionalSites * this.config.stripe.scalingPricing.perSitePrice;
        const scalingFee = this.config.stripe.scalingPricing.scalingFee;
        
        const totalCost = baseCost + perSiteCost + scalingFee;
        
        return {
            currentSites,
            targetSites,
            additionalSites,
            baseCost,
            perSiteCost,
            scalingFee,
            totalCost,
            currency: this.config.stripe.currency
        };
    }

    async createPaymentIntent(scalingCost, customerEmail = 'marquibelbrooks@gmail.com') {
        try {
            console.log('💳 Creating payment intent for auto-scaling...');
            console.log(`📊 Scaling from ${scalingCost.currentSites} to ${scalingCost.targetSites} sites`);
            console.log(`💰 Total cost: $${scalingCost.totalCost.toFixed(2)} ${scalingCost.currency.toUpperCase()}`);

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(scalingCost.totalCost * 100), // Convert to cents
                currency: scalingCost.currency,
                metadata: {
                    service: 'Fakelit.com Auto-Scaling',
                    currentSites: scalingCost.currentSites.toString(),
                    targetSites: scalingCost.targetSites.toString(),
                    additionalSites: scalingCost.additionalSites.toString(),
                    baseCost: scalingCost.baseCost.toString(),
                    perSiteCost: scalingCost.perSiteCost.toString(),
                    scalingFee: scalingCost.scalingFee.toString(),
                    customerEmail: customerEmail
                },
                description: `Fakelit.com Auto-Scaling: ${scalingCost.currentSites} → ${scalingCost.targetSites} Magento sites`,
                receipt_email: customerEmail
            });

            await this.logPayment('PAYMENT_INTENT_CREATED', {
                paymentIntentId: paymentIntent.id,
                amount: scalingCost.totalCost,
                currency: scalingCost.currency,
                scalingDetails: scalingCost
            });

            console.log('✅ Payment intent created successfully');
            console.log(`🆔 Payment Intent ID: ${paymentIntent.id}`);
            console.log(`💰 Amount: $${scalingCost.totalCost.toFixed(2)} ${scalingCost.currency.toUpperCase()}`);

            return paymentIntent;

        } catch (error) {
            console.error('❌ Failed to create payment intent:', error.message);
            await this.logPayment('PAYMENT_INTENT_FAILED', {
                error: error.message,
                scalingDetails: scalingCost
            });
            throw error;
        }
    }

    async processPayment(paymentIntentId) {
        try {
            console.log(`💳 Processing payment: ${paymentIntentId}`);

            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            
            if (paymentIntent.status === 'succeeded') {
                console.log('✅ Payment already succeeded');
                return paymentIntent;
            }

            if (paymentIntent.status === 'requires_payment_method') {
                console.log('⚠️ Payment requires payment method');
                throw new Error('Payment requires payment method');
            }

            if (paymentIntent.status === 'requires_confirmation') {
                console.log('🔄 Confirming payment intent...');
                const confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
                
                await this.logPayment('PAYMENT_CONFIRMED', {
                    paymentIntentId: confirmedIntent.id,
                    amount: confirmedIntent.amount / 100,
                    currency: confirmedIntent.currency,
                    status: confirmedIntent.status
                });

                return confirmedIntent;
            }

            return paymentIntent;

        } catch (error) {
            console.error('❌ Payment processing failed:', error.message);
            await this.logPayment('PAYMENT_PROCESSING_FAILED', {
                paymentIntentId,
                error: error.message
            });
            throw error;
        }
    }

    async createCustomer(email, name = 'Fakelit.com Customer') {
        try {
            console.log(`👤 Creating customer: ${email}`);

            const customer = await this.stripe.customers.create({
                email: email,
                name: name,
                metadata: {
                    service: 'Fakelit.com Auto-Scaling',
                    createdBy: 'Auto-Scaling System'
                }
            });

            console.log(`✅ Customer created: ${customer.id}`);
            return customer;

        } catch (error) {
            console.error('❌ Failed to create customer:', error.message);
            throw error;
        }
    }

    async createSubscription(customerId, scalingCost) {
        try {
            console.log(`📅 Creating subscription for customer: ${customerId}`);

            const subscription = await this.stripe.subscriptions.create({
                customer: customerId,
                items: [{
                    price_data: {
                        currency: scalingCost.currency,
                        product_data: {
                            name: 'Fakelit.com Auto-Scaling Service',
                            description: `Auto-scaling from ${scalingCost.currentSites} to ${scalingCost.targetSites} Magento sites`
                        },
                        unit_amount: Math.round(scalingCost.totalCost * 100)
                    }
                }],
                metadata: {
                    service: 'Fakelit.com Auto-Scaling',
                    currentSites: scalingCost.currentSites.toString(),
                    targetSites: scalingCost.targetSites.toString()
                }
            });

            console.log(`✅ Subscription created: ${subscription.id}`);
            return subscription;

        } catch (error) {
            console.error('❌ Failed to create subscription:', error.message);
            throw error;
        }
    }

    async refundPayment(paymentIntentId, reason = 'Auto-scaling failed') {
        try {
            console.log(`🔄 Processing refund: ${paymentIntentId}`);

            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                reason: 'requested_by_customer',
                metadata: {
                    service: 'Fakelit.com Auto-Scaling',
                    reason: reason
                }
            });

            await this.logPayment('PAYMENT_REFUNDED', {
                paymentIntentId: paymentIntentId,
                refundId: refund.id,
                amount: refund.amount / 100,
                currency: refund.currency,
                reason: reason
            });

            console.log(`✅ Refund processed: ${refund.id}`);
            return refund;

        } catch (error) {
            console.error('❌ Refund failed:', error.message);
            await this.logPayment('REFUND_FAILED', {
                paymentIntentId: paymentIntentId,
                error: error.message,
                reason: reason
            });
            throw error;
        }
    }

    async logPayment(event, data) {
        const paymentLog = {
            timestamp: new Date().toISOString(),
            event: event,
            data: data,
            service: 'Fakelit.com Auto-Scaling'
        };

        this.paymentLogs.push(paymentLog);

        try {
            const fs = require('fs').promises;
            await fs.writeFile(
                this.config.monitoring.paymentLogFile,
                JSON.stringify(this.paymentLogs, null, 2)
            );
        } catch (error) {
            console.error('❌ Failed to save payment log:', error.message);
        }
    }

    async getPaymentHistory() {
        return this.paymentLogs;
    }

    async generateInvoice(paymentIntentId) {
        try {
            console.log(`📄 Generating invoice for: ${paymentIntentId}`);

            const invoice = await this.stripe.invoices.create({
                customer: 'cus_auto_scaling', // You might want to store customer ID
                auto_advance: true,
                collection_method: 'charge_automatically',
                metadata: {
                    service: 'Fakelit.com Auto-Scaling',
                    paymentIntentId: paymentIntentId
                }
            });

            console.log(`✅ Invoice generated: ${invoice.id}`);
            return invoice;

        } catch (error) {
            console.error('❌ Failed to generate invoice:', error.message);
            throw error;
        }
    }

    async handleWebhook(event) {
        try {
            console.log(`🔔 Processing webhook: ${event.type}`);

            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailure(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleInvoicePayment(event.data.object);
                    break;
                default:
                    console.log(`📝 Unhandled webhook event: ${event.type}`);
            }

        } catch (error) {
            console.error('❌ Webhook processing failed:', error.message);
            throw error;
        }
    }

    async handlePaymentSuccess(paymentIntent) {
        console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
        await this.logPayment('WEBHOOK_PAYMENT_SUCCESS', {
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency
        });
    }

    async handlePaymentFailure(paymentIntent) {
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        await this.logPayment('WEBHOOK_PAYMENT_FAILURE', {
            paymentIntentId: paymentIntent.id,
            lastPaymentError: paymentIntent.last_payment_error
        });
    }

    async handleInvoicePayment(invoice) {
        console.log(`📄 Invoice payment: ${invoice.id}`);
        await this.logPayment('WEBHOOK_INVOICE_PAYMENT', {
            invoiceId: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency
        });
    }
}

module.exports = FakelitStripePaymentService; 