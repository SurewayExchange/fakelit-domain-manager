#!/usr/bin/env node

/**
 * Quick .env Setup for Cloudways Credentials
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

async function quickSetup() {
    console.log('🌐 Quick Cloudways Credentials Setup');
    console.log('====================================\n');

    console.log('📋 To get your Cloudways API credentials:');
    console.log('1. Go to https://platform.cloudways.com/');
    console.log('2. Log in to your account');
    console.log('3. Go to Account > API Keys');
    console.log('4. Generate a new API key');
    console.log('5. Copy the API key and your email\n');

    try {
        const apiKey = await question('Enter your Cloudways API Key: ');
        const email = await question('Enter your Cloudways Email: ');

        if (!apiKey || !email) {
            console.log('\n❌ Both API Key and Email are required');
            return;
        }

        // Create .env content
        const envContent = `# Cloudways Configuration
CLOUDWAYS_API_KEY=${apiKey}
CLOUDWAYS_EMAIL=${email}

# Server Configuration
NODE_ENV=development
PORT=3000

# Other configurations can be added here as needed
`;

        // Write .env file
        const envPath = path.join(__dirname, '.env');
        fs.writeFileSync(envPath, envContent);

        console.log('\n✅ .env file created successfully!');
        console.log('🔐 Credentials saved securely');
        console.log('\n🎉 Ready to add selectiveadvertisinggroup.com!');
        console.log('Run: node add-domain-direct.js');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        rl.close();
    }
}

// Run the setup
if (require.main === module) {
    quickSetup();
}

module.exports = quickSetup; 