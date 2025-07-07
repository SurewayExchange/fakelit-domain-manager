/**
 * 💳 Fakelit.com - Payment Routes
 * Handles Stripe webhooks and payment processing
 * Powered by: Fakelit.com
 */

const express = require('express');
const router = express.Router();
const FakelitStripePaymentService = require('../services/stripePaymentService');

class FakelitPaymentRoutes {
    constructor(config) {
        this.config = config;
        this.paymentService = new FakelitStripePaymentService(config);
        this.setupRoutes();
    }

    setupRoutes() {
        // Health check
        router.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'Fakelit.com Payment Processing',
                poweredBy: 'Fakelit.com',
                features: {
                    stripe: 'Payment Processing',
                    webhooks: 'Stripe Webhooks',
                    scaling: 'Auto-Scaling Payments'
                }
            });
        });

        // Create payment intent for scaling
        router.post('/create-payment-intent', async (req, res) => {
            try {
                const { currentSites, targetSites, customerEmail } = req.body;
                
                const scalingCost = await this.paymentService.calculateScalingCost(
                    currentSites || 50,
                    targetSites || 150
                );

                const paymentIntent = await this.paymentService.createPaymentIntent(
                    scalingCost,
                    customerEmail || 'marquibelbrooks@gmail.com'
                );

                res.json({
                    success: true,
                    paymentIntent: {
                        id: paymentIntent.id,
                        clientSecret: paymentIntent.client_secret,
                        amount: scalingCost.totalCost,
                        currency: scalingCost.currency
                    },
                    scalingCost: scalingCost
                });

            } catch (error) {
                console.error('❌ Payment intent creation failed:', error.message);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Process payment
        router.post('/process-payment', async (req, res) => {
            try {
                const { paymentIntentId } = req.body;
                
                if (!paymentIntentId) {
                    return res.status(400).json({
                        success: false,
                        error: 'Payment Intent ID is required'
                    });
                }

                const payment = await this.paymentService.processPayment(paymentIntentId);
                
                res.json({
                    success: true,
                    payment: {
                        id: payment.id,
                        status: payment.status,
                        amount: payment.amount / 100,
                        currency: payment.currency
                    }
                });

            } catch (error) {
                console.error('❌ Payment processing failed:', error.message);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Stripe webhook handler
        router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
            const sig = req.headers['stripe-signature'];
            const endpointSecret = this.config.stripe.webhookSecret;

            let event;

            try {
                event = this.paymentService.stripe.webhooks.constructEvent(
                    req.body,
                    sig,
                    endpointSecret
                );
            } catch (err) {
                console.error('❌ Webhook signature verification failed:', err.message);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }

            try {
                await this.paymentService.handleWebhook(event);
                res.json({ received: true });
            } catch (error) {
                console.error('❌ Webhook processing failed:', error.message);
                res.status(500).json({ error: error.message });
            }
        });

        // Get payment history
        router.get('/payment-history', async (req, res) => {
            try {
                const history = await this.paymentService.getPaymentHistory();
                res.json({
                    success: true,
                    history: history,
                    totalPayments: history.length
                });
            } catch (error) {
                console.error('❌ Failed to get payment history:', error.message);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Calculate scaling cost
        router.post('/calculate-cost', async (req, res) => {
            try {
                const { currentSites, targetSites } = req.body;
                
                const scalingCost = await this.paymentService.calculateScalingCost(
                    currentSites || 50,
                    targetSites || 150
                );

                res.json({
                    success: true,
                    scalingCost: scalingCost
                });

            } catch (error) {
                console.error('❌ Cost calculation failed:', error.message);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Refund payment
        router.post('/refund', async (req, res) => {
            try {
                const { paymentIntentId, reason } = req.body;
                
                if (!paymentIntentId) {
                    return res.status(400).json({
                        success: false,
                        error: 'Payment Intent ID is required'
                    });
                }

                const refund = await this.paymentService.refundPayment(
                    paymentIntentId,
                    reason || 'Customer request'
                );

                res.json({
                    success: true,
                    refund: {
                        id: refund.id,
                        amount: refund.amount / 100,
                        currency: refund.currency,
                        status: refund.status
                    }
                });

            } catch (error) {
                console.error('❌ Refund failed:', error.message);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Create customer
        router.post('/create-customer', async (req, res) => {
            try {
                const { email, name } = req.body;
                
                if (!email) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email is required'
                    });
                }

                const customer = await this.paymentService.createCustomer(
                    email,
                    name || 'Fakelit.com Customer'
                );

                res.json({
                    success: true,
                    customer: {
                        id: customer.id,
                        email: customer.email,
                        name: customer.name
                    }
                });

            } catch (error) {
                console.error('❌ Customer creation failed:', error.message);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Generate invoice
        router.post('/generate-invoice', async (req, res) => {
            try {
                const { paymentIntentId } = req.body;
                
                if (!paymentIntentId) {
                    return res.status(400).json({
                        success: false,
                        error: 'Payment Intent ID is required'
                    });
                }

                const invoice = await this.paymentService.generateInvoice(paymentIntentId);

                res.json({
                    success: true,
                    invoice: {
                        id: invoice.id,
                        amount: invoice.amount_due / 100,
                        currency: invoice.currency,
                        status: invoice.status
                    }
                });

            } catch (error) {
                console.error('❌ Invoice generation failed:', error.message);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Get payment service status
        router.get('/status', (req, res) => {
            res.json({
                status: 'active',
                service: 'Fakelit.com Payment Processing',
                poweredBy: 'Fakelit.com',
                features: {
                    stripe: 'Enabled',
                    webhooks: 'Configured',
                    autoScaling: 'Integrated'
                },
                pricing: this.config.stripe.scalingPricing
            });
        });
    }

    getRouter() {
        return router;
    }
}

module.exports = FakelitPaymentRoutes; 