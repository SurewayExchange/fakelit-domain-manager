#!/usr/bin/env node

/**
 * Setup Cloudways Credentials
 * 
 * This script helps you configure Cloudways API credentials
 * to add selectiveadvertisinggroup.com to your Fakelit server.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupCloudwaysCredentials() {
    console.log('🌐 Fakelit - Cloudways Credentials Setup');
    console.log('========================================\n');

    console.log('To add selectiveadvertisinggroup.com to your Cloudways Fakelit server,');
    console.log('you need to provide your Cloudways API credentials.\n');

    console.log('📋 How to get your Cloudways API credentials:');
    console.log('1. Log in to your Cloudways account');
    console.log('2. Go to Account > API Keys');
    console.log('3. Generate a new API key');
    console.log('4. Copy the API key and your email address\n');

    try {
        const apiKey = await question('Enter your Cloudways API Key: ');
        const email = await question('Enter your Cloudways Email: ');

        if (!apiKey || !email) {
            console.log('\n❌ API Key and Email are required');
            return;
        }

        // Create .env file content
        const envContent = `# Cloudways Configuration
CLOUDWAYS_API_KEY=${apiKey}
CLOUDWAYS_EMAIL=${email}

# Other configurations can be added here
NODE_ENV=development
`;

        // Write to .env file
        const envPath = path.join(__dirname, '.env');
        fs.writeFileSync(envPath, envContent);

        console.log('\n✅ Cloudways credentials saved to .env file');
        console.log('🔐 Credentials are stored locally and not shared');

        // Test the credentials
        console.log('\n🧪 Testing Cloudways connection...');
        
        // Import and test the service
        const CloudwaysService = require('./services/cloudwaysService');
        const cloudwaysService = new CloudwaysService();

        try {
            const servers = await cloudwaysService.getServers();
            console.log(`✅ Successfully connected to Cloudways`);
            console.log(`📊 Found ${servers.length} servers`);

            // Look for Fakelit server
            const fakelitServer = servers.find(server => 
                server.label?.toLowerCase().includes('fakelit')
            );

            if (fakelitServer) {
                console.log(`✅ Found Fakelit server: ${fakelitServer.label}`);
                console.log(`🆔 Server ID: ${fakelitServer.id}`);
                
                // Get applications on Fakelit server
                const applications = await cloudwaysService.getApplicationsByServer(fakelitServer.id);
                console.log(`📱 Found ${applications.length} applications on Fakelit server`);
                
                if (applications.length > 0) {
                    console.log('\n📋 Applications on Fakelit server:');
                    applications.forEach((app, index) => {
                        console.log(`${index + 1}. ${app.label} (ID: ${app.id})`);
                    });
                }
            } else {
                console.log('⚠️  No server named "Fakelit" found');
                console.log('Available servers:');
                servers.forEach((server, index) => {
                    console.log(`${index + 1}. ${server.label} (ID: ${server.id})`);
                });
            }

        } catch (error) {
            console.log('❌ Error testing Cloudways connection:', error.message);
            console.log('Please check your API credentials and try again');
        }

        console.log('\n🎉 Setup complete! You can now run:');
        console.log('node add-selective-advertising-domain.js');

    } catch (error) {
        console.error('❌ Error during setup:', error.message);
    } finally {
        rl.close();
    }
}

// Run the setup
if (require.main === module) {
    setupCloudwaysCredentials();
}

module.exports = setupCloudwaysCredentials; 