#!/usr/bin/env node

/**
 * 🔍 Fakelit.com - Find Server ID Tool
 * Helps locate your Cloudways Server ID
 * Powered by: Fakelit.com
 */

const axios = require('axios');
const readline = require('readline');

class ServerIDFinder {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async initialize() {
        console.log('🔍 Fakelit.com - Find Server ID Tool');
        console.log('====================================');
        console.log('🏢 Powered by: Fakelit.com');
        console.log('');

        try {
            const email = await this.promptInput('Enter your Cloudways email: ');
            const apiKey = await this.promptInput('Enter your Cloudways API key: ');
            
            console.log('\n🔍 Searching for your servers...');
            await this.findServers(email, apiKey);
            
        } catch (error) {
            console.error('❌ Error:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async findServers(email, apiKey) {
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

            console.log(`\n✅ Found ${servers.length} server(s) in your account:`);
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
            } else {
                console.log('\n⚠️  Server with IP 35.184.78.205 not found');
                console.log('Please check the IP address or select from the list above');
            }

        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    console.error('❌ Authentication failed. Please check your API key.');
                } else {
                    console.error(`❌ API error: ${error.response.status} - ${error.response.statusText}`);
                }
            } else if (error.code === 'ECONNABORTED') {
                console.error('❌ Connection timeout. Please check your internet connection.');
            } else {
                console.error('❌ Connection failed:', error.message);
            }
        }
    }

    async promptInput(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, (answer) => {
                resolve(answer.trim());
            });
        });
    }
}

// Run the finder
if (require.main === module) {
    const finder = new ServerIDFinder();
    finder.initialize().catch(error => {
        console.error('❌ Failed to find servers:', error.message);
        process.exit(1);
    });
}

module.exports = ServerIDFinder; 