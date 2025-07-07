#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

async function checkDomains() {
    console.log('🌐 CareConnect Domain Checker');
    console.log('================================\n');

    // Check if credentials are configured
    const username = process.env.ENOM_USERNAME;
    const password = process.env.ENOM_PASSWORD;
    
    if (!username || username === 'your_enom_username') {
        console.log('❌ Enom credentials not found or not configured');
        console.log('\n📝 To configure your Enom credentials:');
        console.log('1. Open your .env file');
        console.log('2. Replace the placeholder values:');
        console.log('   ENOM_USERNAME=your_actual_username');
        console.log('   ENOM_PASSWORD=your_actual_password');
        console.log('\n🔑 Or run this script with credentials:');
        console.log('ENOM_USERNAME=your_username ENOM_PASSWORD=your_password node check-domains-simple.js');
        return;
    }

    console.log('✅ Enom credentials found');
    console.log('🔍 Checking your domains...\n');

    try {
        // Make API request to Enom
        const params = {
            command: 'GetDomains',
            uid: username,
            pw: password,
            responseformat: 'xml'
        };

        console.log('📡 Making API request to Enom...');
        const response = await axios.get('https://reseller.enom.com/interface.asp', {
            params,
            timeout: 15000,
            headers: {
                'User-Agent': 'CareConnect-Domain-Manager/1.0'
            }
        });

        console.log('✅ Response received successfully');
        console.log('📊 Status:', response.status);
        console.log('📄 Response preview:', response.data.substring(0, 300));

        // Try to extract domain information
        const data = response.data;
        
        // Look for domain patterns
        const domainPattern = /([a-zA-Z0-9-]+\.(?:ai|com|net|org|io))/g;
        const matches = data.match(domainPattern);
        
        if (matches && matches.length > 0) {
            console.log('\n🎯 Domains found:');
            console.log('================');
            
            const uniqueDomains = [...new Set(matches)];
            uniqueDomains.forEach((domain, index) => {
                console.log(`${index + 1}. ${domain}`);
            });
            
            console.log(`\n📈 Total domains: ${uniqueDomains.length}`);
        } else {
            console.log('\n🔍 No domains found in response');
            console.log('📄 Full response for debugging:');
            console.log(data);
        }

    } catch (error) {
        console.error('\n❌ Error checking domains:');
        console.error('Message:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        }
        
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Verify your Enom credentials are correct');
        console.log('2. Check if your Enom account is active');
        console.log('3. Ensure you have API access enabled');
        console.log('4. Try logging into your Enom account directly');
    }
}

// Run the domain checker
checkDomains().catch(console.error); 