#!/usr/bin/env node

/**
 * Add selectiveadvertisinggroup.com to Cloudways Server
 * Server Name: Fakelit
 * API Key: x3XDizlcTIsld2mNoV0O6IqbjHV8Db
 * Email: marquibelbrooks@gmail.com
 */

const CloudwaysService = require('./services/cloudwaysService');

async function addDomainCorrectKey() {
    console.log('🌐 Add selectiveadvertisinggroup.com to Cloudways Server');
    console.log('=======================================================\n');
    console.log('🏢 Server Name: Fakelit');
    console.log('🌐 Server IP: 35.184.78.205');
    console.log('🔑 API Key: x3XDizlcTIsld2mNoV0O6IqbjHV8Db');
    console.log('📧 Email: marquibelbrooks@gmail.com\n');

    try {
        // Set environment variables directly
        process.env.CLOUDWAYS_API_KEY = 'x3XDizlcTIsld2mNoV0O6IqbjHV8Db';
        process.env.CLOUDWAYS_EMAIL = 'marquibelbrooks@gmail.com';

        const cloudwaysService = new CloudwaysService();

        console.log('✅ Cloudways credentials configured');
        console.log('🔍 Connecting to Cloudways...\n');

        // Get all servers
        const servers = await cloudwaysService.getServers();
        console.log(`📊 Found ${servers.length} servers`);

        if (servers.length === 0) {
            console.log('❌ No servers found on Cloudways');
            return;
        }

        // Display all servers first
        console.log('\n📋 Available Servers:');
        servers.forEach((server, index) => {
            console.log(`${index + 1}. ${server.label} - IP: ${server.public_ip || 'N/A'}`);
        });

        // Find the server by name "Fakelit"
        const targetServer = servers.find(server => 
            server.label?.toLowerCase() === 'fakelit' ||
            server.label?.toLowerCase().includes('fakelit') ||
            server.public_ip === '35.184.78.205' ||
            server.private_ip === '35.184.78.205'
        );

        if (!targetServer) {
            console.log('\n❌ Server named "Fakelit" not found');
            console.log('💡 Available servers are listed above');
            console.log('🔧 Please check the server name or create the server first');
            return;
        }

        console.log(`\n✅ Found target server: ${targetServer.label}`);
        console.log(`🆔 Server ID: ${targetServer.id}`);
        console.log(`🌐 Public IP: ${targetServer.public_ip || 'N/A'}`);
        console.log(`🔧 Provider: ${targetServer.provider || 'N/A'}`);

        // Get applications on the target server
        const applications = await cloudwaysService.getApplicationsByServer(targetServer.id);
        
        if (applications.length === 0) {
            console.log('\n❌ No applications found on the Fakelit server');
            console.log('💡 Please create an application first in your Cloudways dashboard');
            console.log('📱 Go to: Applications > Add Application');
            return;
        }

        console.log(`\n📱 Found ${applications.length} applications on Fakelit server`);

        // Display applications
        console.log('\n📋 Available Applications:');
        applications.forEach((app, index) => {
            console.log(`${index + 1}. ${app.label} (ID: ${app.id})`);
            console.log(`   URL: ${app.url || 'N/A'}`);
            console.log(`   Status: ${app.status || 'Unknown'}`);
            console.log(`   Type: ${app.application?.application_name || 'Unknown'}`);
        });

        // Use the first application
        const targetApp = applications[0];
        console.log(`\n🎯 Using application: ${targetApp.label} (ID: ${targetApp.id})`);

        // Check if domain already exists
        console.log('\n🔍 Checking existing domains...');
        const existingDomains = await cloudwaysService.getAppDomains(targetServer.id, targetApp.id);
        
        const domainExists = existingDomains.some(domain => 
            domain.domain === 'selectiveadvertisinggroup.com'
        );

        if (domainExists) {
            console.log('⚠️  selectiveadvertisinggroup.com already exists on this application');
            console.log('✅ Domain is ready to use');
        } else {
            // Add the domain
            console.log('\n🌐 Adding selectiveadvertisinggroup.com...');
            const result = await cloudwaysService.addDomainToApp(
                targetServer.id, 
                targetApp.id, 
                'selectiveadvertisinggroup.com'
            );
            console.log('✅ Domain added successfully');
        }

        console.log('\n🎉 Domain Setup Complete!');
        console.log('========================');
        console.log(`🏢 Server: ${targetServer.label}`);
        console.log(`📱 Application: ${targetApp.label}`);
        console.log(`🌐 Domain: selectiveadvertisinggroup.com`);
        console.log(`🔗 URL: https://selectiveadvertisinggroup.com`);
        console.log(`🌐 Server IP: ${targetServer.public_ip || '35.184.78.205'}`);

        console.log('\n📋 DNS Configuration Required:');
        console.log(`1. Point selectiveadvertisinggroup.com to: ${targetServer.public_ip || '35.184.78.205'}`);
        console.log(`2. Add A record: selectiveadvertisinggroup.com → ${targetServer.public_ip || '35.184.78.205'}`);
        console.log(`3. Add A record: www.selectiveadvertisinggroup.com → ${targetServer.public_ip || '35.184.78.205'}`);
        console.log('4. SSL certificate will be auto-provisioned by Cloudways');

        console.log('\n💡 Development Notes:');
        console.log('- Each app can have its own specific branding');
        console.log('- Use subdomains for different applications');
        console.log('- Example: app1.selectiveadvertisinggroup.com');
        console.log('- Example: app2.selectiveadvertisinggroup.com');

        console.log('\n🚀 Next Steps:');
        console.log('1. Configure DNS settings (point domain to server IP)');
        console.log('2. Wait for DNS propagation (can take up to 24 hours)');
        console.log('3. Deploy your application code');
        console.log('4. Test the domain functionality');

        console.log('\n🏢 All domains will be launched from this Fakelit server');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.response) {
            console.error('📡 Response status:', error.response.status);
            console.error('📄 Response data:', error.response.data);
        }

        if (error.message.includes('401')) {
            console.log('\n💡 Authentication Error:');
            console.log('- Check your API key and email');
            console.log('- Make sure the API key is active');
            console.log('- Verify your Cloudways account access');
        }

        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    addDomainCorrectKey();
}

module.exports = addDomainCorrectKey; 