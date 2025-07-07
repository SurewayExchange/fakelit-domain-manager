/**
 * 💳 Fakelit.com - NMI Payment Processing Service
 * Handles NMI payment gateway and terminal processing for auto-scaling operations
 * Powered by: Fakelit.com
 */

const axios = require('axios');
const crypto = require('crypto');

class FakelitNMIPaymentService {
    constructor(config) {
        this.config = config;
        this.nmiConfig = config.payment.gateways.nmi;
        this.paymentLogs = [];
        this.terminals = config.payment.terminals.nmiTerminals;
        this.initialize();
    }

    initialize() {
        console.log('💳 Fakelit.com - NMI Payment Service Initialized');
        console.log('🏢 Powered by: Fakelit.com');
        console.log(`💰 Currency: ${this.nmiConfig.currency.toUpperCase()}`);
        console.log(`🌐 Environment: ${this.nmiConfig.environment}`);
        console.log(`📊 Base Price: $${this.nmiConfig.scalingPricing.basePrice}`);
        console.log(`🏪 Per Site Price: $${this.nmiConfig.scalingPricing.perSitePrice}`);
        console.log(`⚡ Scaling Fee: $${this.nmiConfig.scalingPricing.scalingFee}`);
        console.log(`🏪 Terminals Available: ${this.terminals.length}`);
        this.terminals.forEach(terminal => {
            console.log(`   - ${terminal.name} (${terminal.location}) - ${terminal.status}`);
        });
        console.log('');
    }

    async calculateScalingCost(currentSites, targetSites) {
        const additionalSites = targetSites - currentSites;
        const baseCost = this.nmiConfig.scalingPricing.basePrice;
        const perSiteCost = additionalSites * this.nmiConfig.scalingPricing.perSitePrice;
        const scalingFee = this.nmiConfig.scalingPricing.scalingFee;
        
        const totalCost = baseCost + perSiteCost + scalingFee;
        
        return {
            currentSites,
            targetSites,
            additionalSites,
            baseCost,
            perSiteCost,
            scalingFee,
            totalCost,
            currency: this.nmiConfig.currency
        };
    }

    async createTransaction(scalingCost, paymentMethod = 'credit_card', terminalId = null) {
        try {
            console.log('💳 Creating NMI transaction for auto-scaling...');
            console.log(`📊 Scaling from ${scalingCost.currentSites} to ${scalingCost.targetSites} sites`);
            console.log(`💰 Total cost: $${scalingCost.totalCost.toFixed(2)} ${scalingCost.currency.toUpperCase()}`);

            const transactionData = {
                username: this.nmiConfig.username,
                password: this.nmiConfig.password,
                type: 'sale',
                amount: scalingCost.totalCost.toFixed(2),
                currency: scalingCost.currency,
                payment_method: paymentMethod,
                description: `Fakelit.com Auto-Scaling: ${scalingCost.currentSites} → ${scalingCost.targetSites} Magento sites`,
                orderid: `FAKELIT_SCALING_${Date.now()}`,
                customer_vault_id: null,
                billing: {
                    firstname: 'Fakelit',
                    lastname: 'Customer',
                    company: 'Fakelit.com',
                    address1: 'Auto-Scaling Service',
                    city: 'Digital',
                    state: 'CA',
                    zip: '90210',
                    country: 'US',
                    phone: '555-0123',
                    email: 'admin@fakelit.com'
                },
                shipping: {
                    firstname: 'Fakelit',
                    lastname: 'Customer',
                    company: 'Fakelit.com',
                    address1: 'Auto-Scaling Service',
                    city: 'Digital',
                    state: 'CA',
                    zip: '90210',
                    country: 'US'
                },
                custom_fields: {
                    scaling_current: scalingCost.currentSites.toString(),
                    scaling_target: scalingCost.targetSites.toString(),
                    scaling_additional: scalingCost.additionalSites.toString(),
                    service: 'Fakelit.com Auto-Scaling'
                }
            };

            // Add terminal ID if specified
            if (terminalId) {
                transactionData.terminal_id = terminalId;
            }

            const response = await this.makeNMIApiCall(transactionData);
            
            if (response.response === '1') {
                console.log('✅ NMI transaction created successfully');
                console.log(`🆔 Transaction ID: ${response.transactionid}`);
                console.log(`💰 Amount: $${scalingCost.totalCost.toFixed(2)} ${scalingCost.currency.toUpperCase()}`);

                await this.logPayment('NMI_TRANSACTION_CREATED', {
                    transactionId: response.transactionid,
                    authCode: response.authcode,
                    amount: scalingCost.totalCost,
                    currency: scalingCost.currency,
                    scalingDetails: scalingCost,
                    terminalId: terminalId
                });

                return {
                    success: true,
                    transactionId: response.transactionid,
                    authCode: response.authcode,
                    amount: scalingCost.totalCost,
                    response: response
                };
            } else {
                throw new Error(`NMI Error: ${response.responsetext}`);
            }

        } catch (error) {
            console.error('❌ Failed to create NMI transaction:', error.message);
            await this.logPayment('NMI_TRANSACTION_FAILED', {
                error: error.message,
                scalingDetails: scalingCost
            });
            throw error;
        }
    }

    async makeNMIApiCall(data) {
        try {
            const apiUrl = this.nmiConfig.environment === 'live' 
                ? 'https://secure.networkmerchants.com/api/transact.php'
                : 'https://secure.networkmerchants.com/api/transact.php';

            const response = await axios.post(apiUrl, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 30000
            });

            // Parse NMI response
            const responseData = {};
            const responseText = response.data;
            const lines = responseText.split('\n');
            
            lines.forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    responseData[key.trim()] = value.trim();
                }
            });

            return responseData;

        } catch (error) {
            console.error('❌ NMI API call failed:', error.message);
            throw error;
        }
    }

    async processTerminalPayment(scalingCost, terminalId) {
        try {
            console.log(`🏪 Processing terminal payment: ${terminalId}`);

            // Find terminal
            const terminal = this.terminals.find(t => t.id === terminalId);
            if (!terminal) {
                throw new Error(`Terminal not found: ${terminalId}`);
            }

            if (terminal.status !== 'active') {
                throw new Error(`Terminal not active: ${terminalId}`);
            }

            // Create terminal transaction
            const transaction = await this.createTransaction(scalingCost, 'terminal', terminalId);

            await this.logPayment('TERMINAL_PAYMENT_PROCESSED', {
                terminalId: terminalId,
                terminalName: terminal.name,
                terminalLocation: terminal.location,
                transactionId: transaction.transactionId,
                amount: scalingCost.totalCost
            });

            return transaction;

        } catch (error) {
            console.error('❌ Terminal payment failed:', error.message);
            await this.logPayment('TERMINAL_PAYMENT_FAILED', {
                terminalId: terminalId,
                error: error.message,
                scalingDetails: scalingCost
            });
            throw error;
        }
    }

    async refundTransaction(transactionId, reason = 'Auto-scaling failed') {
        try {
            console.log(`🔄 Processing NMI refund: ${transactionId}`);

            const refundData = {
                username: this.nmiConfig.username,
                password: this.nmiConfig.password,
                type: 'refund',
                transactionid: transactionId,
                reason: reason
            };

            const response = await this.makeNMIApiCall(refundData);

            if (response.response === '1') {
                await this.logPayment('NMI_REFUND_PROCESSED', {
                    originalTransactionId: transactionId,
                    refundTransactionId: response.transactionid,
                    amount: response.amount,
                    reason: reason
                });

                console.log(`✅ NMI refund processed: ${response.transactionid}`);
                return {
                    success: true,
                    refundTransactionId: response.transactionid,
                    amount: response.amount
                };
            } else {
                throw new Error(`Refund failed: ${response.responsetext}`);
            }

        } catch (error) {
            console.error('❌ NMI refund failed:', error.message);
            await this.logPayment('NMI_REFUND_FAILED', {
                transactionId: transactionId,
                error: error.message,
                reason: reason
            });
            throw error;
        }
    }

    async createCustomer(email, name = 'Fakelit.com Customer') {
        try {
            console.log(`👤 Creating NMI customer: ${email}`);

            const customerData = {
                username: this.nmiConfig.username,
                password: this.nmiConfig.password,
                type: 'add_customer',
                firstname: name.split(' ')[0] || name,
                lastname: name.split(' ').slice(1).join(' ') || '',
                email: email,
                phone: '555-0123',
                company: 'Fakelit.com',
                address1: 'Auto-Scaling Service',
                city: 'Digital',
                state: 'CA',
                zip: '90210',
                country: 'US'
            };

            const response = await this.makeNMIApiCall(customerData);

            if (response.response === '1') {
                console.log(`✅ NMI customer created: ${response.customer_vault_id}`);
                return {
                    customerVaultId: response.customer_vault_id,
                    success: true
                };
            } else {
                throw new Error(`Customer creation failed: ${response.responsetext}`);
            }

        } catch (error) {
            console.error('❌ Failed to create NMI customer:', error.message);
            throw error;
        }
    }

    async getTerminalStatus(terminalId) {
        try {
            const terminal = this.terminals.find(t => t.id === terminalId);
            if (!terminal) {
                throw new Error(`Terminal not found: ${terminalId}`);
            }

            return {
                id: terminal.id,
                name: terminal.name,
                location: terminal.location,
                status: terminal.status,
                lastCheck: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Failed to get terminal status:', error.message);
            throw error;
        }
    }

    async getAllTerminals() {
        return this.terminals.map(terminal => ({
            id: terminal.id,
            name: terminal.name,
            location: terminal.location,
            status: terminal.status
        }));
    }

    async logPayment(event, data) {
        const paymentLog = {
            timestamp: new Date().toISOString(),
            event: event,
            data: data,
            service: 'Fakelit.com NMI Auto-Scaling',
            gateway: 'NMI'
        };

        this.paymentLogs.push(paymentLog);

        try {
            const fs = require('fs').promises;
            await fs.writeFile(
                this.config.monitoring.nmiLogFile,
                JSON.stringify(this.paymentLogs, null, 2)
            );
        } catch (error) {
            console.error('❌ Failed to save NMI payment log:', error.message);
        }
    }

    async getPaymentHistory() {
        return this.paymentLogs;
    }

    async generateReceipt(transactionId) {
        try {
            console.log(`📄 Generating NMI receipt for: ${transactionId}`);

            const receiptData = {
                username: this.nmiConfig.username,
                password: this.nmiConfig.password,
                type: 'get_transaction_details',
                transactionid: transactionId
            };

            const response = await this.makeNMIApiCall(receiptData);

            if (response.response === '1') {
                const receipt = {
                    transactionId: response.transactionid,
                    amount: response.amount,
                    currency: response.currency,
                    authCode: response.authcode,
                    orderId: response.orderid,
                    description: response.description,
                    timestamp: new Date().toISOString(),
                    service: 'Fakelit.com Auto-Scaling'
                };

                console.log(`✅ Receipt generated for: ${transactionId}`);
                return receipt;
            } else {
                throw new Error(`Receipt generation failed: ${response.responsetext}`);
            }

        } catch (error) {
            console.error('❌ Failed to generate receipt:', error.message);
            throw error;
        }
    }

    async testConnection() {
        try {
            console.log('🔍 Testing NMI connection...');

            const testData = {
                username: this.nmiConfig.username,
                password: this.nmiConfig.password,
                type: 'ping'
            };

            const response = await this.makeNMIApiCall(testData);

            if (response.response === '1') {
                console.log('✅ NMI connection successful');
                return true;
            } else {
                throw new Error(`Connection test failed: ${response.responsetext}`);
            }

        } catch (error) {
            console.error('❌ NMI connection test failed:', error.message);
            return false;
        }
    }
}

module.exports = FakelitNMIPaymentService; 