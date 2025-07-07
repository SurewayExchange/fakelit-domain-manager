#!/usr/bin/env node

/**
 * 🔧 Fakelit.com - Auto Scaling Setup Wizard
 * Interactive setup for configuring Cloudways credentials
 * Powered by: Fakelit.com
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const axios = require('axios');

class FakelitAutoScalingSetup {
    constructor() {
        this.configFile = 'fakelit-auto-scaling-config.json';
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async initialize() {
        console.log('🔧 Fakelit.com - Auto Scaling Setup Wizard');
        console.log('==========================================');
        console.log('🏢 Powered by: Fakelit.com');
        console.log('');
        console.log('This wizard will help you configure your Cloudways credentials');
        console.log('and test the auto-scaling system.');
        console.log('');

        try {
            // Load existing config
            const config = await this.loadConfiguration();
            
            // Run setup steps
            await this.runSetup(config);
            
            // Test configuration
            await this.testConfiguration(config);
            
            // Save configuration
            await this.saveConfiguration(config);
            
            console.log('\n✅ Setup completed successfully!');
            console.log('🚀 You can now start the auto-scaling monitor:');
            console.log('   npm run scaling:start');
            
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async loadConfiguration() {
        try {
            const configData = await fs.readFile(this.configFile, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.log('📝 Creating new configuration...');
            return this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            "fakelit": {
                "branding": "Powered by Fakelit.com",
                "version": "1.0.0",
                "description": "Auto-scaling configuration for Fakelit.com server"
            },
            "cloudways": {
                "email": "",
                "apiKey": "",
                "serverId": "",
                "baseUrl": "https://api.cloudways.com/api/v1"
            },
            "scaling": {
                "currentLimit": 50,
                "targetLimit": 150,
                "checkInterval": 300000,
                "scalingThreshold": 45,
                "maxRetries": 3,
                "retryDelay": 30000,
                "scalingTimeout": 300000
            },
            "monitoring": {
                "logFile": "fakelit-scaling-logs.json",
                "alertFile": "fakelit-scaling-alerts.json",
                "metricsFile": "fakelit-scaling-metrics.json"
            },
            "specifications": {
                "baseRequirements": {
                    "ram": 16,
                    "cpu": 8,
                    "storage": 100
                },
                "perSiteRequirements": {
                    "ram": 0.5,
                    "cpu": 0.2,
                    "storage": 5
                },
                "safetyMargin": {
                    "ram": 8,
                    "cpu": 4,
                    "storage": 50
                }
            }
        };
    }

    async runSetup(config) {
        console.log('📋 Step 1: Cloudways Credentials');
        console.log('================================');
        console.log('');
        console.log('You need to provide your Cloudways credentials:');
        console.log('1. Email address used for Cloudways account');
        console.log('2. API key from Cloudways dashboard');
        console.log('3. Server ID from your Cloudways server');
        console.log('');

        // Get Cloudways email
        config.cloudways.email = await this.promptInput(
            'Enter your Cloudways email address: ',
            config.cloudways.email
        );

        // Get API key
        config.cloudways.apiKey = await this.promptInput(
            'Enter your Cloudways API key: ',
            config.cloudways.apiKey
        );

        // Get server ID
        config.cloudways.serverId = await this.promptInput(
            'Enter your Cloudways server ID: ',
            config.cloudways.serverId
        );

        console.log('\n📋 Step 2: Scaling Configuration');
        console.log('=================================');
        console.log('');

        // Configure scaling thresholds
        const currentLimit = await this.promptInput(
            `Current Magento website limit (default: ${config.scaling.currentLimit}): `,
            config.scaling.currentLimit.toString()
        );
        config.scaling.currentLimit = parseInt(currentLimit) || config.scaling.currentLimit;

        const targetLimit = await this.promptInput(
            `Target Magento website limit (default: ${config.scaling.targetLimit}): `,
            config.scaling.targetLimit.toString()
        );
        config.scaling.targetLimit = parseInt(targetLimit) || config.scaling.targetLimit;

        const threshold = await this.promptInput(
            `Scaling threshold (default: ${config.scaling.scalingThreshold}): `,
            config.scaling.scalingThreshold.toString()
        );
        config.scaling.scalingThreshold = parseInt(threshold) || config.scaling.scalingThreshold;

        console.log('\n📋 Step 3: Monitoring Settings');
        console.log('==============================');
        console.log('');

        const checkInterval = await this.promptInput(
            `Check interval in minutes (default: ${config.scaling.checkInterval / 60000}): `,
            (config.scaling.checkInterval / 60000).toString()
        );
        config.scaling.checkInterval = (parseInt(checkInterval) || 5) * 60000;

        console.log('\n✅ Configuration completed!');
    }

    async testConfiguration(config) {
        console.log('\n🧪 Step 4: Testing Configuration');
        console.log('================================');
        console.log('');

        console.log('🔍 Testing Cloudways API connection...');
        
        try {
            // Test API connection
            const response = await axios.get(
                `https://api.cloudways.com/api/v1/server/${config.cloudways.serverId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.cloudways.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            if (response.data && response.data.server) {
                const server = response.data.server;
                console.log('✅ Cloudways API connection successful!');
                console.log(`   Server Name: ${server.label || 'Unknown'}`);
                console.log(`   Server Status: ${server.status || 'Unknown'}`);
                console.log(`   Current RAM: ${server.size || 'Unknown'}GB`);
                console.log(`   Current CPU: ${server.cpu || 'Unknown'} vCPUs`);
                console.log(`   Current Storage: ${server.storage || 'Unknown'}GB`);
            } else {
                throw new Error('Invalid server response');
            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    console.error('❌ Authentication failed. Please check your API key.');
                } else if (error.response.status === 404) {
                    console.error('❌ Server not found. Please check your server ID.');
                } else {
                    console.error(`❌ API error: ${error.response.status} - ${error.response.statusText}`);
                }
            } else if (error.code === 'ECONNABORTED') {
                console.error('❌ Connection timeout. Please check your internet connection.');
            } else {
                console.error('❌ Connection failed:', error.message);
            }
            
            throw new Error('Configuration test failed');
        }

        console.log('\n🔍 Testing application listing...');
        
        try {
            const response = await axios.get(
                `https://api.cloudways.com/api/v1/server/${config.cloudways.serverId}/app`,
                {
                    headers: {
                        'Authorization': `Bearer ${config.cloudways.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            const applications = response.data.apps || [];
            const magentoApps = applications.filter(app => 
                app.application && app.application.name && 
                app.application.name.toLowerCase().includes('magento')
            );

            console.log('✅ Application listing successful!');
            console.log(`   Total Applications: ${applications.length}`);
            console.log(`   Magento Applications: ${magentoApps.length}`);
            console.log(`   Current Limit: ${config.scaling.currentLimit}`);
            console.log(`   Scaling Threshold: ${config.scaling.scalingThreshold}`);

            if (magentoApps.length >= config.scaling.scalingThreshold) {
                console.log('⚠️  Warning: Current Magento count is at or above scaling threshold!');
            }

        } catch (error) {
            console.error('❌ Application listing failed:', error.message);
            throw new Error('Application listing test failed');
        }

        console.log('\n✅ All tests passed! Configuration is ready.');
    }

    async saveConfiguration(config) {
        try {
            await fs.writeFile(this.configFile, JSON.stringify(config, null, 2));
            console.log('\n💾 Configuration saved successfully!');
        } catch (error) {
            console.error('❌ Failed to save configuration:', error.message);
            throw error;
        }
    }

    async promptInput(prompt, defaultValue = '') {
        return new Promise((resolve) => {
            const displayPrompt = defaultValue ? `${prompt}(${defaultValue}) ` : prompt;
            this.rl.question(displayPrompt, (answer) => {
                resolve(answer.trim() || defaultValue);
            });
        });
    }

    async showHelp() {
        console.log('🔧 Fakelit.com - Auto Scaling Setup Help');
        console.log('========================================');
        console.log('');
        console.log('This setup wizard will help you configure:');
        console.log('');
        console.log('1. Cloudways Credentials:');
        console.log('   - Email: Your Cloudways account email');
        console.log('   - API Key: Found in Cloudways Dashboard > API');
        console.log('   - Server ID: Found in Cloudways Dashboard > Servers');
        console.log('');
        console.log('2. Scaling Configuration:');
        console.log('   - Current Limit: How many Magento sites you currently support');
        console.log('   - Target Limit: How many Magento sites after scaling (150)');
        console.log('   - Scaling Threshold: When to trigger scaling (45)');
        console.log('');
        console.log('3. Monitoring Settings:');
        console.log('   - Check Interval: How often to check server capacity');
        console.log('');
        console.log('🏢 Powered by: Fakelit.com');
    }
}

// CLI Interface
async function main() {
    const setup = new FakelitAutoScalingSetup();
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        await setup.showHelp();
    } else {
        await setup.initialize();
    }
}

// Run the setup
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    });
}

module.exports = FakelitAutoScalingSetup; 