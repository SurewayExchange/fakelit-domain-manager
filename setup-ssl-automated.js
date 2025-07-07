#!/usr/bin/env node

/**
 * Automated SSL Certificate Setup for Fakelit.com
 * 
 * This script automatically configures SSL certificates
 * for fakelit.com and www.fakelit.com on Cloudways
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🔒 Fakelit.com - Automated SSL Certificate Setup');
console.log('================================================\n');

class FakelitSSLSetup {
    constructor() {
        this.baseUrl = 'https://api.cloudways.com/api/v1';
        this.apiKey = process.env.CLOUDWAYS_API_KEY || '2kh39nQVNG6MIDpQTxeIi0wS3WAUB4';
        this.email = process.env.CLOUDWAYS_EMAIL || 'marquibelbrooks@gmail.com';
        this.domain = 'fakelit.com';
        this.subdomains = ['www.fakelit.com'];
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async getServers() {
        try {
            console.log('🔍 Fetching Cloudways servers...');
            const response = await axios.get(`${this.baseUrl}/server`, {
                headers: this.getAuthHeaders(),
                timeout: 10000
            });
            
            if (response.data && response.data.servers) {
                console.log(`✅ Found ${response.data.servers.length} servers`);
                return response.data.servers;
            } else {
                console.log('❌ No servers found');
                return [];
            }
        } catch (error) {
            console.log(`❌ Error fetching servers: ${error.message}`);
            return [];
        }
    }

    async getApplications(serverId) {
        try {
            console.log(`🔍 Fetching applications for server ${serverId}...`);
            const response = await axios.get(`${this.baseUrl}/app`, {
                headers: this.getAuthHeaders(),
                params: { server_id: serverId },
                timeout: 10000
            });
            
            if (response.data && response.data.apps) {
                console.log(`✅ Found ${response.data.apps.length} applications`);
                return response.data.apps;
            } else {
                console.log('❌ No applications found');
                return [];
            }
        } catch (error) {
            console.log(`❌ Error fetching applications: ${error.message}`);
            return [];
        }
    }

    async addDomain(serverId, appId, domain) {
        try {
            console.log(`🌐 Adding domain: ${domain}`);
            const response = await axios.post(`${this.baseUrl}/app/manage/domain`, {
                server_id: serverId,
                app_id: appId,
                domain: domain
            }, {
                headers: this.getAuthHeaders(),
                timeout: 15000
            });
            
            if (response.data && response.data.status === 'success') {
                console.log(`✅ Domain ${domain} added successfully`);
                return true;
            } else {
                console.log(`❌ Failed to add domain ${domain}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ Error adding domain ${domain}: ${error.message}`);
            return false;
        }
    }

    async enableSSL(serverId, appId, domain) {
        try {
            console.log(`🔒 Enabling SSL for: ${domain}`);
            const response = await axios.post(`${this.baseUrl}/app/manage/ssl`, {
                server_id: serverId,
                app_id: appId,
                domain: domain,
                ssl_type: 'lets_encrypt'
            }, {
                headers: this.getAuthHeaders(),
                timeout: 30000
            });
            
            if (response.data && response.data.status === 'success') {
                console.log(`✅ SSL enabled for ${domain}`);
                return true;
            } else {
                console.log(`❌ Failed to enable SSL for ${domain}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ Error enabling SSL for ${domain}: ${error.message}`);
            return false;
        }
    }

    async forceHTTPS(serverId, appId) {
        try {
            console.log('🔄 Enabling HTTPS redirect...');
            const response = await axios.post(`${this.baseUrl}/app/manage/ssl/force_https`, {
                server_id: serverId,
                app_id: appId,
                force_https: true
            }, {
                headers: this.getAuthHeaders(),
                timeout: 15000
            });
            
            if (response.data && response.data.status === 'success') {
                console.log('✅ HTTPS redirect enabled');
                return true;
            } else {
                console.log('❌ Failed to enable HTTPS redirect');
                return false;
            }
        } catch (error) {
            console.log(`❌ Error enabling HTTPS redirect: ${error.message}`);
            return false;
        }
    }

    async setupSSL() {
        console.log('🚀 Starting automated SSL setup...\n');

        // Get servers
        const servers = await this.getServers();
        if (servers.length === 0) {
            console.log('❌ No servers found. Please check your Cloudways credentials.');
            return false;
        }

        // Use first server (or you can specify which one)
        const server = servers[0];
        console.log(`🏢 Using server: ${server.name} (ID: ${server.id})`);

        // Get applications
        const applications = await this.getApplications(server.id);
        if (applications.length === 0) {
            console.log('❌ No applications found. Please create the Fakelit.com application first.');
            return false;
        }

        // Find Fakelit application
        const fakelitApp = applications.find(app => 
            app.name.toLowerCase().includes('fakelit') || 
            app.name.toLowerCase().includes('domain')
        );

        if (!fakelitApp) {
            console.log('❌ Fakelit.com application not found. Please create it first.');
            return false;
        }

        console.log(`📱 Using application: ${fakelitApp.name} (ID: ${fakelitApp.id})`);

        // Add primary domain
        const primaryDomainAdded = await this.addDomain(server.id, fakelitApp.id, this.domain);
        if (!primaryDomainAdded) {
            console.log('❌ Failed to add primary domain');
            return false;
        }

        // Add www subdomain
        const subdomainAdded = await this.addDomain(server.id, fakelitApp.id, this.subdomains[0]);
        if (!subdomainAdded) {
            console.log('❌ Failed to add www subdomain');
            return false;
        }

        // Wait a moment for domains to be added
        console.log('⏳ Waiting for domains to be processed...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Enable SSL for primary domain
        const primarySSLEnabled = await this.enableSSL(server.id, fakelitApp.id, this.domain);
        if (!primarySSLEnabled) {
            console.log('❌ Failed to enable SSL for primary domain');
            return false;
        }

        // Enable SSL for www subdomain
        const subdomainSSLEnabled = await this.enableSSL(server.id, fakelitApp.id, this.subdomains[0]);
        if (!subdomainSSLEnabled) {
            console.log('❌ Failed to enable SSL for www subdomain');
            return false;
        }

        // Wait for SSL certificates to be installed
        console.log('⏳ Waiting for SSL certificates to install...');
        await new Promise(resolve => setTimeout(resolve, 30000));

        // Enable HTTPS redirect
        const httpsRedirectEnabled = await this.forceHTTPS(server.id, fakelitApp.id);
        if (!httpsRedirectEnabled) {
            console.log('❌ Failed to enable HTTPS redirect');
            return false;
        }

        console.log('\n🎉 **SSL SETUP COMPLETE**');
        console.log('=========================');
        console.log('✅ Primary domain added: fakelit.com');
        console.log('✅ Subdomain added: www.fakelit.com');
        console.log('✅ SSL certificates installed');
        console.log('✅ HTTPS redirect enabled');
        console.log('\n🔒 **SSL CERTIFICATES ACTIVE**');
        console.log('==============================');
        console.log('• https://fakelit.com');
        console.log('• https://www.fakelit.com');
        console.log('• http://fakelit.com → redirects to HTTPS');
        console.log('• http://www.fakelit.com → redirects to HTTPS');
        console.log('\n📞 **SUPPORT**');
        console.log('==============');
        console.log('• Fakelit.com Support: 702-664-0009');
        console.log('• Email: support@fakelit.com');
        console.log('• Address: 2300 W Sahara Ave Suite 800, Las Vegas, NV 89102');
        console.log('\n🏢 Powered by Fakelit.com');

        return true;
    }
}

// Run automated SSL setup
const sslSetup = new FakelitSSLSetup();
sslSetup.setupSSL().catch(console.error);

module.exports = FakelitSSLSetup; 