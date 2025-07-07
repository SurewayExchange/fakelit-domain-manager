#!/usr/bin/env node

/**
 * 🔍 Fakelit.com - Find Server ID (Updated)
 * Direct API call to find Server ID with new API key
 * Powered by: Fakelit.com
 */

const axios = require('axios');

async function getServerID() {
    const email = 'marquibelbrooks@gmail.com';
    const apiKey = 'D4z2jyEOEJUmU5jhTjdMiz5ZQs9eZi';
    
    console.log('🔍 Fakelit.com - Finding Server ID');
    console.log('==================================');
    console.log('🏢 Powered by: Fakelit.com');
    console.log('');
    console.log('🔍 Searching for your Cloudways servers...');
    
    try {
        const response = await axios.get(
            'https://api.cloudways.com/api/v1/server',
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        const servers = response.data.servers || [];
        
        if (servers.length === 0) {
            console.log('❌ No servers found in your Cloudways account');
            return;
        }

        console.log(`✅ Found ${servers.length} server(s) in your account:`);
        console.log('==================================================');

        servers.forEach((server, index) => {
            console.log(`\n${index + 1}. Server Details:`);
            console.log(`   📍 Name: ${server.label || 'Unnamed'}`);
            console.log(`   🆔 Server ID: ${server.id}`);
            console.log(`   🌐 IP Address: ${server.public_ip || 'N/A'}`);
            console.log(`   💾 RAM: ${server.size || 'N/A'}GB`);
            console.log(`   ⚡ CPU: ${server.cpu || 'N/A'} vCPUs`);
            console.log(`   💿 Storage: ${server.storage || 'N/A'}GB`);
            console.log(`   📊 Status: ${server.status || 'N/A'}`);
        });

        // Look for server with IP 35.184.78.205
        const targetServer = servers.find(server => 
            server.public_ip === '35.184.78.205'
        );

        if (targetServer) {
            console.log('\n🎯 Target Server Found!');
            console.log('======================');
            console.log(`📍 Name: ${targetServer.label || 'Unnamed'}`);
            console.log(`🆔 Server ID: ${targetServer.id}`);
            console.log(`🌐 IP: ${targetServer.public_ip}`);
            console.log('');
            console.log('✅ Use this Server ID in the setup wizard:');
            console.log(`   ${targetServer.id}`);
            console.log('');
            console.log('🚀 You can now complete the auto-scaling setup!');
        } else {
            console.log('\n⚠️  Server with IP 35.184.78.205 not found');
            console.log('Available servers:');
            servers.forEach(server => {
                console.log(`   - ${server.label || 'Unnamed'} (${server.public_ip}) - ID: ${server.id}`);
            });
        }

    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
                console.error('❌ Authentication failed. Please check your API key.');
            } else {
                console.error(`❌ API error: ${error.response.status} - ${error.response.statusText}`);
                console.error('Response:', error.response.data);
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('❌ Connection timeout. Please check your internet connection.');
        } else {
            console.error('❌ Connection failed:', error.message);
        }
    }
}

// Run the function
getServerID(); 