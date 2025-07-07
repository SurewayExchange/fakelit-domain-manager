#!/usr/bin/env node

/**
 * Add selectiveadvertisinggroup.com to Cloudways Server
 * 
 * This script adds the selectiveadvertisinggroup.com domain to a Cloudways server
 * for development and sandbox purposes. Each app will have its own specific branding.
 */

require('dotenv').config();
const CloudwaysService = require('./services/cloudwaysService');

async function addSelectiveAdvertisingDomain() {
    console.log('🌐 Add Selective Advertising Domain to Cloudways');
    console.log('================================================\n');

    try {
        const cloudwaysService = new CloudwaysService();

        // Check if credentials are configured
        if (!process.env.CLOUDWAYS_API_KEY || !process.env.CLOUDWAYS_EMAIL) {
            console.log('❌ Cloudways credentials not found in environment');
            console.log('Please add the following to your .env file:');
            console.log('CLOUDWAYS_API_KEY=your_cloudways_api_key');
            console.log('CLOUDWAYS_EMAIL=your_cloudways_email');
            return;
        }

        console.log('✅ Cloudways credentials found');
        console.log('🔍 Starting domain addition process...\n');

        // Get all servers
        const servers = await cloudwaysService.getServers();
        console.log(`📊 Found ${servers.length} servers`);

        if (servers.length === 0) {
            console.log('❌ No servers found on Cloudways');
            return;
        }

        // Display available servers
        console.log('\n📋 Available Servers:');
        servers.forEach((server, index) => {
            console.log(`${index + 1}. ${server.label} (ID: ${server.id})`);
        });

        // Get applications from the first server (or you can modify to select specific server)
        const targetServer = servers[0];
        console.log(`\n🎯 Using server: ${targetServer.label} (ID: ${targetServer.id})`);

        const applications = await cloudwaysService.getApplicationsByServer(targetServer.id);
        
        if (applications.length === 0) {
            console.log('❌ No applications found on the selected server');
            return;
        }

        console.log(`📱 Found ${applications.length} applications on server`);

        // Display available applications
        console.log('\n📋 Available Applications:');
        applications.forEach((app, index) => {
            console.log(`${index + 1}. ${app.label} (ID: ${app.id})`);
        });

        // Use the first application (or you can modify to select specific app)
        const targetApp = applications[0];
        console.log(`\n🎯 Using application: ${targetApp.label} (ID: ${targetApp.id})`);

        // Add the domain
        console.log('\n🌐 Adding selectiveadvertisinggroup.com...');
        const result = await cloudwaysService.addDomainToApp(
            targetServer.id, 
            targetApp.id, 
            'selectiveadvertisinggroup.com'
        );

        console.log('\n🎉 Domain Addition Complete!');
        console.log('============================');
        console.log(`🏢 Server: ${targetServer.label}`);
        console.log(`📱 Application: ${targetApp.label}`);
        console.log(`🌐 Domain: selectiveadvertisinggroup.com`);
        console.log(`🔗 URL: https://selectiveadvertisinggroup.com`);
        console.log('\n📋 Next Steps:');
        console.log('1. Configure DNS settings for selectiveadvertisinggroup.com');
        console.log('2. Point domain to Cloudways server IP');
        console.log('3. Set up SSL certificate (automatic with Cloudways)');
        console.log('4. Deploy your application with app-specific branding');
        console.log('5. Test the domain functionality');

        console.log('\n💡 Note: Each application deployed on this domain should have its own specific branding');

    } catch (error) {
        console.error('\n❌ Error adding domain:', error.message);
        
        if (error.message.includes('server not found')) {
            console.log('\n💡 Troubleshooting:');
            console.log('1. Make sure you have servers on Cloudways');
            console.log('2. Check your Cloudways API credentials');
            console.log('3. Verify the server is active and accessible');
        }
        
        if (error.message.includes('No applications found')) {
            console.log('\n💡 Troubleshooting:');
            console.log('1. Make sure you have at least one application on the server');
            console.log('2. Create a new application if needed');
            console.log('3. Verify the application is active');
        }

        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    addSelectiveAdvertisingDomain();
}

module.exports = addSelectiveAdvertisingDomain; 