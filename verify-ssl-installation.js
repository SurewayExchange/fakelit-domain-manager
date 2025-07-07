#!/usr/bin/env node

/**
 * SSL Certificate Verification for Fakelit.com
 * 
 * This script verifies SSL certificate installation
 * and provides detailed status information
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

console.log('🔒 Fakelit.com - SSL Certificate Verification');
console.log('=============================================\n');

const domains = [
    'fakelit.com',
    'www.fakelit.com'
];

async function checkSSL(domain) {
    return new Promise((resolve) => {
        const options = {
            hostname: domain,
            port: 443,
            method: 'GET',
            path: '/',
            timeout: 10000,
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            const cert = res.socket.getPeerCertificate();
            resolve({
                domain,
                status: 'success',
                statusCode: res.statusCode,
                certificate: {
                    subject: cert.subject,
                    issuer: cert.issuer,
                    validFrom: cert.valid_from,
                    validTo: cert.valid_to,
                    serialNumber: cert.serialNumber
                },
                headers: res.headers,
                https: true
            });
        });

        req.on('error', (error) => {
            resolve({
                domain,
                status: 'error',
                error: error.message,
                https: false
            });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                domain,
                status: 'timeout',
                error: 'Request timeout',
                https: false
            });
        });

        req.end();
    });
}

async function checkHTTPRedirect(domain) {
    return new Promise((resolve) => {
        const options = {
            hostname: domain,
            port: 80,
            method: 'GET',
            path: '/',
            timeout: 10000,
            followRedirect: false
        };

        const req = http.request(options, (res) => {
            resolve({
                domain,
                status: 'success',
                statusCode: res.statusCode,
                location: res.headers.location,
                redirects: res.statusCode >= 300 && res.statusCode < 400
            });
        });

        req.on('error', (error) => {
            resolve({
                domain,
                status: 'error',
                error: error.message,
                redirects: false
            });
        });

        req.setTimeout(10000, () => {
            req.destroy();
            resolve({
                domain,
                status: 'timeout',
                error: 'Request timeout',
                redirects: false
            });
        });

        req.end();
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calculateDaysRemaining(validTo) {
    const expiryDate = new Date(validTo);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

async function verifySSLInstallation() {
    console.log('🔍 Checking SSL certificates...\n');

    // Check HTTPS certificates
    const sslResults = await Promise.all(domains.map(domain => checkSSL(domain)));
    
    // Check HTTP redirects
    const redirectResults = await Promise.all(domains.map(domain => checkHTTPRedirect(domain)));

    console.log('📊 **SSL CERTIFICATE STATUS**');
    console.log('=============================\n');

    sslResults.forEach(result => {
        console.log(`🌐 **${result.domain}**`);
        console.log('----------------------------');
        
        if (result.status === 'success') {
            const daysRemaining = calculateDaysRemaining(result.certificate.validTo);
            const isExpiringSoon = daysRemaining <= 30;
            
            console.log(`✅ Status: SSL Certificate Active`);
            console.log(`📅 Valid From: ${formatDate(result.certificate.validFrom)}`);
            console.log(`📅 Valid Until: ${formatDate(result.certificate.validTo)}`);
            console.log(`⏰ Days Remaining: ${daysRemaining} days`);
            console.log(`🏢 Issuer: ${result.certificate.issuer.CN || result.certificate.issuer.O}`);
            console.log(`🔢 Serial Number: ${result.certificate.serialNumber}`);
            
            if (isExpiringSoon) {
                console.log(`⚠️  WARNING: Certificate expires in ${daysRemaining} days!`);
            }
            
            console.log(`📊 HTTP Status: ${result.statusCode}`);
        } else {
            console.log(`❌ Status: SSL Certificate Not Found`);
            console.log(`❌ Error: ${result.error}`);
            console.log(`🔧 Action Required: Install SSL certificate`);
        }
        console.log('');
    });

    console.log('🔄 **HTTP TO HTTPS REDIRECTS**');
    console.log('==============================\n');

    redirectResults.forEach(result => {
        console.log(`🌐 **${result.domain}**`);
        console.log('----------------------------');
        
        if (result.status === 'success' && result.redirects) {
            console.log(`✅ Status: Redirecting to HTTPS`);
            console.log(`📊 Status Code: ${result.statusCode}`);
            console.log(`📍 Redirect Location: ${result.location}`);
        } else if (result.status === 'success' && !result.redirects) {
            console.log(`⚠️  Status: Not redirecting to HTTPS`);
            console.log(`📊 Status Code: ${result.statusCode}`);
            console.log(`🔧 Action Required: Enable HTTPS redirect`);
        } else {
            console.log(`❌ Status: HTTP not accessible`);
            console.log(`❌ Error: ${result.error}`);
        }
        console.log('');
    });

    // Overall assessment
    const sslSuccess = sslResults.filter(r => r.status === 'success').length;
    const redirectSuccess = redirectResults.filter(r => r.status === 'success' && r.redirects).length;
    
    console.log('📈 **OVERALL ASSESSMENT**');
    console.log('=========================\n');
    
    if (sslSuccess === domains.length && redirectSuccess === domains.length) {
        console.log('🎉 **PERFECT SSL SETUP**');
        console.log('✅ All domains have SSL certificates');
        console.log('✅ All domains redirect HTTP to HTTPS');
        console.log('✅ SSL setup is complete and secure');
    } else if (sslSuccess === domains.length) {
        console.log('🔒 **SSL CERTIFICATES INSTALLED**');
        console.log('✅ All domains have SSL certificates');
        console.log('⚠️  Some domains may not redirect HTTP to HTTPS');
        console.log('🔧 Consider enabling HTTPS redirects');
    } else if (sslSuccess > 0) {
        console.log('⚠️  **PARTIAL SSL SETUP**');
        console.log(`✅ ${sslSuccess}/${domains.length} domains have SSL`);
        console.log(`❌ ${domains.length - sslSuccess} domains need SSL certificates`);
        console.log('🔧 Complete SSL installation for remaining domains');
    } else {
        console.log('❌ **SSL SETUP REQUIRED**');
        console.log('❌ No SSL certificates found');
        console.log('🔧 Follow SSL setup guide to install certificates');
    }

    console.log('\n🔧 **NEXT STEPS**');
    console.log('==================');
    
    if (sslSuccess < domains.length) {
        console.log('1. Follow the SSL setup guide');
        console.log('2. Install SSL certificates for missing domains');
        console.log('3. Enable HTTPS redirects');
    } else if (redirectSuccess < domains.length) {
        console.log('1. Enable HTTPS redirects in Cloudways');
        console.log('2. Test HTTP to HTTPS redirection');
    } else {
        console.log('1. ✅ SSL setup is complete!');
        console.log('2. Monitor certificate expiration dates');
        console.log('3. Set up SSL monitoring alerts');
    }

    console.log('\n📞 **SUPPORT**');
    console.log('==============');
    console.log('• Fakelit.com Support: 702-664-0009');
    console.log('• Email: support@fakelit.com');
    console.log('• Cloudways Support: Available 24/7');
    
    console.log('\n🏢 Powered by Fakelit.com');
}

// Run verification
verifySSLInstallation().catch(console.error);

module.exports = {
    verifySSLInstallation
}; 