#!/usr/bin/env node

/**
 * Scale Fakelit Server for 50 Magento Websites
 * Server Name: Fakelit
 * API Key: x3XDizlcTIsld2mNoV0O6IqbjHV8Db
 * Email: marquibelbrooks@gmail.com
 */

const CloudwaysService = require('./services/cloudwaysService');

async function scaleFakelitServer() {
    console.log('🚀 Scale Fakelit Server for 50 Magento Websites');
    console.log('================================================\n');
    console.log('🏢 Server Name: Fakelit');
    console.log('🌐 Server IP: 35.184.78.205');
    console.log('🔑 API Key: x3XDizlcTIsld2mNoV0O6IqbjHV8Db');
    console.log('📧 Email: marquibelbrooks@gmail.com\n');

    try {
        // Set environment variables
        process.env.CLOUDWAYS_API_KEY = 'x3XDizlcTIsld2mNoV0O6IqbjHV8Db';
        process.env.CLOUDWAYS_EMAIL = 'marquibelbrooks@gmail.com';

        const cloudwaysService = new CloudwaysService();

        console.log('✅ Cloudways credentials configured');
        console.log('🔍 Connecting to Cloudways...\n');

        // Get all servers
        const servers = await cloudwaysService.getServers();
        console.log(`📊 Found ${servers.length} servers`);

        // Find Fakelit server
        const fakelitServer = servers.find(server => 
            server.label?.toLowerCase() === 'fakelit' ||
            server.label?.toLowerCase().includes('fakelit') ||
            server.public_ip === '35.184.78.205'
        );

        if (!fakelitServer) {
            console.log('❌ Fakelit server not found');
            console.log('Available servers:');
            servers.forEach((server, index) => {
                console.log(`${index + 1}. ${server.label} - IP: ${server.public_ip || 'N/A'}`);
            });
            return;
        }

        console.log(`✅ Found Fakelit server: ${fakelitServer.label}`);
        console.log(`🆔 Server ID: ${fakelitServer.id}`);
        console.log(`🌐 Public IP: ${fakelitServer.public_ip || 'N/A'}`);
        console.log(`🔧 Provider: ${fakelitServer.provider || 'N/A'}`);
        console.log(`💾 Current Size: ${fakelitServer.size || 'N/A'}`);

        // Calculate required resources for 50 Magento websites
        console.log('\n📊 Resource Requirements for 50 Magento Websites:');
        console.log('==================================================');
        
        const requirements = {
            ram: '32GB', // 50 sites × 512MB base + overhead
            cpu: '16 vCPUs', // 50 sites × 0.3 vCPU + overhead
            storage: '500GB', // 50 sites × 8GB + database + backups
            bandwidth: 'Unlimited', // Cloudways provides unlimited bandwidth
            databases: 50, // One database per Magento site
            ssl_certificates: 50 // One SSL per domain
        };

        console.log(`💾 RAM: ${requirements.ram}`);
        console.log(`🖥️  CPU: ${requirements.cpu}`);
        console.log(`💿 Storage: ${requirements.storage}`);
        console.log(`🌐 Bandwidth: ${requirements.bandwidth}`);
        console.log(`🗄️  Databases: ${requirements.databases}`);
        console.log(`🔒 SSL Certificates: ${requirements.ssl_certificates}`);

        console.log('\n💡 Recommended Cloudways Server Size:');
        console.log('=====================================');
        console.log('🏗️  Server Size: 32GB RAM / 16 vCPU / 500GB Storage');
        console.log('💰 Estimated Cost: $200-300/month (depending on provider)');
        console.log('⚡ Performance: High-performance optimized for Magento');

        console.log('\n🔧 Scaling Options:');
        console.log('==================');
        console.log('1. Scale Up: Increase server size in Cloudways dashboard');
        console.log('2. Load Balancing: Add multiple servers for redundancy');
        console.log('3. CDN: Enable Cloudways CDN for better performance');
        console.log('4. Caching: Implement Redis/Memcached for Magento');

        console.log('\n📋 Scaling Checklist:');
        console.log('====================');
        console.log('□ Backup current server configuration');
        console.log('□ Scale server size in Cloudways dashboard');
        console.log('□ Configure Redis/Memcached for caching');
        console.log('□ Enable Cloudways CDN');
        console.log('□ Set up monitoring and alerts');
        console.log('□ Configure automated backups');
        console.log('□ Test performance with sample Magento sites');

        console.log('\n🚀 Next Steps:');
        console.log('==============');
        console.log('1. Go to Cloudways Dashboard');
        console.log('2. Select Fakelit server');
        console.log('3. Go to Server Settings > Scaling');
        console.log('4. Choose 32GB RAM / 16 vCPU plan');
        console.log('5. Confirm scaling operation');
        console.log('6. Wait for scaling to complete (5-10 minutes)');

        console.log('\n⚠️  Important Notes:');
        console.log('===================');
        console.log('• Scaling will cause brief downtime (2-5 minutes)');
        console.log('• All applications will be restarted');
        console.log('• SSL certificates will be reissued');
        console.log('• DNS settings remain unchanged');
        console.log('• Backup your data before scaling');

        console.log('\n🏢 All 50 Magento websites will run on this scaled Fakelit server');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (error.response) {
            console.error('📡 Response status:', error.response.status);
            console.error('📄 Response data:', error.response.data);
        }

        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    scaleFakelitServer();
}

module.exports = scaleFakelitServer; 