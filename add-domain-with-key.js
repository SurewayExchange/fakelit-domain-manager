#!/usr/bin/env node

/**
 * Add selectiveadvertisinggroup.com to Cloudways Server
 * Using provided API key: IRF4eMEfcZ01UNWWNTESY6E0WhT8hT
 */

const CloudwaysService = require('./services/cloudwaysService');

async function addDomainWithKey() {
    console.log('🌐 Add selectiveadvertisinggroup.com to Cloudways Server');
    console.log('=======================================================\n');
    console.log('🏢 Server IP: 35.184.78.205');
    console.log('🔑 API Key: IRF4eMEfcZ01UNWWNTESY6E0WhT8hT\n');

    try {
        // Set environment variables directly
        process.env.CLOUDWAYS_API_KEY = 'IRF4eMEfcZ01UNWWNTESY6E0WhT8hT';
        
        // We still need the email - let's prompt for it
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (prompt) => new Promise((resolve) => {
            rl.question(prompt, resolve);
        });

        const email = await question('Enter your Cloudways Email: ');
        rl.close();

        if (!email) {
            console.log('❌ Email is required');
            return;
        }

        process.env.CLOUDWAYS_EMAIL = email;

        const cloudwaysService = new CloudwaysService();

        console.log('✅ Cloudways credentials configured');
        console.log('🔍 Connecting to Cloudways...\n');

        // Get all servers
        const servers = await cloudwaysService.getServers();
        console.log(`📊 Found ${servers.length} servers`);

        // Find the server with IP 35.184.78.205
        const targetServer = servers.find(server => 
            server.public_ip === '35.184.78.205' || 
            server.private_ip === '35.184.78.205' ||
            server.label?.toLowerCase().includes('fakelit')
        );

        if (!targetServer) {
            console.log('❌ Server with IP 35.184.78.205 not found');
            console.log('Available servers:');
            servers.forEach((server, index) => {
                console.log(`${index + 1}. ${server.label} - IP: ${server.public_ip || 'N/A'}`);
            });
            return;
        }

        console.log(`✅ Found target server: ${targetServer.label}`);
        console.log(`🆔 Server ID: ${targetServer.id}`);
        console.log(`🌐 Public IP: ${targetServer.public_ip || 'N/A'}`);

        // Get applications on the target server
        const applications = await cloudwaysService.getApplicationsByServer(targetServer.id);
        
        if (applications.length === 0) {
            console.log('❌ No applications found on the target server');
            console.log('Please create an application first');
            return;
        }

        console.log(`📱 Found ${applications.length} applications on server`);

        // Display applications
        console.log('\n📋 Available Applications:');
        applications.forEach((app, index) => {
            console.log(`${index + 1}. ${app.label} (ID: ${app.id})`);
            console.log(`   URL: ${app.url || 'N/A'}`);
            console.log(`   Status: ${app.status || 'Unknown'}`);
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
        console.log(`🌐 Server IP: 35.184.78.205`);

        console.log('\n📋 DNS Configuration Required:');
        console.log('1. Point selectiveadvertisinggroup.com to: 35.184.78.205');
        console.log('2. Add A record: selectiveadvertisinggroup.com → 35.184.78.205');
        console.log('3. Add A record: www.selectiveadvertisinggroup.com → 35.184.78.205');
        console.log('4. SSL certificate will be auto-provisioned by Cloudways');

        console.log('\n💡 Development Notes:');
        console.log('- Each app can have its own specific branding');
        console.log('- Use subdomains for different applications');
        console.log('- Example: app1.selectiveadvertisinggroup.com');
        console.log('- Example: app2.selectiveadvertisinggroup.com');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.response) {
            console.error('📡 Response status:', error.response.status);
            console.error('📄 Response data:', error.response.data);
        }

        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    addDomainWithKey();
}

module.exports = addDomainWithKey; 