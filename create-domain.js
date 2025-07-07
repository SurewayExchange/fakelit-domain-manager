const DomainManager = require('./services/domainManager');

async function createDomain() {
    console.log('🌐 Fakelit.com - Domain Creation Tool');
    console.log('====================================\n');

    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('❌ Domain name is required');
        console.log('\n📖 Usage:');
        console.log('node create-domain.js <domain-name> [platform]');
        console.log('\n📝 Examples:');
        console.log('node create-domain.js myapp.com');
        console.log('node create-domain.js myapp.com Cloudways');
        console.log('node create-domain.js mydomain.com Enom');
        console.log('\n🏢 All domains will be powered by Fakelit.com');
        return;
    }

    const domainName = args[0];
    const platform = args[1] || 'Cloudways'; // Default to Cloudways

    // Validate domain name
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domainName)) {
        console.log('❌ Invalid domain name format');
        console.log('💡 Domain should be in format: example.com');
        return;
    }

    // Validate platform
    const validPlatforms = ['Cloudways', 'Enom'];
    if (!validPlatforms.includes(platform)) {
        console.log('❌ Invalid platform');
        console.log(`💡 Valid platforms: ${validPlatforms.join(', ')}`);
        return;
    }

    const domainManager = new DomainManager();

    try {
        console.log(`🚀 Creating domain: ${domainName}`);
        console.log(`🏗️  Platform: ${platform}`);
        console.log(`🏢 Brand: Fakelit.com`);
        console.log('');

        // Check credentials
        const hasCloudways = process.env.CLOUDWAYS_API_KEY && process.env.CLOUDWAYS_EMAIL;
        const hasEnom = process.env.ENOM_USERNAME && process.env.ENOM_PASSWORD;

        if (platform === 'Cloudways' && !hasCloudways) {
            console.log('❌ Cloudways credentials not found');
            console.log('\n📝 To configure Cloudways:');
            console.log('CLOUDWAYS_API_KEY=your_api_key');
            console.log('CLOUDWAYS_EMAIL=your_email');
            return;
        }

        if (platform === 'Enom' && !hasEnom) {
            console.log('❌ Enom credentials not found');
            console.log('\n📝 To configure Enom:');
            console.log('ENOM_USERNAME=your_username');
            console.log('ENOM_PASSWORD=your_password');
            return;
        }

        console.log('✅ Credentials verified');
        console.log('🔄 Creating domain...\n');

        // Create the domain
        const result = await domainManager.createDomain(domainName, platform);

        if (result.success) {
            console.log('✅ Domain created successfully!');
            console.log('📊 Details:');
            console.log(`   Domain: ${result.domainName}`);
            console.log(`   Platform: ${result.platform}`);
            if (result.appId) console.log(`   App ID: ${result.appId}`);
            if (result.serverId) console.log(`   Server ID: ${result.serverId}`);
            console.log(`   Brand: ${result.poweredBy || 'Fakelit.com'}`);
            console.log(`   Message: ${result.message}`);
            
            console.log('\n🎉 Your domain is now ready!');
            console.log('🏢 Powered by Fakelit.com');
        } else {
            console.log('❌ Failed to create domain');
            console.log(`Error: ${result.message}`);
        }

    } catch (error) {
        console.error('❌ Error creating domain:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('• Check your API credentials');
        console.log('• Verify domain name is available');
        console.log('• Ensure account has proper permissions');
        console.log('• Check network connectivity');
    }
}

// Run the application
if (require.main === module) {
    createDomain().catch(console.error);
}

module.exports = { createDomain }; 