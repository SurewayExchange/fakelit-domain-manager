#!/usr/bin/env node

/**
 * Complete SSL Certificate Setup for Fakelit.com
 * 
 * This script provides step-by-step instructions for setting up
 * SSL certificates on Cloudways for fakelit.com and www.fakelit.com
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Fakelit.com - Complete SSL Certificate Setup');
console.log('===============================================\n');

console.log('📋 **PRE-SETUP CHECKLIST**');
console.log('==========================');
console.log('✅ Fakelit.com application deployed on Cloudways');
console.log('✅ Domain fakelit.com added to application');
console.log('✅ DNS records pointing to Cloudways server');
console.log('✅ Application running and accessible\n');

console.log('🔧 **STEP-BY-STEP SSL SETUP**');
console.log('=============================\n');

console.log('STEP 1: Access Cloudways Dashboard');
console.log('-----------------------------------');
console.log('1. Open browser and go to: https://platform.cloudways.com/');
console.log('2. Log in with your Cloudways credentials');
console.log('3. Navigate to your Fakelit.com application\n');

console.log('STEP 2: Navigate to SSL Settings');
console.log('---------------------------------');
console.log('1. Click on your Fakelit.com application');
console.log('2. Go to "Application Settings" tab');
console.log('3. Click on "SSL Certificate" sub-tab\n');

console.log('STEP 3: Add Primary Domain');
console.log('----------------------------');
console.log('1. Click "Add Domain" button');
console.log('2. Enter domain name: fakelit.com');
console.log('3. Click "Add Domain" to confirm');
console.log('4. Wait for domain to be added (usually instant)\n');

console.log('STEP 4: Enable SSL for Primary Domain');
console.log('--------------------------------------');
console.log('1. Find "fakelit.com" in the domain list');
console.log('2. Click "Enable SSL" button next to it');
console.log('3. Choose "Let\'s Encrypt" (free option)');
console.log('4. Click "Enable SSL" to confirm');
console.log('5. Wait 5-10 minutes for certificate installation\n');

console.log('STEP 5: Add www Subdomain');
console.log('---------------------------');
console.log('1. Click "Add Domain" button again');
console.log('2. Enter domain name: www.fakelit.com');
console.log('3. Click "Add Domain" to confirm\n');

console.log('STEP 6: Enable SSL for www Subdomain');
console.log('-------------------------------------');
console.log('1. Find "www.fakelit.com" in the domain list');
console.log('2. Click "Enable SSL" button next to it');
console.log('3. Choose "Let\'s Encrypt" (free option)');
console.log('4. Click "Enable SSL" to confirm');
console.log('5. Wait 5-10 minutes for certificate installation\n');

console.log('STEP 7: Force HTTPS Redirect');
console.log('-----------------------------');
console.log('1. In SSL settings, find "Force HTTPS" option');
console.log('2. Enable "Force HTTPS" toggle');
console.log('3. This will automatically redirect HTTP to HTTPS\n');

console.log('STEP 8: Verify SSL Installation');
console.log('--------------------------------');
console.log('1. Wait 10-15 minutes for all certificates to install');
console.log('2. Test the following URLs:');
console.log('   • https://fakelit.com');
console.log('   • https://www.fakelit.com');
console.log('   • http://fakelit.com (should redirect to HTTPS)');
console.log('   • http://www.fakelit.com (should redirect to HTTPS)');
console.log('3. Check for green padlock in browser address bar\n');

console.log('🔍 **TROUBLESHOOTING GUIDE**');
console.log('============================\n');

console.log('❌ **Common Issues & Solutions:**\n');

console.log('Issue: Certificate Not Installing');
console.log('Solution:');
console.log('  • Check DNS records are correct');
console.log('  • Ensure domain resolves to Cloudways IP');
console.log('  • Wait 10-15 minutes and try again');
console.log('  • Check Cloudways application logs\n');

console.log('Issue: DNS Resolution Problems');
console.log('Solution:');
console.log('  • Verify A record points to Cloudways server IP');
console.log('  • Add CNAME record: www → fakelit.com');
console.log('  • Wait for DNS propagation (up to 48 hours)');
console.log('  • Use DNS checker tools to verify\n');

console.log('Issue: Mixed Content Warnings');
console.log('Solution:');
console.log('  • Update all internal links to use HTTPS');
console.log('  • Check for hardcoded HTTP URLs in code');
console.log('  • Update image and script sources to HTTPS\n');

console.log('Issue: Certificate Expired');
console.log('Solution:');
console.log('  • Let\'s Encrypt auto-renews every 90 days');
console.log('  • Check Cloudways auto-renewal settings');
console.log('  • Manual renewal available in SSL settings\n');

console.log('✅ **SSL BENEFITS**');
console.log('==================');
console.log('🔒 Secure HTTPS connections');
console.log('🏆 Better SEO rankings');
console.log('💳 PCI compliance for payments');
console.log('🎯 Customer trust and security');
console.log('📈 Improved website performance\n');

console.log('📞 **SUPPORT INFORMATION**');
console.log('==========================');
console.log('• Cloudways Support: Available 24/7');
console.log('• Fakelit.com Support: 702-664-0009');
console.log('• Email: support@fakelit.com');
console.log('• Address: 2300 W Sahara Ave Suite 800, Las Vegas, NV 89102\n');

console.log('🎯 **POST-SETUP CHECKLIST**');
console.log('==========================');
console.log('1. ✅ SSL certificates installed');
console.log('2. ✅ HTTPS working on both domains');
console.log('3. ✅ HTTP redirecting to HTTPS');
console.log('4. ✅ Green padlock visible in browser');
console.log('5. ✅ No mixed content warnings');
console.log('6. ✅ Payment gateways configured for HTTPS');
console.log('7. ✅ Sitemap updated with HTTPS URLs');
console.log('8. ✅ SSL monitoring set up\n');

console.log('🔒 **SSL CONFIGURATION SUMMARY**');
console.log('================================');
console.log('Domain: fakelit.com');
console.log('Subdomain: www.fakelit.com');
console.log('Certificate Type: Let\'s Encrypt');
console.log('Auto-renewal: Enabled');
console.log('Force HTTPS: Enabled');
console.log('Status: Ready for setup\n');

console.log('🚀 **READY TO PROCEED**');
console.log('======================');
console.log('Follow the steps above to complete SSL setup.');
console.log('Run "node verify-ssl.js" after setup to verify installation.');
console.log('');
console.log('🏢 Powered by Fakelit.com');

// Create setup tracking file
const setupConfig = {
    domain: 'fakelit.com',
    subdomains: ['www.fakelit.com'],
    certificateType: 'lets-encrypt',
    autoRenewal: true,
    forceHttps: true,
    setupDate: new Date().toISOString(),
    status: 'ready-for-setup',
    steps: [
        'Access Cloudways Dashboard',
        'Navigate to SSL Settings',
        'Add Primary Domain',
        'Enable SSL for Primary Domain',
        'Add www Subdomain',
        'Enable SSL for www Subdomain',
        'Force HTTPS Redirect',
        'Verify SSL Installation'
    ]
};

const configPath = path.join(__dirname, 'ssl-setup-config.json');
fs.writeFileSync(configPath, JSON.stringify(setupConfig, null, 2));

console.log(`\n📄 Setup configuration saved to: ${configPath}`);
console.log('Use this file to track your SSL setup progress.');

module.exports = {
    setupSSL: () => {
        console.log('Complete SSL setup guide displayed');
    }
}; 