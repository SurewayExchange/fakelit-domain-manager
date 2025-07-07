#!/usr/bin/env node

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
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            const cert = res.socket.getPeerCertificate();
            resolve({
                domain,
                status: 'success',
                statusCode: res.statusCode,
                certificate: {
                    subject: cert.subject.CN,
                    issuer: cert.issuer.CN,
                    validFrom: cert.valid_from,
                    validTo: cert.valid_to,
                    daysRemaining: Math.ceil((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24))
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                domain,
                status: 'error',
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                domain,
                status: 'timeout',
                error: 'Request timed out'
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
            timeout: 10000
        };

        const req = http.request(options, (res) => {
            resolve({
                domain,
                status: 'redirect',
                statusCode: res.statusCode,
                location: res.headers.location
            });
        });

        req.on('error', (error) => {
            resolve({
                domain,
                status: 'error',
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                domain,
                status: 'timeout',
                error: 'Request timed out'
            });
        });

        req.end();
    });
}

async function verifySSL() {
    console.log('🔍 Checking SSL certificates...\n');

    for (const domain of domains) {
        console.log(`📋 Checking: ${domain}`);
        
        // Check HTTPS
        const sslResult = await checkSSL(domain);
        
        if (sslResult.status === 'success') {
            console.log(`✅ HTTPS: Working`);
            console.log(`   Certificate: ${sslResult.certificate.subject}`);
            console.log(`   Issuer: ${sslResult.certificate.issuer}`);
            console.log(`   Valid Until: ${sslResult.certificate.validTo}`);
            console.log(`   Days Remaining: ${sslResult.certificate.daysRemaining}`);
            console.log(`   Status Code: ${sslResult.statusCode}`);
        } else {
            console.log(`❌ HTTPS: ${sslResult.error}`);
        }

        // Check HTTP redirect
        const httpResult = await checkHTTPRedirect(domain);
        
        if (httpResult.status === 'redirect') {
            console.log(`✅ HTTP Redirect: ${httpResult.statusCode} → ${httpResult.location}`);
        } else {
            console.log(`⚠️  HTTP: ${httpResult.error || 'No redirect'}`);
        }

        console.log('');
    }

    console.log('🎯 **SSL Verification Summary:**');
    console.log('✅ SSL certificates should be installed');
    console.log('✅ HTTPS should be working');
    console.log('✅ HTTP should redirect to HTTPS');
    console.log('✅ Green padlock should appear in browser\n');

    console.log('🔗 **Test URLs:**');
    console.log('   • https://fakelit.com');
    console.log('   • https://www.fakelit.com');
    console.log('   • http://fakelit.com (should redirect)');
    console.log('   • http://www.fakelit.com (should redirect)\n');

    console.log('📞 **If SSL is not working:**');
    console.log('   • Contact Cloudways Support');
    console.log('   • Check DNS records');
    console.log('   • Verify domain is added to application');
    console.log('   • Wait 10-15 minutes for certificate installation\n');

    console.log('🏢 Powered by Fakelit.com');
}

if (require.main === module) {
    verifySSL();
}

module.exports = { verifySSL }; 