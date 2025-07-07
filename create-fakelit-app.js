#!/usr/bin/env node

const axios = require('axios');

class FakelitCloudwaysDeployer {
    constructor() {
        this.baseUrl = 'https://api.cloudways.com/api/v1';
        this.apiKey = process.env.CLOUDWAYS_API_KEY;
        this.email = process.env.CLOUDWAYS_EMAIL;
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async testConnection() {
        try {
            console.log('🔍 Testing Cloudways API connection...');
            const response = await axios.get(`${this.baseUrl}/server`, {
                headers: this.getAuthHeaders(),
                timeout: 10000
            });
            
            console.log('✅ API connection successful');
            console.log('📊 Response structure:', Object.keys(response.data));
            
            if (response.data.servers) {
                console.log(`✅ Found ${response.data.servers.length} servers`);
                return response.data.servers;
            } else {
                console.log('⚠️ No servers found or different response structure');
                console.log('📄 Full response:', JSON.stringify(response.data, null, 2));
                return [];
            }
        } catch (error) {
            console.error('❌ API connection failed:', error.message);
            if (error.response) {
                console.error('📡 Status:', error.response.status);
                console.error('📄 Data:', error.response.data);
            }
            throw error;
        }
    }

    async createFakelitApp(serverId) {
        try {
            console.log(`🚀 Creating Fakelit.com application on server ${serverId}...`);
            
            const appData = {
                server_id: serverId,
                application: {
                    name: 'fakelit-domain-manager',
                    application: 'nodejs',
                    application_version: '18',
                    project_name: 'Fakelit.com Domain Management',
                    description: 'Professional hosting and domain management platform'
                }
            };

            const response = await axios.post(`${this.baseUrl}/app`, appData, {
                headers: this.getAuthHeaders(),
                timeout: 30000
            });

            console.log('✅ Fakelit.com application created successfully');
            console.log('📊 App details:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating application:', error.message);
            if (error.response) {
                console.error('📡 Status:', error.response.status);
                console.error('📄 Data:', error.response.data);
            }
            throw error;
        }
    }

    async deployFakelitFiles(serverId, appId) {
        try {
            console.log(`📁 Deploying Fakelit.com files to application ${appId}...`);
            
            // This would require file upload logic
            console.log('📋 Files to deploy:');
            console.log('- server.js');
            console.log('- package.json');
            console.log('- public/ directory');
            console.log('- routes/ directory');
            console.log('- services/ directory');
            
            console.log('✅ File deployment instructions generated');
            return true;
        } catch (error) {
            console.error('❌ Error deploying files:', error.message);
            throw error;
        }
    }
}

async function main() {
    console.log('🚀 Fakelit.com Cloudways Deployment');
    console.log('====================================\n');

    if (!process.env.CLOUDWAYS_API_KEY || !process.env.CLOUDWAYS_EMAIL) {
        console.log('❌ Cloudways credentials not found');
        console.log('Please set CLOUDWAYS_API_KEY and CLOUDWAYS_EMAIL environment variables');
        return;
    }

    const deployer = new FakelitCloudwaysDeployer();

    try {
        // Test connection
        const servers = await deployer.testConnection();
        
        if (servers.length === 0) {
            console.log('\n⚠️ No servers found. You need to create a server first.');
            console.log('Please log into Cloudways dashboard and create a server.');
            return;
        }

        console.log('\n📋 Available servers:');
        servers.forEach((server, index) => {
            console.log(`${index + 1}. ${server.label} (ID: ${server.id})`);
        });

        // Use the first server or a specific one
        const targetServer = servers[0];
        console.log(`\n🎯 Using server: ${targetServer.label} (ID: ${targetServer.id})`);

        // Create Fakelit application
        const app = await deployer.createFakelitApp(targetServer.id);
        
        // Deploy files
        await deployer.deployFakelitFiles(targetServer.id, app.app.id);

        console.log('\n🎉 Fakelit.com deployment initiated!');
        console.log('📊 Next steps:');
        console.log('1. Upload files via Cloudways dashboard');
        console.log('2. Configure environment variables');
        console.log('3. Set up domain: fakelit.com');
        console.log('4. Enable SSL certificate');

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
    }
}

if (require.main === module) {
    main();
}

module.exports = FakelitCloudwaysDeployer; 