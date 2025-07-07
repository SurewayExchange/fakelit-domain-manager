const express = require('express');
const router = express.Router();
const CryptoPaymentService = require('../services/cryptoPaymentService');

const cryptoPaymentService = new CryptoPaymentService();

// Initialize Web3 connection
router.post('/initialize', async (req, res) => {
    try {
        const { provider } = req.body;
        
        if (!provider) {
            return res.status(400).json({
                success: false,
                message: 'Provider is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const initialized = cryptoPaymentService.initializeWeb3(provider);
        
        if (initialized) {
            const networkInfo = await cryptoPaymentService.getNetworkInfo();
            
            res.json({
                success: true,
                message: 'Web3 connection established',
                networkInfo: networkInfo,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to initialize Web3 connection',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Web3 initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize Web3',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get network information
router.get('/network', async (req, res) => {
    try {
        const networkInfo = await cryptoPaymentService.getNetworkInfo();
        
        if (networkInfo) {
            res.json({
                success: true,
                networkInfo: networkInfo,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get network information',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get network info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get network information',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get account balance
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!cryptoPaymentService.validateWalletAddress(address)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid wallet address',
                poweredBy: 'Fakelit.com'
            });
        }

        const balance = await cryptoPaymentService.getAccountBalance(address);
        
        if (balance) {
            res.json({
                success: true,
                balance: balance,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get account balance',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get account balance',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Create payment request
router.post('/payment-request', async (req, res) => {
    try {
        const { amount, currency, token } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const paymentRequest = cryptoPaymentService.createPaymentRequest(
            parseFloat(amount),
            currency || 'USD',
            token || 'ETH'
        );
        
        if (paymentRequest) {
            res.json({
                success: true,
                message: 'Payment request created successfully',
                paymentRequest: paymentRequest,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to create payment request',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Create payment request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment request',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Process payment
router.post('/process-payment', async (req, res) => {
    try {
        const { paymentId, fromAddress, transactionHash } = req.body;
        
        if (!paymentId || !fromAddress || !transactionHash) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID, from address, and transaction hash are required',
                poweredBy: 'Fakelit.com'
            });
        }

        if (!cryptoPaymentService.validateWalletAddress(fromAddress)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid from address',
                poweredBy: 'Fakelit.com'
            });
        }

        const payment = await cryptoPaymentService.processPayment(
            paymentId,
            fromAddress,
            transactionHash
        );
        
        res.json({
            success: true,
            message: 'Payment processed successfully',
            payment: payment,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process payment',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get payment status
router.get('/payment/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const paymentStatus = cryptoPaymentService.getPaymentStatus(paymentId);
        
        if (paymentStatus) {
            res.json({
                success: true,
                paymentStatus: paymentStatus,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Payment not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get payment history
router.get('/history', async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            fromAddress: req.query.fromAddress,
            token: req.query.token,
            startDate: req.query.startDate ? parseInt(req.query.startDate) : null,
            endDate: req.query.endDate ? parseInt(req.query.endDate) : null
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === null) {
                delete filters[key];
            }
        });

        const history = cryptoPaymentService.getPaymentHistory(filters);
        
        res.json({
            success: true,
            history: history,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment history',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get supported tokens
router.get('/tokens', async (req, res) => {
    try {
        const tokens = cryptoPaymentService.getSupportedTokens();
        
        res.json({
            success: true,
            tokens: tokens,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get tokens error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get supported tokens',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Estimate gas for transaction
router.post('/estimate-gas', async (req, res) => {
    try {
        const { fromAddress, toAddress, amount, token } = req.body;
        
        if (!fromAddress || !toAddress || !amount) {
            return res.status(400).json({
                success: false,
                message: 'From address, to address, and amount are required',
                poweredBy: 'Fakelit.com'
            });
        }

        if (!cryptoPaymentService.validateWalletAddress(fromAddress) || 
            !cryptoPaymentService.validateWalletAddress(toAddress)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid wallet address',
                poweredBy: 'Fakelit.com'
            });
        }

        const gasEstimate = await cryptoPaymentService.estimateGas(
            fromAddress,
            toAddress,
            parseFloat(amount),
            token || 'ETH'
        );
        
        if (gasEstimate) {
            res.json({
                success: true,
                gasEstimate: gasEstimate,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to estimate gas',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Estimate gas error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to estimate gas',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Generate payment QR code
router.post('/qr-code', async (req, res) => {
    try {
        const { paymentId } = req.body;
        
        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const paymentRequest = cryptoPaymentService.getPaymentStatus(paymentId);
        if (!paymentRequest) {
            return res.status(404).json({
                success: false,
                message: 'Payment request not found',
                poweredBy: 'Fakelit.com'
            });
        }

        const qrCode = cryptoPaymentService.generatePaymentQR(paymentRequest);
        
        if (qrCode) {
            res.json({
                success: true,
                qrCode: qrCode,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to generate QR code',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Generate QR code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get payment statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = cryptoPaymentService.getPaymentStats();
        
        if (stats) {
            res.json({
                success: true,
                stats: stats,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get payment statistics',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get payment stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment statistics',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Refund payment (admin function)
router.post('/refund', async (req, res) => {
    try {
        const { paymentId, reason } = req.body;
        
        if (!paymentId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Payment ID and reason are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const refund = await cryptoPaymentService.refundPayment(paymentId, reason);
        
        res.json({
            success: true,
            message: 'Refund initiated successfully',
            refund: refund,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Refund payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to refund payment',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Validate wallet address
router.post('/validate-address', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                message: 'Address is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const isValid = cryptoPaymentService.validateWalletAddress(address);
        
        res.json({
            success: true,
            isValid: isValid,
            address: address,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Validate address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate address',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 