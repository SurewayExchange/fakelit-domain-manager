#!/usr/bin/env node

/**
 * 🧪 Fakelit.com - Auto Scaling Setup Test
 * Test and verify your auto-scaling configuration
 * Powered by: Fakelit.com
 */

const fs = require('fs').promises;
const path = require('path');

class ScalingSetupTest {
    constructor() {
        this.configFile = 'fakelit-auto-scaling-config.json';
    }

    async runTest() {
        console.log('🧪 Fakelit.com - Auto Scaling Setup Test');
        console.log('========================================');
        console.log('🏢 Powered by: Fakelit.com');
        console.log('');

        try {
            await this.testConfiguration();
            await this.showScalingSpecs();
            await this.showMonitoringInfo();
            await this.showCommands();
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }

    async testConfiguration() {
        console.log('📋 Testing Configuration...');
        console.log('============================');
        
        try {
            const configData = await fs.readFile(this.configFile, 'utf8');
            const config = JSON.parse(configData);
            
            console.log('✅ Configuration file found');
            console.log(`   📧 Email: ${config.cloudways.email}`);
            console.log(`   🔑 API Key: ${config.cloudways.apiKey.substring(0, 8)}...`);
            console.log(`   🆔 Server ID: ${config.cloudways.serverId}`);
            
            if (config.cloudways.serverId === 'YOUR_SERVER_ID_HERE') {
                console.log('⚠️  Server ID needs to be configured');
                console.log('   Run: node manual-server-id-setup.js');
            } else {
                console.log('✅ Server ID configured');
            }
            
            console.log(`   🎯 Current Limit: ${config.scaling.currentLimit} Magento sites`);
            console.log(`   🎯 Target Limit: ${config.scaling.targetLimit} Magento sites`);
            console.log(`   📊 Scaling Threshold: ${config.scaling.scalingThreshold} apps`);
            console.log(`   ⏰ Check Interval: ${config.scaling.checkInterval / 60000} minutes`);
            
        } catch (error) {
            console.error('❌ Configuration test failed:', error.message);
            throw error;
        }
    }

    async showScalingSpecs() {
        console.log('\n📊 Scaling Specifications:');
        console.log('==========================');
        
        const currentSpecs = {
            ram: 40,    // 50 sites * 0.5GB + 16GB base + 8GB margin
            cpu: 18,    // 50 sites * 0.2 vCPU + 8 vCPU base + 4 vCPU margin
            storage: 350 // 50 sites * 5GB + 100GB base + 50GB margin
        };
        
        const targetSpecs = {
            ram: 91,    // 150 sites * 0.5GB + 16GB base + 8GB margin
            cpu: 38,    // 150 sites * 0.2 vCPU + 8 vCPU base + 4 vCPU margin
            storage: 850 // 150 sites * 5GB + 100GB base + 50GB margin
        };
        
        console.log('Current Server (50 Magento sites):');
        console.log(`   💾 RAM: ${currentSpecs.ram}GB`);
        console.log(`   ⚡ CPU: ${currentSpecs.cpu} vCPUs`);
        console.log(`   💿 Storage: ${currentSpecs.storage}GB`);
        console.log('');
        console.log('Target Server (150 Magento sites):');
        console.log(`   💾 RAM: ${targetSpecs.ram}GB (+${targetSpecs.ram - currentSpecs.ram}GB)`);
        console.log(`   ⚡ CPU: ${targetSpecs.cpu} vCPUs (+${targetSpecs.cpu - currentSpecs.cpu} vCPUs)`);
        console.log(`   💿 Storage: ${targetSpecs.storage}GB (+${targetSpecs.storage - currentSpecs.storage}GB)`);
    }

    async showMonitoringInfo() {
        console.log('\n📈 Monitoring Information:');
        console.log('==========================');
        console.log('The auto-scaling system will:');
        console.log('   🔍 Check server every 5 minutes');
        console.log('   📊 Count Magento applications');
        console.log('   🚨 Trigger scaling at 45+ apps');
        console.log('   ⚡ Scale server automatically');
        console.log('   📝 Log all events and alerts');
        console.log('   ✅ Verify scaling completion');
    }

    async showCommands() {
        console.log('\n🛠️  Available Commands:');
        console.log('=======================');
        console.log('npm run scaling:setup    # Run setup wizard');
        console.log('npm run scaling:start    # Start auto-scaling monitor');
        console.log('npm run scaling:stop     # Stop auto-scaling monitor');
        console.log('npm run scaling:status   # Check current status');
        console.log('npm run scaling:manual   # Trigger manual scaling');
        console.log('npm run scaling:logs     # View scaling logs');
        console.log('npm run scaling:alerts   # View scaling alerts');
        console.log('');
        console.log('🔧 Manual Setup:');
        console.log('node manual-server-id-setup.js  # Find Server ID manually');
        console.log('');
        console.log('🧪 Test Configuration:');
        console.log('node test-scaling-setup.js      # This script');
    }
}

// Run the test
if (require.main === module) {
    const test = new ScalingSetupTest();
    test.runTest().catch(error => {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    });
}

module.exports = ScalingSetupTest; 