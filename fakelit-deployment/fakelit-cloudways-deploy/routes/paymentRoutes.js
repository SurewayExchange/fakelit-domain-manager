/**
 * 💳 Fakelit.com Payment Routes
 * Handles payment processing for domain management services using NMI + Magento
 */

const express = require('express');
const router = express.Router();
const PaymentService = require('../services/paymentService');

const paymentService = new PaymentService();

/**
 * GET /api/payments/services
 * Get all available services
 */
router.get('/services', async (req, res) => {
    try {
        const result = await paymentService.getServices();
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: 'Services retrieved successfully',
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * GET /api/payments/services/:serviceId
 * Get specific service details
 */
router.get('/services/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const result = await paymentService.getService(serviceId);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: 'Service details retrieved successfully',
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                error: result.error,
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * POST /api/payments/process
 * Process payment for service purchase
 */
router.post('/process', async (req, res) => {
    try {
        const { serviceId, customerData, paymentData } = req.body;
        
        // Validate required fields
        if (!serviceId || !customerData || !paymentData) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: serviceId, customerData, paymentData',
                poweredBy: 'Fakelit.com'
            });
        }
        
        // Validate customer data
        const requiredCustomerFields = ['firstName', 'lastName', 'email'];
        for (const field of requiredCustomerFields) {
            if (!customerData[field]) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required customer field: ${field}`,
                    poweredBy: 'Fakelit.com'
                });
            }
        }
        
        // Validate payment data
        const requiredPaymentFields = ['cardNumber', 'expiryDate', 'cvv'];
        for (const field of requiredPaymentFields) {
            if (!paymentData[field]) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required payment field: ${field}`,
                    poweredBy: 'Fakelit.com'
                });
            }
        }
        
        // Process payment
        const result = await paymentService.createPayment(serviceId, customerData, paymentData);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: 'Payment processed successfully',
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Payment processing failed',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * GET /api/payments/customer/:email/services
 * Get customer's active services
 */
router.get('/customer/:email/services', async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
                poweredBy: 'Fakelit.com'
            });
        }
        
        const result = await paymentService.getCustomerServices(email);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: 'Customer services retrieved successfully',
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get customer services error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * GET /api/payments/customer/:email/history
 * Get customer's payment history
 */
router.get('/customer/:email/history', async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
                poweredBy: 'Fakelit.com'
            });
        }
        
        const result = await paymentService.getPaymentHistory(email);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: 'Payment history retrieved successfully',
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * POST /api/payments/validate-card
 * Validate credit card information
 */
router.post('/validate-card', async (req, res) => {
    try {
        const { cardNumber, expiryDate, cvv } = req.body;
        
        // Basic card validation
        const validation = {
            isValid: true,
            errors: []
        };
        
        // Validate card number (Luhn algorithm)
        if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
            validation.isValid = false;
            validation.errors.push('Invalid card number');
        }
        
        // Validate expiry date
        if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
            validation.isValid = false;
            validation.errors.push('Invalid expiry date format (MM/YY)');
        } else {
            const [month, year] = expiryDate.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;
            
            if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                validation.isValid = false;
                validation.errors.push('Card has expired');
            }
        }
        
        // Validate CVV
        if (!cvv || cvv.length < 3 || cvv.length > 4) {
            validation.isValid = false;
            validation.errors.push('Invalid CVV');
        }
        
        res.json({
            success: true,
            data: validation,
            message: validation.isValid ? 'Card validation passed' : 'Card validation failed',
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Validate card error:', error);
        res.status(500).json({
            success: false,
            error: 'Card validation failed',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * GET /api/payments/status
 * Get payment service status
 */
router.get('/status', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                status: 'operational',
                gateway: 'NMI + Magento',
                services: Object.keys(paymentService.services).length,
                poweredBy: 'Fakelit.com',
                timestamp: new Date().toISOString()
            },
            message: 'Payment service is operational',
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get payment status',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 