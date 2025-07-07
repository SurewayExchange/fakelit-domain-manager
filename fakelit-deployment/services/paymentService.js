/**
 * 💳 Fakelit.com Payment Service
 * Handles payment processing for domain management services using NMI + Magento
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class PaymentService {
    constructor() {
        this.nmiConfig = {
            gatewayId: process.env.NMI_GATEWAY_ID,
            username: process.env.NMI_USERNAME,
            password: process.env.NMI_PASSWORD,
            endpoint: process.env.NMI_ENDPOINT || 'https://secure.networkmerchants.com/api/transact.php'
        };
        
        this.magentoConfig = {
            baseUrl: process.env.MAGENTO_BASE_URL,
            consumerKey: process.env.MAGENTO_CONSUMER_KEY,
            consumerSecret: process.env.MAGENTO_CONSUMER_SECRET,
            accessToken: process.env.MAGENTO_ACCESS_TOKEN,
            accessTokenSecret: process.env.MAGENTO_ACCESS_TOKEN_SECRET
        };
        
        this.services = {
            'domain-registration': {
                name: 'Domain Registration',
                description: 'Professional domain registration service via Tucows/Enom',
                price: 1500, // $15.00 in cents
                currency: 'USD',
                features: [
                    'Domain registration for 1 year',
                    'DNS management via Cloudways',
                    'SSL certificate included',
                    '24/7 Fakelit.com support',
                    'Professional branding'
                ],
                magentoProductId: 'domain_registration'
            },
            'domain-management': {
                name: 'Domain Management',
                description: 'Complete domain management solution',
                price: 2500, // $25.00 in cents
                currency: 'USD',
                features: [
                    'Unlimited domain management',
                    'Automated DNS configuration',
                    'SSL certificate management',
                    'Domain transfer assistance',
                    'Professional support',
                    'Analytics dashboard'
                ],
                magentoProductId: 'domain_management'
            },
            'premium-support': {
                name: 'Premium Support',
                description: 'Priority support and consultation',
                price: 5000, // $50.00 in cents
                currency: 'USD',
                features: [
                    'Priority 24/7 support',
                    'Dedicated account manager',
                    'Custom domain strategies',
                    'Migration assistance',
                    'Performance optimization',
                    'Security consultation'
                ],
                magentoProductId: 'premium_support'
            },
            'enterprise-package': {
                name: 'Enterprise Package',
                description: 'Complete enterprise domain solution',
                price: 15000, // $150.00 in cents
                currency: 'USD',
                features: [
                    'Unlimited domains',
                    'Custom branding',
                    'API access',
                    'White-label solution',
                    'Dedicated support team',
                    'Custom integrations',
                    'Advanced analytics',
                    'Compliance reporting'
                ],
                magentoProductId: 'enterprise_package'
            }
        };
    }

    /**
     * Get all available services
     */
    async getServices() {
        try {
            return {
                success: true,
                data: {
                    services: this.services,
                    poweredBy: 'Fakelit.com',
                    paymentGateway: 'NMI + Magento'
                }
            };
        } catch (error) {
            console.error('Payment service error:', error);
            return {
                success: false,
                error: 'Failed to retrieve services'
            };
        }
    }

    /**
     * Get service details by ID
     */
    async getService(serviceId) {
        try {
            const service = this.services[serviceId];
            if (!service) {
                return {
                    success: false,
                    error: 'Service not found'
                };
            }

            return {
                success: true,
                data: {
                    service: {
                        ...service,
                        id: serviceId
                    },
                    poweredBy: 'Fakelit.com',
                    paymentGateway: 'NMI + Magento'
                }
            };
        } catch (error) {
            console.error('Get service error:', error);
            return {
                success: false,
                error: 'Failed to retrieve service'
            };
        }
    }

    /**
     * Create payment transaction via NMI
     */
    async createPayment(serviceId, customerData, paymentData) {
        try {
            const service = this.services[serviceId];
            if (!service) {
                return {
                    success: false,
                    error: 'Service not found'
                };
            }

            // Create NMI transaction
            const nmiTransaction = await this.processNMICharge({
                amount: service.price / 100, // Convert cents to dollars
                currency: service.currency,
                customer: customerData,
                payment: paymentData,
                service: service
            });

            if (!nmiTransaction.success) {
                return nmiTransaction;
            }

            // Create Magento order
            const magentoOrder = await this.createMagentoOrder({
                service: service,
                customer: customerData,
                nmiTransaction: nmiTransaction.data
            });

            if (!magentoOrder.success) {
                return magentoOrder;
            }

            // Create service activation
            const activation = await this.createServiceActivation({
                serviceId: serviceId,
                customerEmail: customerData.email,
                amount: service.price,
                currency: service.currency,
                nmiTransactionId: nmiTransaction.data.transaction_id,
                magentoOrderId: magentoOrder.data.order_id,
                status: 'active'
            });

            return {
                success: true,
                data: {
                    transaction: nmiTransaction.data,
                    order: magentoOrder.data,
                    activation: activation,
                    poweredBy: 'Fakelit.com'
                }
            };
        } catch (error) {
            console.error('Create payment error:', error);
            return {
                success: false,
                error: 'Payment processing failed'
            };
        }
    }

    /**
     * Process payment through NMI gateway
     */
    async processNMICharge(transactionData) {
        try {
            const nmiPayload = {
                gateway_id: this.nmiConfig.gatewayId,
                username: this.nmiConfig.username,
                password: this.nmiConfig.password,
                type: 'sale',
                amount: transactionData.amount,
                currency: transactionData.currency,
                firstname: transactionData.customer.firstName,
                lastname: transactionData.customer.lastName,
                email: transactionData.customer.email,
                ccnumber: transactionData.payment.cardNumber,
                ccexp: transactionData.payment.expiryDate,
                cvv: transactionData.payment.cvv,
                address1: transactionData.customer.address || '',
                city: transactionData.customer.city || '',
                state: transactionData.customer.state || '',
                zip: transactionData.customer.zipCode || '',
                country: transactionData.customer.country || 'US',
                description: `Fakelit.com - ${transactionData.service.name}`,
                orderid: `FAKELIT_${Date.now()}_${uuidv4().substr(0, 8)}`
            };

            const response = await axios.post(this.nmiConfig.endpoint, nmiPayload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const result = this.parseNMIResponse(response.data);

            if (result.response === '1') {
                return {
                    success: true,
                    data: {
                        transaction_id: result.transactionid,
                        auth_code: result.authcode,
                        response_code: result.response,
                        response_text: result.responsetext,
                        amount: transactionData.amount,
                        currency: transactionData.currency,
                        poweredBy: 'Fakelit.com'
                    }
                };
            } else {
                return {
                    success: false,
                    error: result.responsetext || 'Payment declined'
                };
            }
        } catch (error) {
            console.error('NMI transaction error:', error);
            return {
                success: false,
                error: 'Payment gateway error'
            };
        }
    }

    /**
     * Parse NMI response
     */
    parseNMIResponse(responseText) {
        const lines = responseText.split('\n');
        const result = {};
        
        lines.forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                result[key.trim()] = value.trim();
            }
        });
        
        return result;
    }

    /**
     * Create Magento order
     */
    async createMagentoOrder(orderData) {
        try {
            const magentoPayload = {
                order: {
                    customer_email: orderData.customer.email,
                    customer_firstname: orderData.customer.firstName,
                    customer_lastname: orderData.customer.lastName,
                    items: [{
                        product_id: orderData.service.magentoProductId,
                        qty: 1,
                        price: orderData.service.price / 100
                    }],
                    payment: {
                        method: 'nmi',
                        transaction_id: orderData.nmiTransaction.transaction_id
                    },
                    billing_address: {
                        firstname: orderData.customer.firstName,
                        lastname: orderData.customer.lastName,
                        email: orderData.customer.email,
                        street: [orderData.customer.address || ''],
                        city: orderData.customer.city || '',
                        region: orderData.customer.state || '',
                        postcode: orderData.customer.zipCode || '',
                        country_id: orderData.customer.country || 'US'
                    }
                }
            };

            const response = await axios.post(
                `${this.magentoConfig.baseUrl}/rest/V1/orders`,
                magentoPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.magentoConfig.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: {
                    order_id: response.data.entity_id,
                    order_number: response.data.increment_id,
                    status: response.data.status,
                    poweredBy: 'Fakelit.com'
                }
            };
        } catch (error) {
            console.error('Magento order creation error:', error);
            return {
                success: false,
                error: 'Order creation failed'
            };
        }
    }

    /**
     * Create service activation record
     */
    async createServiceActivation(activationData) {
        try {
            const activation = {
                id: uuidv4(),
                ...activationData,
                createdAt: new Date().toISOString(),
                expiresAt: this.calculateExpiryDate(activationData.serviceId),
                poweredBy: 'Fakelit.com',
                paymentGateway: 'NMI + Magento'
            };

            // In a real application, save to database
            console.log('Service activation created:', activation);
            
            return activation;
        } catch (error) {
            console.error('Create service activation error:', error);
            throw error;
        }
    }

    /**
     * Calculate service expiry date
     */
    calculateExpiryDate(serviceId) {
        const now = new Date();
        const expiryDate = new Date(now);
        
        switch (serviceId) {
            case 'domain-registration':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year
                break;
            case 'domain-management':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year
                break;
            case 'premium-support':
                expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months
                break;
            case 'enterprise-package':
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year
                break;
            default:
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Default 1 year
        }
        
        return expiryDate.toISOString();
    }

    /**
     * Get customer's active services
     */
    async getCustomerServices(customerEmail) {
        try {
            // Query Magento for customer orders
            const response = await axios.get(
                `${this.magentoConfig.baseUrl}/rest/V1/customers/search?searchCriteria[filterGroups][0][filters][0][field]=email&searchCriteria[filterGroups][0][filters][0][value]=${customerEmail}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.magentoConfig.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.items.length === 0) {
                return {
                    success: true,
                    data: {
                        services: [],
                        poweredBy: 'Fakelit.com'
                    }
                };
            }

            const customerId = response.data.items[0].id;
            
            // Get customer orders
            const ordersResponse = await axios.get(
                `${this.magentoConfig.baseUrl}/rest/V1/orders?searchCriteria[filterGroups][0][filters][0][field]=customer_id&searchCriteria[filterGroups][0][filters][0][value]=${customerId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.magentoConfig.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const services = ordersResponse.data.items.map(order => ({
                id: uuidv4(),
                orderId: order.entity_id,
                orderNumber: order.increment_id,
                status: order.status,
                createdAt: order.created_at,
                poweredBy: 'Fakelit.com'
            }));

            return {
                success: true,
                data: {
                    services: services,
                    poweredBy: 'Fakelit.com'
                }
            };
        } catch (error) {
            console.error('Get customer services error:', error);
            return {
                success: false,
                error: 'Failed to retrieve customer services'
            };
        }
    }

    /**
     * Get payment history for customer
     */
    async getPaymentHistory(customerEmail) {
        try {
            // Query NMI for transaction history
            const nmiPayload = {
                gateway_id: this.nmiConfig.gatewayId,
                username: this.nmiConfig.username,
                password: this.nmiConfig.password,
                type: 'query',
                email: customerEmail
            };

            const response = await axios.post(this.nmiConfig.endpoint, nmiPayload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const result = this.parseNMIResponse(response.data);

            if (result.response === '1') {
                const transactions = this.parseNMIQueryResponse(response.data);
                return {
                    success: true,
                    data: {
                        transactions: transactions,
                        poweredBy: 'Fakelit.com'
                    }
                };
            } else {
                return {
                    success: true,
                    data: {
                        transactions: [],
                        poweredBy: 'Fakelit.com'
                    }
                };
            }
        } catch (error) {
            console.error('Get payment history error:', error);
            return {
                success: false,
                error: 'Failed to retrieve payment history'
            };
        }
    }

    /**
     * Parse NMI query response
     */
    parseNMIQueryResponse(responseText) {
        // Parse NMI query response format
        const lines = responseText.split('\n');
        const transactions = [];
        let currentTransaction = {};
        
        lines.forEach(line => {
            if (line.startsWith('transactionid=')) {
                if (Object.keys(currentTransaction).length > 0) {
                    transactions.push(currentTransaction);
                }
                currentTransaction = {};
            }
            
            const [key, value] = line.split('=');
            if (key && value) {
                currentTransaction[key.trim()] = value.trim();
            }
        });
        
        if (Object.keys(currentTransaction).length > 0) {
            transactions.push(currentTransaction);
        }
        
        return transactions.map(tx => ({
            id: tx.transactionid,
            amount: tx.amount,
            currency: tx.currency || 'USD',
            status: tx.response === '1' ? 'approved' : 'declined',
            date: tx.date,
            description: tx.description,
            poweredBy: 'Fakelit.com'
        }));
    }
}

module.exports = PaymentService; 