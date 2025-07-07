const DomainManager = require('./services/domainManager');

async function checkCloudways() {
    console.log('🌐 Fakelit.com - Cloudways Application Checker');
    console.log('=============================================\n');

    const domainManager = new DomainManager();

    try {
        // Check if Cloudways credentials are configured
        const hasCloudways = process.env.CLOUDWAYS_API_KEY && process.env.CLOUDWAYS_EMAIL;

        if (!hasCloudways) {
            console.log('❌ Cloudways API credentials not found');
            console.log('\n📝 To configure Cloudways credentials:');
            console.log('1. Open your .env file');
            console.log('2. Add the following lines:');
            console.log('\n   CLOUDWAYS_API_KEY=your_cloudways_api_key');
            console.log('   CLOUDWAYS_EMAIL=your_cloudways_email');
            console.log('\n3. Restart the application');
            return;
        }

        console.log('✅ Cloudways credentials found');
        console.log('🔄 Fetching Cloudways applications...\n');

        // Get Cloudways applications
        const applications = await domainManager.getCloudwaysApplications();

        if (applications.length === 0) {
            console.log('❌ No Cloudways applications found');
            console.log('\n💡 This could mean:');
            console.log('• No applications exist on your Cloudways account');
            console.log('• API key doesn\'t have proper permissions');
            console.log('• Account is inactive');
            return;
        }

        // Display applications
        console.log(`📊 Found ${applications.length} Cloudways applications:\n`);
        
        applications.forEach((app, index) => {
            console.log(`${index + 1}. ${app.appName}`);
            console.log(`   📍 Server: ${app.serverName} (${app.serverIp})`);
            console.log(`   🌐 URL: ${app.appUrl}`);
            console.log(`   📱 Type: ${app.appType} ${app.appVersion}`);
            console.log(`   📊 Status: ${app.appStatus}`);
            console.log(`   🔗 Domains: ${app.domains.length > 0 ? app.domains.join(', ') : 'None'}`);
            console.log(`   🔒 SSL: ${app.ssl ? 'Active' : 'Inactive'}`);
            console.log(`   🏢 Powered by: ${app.poweredBy || 'Fakelit.com'}`);
            console.log(`   📅 Created: ${new Date(app.createdAt).toLocaleDateString()}`);
            console.log('');
        });

        // Summary
        console.log('📈 SUMMARY:');
        console.log('==========');
        console.log(`Total Applications: ${applications.length}`);
        console.log(`Active Applications: ${applications.filter(app => app.appStatus === 'running').length}`);
        console.log(`Applications with SSL: ${applications.filter(app => app.ssl).length}`);
        console.log(`Total Domains: ${applications.reduce((total, app) => total + app.domains.length, 0)}`);
        console.log(`Brand: All applications powered by Fakelit.com`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('• Check your Cloudways API key in .env file');
        console.log('• Verify your Cloudways email address');
        console.log('• Ensure API key has proper permissions');
        console.log('• Check network connectivity');
    }
}

// Run the application
if (require.main === module) {
    checkCloudways().catch(console.error);
}

module.exports = { checkCloudways }; 