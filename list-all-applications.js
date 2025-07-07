const DomainManager = require('./services/domainManager');

async function listAllApplications() {
    console.log('🌐 Fakelit.com Domain & Application Manager');
    console.log('==========================================\n');

    const domainManager = new DomainManager();

    try {
        // Check if credentials are configured
        const hasCloudways = process.env.CLOUDWAYS_API_KEY && process.env.CLOUDWAYS_EMAIL;
        const hasEnom = process.env.ENOM_USERNAME && process.env.ENOM_PASSWORD;

        if (!hasCloudways && !hasEnom) {
            console.log('❌ No API credentials found');
            console.log('\n📝 To configure your credentials:');
            console.log('1. Open your .env file');
            console.log('2. Add the following lines:');
            console.log('\n   # Cloudways Configuration');
            console.log('   CLOUDWAYS_API_KEY=your_cloudways_api_key');
            console.log('   CLOUDWAYS_EMAIL=your_cloudways_email');
            console.log('\n   # Enom Configuration');
            console.log('   ENOM_USERNAME=your_enom_username');
            console.log('   ENOM_PASSWORD=your_enom_password');
            console.log('\n3. Restart the application');
            return;
        }

        console.log('🔍 Checking credentials...');
        if (hasCloudways) console.log('✅ Cloudways credentials found');
        if (hasEnom) console.log('✅ Enom credentials found');

        // Generate comprehensive report
        console.log('\n🔄 Generating comprehensive report for Fakelit.com...');
        const report = await domainManager.generateReport();

        // Display the report
        await domainManager.listAllApplications();

        // Show file location
        console.log('\n📁 FILES GENERATED:');
        console.log('==================');
        console.log(`📄 DomainCreate_File.json - Complete inventory and recommendations`);
        console.log(`📊 Report includes: ${report.totalApplications} applications, ${report.totalDomains} domains`);
        console.log(`💡 ${report.recommendations.length} recommendations generated`);
        console.log(`🏢 All applications powered by: Fakelit.com`);

        // Show quick actions
        console.log('\n🚀 QUICK ACTIONS:');
        console.log('=================');
        console.log('• View detailed report: cat DomainCreate_File.json');
        console.log('• Create new domain: node create-domain.js <domain-name>');
        console.log('• Check specific platform: node check-cloudways.js or node check-enom.js');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('• Check your API credentials in .env file');
        console.log('• Verify network connectivity');
        console.log('• Ensure API keys have proper permissions');
    }
}

// Run the application
if (require.main === module) {
    listAllApplications().catch(console.error);
}

module.exports = { listAllApplications }; 