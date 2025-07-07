const DomainManager = require('./services/domainManager');

async function checkEnom() {
    console.log('🌐 Fakelit.com - Enom Domain Checker');
    console.log('====================================\n');

    const domainManager = new DomainManager();

    try {
        // Check if Enom credentials are configured
        const hasEnom = process.env.ENOM_USERNAME && process.env.ENOM_PASSWORD;

        if (!hasEnom) {
            console.log('❌ Enom credentials not found');
            console.log('\n📝 To configure Enom credentials:');
            console.log('1. Open your .env file');
            console.log('2. Add the following lines:');
            console.log('\n   ENOM_USERNAME=your_enom_username');
            console.log('   ENOM_PASSWORD=your_enom_password');
            console.log('\n3. Restart the application');
            return;
        }

        console.log('✅ Enom credentials found');
        console.log('🔄 Fetching Enom domains...\n');

        // Get Enom domains
        const domains = await domainManager.getEnomDomains();

        if (domains.length === 0) {
            console.log('❌ No Enom domains found');
            console.log('\n💡 This could mean:');
            console.log('• No domains exist on your Enom account');
            console.log('• Credentials are incorrect');
            console.log('• Account is inactive');
            return;
        }

        // Display domains
        console.log(`📊 Found ${domains.length} Enom domains:\n`);
        
        domains.forEach((domain, index) => {
            const expiryDate = new Date(domain.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            const isExpiringSoon = daysUntilExpiry <= 30;
            
            console.log(`${index + 1}. ${domain.domainName}`);
            console.log(`   📅 Expires: ${expiryDate.toLocaleDateString()}`);
            console.log(`   ⏰ Days until expiry: ${daysUntilExpiry}${isExpiringSoon ? ' ⚠️ EXPIRING SOON' : ''}`);
            console.log(`   🔄 Auto-renew: ${domain.autoRenew ? 'Yes' : 'No'}`);
            console.log(`   📊 Status: ${domain.status}`);
            console.log(`   🏢 Powered by: ${domain.poweredBy || 'Fakelit.com'}`);
            console.log('');
        });

        // Summary
        const expiringSoon = domains.filter(domain => {
            const daysUntilExpiry = Math.ceil((new Date(domain.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30;
        });

        console.log('📈 SUMMARY:');
        console.log('==========');
        console.log(`Total Domains: ${domains.length}`);
        console.log(`Auto-renewal Enabled: ${domains.filter(domain => domain.autoRenew).length}`);
        console.log(`Expiring Soon (≤30 days): ${expiringSoon.length}`);
        console.log(`Active Domains: ${domains.filter(domain => domain.status === 'Active').length}`);
        console.log(`Brand: All domains powered by Fakelit.com`);

        if (expiringSoon.length > 0) {
            console.log('\n⚠️  DOMAINS EXPIRING SOON:');
            console.log('========================');
            expiringSoon.forEach(domain => {
                const daysUntilExpiry = Math.ceil((new Date(domain.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                console.log(`• ${domain.domainName} - ${daysUntilExpiry} days`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('• Check your Enom username and password in .env file');
        console.log('• Verify your Enom account is active');
        console.log('• Ensure account has API access');
        console.log('• Check network connectivity');
    }
}

// Run the application
if (require.main === module) {
    checkEnom().catch(console.error);
}

module.exports = { checkEnom }; 