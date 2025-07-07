#!/usr/bin/env node

/**
 * 🌐 Fakelit.com - Auto Scaling Monitor
 * Automatically scales server capacity from 50 to 150 Magento websites
 * Powered by: Fakelit.com
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const FakelitUnifiedPaymentService = require('./services/unifiedPaymentService');

class FakelitAutoScalingMonitor {
    constructor() {
        this.config = {
            cloudways: {
                email: process.env.CLOUDWAYS_EMAIL,
                apiKey: process.env.CLOUDWAYS_API_KEY,
                serverId: process.env.CLOUDWAYS_SERVER_ID
            },
            scaling: {
                currentLimit: 50,
                targetLimit: 150,
                checkInterval: 300000, // 5 minutes
                scalingThreshold: 45, // Scale when 45+ apps detected
                maxRetries: 3,
                retryDelay: 30000, // 30 seconds
                requirePayment: true,
                autoCharge: true,
                paymentMethod: 'auto'
            },
            monitoring: {
                logFile: 'fakelit-scaling-logs.json',
                alertFile: 'fakelit-scaling-alerts.json'
            }
        };
        
        this.isScaling = false;
        this.lastCheck = null;
        this.scalingHistory = [];
        this.paymentService = null;
    }

    async initialize() {
        console.log('🌐 Fakelit.com - Auto Scaling Monitor');
        console.log('=====================================');
        console.log('🏢 Powered by: Fakelit.com');
        console.log('💳 Multi-Gateway Payment Processing: NMI + Stripe');
        console.log('📊 Monitoring server capacity...');
        console.log(`🎯 Current limit: ${this.config.scaling.currentLimit} Magento websites`);
        console.log(`🎯 Target limit: ${this.config.scaling.targetLimit} Magento websites`);
        console.log(`⏰ Check interval: ${this.config.scaling.checkInterval / 1000} seconds`);
        console.log('');

        // Load configuration
        await this.loadConfiguration();
        
        // Initialize payment service
        this.initializePaymentService();
        
        // Load existing scaling history
        await this.loadScalingHistory();
        
        // Start monitoring
        this.startMonitoring();
    }

    async loadConfiguration() {
        try {
            const fs = require('fs').promises;
            const configData = await fs.readFile('fakelit-auto-scaling-config.json', 'utf8');
            const config = JSON.parse(configData);
            
            // Update config with loaded values
            this.config = {
                ...this.config,
                cloudways: config.cloudways,
                scaling: { ...this.config.scaling, ...config.scaling },
                monitoring: config.monitoring,
                payment: config.payment
            };
            
            console.log('✅ Configuration loaded with multi-gateway payment settings');
        } catch (error) {
            console.log('⚠️ Using default configuration (no payment processing)');
        }
    }

    initializePaymentService() {
        if (this.config.payment) {
            try {
                this.paymentService = new FakelitUnifiedPaymentService(this.config);
                console.log('💳 Unified payment service initialized');
                
                // Show available gateways
                const gateways = this.paymentService.getAvailableGateways();
                console.log('🔄 Available Payment Gateways:');
                gateways.forEach(gateway => {
                    console.log(`   ✅ ${gateway.name} (${gateway.id})`);
                    if (gateway.terminals) {
                        console.log(`      🏪 Terminals: Available`);
                    }
                });
                
            } catch (error) {
                console.error('❌ Failed to initialize payment service:', error.message);
                this.paymentService = null;
            }
        } else {
            console.log('⚠️ Payment processing disabled (no payment config)');
        }
    }

    async loadScalingHistory() {
        try {
            const historyData = await fs.readFile(this.config.monitoring.logFile, 'utf8');
            this.scalingHistory = JSON.parse(historyData);
            console.log(`📚 Loaded ${this.scalingHistory.length} scaling events from history`);
        } catch (error) {
            console.log('📚 No existing scaling history found, starting fresh');
            this.scalingHistory = [];
        }
    }

    async saveScalingHistory() {
        try {
            await fs.writeFile(
                this.config.monitoring.logFile,
                JSON.stringify(this.scalingHistory, null, 2)
            );
        } catch (error) {
            console.error('❌ Failed to save scaling history:', error.message);
        }
    }

    async checkServerCapacity() {
        try {
            console.log(`\n🔍 Checking server capacity at ${new Date().toISOString()}`);
            
            const response = await axios.get(
                `https://api.cloudways.com/api/v1/server/${this.config.cloudways.serverId}/app`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.cloudways.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const applications = response.data.apps || [];
            const magentoApps = applications.filter(app => 
                app.application && app.application.name && 
                app.application.name.toLowerCase().includes('magento')
            );

            console.log(`📊 Total applications: ${applications.length}`);
            console.log(`🛒 Magento applications: ${magentoApps.length}`);
            console.log(`🎯 Current limit: ${this.config.scaling.currentLimit}`);

            // Check if scaling is needed
            if (magentoApps.length >= this.config.scaling.scalingThreshold && !this.isScaling) {
                console.log('🚨 Scaling threshold reached! Initiating auto-scaling...');
                await this.triggerAutoScaling(magentoApps.length);
            } else if (magentoApps.length < this.config.scaling.scalingThreshold) {
                console.log('✅ Server capacity within normal limits');
            }

            this.lastCheck = new Date();
            
        } catch (error) {
            console.error('❌ Failed to check server capacity:', error.message);
            await this.logAlert('CAPACITY_CHECK_FAILED', error.message);
        }
    }

    async triggerAutoScaling(currentCount) {
        if (this.isScaling) {
            console.log('⚠️ Scaling already in progress, skipping...');
            return;
        }

        this.isScaling = true;
        console.log('\n🚀 Initiating Fakelit.com Auto-Scaling Process');
        console.log('==============================================');

        try {
            // Log scaling event
            const scalingEvent = {
                timestamp: new Date().toISOString(),
                event: 'AUTO_SCALING_TRIGGERED',
                currentCount,
                currentLimit: this.config.scaling.currentLimit,
                targetLimit: this.config.scaling.targetLimit,
                status: 'IN_PROGRESS'
            };

            this.scalingHistory.push(scalingEvent);
            await this.saveScalingHistory();

            // Step 1: Calculate scaling cost
            console.log('💰 Step 1: Calculating scaling costs...');
            const scalingCost = await this.calculateScalingCost();
            console.log(`   Base Cost: $${scalingCost.baseCost}`);
            console.log(`   Per Site Cost: $${scalingCost.perSiteCost}`);
            console.log(`   Scaling Fee: $${scalingCost.scalingFee}`);
            console.log(`   Total Cost: $${scalingCost.totalCost}`);

            // Step 2: Process payment if required
            if (this.config.scaling.requirePayment && this.paymentService) {
                console.log('💳 Step 2: Processing payment...');
                const paymentResult = await this.processScalingPayment(scalingCost);
                
                if (!paymentResult.success) {
                    throw new Error(`Payment failed: ${paymentResult.error}`);
                }
                
                console.log(`✅ Payment processed successfully via ${paymentResult.gateway.toUpperCase()}`);
                scalingEvent.paymentId = paymentResult.result.transactionId || paymentResult.result.id;
                scalingEvent.paymentGateway = paymentResult.gateway;
            } else {
                console.log('⚠️ Payment processing skipped (disabled or no payment service)');
            }

            // Step 3: Check current server specs
            console.log('📋 Step 3: Checking current server specifications...');
            const serverSpecs = await this.getServerSpecifications();
            console.log(`   Current RAM: ${serverSpecs.ram}GB`);
            console.log(`   Current CPU: ${serverSpecs.cpu} vCPUs`);
            console.log(`   Current Storage: ${serverSpecs.storage}GB`);

            // Step 4: Calculate required specs for 150 Magento sites
            console.log('🧮 Step 4: Calculating required specifications...');
            const requiredSpecs = this.calculateRequiredSpecs(150);
            console.log(`   Required RAM: ${requiredSpecs.ram}GB`);
            console.log(`   Required CPU: ${requiredSpecs.cpu} vCPUs`);
            console.log(`   Required Storage: ${requiredSpecs.storage}GB`);

            // Step 5: Scale server
            console.log('⚡ Step 5: Scaling server...');
            const scalingResult = await this.scaleServer(requiredSpecs);
            
            if (scalingResult.success) {
                console.log('✅ Server scaling completed successfully!');
                
                // Update current limit
                this.config.scaling.currentLimit = this.config.scaling.targetLimit;
                
                // Log success
                scalingEvent.status = 'COMPLETED';
                scalingEvent.newSpecs = requiredSpecs;
                scalingEvent.scalingResult = scalingResult;
                scalingEvent.scalingCost = scalingCost;
                
                await this.logAlert('SCALING_SUCCESS', {
                    message: 'Server successfully scaled to 150 Magento websites',
                    newSpecs: requiredSpecs,
                    scalingCost: scalingCost,
                    paymentGateway: scalingEvent.paymentGateway,
                    timestamp: new Date().toISOString()
                });

                console.log('\n🎉 Fakelit.com Auto-Scaling Complete!');
                console.log('=====================================');
                console.log(`🏢 Server now supports ${this.config.scaling.currentLimit} Magento websites`);
                console.log(`💪 RAM: ${requiredSpecs.ram}GB`);
                console.log(`⚡ CPU: ${requiredSpecs.cpu} vCPUs`);
                console.log(`💾 Storage: ${requiredSpecs.storage}GB`);
                console.log(`💰 Total Cost: $${scalingCost.totalCost}`);
                if (scalingEvent.paymentGateway) {
                    console.log(`💳 Payment Gateway: ${scalingEvent.paymentGateway.toUpperCase()}`);
                }
                console.log('🌐 Powered by: Fakelit.com');

            } else {
                throw new Error(scalingResult.error);
            }

        } catch (error) {
            console.error('❌ Auto-scaling failed:', error.message);
            
            scalingEvent.status = 'FAILED';
            scalingEvent.error = error.message;
            
            // Attempt refund if payment was made
            if (scalingEvent.paymentId && this.paymentService) {
                try {
                    console.log('🔄 Attempting payment refund due to scaling failure...');
                    await this.paymentService.refundPayment(
                        scalingEvent.paymentId, 
                        scalingEvent.paymentGateway, 
                        'Auto-scaling failed'
                    );
                    console.log('✅ Payment refunded successfully');
                } catch (refundError) {
                    console.error('❌ Refund failed:', refundError.message);
                }
            }
            
            await this.logAlert('SCALING_FAILED', {
                message: 'Auto-scaling failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });

        } finally {
            this.isScaling = false;
            await this.saveScalingHistory();
        }
    }

    async calculateScalingCost() {
        if (!this.paymentService) {
            return {
                currentSites: this.config.scaling.currentLimit,
                targetSites: this.config.scaling.targetLimit,
                additionalSites: this.config.scaling.targetLimit - this.config.scaling.currentLimit,
                baseCost: 0,
                perSiteCost: 0,
                scalingFee: 0,
                totalCost: 0,
                currency: 'usd'
            };
        }

        return await this.paymentService.calculateScalingCost(
            this.config.scaling.currentLimit,
            this.config.scaling.targetLimit
        );
    }

    async processScalingPayment(scalingCost) {
        try {
            const paymentResult = await this.paymentService.processPayment(
                scalingCost,
                null, // Use default gateway
                this.config.scaling.paymentMethod
            );
            
            return paymentResult;

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getServerSpecifications() {
        try {
            const response = await axios.get(
                `https://api.cloudways.com/api/v1/server/${this.config.cloudways.serverId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.cloudways.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const server = response.data.server;
            return {
                ram: server.size || 8,
                cpu: server.cpu || 4,
                storage: server.storage || 160
            };
        } catch (error) {
            console.error('❌ Failed to get server specifications:', error.message);
            return { ram: 8, cpu: 4, storage: 160 }; // Default fallback
        }
    }

    calculateRequiredSpecs(targetSites) {
        // Calculate specs needed for target number of Magento sites
        const baseRamPerSite = 0.5; // GB per site
        const baseCpuPerSite = 0.2; // vCPU per site
        const baseStoragePerSite = 5; // GB per site

        return {
            ram: Math.ceil(targetSites * baseRamPerSite + 16), // 16GB base + per site
            cpu: Math.ceil(targetSites * baseCpuPerSite + 8),  // 8 vCPU base + per site
            storage: Math.ceil(targetSites * baseStoragePerSite + 100) // 100GB base + per site
        };
    }

    async scaleServer(requiredSpecs) {
        try {
            console.log('🔄 Sending scaling request to Cloudways...');
            
            const scalingData = {
                server_id: this.config.cloudways.serverId,
                size: requiredSpecs.ram,
                cpu: requiredSpecs.cpu,
                storage: requiredSpecs.storage
            };

            const response = await axios.post(
                'https://api.cloudways.com/api/v1/server/scale',
                scalingData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.config.cloudways.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === 'success') {
                console.log('✅ Scaling request accepted by Cloudways');
                
                // Wait for scaling to complete
                await this.waitForScalingCompletion();
                
                return { success: true, taskId: response.data.task_id };
            } else {
                return { success: false, error: response.data.message || 'Unknown scaling error' };
            }

        } catch (error) {
            console.error('❌ Scaling request failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    async waitForScalingCompletion() {
        console.log('⏳ Waiting for scaling to complete...');
        
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes with 5-second intervals
        
        while (attempts < maxAttempts) {
            try {
                const response = await axios.get(
                    `https://api.cloudways.com/api/v1/server/${this.config.cloudways.serverId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${this.config.cloudways.apiKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const server = response.data.server;
                if (server.status === 'running' && !server.scaling) {
                    console.log('✅ Server scaling completed');
                    return true;
                }

                console.log(`⏳ Scaling in progress... (attempt ${attempts + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                attempts++;

            } catch (error) {
                console.error('❌ Error checking scaling status:', error.message);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        throw new Error('Scaling timeout - server may still be scaling');
    }

    async logAlert(type, data) {
        try {
            const alert = {
                timestamp: new Date().toISOString(),
                type,
                data,
                serverId: this.config.cloudways.serverId
            };

            let alerts = [];
            try {
                const alertsData = await fs.readFile(this.config.monitoring.alertFile, 'utf8');
                alerts = JSON.parse(alertsData);
            } catch (error) {
                // File doesn't exist, start fresh
            }

            alerts.push(alert);
            await fs.writeFile(this.config.monitoring.alertFile, JSON.stringify(alerts, null, 2));
            
            console.log(`📝 Alert logged: ${type}`);
        } catch (error) {
            console.error('❌ Failed to log alert:', error.message);
        }
    }

    startMonitoring() {
        console.log('🚀 Starting Fakelit.com Auto-Scaling Monitor...');
        console.log('📊 Monitoring will check every 5 minutes');
        console.log('🔄 Auto-scaling will trigger at 45+ Magento applications');
        console.log('');

        // Initial check
        this.checkServerCapacity();

        // Set up periodic monitoring
        setInterval(() => {
            this.checkServerCapacity();
        }, this.config.scaling.checkInterval);

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down Fakelit.com Auto-Scaling Monitor...');
            await this.saveScalingHistory();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('\n🛑 Shutting down Fakelit.com Auto-Scaling Monitor...');
            await this.saveScalingHistory();
            process.exit(0);
        });
    }

    async getScalingStatus() {
        return {
            isScaling: this.isScaling,
            currentLimit: this.config.scaling.currentLimit,
            targetLimit: this.config.scaling.targetLimit,
            lastCheck: this.lastCheck,
            scalingHistory: this.scalingHistory.slice(-10) // Last 10 events
        };
    }
}

// CLI Interface
async function main() {
    const monitor = new FakelitAutoScalingMonitor();
    
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--status')) {
        await monitor.initialize();
        const status = await monitor.getScalingStatus();
        console.log('\n📊 Fakelit.com Auto-Scaling Status:');
        console.log('==================================');
        console.log(`🔄 Currently Scaling: ${status.isScaling ? 'Yes' : 'No'}`);
        console.log(`🎯 Current Limit: ${status.currentLimit} Magento websites`);
        console.log(`🎯 Target Limit: ${status.targetLimit} Magento websites`);
        console.log(`📅 Last Check: ${status.lastCheck || 'Never'}`);
        console.log(`📚 Recent Events: ${status.scalingHistory.length}`);
        process.exit(0);
    }
    
    if (args.includes('--manual-scale')) {
        await monitor.initialize();
        console.log('\n🔧 Manual scaling triggered...');
        await monitor.triggerAutoScaling(50); // Force scaling
        process.exit(0);
    }
    
    // Start normal monitoring
    await monitor.initialize();
}

// Run the monitor
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fakelit.com Auto-Scaling Monitor failed:', error.message);
        process.exit(1);
    });
}

module.exports = FakelitAutoScalingMonitor; 