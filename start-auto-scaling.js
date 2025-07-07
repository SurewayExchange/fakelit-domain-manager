#!/usr/bin/env node

/**
 * 🚀 Fakelit.com - Auto Scaling Startup Script
 * Launches the auto-scaling monitor with proper configuration
 * Powered by: Fakelit.com
 */

const fs = require('fs').promises;
const path = require('path');
const FakelitAutoScalingMonitor = require('./auto-scaling-monitor');

class FakelitAutoScalingStarter {
    constructor() {
        this.configFile = 'fakelit-auto-scaling-config.json';
        this.envFile = '.env';
        this.pidFile = 'fakelit-scaling.pid';
    }

    async initialize() {
        console.log('🚀 Fakelit.com - Auto Scaling Startup');
        console.log('====================================');
        console.log('🏢 Powered by: Fakelit.com');
        console.log('');

        try {
            // Check if already running
            if (await this.isAlreadyRunning()) {
                console.log('⚠️ Auto-scaling monitor is already running');
                console.log('   Use: node start-auto-scaling.js --stop to stop it');
                process.exit(1);
            }

            // Load configuration
            const config = await this.loadConfiguration();
            
            // Validate configuration
            await this.validateConfiguration(config);
            
            // Set environment variables
            await this.setEnvironmentVariables(config);
            
            // Start the monitor
            await this.startMonitor(config);
            
        } catch (error) {
            console.error('❌ Startup failed:', error.message);
            process.exit(1);
        }
    }

    async isAlreadyRunning() {
        try {
            const pidData = await fs.readFile(this.pidFile, 'utf8');
            const pid = parseInt(pidData.trim());
            
            // Check if process is still running
            try {
                process.kill(pid, 0); // Signal 0 just checks if process exists
                return true;
            } catch (error) {
                // Process not running, remove stale PID file
                await fs.unlink(this.pidFile);
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    async loadConfiguration() {
        try {
            const configData = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(configData);
            
            console.log('✅ Configuration loaded successfully');
            return config;
            
        } catch (error) {
            console.error('❌ Failed to load configuration:', error.message);
            console.log('📝 Creating default configuration...');
            
            const defaultConfig = await this.createDefaultConfig();
            await fs.writeFile(this.configFile, JSON.stringify(defaultConfig, null, 2));
            
            console.log('✅ Default configuration created');
            console.log('⚠️ Please update the configuration with your Cloudways credentials');
            console.log(`   Edit: ${this.configFile}`);
            
            return defaultConfig;
        }
    }

    async createDefaultConfig() {
        return {
            "fakelit": {
                "branding": "Powered by Fakelit.com",
                "version": "1.0.0",
                "description": "Auto-scaling configuration for Fakelit.com server"
            },
            "cloudways": {
                "email": "your-cloudways-email@example.com",
                "apiKey": "your-cloudways-api-key",
                "serverId": "your-server-id",
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

    async validateConfiguration(config) {
        console.log('🔍 Validating configuration...');
        
        const required = ['cloudways', 'scaling', 'monitoring'];
        for (const section of required) {
            if (!config[section]) {
                throw new Error(`Missing required configuration section: ${section}`);
            }
        }

        const cloudways = config.cloudways;
        if (!cloudways.email || cloudways.email === 'your-cloudways-email@example.com') {
            throw new Error('Please set your Cloudways email in the configuration');
        }
        
        if (!cloudways.apiKey || cloudways.apiKey === 'your-cloudways-api-key') {
            throw new Error('Please set your Cloudways API key in the configuration');
        }
        
        if (!cloudways.serverId || cloudways.serverId === 'your-server-id') {
            throw new Error('Please set your Cloudways server ID in the configuration');
        }

        console.log('✅ Configuration validation passed');
    }

    async setEnvironmentVariables(config) {
        console.log('🔧 Setting environment variables...');
        
        const envVars = {
            CLOUDWAYS_EMAIL: config.cloudways.email,
            CLOUDWAYS_API_KEY: config.cloudways.apiKey,
            CLOUDWAYS_SERVER_ID: config.cloudways.serverId,
            FAKELIT_SCALING_ENABLED: 'true',
            FAKELIT_BRANDING: 'Powered by Fakelit.com'
        };

        let envContent = '';
        for (const [key, value] of Object.entries(envVars)) {
            envContent += `${key}=${value}\n`;
        }

        await fs.writeFile(this.envFile, envContent);
        console.log('✅ Environment variables set');
    }

    async startMonitor(config) {
        console.log('🚀 Starting Fakelit.com Auto-Scaling Monitor...');
        
        // Write PID file
        await fs.writeFile(this.pidFile, process.pid.toString());
        
        // Create monitor instance
        const monitor = new FakelitAutoScalingMonitor();
        
        // Override config with loaded values
        monitor.config = {
            ...monitor.config,
            cloudways: config.cloudways,
            scaling: config.scaling,
            monitoring: config.monitoring
        };
        
        // Start monitoring
        await monitor.initialize();
        
        console.log('✅ Auto-scaling monitor started successfully');
        console.log('📊 Monitoring active - press Ctrl+C to stop');
        
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down Fakelit.com Auto-Scaling Monitor...');
            try {
                await fs.unlink(this.pidFile);
            } catch (error) {
                // PID file might already be gone
            }
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n🛑 Shutting down Fakelit.com Auto-Scaling Monitor...');
            try {
                await fs.unlink(this.pidFile);
            } catch (error) {
                // PID file might already be gone
            }
            process.exit(0);
        });
    }

    async stopMonitor() {
        try {
            const pidData = await fs.readFile(this.pidFile, 'utf8');
            const pid = parseInt(pidData.trim());
            
            console.log(`🛑 Stopping Fakelit.com Auto-Scaling Monitor (PID: ${pid})...`);
            
            process.kill(pid, 'SIGTERM');
            
            // Wait a moment for graceful shutdown
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Force kill if still running
            try {
                process.kill(pid, 'SIGKILL');
            } catch (error) {
                // Process already stopped
            }
            
            await fs.unlink(this.pidFile);
            console.log('✅ Auto-scaling monitor stopped');
            
        } catch (error) {
            console.error('❌ Failed to stop monitor:', error.message);
            process.exit(1);
        }
    }

    async showStatus() {
        try {
            const monitor = new FakelitAutoScalingMonitor();
            await monitor.initialize();
            const status = await monitor.getScalingStatus();
            
            console.log('\n📊 Fakelit.com Auto-Scaling Status');
            console.log('=================================');
            console.log(`🔄 Currently Scaling: ${status.isScaling ? 'Yes' : 'No'}`);
            console.log(`🎯 Current Limit: ${status.currentLimit} Magento websites`);
            console.log(`🎯 Target Limit: ${status.targetLimit} Magento websites`);
            console.log(`📅 Last Check: ${status.lastCheck || 'Never'}`);
            console.log(`📚 Recent Events: ${status.scalingHistory.length}`);
            
            if (status.scalingHistory.length > 0) {
                console.log('\n📋 Recent Scaling Events:');
                status.scalingHistory.slice(-5).forEach((event, index) => {
                    console.log(`   ${index + 1}. ${event.timestamp} - ${event.event} (${event.status})`);
                });
            }
            
        } catch (error) {
            console.error('❌ Failed to get status:', error.message);
        }
    }
}

// CLI Interface
async function main() {
    const starter = new FakelitAutoScalingStarter();
    const args = process.argv.slice(2);
    
    if (args.includes('--stop')) {
        await starter.stopMonitor();
    } else if (args.includes('--status')) {
        await starter.showStatus();
    } else if (args.includes('--help')) {
        console.log('🚀 Fakelit.com - Auto Scaling Monitor');
        console.log('====================================');
        console.log('');
        console.log('Usage:');
        console.log('  node start-auto-scaling.js          Start the auto-scaling monitor');
        console.log('  node start-auto-scaling.js --stop   Stop the auto-scaling monitor');
        console.log('  node start-auto-scaling.js --status Show current status');
        console.log('  node start-auto-scaling.js --help   Show this help');
        console.log('');
        console.log('🏢 Powered by: Fakelit.com');
    } else {
        await starter.initialize();
    }
}

// Run the starter
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fakelit.com Auto-Scaling Startup failed:', error.message);
        process.exit(1);
    });
}

module.exports = FakelitAutoScalingStarter; 