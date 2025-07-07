const CloudwaysService = require('./services/cloudwaysService');

async function checkCloudwaysApps() {
    console.log('🌐 CareConnect Cloudways Application Checker');
    console.log('==========================================\n');

    const cloudwaysService = new CloudwaysService();

    // Check if credentials are configured
    if (!process.env.CLOUDWAYS_API_KEY || !process.env.CLOUDWAYS_EMAIL) {
        console.log('❌ Cloudways credentials not found in .env file');
        console.log('\n📝 To configure your Cloudways credentials:');
        console.log('1. Open your .env file');
        console.log('2. Add the following lines:');
        console.log('   CLOUDWAYS_API_KEY=your_cloudways_api_key');
        console.log('   CLOUDWAYS_EMAIL=your_cloudways_email');
        console.log('\n🔑 Or run this script with credentials:');
        console.log('CLOUDWAYS_API_KEY=your_key CLOUDWAYS_EMAIL=your_email node check-cloudways-apps.js');
        return;
    }

    console.log('✅ Cloudways credentials found');
    console.log('🔍 Checking your applications...\n');

    try {
        // List all applications
        await cloudwaysService.listAllApplications();

    } catch (error) {
        console.error('❌ Error checking Cloudways applications:', error.message);
        
        if (error.message.includes('credentials not configured')) {
            console.log('\n💡 To get your Cloudways API credentials:');
            console.log('1. Log into your Cloudways account');
            console.log('2. Go to Account > API Keys');
            console.log('3. Generate a new API key');
            console.log('4. Use your Cloudways email and the generated API key');
        }
    }
}

// Run the check
checkCloudwaysApps().catch(console.error); 