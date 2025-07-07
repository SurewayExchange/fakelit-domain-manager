const Web3 = require('web3');
const crypto = require('crypto');

class CryptoPaymentService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.walletAddress = '0xB7f814EbE3B4f0e838470E60869d75B977a6E3c2';
        this.supportedTokens = {
            ETH: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
                address: null // Native token
            },
            USDT: {
                name: 'Tether USD',
                symbol: 'USDT',
                decimals: 6,
                address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' // Mainnet USDT
            },
            USDC: {
                name: 'USD Coin',
                symbol: 'USDC',
                decimals: 6,
                address: '0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C' // Mainnet USDC
            }
        };
        
        this.paymentHistory = [];
        this.pendingPayments = new Map();
        
        // Initialize Web3 (will be set by client)
        this.web3 = null;
        this.networkId = null;
        
        console.log('✅ Crypto payment service initialized');
        console.log(`🏦 Fakelit.com wallet: ${this.walletAddress}`);
    }

    // Initialize Web3 connection
    initializeWeb3(provider) {
        try {
            this.web3 = new Web3(provider);
            console.log('✅ Web3 connection established');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Web3:', error);
            return false;
        }
    }

    // Get network information
    async getNetworkInfo() {
        try {
            if (!this.web3) {
                throw new Error('Web3 not initialized');
            }

            const networkId = await this.web3.eth.net.getId();
            const networkType = await this.web3.eth.net.getNetworkType();
            
            this.networkId = networkId;
            
            return {
                networkId,
                networkType,
                isMainnet: networkId === 1,
                isTestnet: networkId !== 1,
                poweredBy: this.brandName
            };
        } catch (error) {
            console.error('❌ Failed to get network info:', error);
            return null;
        }
    }

    // Get account balance
    async getAccountBalance(address) {
        try {
            if (!this.web3) {
                throw new Error('Web3 not initialized');
            }

            const balance = await this.web3.eth.getBalance(address);
            const ethBalance = this.web3.utils.fromWei(balance, 'ether');
            
            return {
                address,
                balance: balance,
                ethBalance: parseFloat(ethBalance),
                poweredBy: this.brandName
            };
        } catch (error) {
            console.error('❌ Failed to get account balance:', error);
            return null;
        }
    }

    // Create payment request
    createPaymentRequest(amount, currency = 'USD', token = 'ETH') {
        try {
            const paymentId = crypto.randomBytes(16).toString('hex');
            const timestamp = Date.now();
            
            // Convert USD to token amount (simplified conversion)
            let tokenAmount;
            if (token === 'ETH') {
                // Simplified ETH conversion (in production, use real-time rates)
                tokenAmount = amount * 0.0004; // Approximate ETH rate
            } else if (token === 'USDT' || token === 'USDC') {
                tokenAmount = amount; // 1:1 for stablecoins
            } else {
                tokenAmount = amount * 0.0004; // Default to ETH rate
            }

            const paymentRequest = {
                id: paymentId,
                amount: amount,
                currency: currency,
                token: token,
                tokenAmount: tokenAmount,
                tokenDecimals: this.supportedTokens[token]?.decimals || 18,
                walletAddress: this.walletAddress,
                timestamp: timestamp,
                expiresAt: timestamp + (30 * 60 * 1000), // 30 minutes
                status: 'pending',
                poweredBy: this.brandName
            };

            this.pendingPayments.set(paymentId, paymentRequest);
            
            console.log(`✅ Payment request created: ${paymentId}`);
            return paymentRequest;
        } catch (error) {
            console.error('❌ Failed to create payment request:', error);
            return null;
        }
    }

    // Process crypto payment
    async processPayment(paymentId, fromAddress, transactionHash) {
        try {
            const paymentRequest = this.pendingPayments.get(paymentId);
            if (!paymentRequest) {
                throw new Error('Payment request not found');
            }

            if (paymentRequest.status !== 'pending') {
                throw new Error('Payment already processed');
            }

            if (Date.now() > paymentRequest.expiresAt) {
                throw new Error('Payment request expired');
            }

            // Verify transaction (simplified - in production, verify on blockchain)
            const payment = {
                ...paymentRequest,
                fromAddress: fromAddress,
                transactionHash: transactionHash,
                processedAt: Date.now(),
                status: 'completed',
                poweredBy: this.brandName
            };

            // Move from pending to completed
            this.pendingPayments.delete(paymentId);
            this.paymentHistory.push(payment);

            console.log(`✅ Payment processed: ${paymentId}`);
            return payment;
        } catch (error) {
            console.error('❌ Failed to process payment:', error);
            throw error;
        }
    }

    // Get payment status
    getPaymentStatus(paymentId) {
        try {
            // Check pending payments
            const pendingPayment = this.pendingPayments.get(paymentId);
            if (pendingPayment) {
                return {
                    ...pendingPayment,
                    isExpired: Date.now() > pendingPayment.expiresAt
                };
            }

            // Check completed payments
            const completedPayment = this.paymentHistory.find(p => p.id === paymentId);
            if (completedPayment) {
                return completedPayment;
            }

            return null;
        } catch (error) {
            console.error('❌ Failed to get payment status:', error);
            return null;
        }
    }

    // Get payment history
    getPaymentHistory(filters = {}) {
        try {
            let payments = [...this.paymentHistory];

            // Apply filters
            if (filters.status) {
                payments = payments.filter(p => p.status === filters.status);
            }
            if (filters.fromAddress) {
                payments = payments.filter(p => p.fromAddress === filters.fromAddress);
            }
            if (filters.token) {
                payments = payments.filter(p => p.token === filters.token);
            }
            if (filters.startDate) {
                payments = payments.filter(p => p.processedAt >= filters.startDate);
            }
            if (filters.endDate) {
                payments = payments.filter(p => p.processedAt <= filters.endDate);
            }

            return {
                payments: payments,
                count: payments.length,
                totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
                poweredBy: this.brandName
            };
        } catch (error) {
            console.error('❌ Failed to get payment history:', error);
            return { payments: [], count: 0, totalAmount: 0 };
        }
    }

    // Get supported tokens
    getSupportedTokens() {
        return {
            tokens: this.supportedTokens,
            walletAddress: this.walletAddress,
            poweredBy: this.brandName
        };
    }

    // Validate wallet address
    validateWalletAddress(address) {
        try {
            if (!this.web3) {
                return this.web3.utils.isAddress(address);
            }
            return this.web3.utils.isAddress(address);
        } catch (error) {
            return false;
        }
    }

    // Get gas estimate for transaction
    async estimateGas(fromAddress, toAddress, amount, token = 'ETH') {
        try {
            if (!this.web3) {
                throw new Error('Web3 not initialized');
            }

            let gasEstimate;
            if (token === 'ETH') {
                // Estimate gas for ETH transfer
                gasEstimate = await this.web3.eth.estimateGas({
                    from: fromAddress,
                    to: toAddress,
                    value: this.web3.utils.toWei(amount.toString(), 'ether')
                });
            } else {
                // Estimate gas for token transfer (ERC-20)
                const tokenContract = this.supportedTokens[token];
                if (!tokenContract) {
                    throw new Error('Unsupported token');
                }

                // Simplified gas estimate for token transfers
                gasEstimate = 65000; // Approximate gas for ERC-20 transfer
            }

            return {
                gasEstimate: gasEstimate,
                gasPrice: await this.web3.eth.getGasPrice(),
                estimatedCost: this.web3.utils.fromWei(
                    (BigInt(gasEstimate) * BigInt(await this.web3.eth.getGasPrice())).toString(),
                    'ether'
                ),
                poweredBy: this.brandName
            };
        } catch (error) {
            console.error('❌ Failed to estimate gas:', error);
            return null;
        }
    }

    // Generate QR code data for payment
    generatePaymentQR(paymentRequest) {
        try {
            const qrData = {
                type: 'crypto-payment',
                paymentId: paymentRequest.id,
                amount: paymentRequest.tokenAmount,
                token: paymentRequest.token,
                walletAddress: paymentRequest.walletAddress,
                brand: this.brandName,
                timestamp: paymentRequest.timestamp
            };

            return {
                qrData: JSON.stringify(qrData),
                qrUrl: `https://fakelit.com/pay/${paymentRequest.id}`,
                poweredBy: this.brandName
            };
        } catch (error) {
            console.error('❌ Failed to generate QR code:', error);
            return null;
        }
    }

    // Get payment statistics
    getPaymentStats() {
        try {
            const completedPayments = this.paymentHistory.filter(p => p.status === 'completed');
            const pendingPayments = this.pendingPayments.size;

            const stats = {
                totalPayments: completedPayments.length,
                pendingPayments: pendingPayments,
                totalAmount: completedPayments.reduce((sum, p) => sum + p.amount, 0),
                averageAmount: completedPayments.length > 0 ? 
                    completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length : 0,
                tokensUsed: [...new Set(completedPayments.map(p => p.token))],
                poweredBy: this.brandName
            };

            return stats;
        } catch (error) {
            console.error('❌ Failed to get payment stats:', error);
            return null;
        }
    }

    // Refund payment (admin function)
    async refundPayment(paymentId, reason) {
        try {
            const payment = this.paymentHistory.find(p => p.id === paymentId);
            if (!payment) {
                throw new Error('Payment not found');
            }

            if (payment.status !== 'completed') {
                throw new Error('Payment not completed');
            }

            // Create refund record
            const refund = {
                id: `REF-${Date.now()}`,
                originalPaymentId: paymentId,
                amount: payment.amount,
                token: payment.token,
                tokenAmount: payment.tokenAmount,
                fromAddress: payment.fromAddress,
                toAddress: payment.walletAddress,
                reason: reason,
                refundedAt: Date.now(),
                status: 'pending',
                poweredBy: this.brandName
            };

            // In production, this would initiate the actual refund transaction
            console.log(`🔄 Refund initiated: ${refund.id}`);
            return refund;
        } catch (error) {
            console.error('❌ Failed to refund payment:', error);
            throw error;
        }
    }
}

module.exports = CryptoPaymentService; 