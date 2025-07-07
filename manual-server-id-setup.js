#!/usr/bin/env node

/**
 * 🔧 Fakelit.com - Manual Server ID Setup
 * Help you find and configure your Server ID manually
 * Powered by: Fakelit.com
 */

const fs = require('fs').promises;
const readline = require('readline');

class ManualServerIDSetup {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async initialize() {
        console.log('🔧 Fakelit.com - Manual Server ID Setup');
        console.log('=======================================');
        console.log('🏢 Powered by: Fakelit.com');
        console.log('');
        console.log('Since we couldn\'t access your Cloudways API automatically,');
        console.log('let\'s set up your Server ID manually.');
        console.log('');

        try {
            await this.showInstructions();
            await this.getServerID();
            await this.updateConfiguration();
            await this.showNextSteps();
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async showInstructions() {
        console.log('📋 How to Find Your Server ID:');
        console.log('==============================');
        console.log('');
        console.log('1. Log into Cloudways Dashboard:');
        console.log('   https://platform.cloudways.com/');
        console.log('');
        console.log('2. Go to your server (IP: 35.184.78.205)');
        console.log('');
        console.log('3. Look for the Server ID in one of these places:');
        console.log('   - URL: https://platform.cloudways.com/server/YOUR_SERVER_ID');
        console.log('   - Server Details page');
        console.log('   - Server Settings');
        console.log('');
        console.log('4. The Server ID looks like: 5f8a2b1c3d4e5f6a7b8c9d0e');
        console.log('   (a long string of letters and numbers)');
        console.log('');
    }

    async getServerID() {
        console.log('🔍 Enter Your Server ID:');
        console.log('========================');
        
        const serverID = await this.promptInput('Server ID: ');
        
        if (!serverID || serverID === 'YOUR_SERVER_ID_HERE') {
            throw new Error('Please enter a valid Server ID');
        }

        // Basic validation
        if (serverID.length < 10) {
            console.log('⚠️  Warning: Server ID seems short. Make sure you copied the complete ID.');
        }

        this.serverID = serverID;
        console.log(`✅ Server ID captured: ${serverID}`);
    }

    async updateConfiguration() {
        console.log('\n💾 Updating configuration...');
        
        try {
            const configPath = 'fakelit-auto-scaling-config.json';
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);
            
            config.cloudways.serverId = this.serverID;
            
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            console.log('✅ Configuration updated successfully!');
            
        } catch (error) {
            console.error('❌ Failed to update configuration:', error.message);
            throw error;
        }
    }

    async showNextSteps() {
        console.log('\n🚀 Next Steps:');
        console.log('==============');
        console.log('');
        console.log('1. ✅ Configuration saved');
        console.log('2. 🔧 Test the configuration:');
        console.log('   npm run scaling:status');
        console.log('');
        console.log('3. 🚀 Start auto-scaling monitor:');
        console.log('   npm run scaling:start');
        console.log('');
        console.log('4. 📊 Monitor scaling events:');
        console.log('   npm run scaling:logs');
        console.log('');
        console.log('🎯 Your auto-scaling system will:');
        console.log('   - Monitor every 5 minutes');
        console.log('   - Scale when 45+ Magento apps detected');
        console.log('   - Increase capacity from 50 to 150 sites');
        console.log('');
        console.log('🏢 Powered by: Fakelit.com');
    }

    async promptInput(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, (answer) => {
                resolve(answer.trim());
            });
        });
    }
}

// Run the setup
if (require.main === module) {
    const setup = new ManualServerIDSetup();
    setup.initialize().catch(error => {
        console.error('❌ Manual setup failed:', error.message);
        process.exit(1);
    });
}

module.exports = ManualServerIDSetup; 