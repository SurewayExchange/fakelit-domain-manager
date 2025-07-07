#!/usr/bin/env node

require('dotenv').config();
const DomainService = require('./services/domainService');

async function checkDomains() {
    console.log('🌐 CareConnect Domain Management');
    console.log('================================\n');

    const domainService = new DomainService();

    // Check if credentials are configured
    if (!process.env.ENOM_USERNAME || !process.env.ENOM_PASSWORD) {
        console.log('❌ Enom credentials not found in .env file');
        console.log('Please add the following to your .env file:');
        console.log('ENOM_USERNAME=your_enom_username');
        console.log('ENOM_PASSWORD=your_enom_password');
        console.log('\nOr run this script with your credentials:');
        console.log('ENOM_USERNAME=your_username ENOM_PASSWORD=your_password node check-domains.js');
        return;
    }

    try {
        console.log('🔍 Fetching your domains from Enom/Tucow...\n');
        
        const result = await domainService.listAllDomains();
        
        if (result.success) {
            console.log(`✅ Successfully retrieved ${result.total} domains:\n`);
            
            if (result.domains.length === 0) {
                console.log('📭 No domains found in your Enom account');
            } else {
                result.domains.forEach((domain, index) => {
                    console.log(`${index + 1}. ${domain.name}`);
                    console.log(`   Status: ${domain.status || 'Unknown'}`);
                    console.log(`   Expiry: ${domain.expiryDate || 'Unknown'}`);
                    console.log(`   Auto-renew: ${domain.autoRenew ? 'Yes' : 'No'}`);
                    if (domain.nameServers && domain.nameServers.length > 0) {
                        console.log(`   Name Servers: ${domain.nameServers.join(', ')}`);
                    }
                    if (domain.error) {
                        console.log(`   ⚠️  Error: ${domain.error}`);
                    }
                    console.log('');
                });
            }
        } else {
            console.log('❌ Failed to fetch domains:', result.error);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the script
checkDomains(); 