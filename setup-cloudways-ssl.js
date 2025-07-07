#!/usr/bin/env node

/**
 * Cloudways SSL Certificate Setup for Fakelit.com
 * 
 * This script guides you through setting up SSL certificates
 * for fakelit.com and www.fakelit.com on Cloudways.
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Fakelit.com - Cloudways SSL Certificate Setup');
console.log('================================================\n');

console.log('📋 Prerequisites:');
console.log('✅ Fakelit.com application deployed on Cloudways');
console.log('✅ Domain fakelit.com added to application');
console.log('✅ DNS records pointing to Cloudways server\n');

console.log('🔧 SSL Certificate Setup Steps:\n');

console.log('1. **Access Cloudways Dashboard**');
console.log('   • Go to: https://platform.cloudways.com/');
console.log('   • Log in with your credentials');
console.log('   • Navigate to your Fakelit.com application\n');

console.log('2. **Navigate to SSL Settings**');
console.log('   • Click on your application');
console.log('   • Go to "Application Settings"');
console.log('   • Click on "SSL Certificate" tab\n');

console.log('3. **Add Custom Domain**');
console.log('   • Click "Add Domain"');
console.log('   • Enter: fakelit.com');
console.log('   • Click "Add Domain"\n');

console.log('4. **Enable SSL Certificate**');
console.log('   • Find fakelit.com in the domain list');
console.log('   • Click "Enable SSL" button');
console.log('   • Choose "Let\'s Encrypt" (free)');
console.log('   • Click "Enable SSL"\n');

console.log('5. **Add www Subdomain**');
console.log('   • Click "Add Domain" again');
console.log('   • Enter: www.fakelit.com');
console.log('   • Click "Add Domain"');
console.log('   • Enable SSL for www.fakelit.com\n');

console.log('6. **Verify SSL Installation**');
console.log('   • Wait 5-10 minutes for certificate to install');
console.log('   • Test: https://fakelit.com');
console.log('   • Test: https://www.fakelit.com');
console.log('   • Check for green padlock in browser\n');

console.log('7. **Force HTTPS Redirect**');
console.log('   • In SSL settings, enable "Force HTTPS"');
console.log('   • This redirects HTTP to HTTPS automatically\n');

console.log('8. **Update DNS Records** (if needed)');
console.log('   • Ensure A record points to Cloudways IP');
console.log('   • Add CNAME record: www → fakelit.com');
console.log('   • Wait for DNS propagation (up to 48 hours)\n');

console.log('🔍 **Troubleshooting SSL Issues:**\n');

console.log('❌ **Certificate Not Installing:**');
console.log('   • Check DNS records are correct');
console.log('   • Ensure domain resolves to Cloudways IP');
console.log('   • Wait 10-15 minutes and try again');
console.log('   • Check Cloudways logs for errors\n');

console.log('❌ **Mixed Content Warnings:**');
console.log('   • Update all internal links to use HTTPS');
console.log('   • Check for hardcoded HTTP URLs');
console.log('   • Update image and script sources\n');

console.log('❌ **Certificate Expired:**');
console.log('   • Let\'s Encrypt auto-renews every 90 days');
console.log('   • Check Cloudways auto-renewal settings');
console.log('   • Manual renewal available in SSL settings\n');

console.log('✅ **SSL Certificate Benefits:**');
console.log('   • Secure HTTPS connections');
console.log('   • Green padlock in browser');
console.log('   • Better SEO rankings');
console.log('   • Customer trust and security');
console.log('   • PCI compliance for payments\n');

console.log('📞 **Support Information:**');
console.log('   • Cloudways Support: Available 24/7');
console.log('   • Fakelit.com Support: 702-664-0009');
console.log('   • Email: support@fakelit.com\n');

console.log('🎯 **Next Steps After SSL Setup:**');
console.log('   1. Test all pages with HTTPS');
console.log('   2. Update any hardcoded HTTP links');
console.log('   3. Configure payment gateways for HTTPS');
console.log('   4. Set up monitoring for certificate expiry');
console.log('   5. Update sitemap.xml with HTTPS URLs\n');

console.log('🏢 **Fakelit.com SSL Configuration:**');
console.log('   • Domain: fakelit.com');
console.log('   • Subdomain: www.fakelit.com');
console.log('   • Certificate Type: Let\'s Encrypt');
console.log('   • Auto-renewal: Enabled');
console.log('   • Force HTTPS: Enabled\n');

console.log('🔒 SSL Certificate setup complete!');
console.log('Visit https://fakelit.com to verify secure connection.');
console.log('');
console.log('Powered by Fakelit.com');

// Create SSL configuration file
const sslConfig = {
    domain: 'fakelit.com',
    subdomains: ['www.fakelit.com'],
    certificateType: 'lets-encrypt',
    autoRenewal: true,
    forceHttps: true,
    setupDate: new Date().toISOString(),
    status: 'pending-setup'
};

const configPath = path.join(__dirname, 'ssl-config.json');
fs.writeFileSync(configPath, JSON.stringify(sslConfig, null, 2));

console.log(`\n📄 SSL configuration saved to: ${configPath}`);
console.log('Use this file to track your SSL setup progress.');

module.exports = {
    setupSSL: () => {
        console.log('SSL setup guide displayed');
    }
}; 