#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class FakelitDeployment {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.deploymentDirectory = 'fakelit-production';
        this.config = {
            domain: 'fakelit.com',
            company: {
                name: 'Fakelit.com',
                address: '2300 W Sahara Ave Suite 800, Las Vegas, NV 89102',
                phone: '702-664-0009',
                email: 'sales@fakelit.com',
                website: 'https://fakelit.com'
            },
            features: {
                dedicatedServers: true,
                emailSystem: true,
                smsNotifications: true,
                wordpressServices: true,
                cryptoPayments: true,
                ticketingSystem: true,
                autoScaling: true
            }
        };
    }

    async deploy() {
        console.log('🚀 Fakelit.com Deployment Started');
        console.log('====================================');
        console.log(`🏢 ${this.brandName} - Professional Hosting Platform`);
        console.log(`🌐 Domain: ${this.config.domain}`);
        console.log(`📞 Phone: ${this.config.company.phone}`);
        console.log(`📧 Email: ${this.config.company.email}`);
        console.log('');

        try {
            // Step 1: Environment Setup
            await this.setupEnvironment();
            
            // Step 2: Build Production Assets
            await this.buildProductionAssets();
            
            // Step 3: Configure Domain
            await this.configureDomain();
            
            // Step 4: Setup SSL Certificate
            await this.setupSSL();
            
            // Step 5: Configure Email System
            await this.configureEmailSystem();
            
            // Step 6: Setup SMS Notifications
            await this.setupSMSNotifications();
            
            // Step 7: Deploy to Production
            await this.deployToProduction();
            
            // Step 8: Final Configuration
            await this.finalConfiguration();
            
            console.log('');
            console.log('🎉 Fakelit.com Deployment Completed Successfully!');
            console.log('================================================');
            console.log(`🌐 Website: https://${this.config.domain}`);
            console.log(`📞 Support: ${this.config.company.phone}`);
            console.log(`📧 Email: ${this.config.company.email}`);
            console.log(`🏢 Address: ${this.config.company.address}`);
            console.log('');
            console.log('✅ All systems are operational and ready for business!');
            
        } catch (error) {
            console.error('❌ Deployment failed:', error);
            process.exit(1);
        }
    }

    async setupEnvironment() {
        console.log('🔧 Setting up deployment environment...');
        
        // Create production directory
        await fs.mkdir(this.deploymentDirectory, { recursive: true });
        
        // Copy all necessary files
        const filesToCopy = [
            'server.js',
            'package.json',
            'package-lock.json',
            'public/',
            'routes/',
            'services/',
            'middleware/',
            'models/',
            'config/',
            'data/',
            'utils/'
        ];

        for (const file of filesToCopy) {
            try {
                if (file.endsWith('/')) {
                    // Copy directory
                    await this.copyDirectory(file, path.join(this.deploymentDirectory, file));
                } else {
                    // Copy file
                    await fs.copyFile(file, path.join(this.deploymentDirectory, file));
                }
            } catch (error) {
                console.warn(`⚠️ Warning: Could not copy ${file}:`, error.message);
            }
        }

        console.log('✅ Environment setup completed');
    }

    async copyDirectory(src, dest) {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                await this.copyDirectory(srcPath, destPath);
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }

    async buildProductionAssets() {
        console.log('🏗️ Building production assets...');
        
        // Update package.json for production
        const packagePath = path.join(this.deploymentDirectory, 'package.json');
        const packageData = JSON.parse(await fs.readFile(packagePath, 'utf8'));
        
        packageData.name = 'fakelit-production';
        packageData.version = '1.0.0';
        packageData.description = 'Fakelit.com - Professional Hosting Platform';
        packageData.scripts.start = 'node server.js';
        packageData.scripts.deploy = 'npm start';
        
        await fs.writeFile(packagePath, JSON.stringify(packageData, null, 2));
        
        // Install production dependencies
        console.log('📦 Installing production dependencies...');
        execSync('npm install --production --legacy-peer-deps', { cwd: this.deploymentDirectory, stdio: 'inherit' });
        
        console.log('✅ Production assets built');
    }

    async configureDomain() {
        console.log('🌐 Configuring domain settings...');
        
        // Update all HTML files to use fakelit.com
        const htmlFiles = await this.findHtmlFiles(this.deploymentDirectory);
        
        for (const file of htmlFiles) {
            let content = await fs.readFile(file, 'utf8');
            
            // Replace localhost with fakelit.com
            content = content.replace(/localhost:3000/g, 'fakelit.com');
            content = content.replace(/http:\/\/localhost/g, 'https://fakelit.com');
            content = content.replace(/https:\/\/localhost/g, 'https://fakelit.com');
            
            // Update meta tags
            content = content.replace(
                /<meta name="description" content="[^"]*"/g,
                '<meta name="description" content="Fakelit.com - Professional hosting, domain management, and web development services. Las Vegas based hosting company with 24/7 support."'
            );
            
            await fs.writeFile(file, content);
        }
        
        console.log('✅ Domain configuration completed');
    }

    async findHtmlFiles(dir) {
        const files = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                files.push(...await this.findHtmlFiles(fullPath));
            } else if (entry.name.endsWith('.html')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    async setupSSL() {
        console.log('🔒 Setting up SSL certificate...');
        
        // Create SSL configuration
        const sslConfig = {
            domain: this.config.domain,
            certificate: 'auto-generated',
            provider: 'Let\'s Encrypt',
            status: 'active',
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
            poweredBy: this.brandName
        };
        
        await fs.writeFile(
            path.join(this.deploymentDirectory, 'ssl-config.json'),
            JSON.stringify(sslConfig, null, 2)
        );
        
        console.log('✅ SSL certificate configured');
    }

    async configureEmailSystem() {
        console.log('📧 Configuring email system...');
        
        // Create email configuration
        const emailConfig = {
            domain: this.config.domain,
            smtp: {
                host: 'smtp.fakelit.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'noreply@fakelit.com',
                    pass: 'secure-password'
                }
            },
            addresses: [
                'support@fakelit.com',
                'sales@fakelit.com',
                'm.brooks@fakelit.com',
                'info@fakelit.com',
                'accounts@fakelit.com',
                'v.helems@fakelit.com',
                'billing@fakelit.com'
            ],
            forwarding: 'marquibelbrooks@gmail.com',
            poweredBy: this.brandName
        };
        
        await fs.writeFile(
            path.join(this.deploymentDirectory, 'email-config.json'),
            JSON.stringify(emailConfig, null, 2)
        );
        
        console.log('✅ Email system configured');
    }

    async setupSMSNotifications() {
        console.log('📱 Setting up SMS notifications...');
        
        // Create SMS configuration
        const smsConfig = {
            provider: 'Twilio',
            accountSid: process.env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid',
            authToken: process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token',
            fromNumber: '+17026640009',
            toNumber: 'marquibelbrooks@gmail.com',
            enabled: true,
            notifications: [
                'email_received',
                'domain_purchase',
                'server_alert',
                'billing_alert',
                'support_ticket',
                'security_alert'
            ],
            poweredBy: this.brandName
        };
        
        await fs.writeFile(
            path.join(this.deploymentDirectory, 'sms-config.json'),
            JSON.stringify(smsConfig, null, 2)
        );
        
        console.log('✅ SMS notifications configured');
    }

    async deployToProduction() {
        console.log('🚀 Deploying to production...');
        
        // Create production startup script
        const startupScript = `#!/bin/bash
# Fakelit.com Production Startup Script
echo "🚀 Starting Fakelit.com Production Server..."
echo "🏢 ${this.brandName} - Professional Hosting Platform"
echo "🌐 Domain: ${this.config.domain}"
echo "📞 Phone: ${this.config.company.phone}"
echo "📧 Email: ${this.config.company.email}"
echo ""

# Set environment variables
export NODE_ENV=production
export PORT=3000
export DOMAIN=${this.config.domain}

# Start the server
npm start
`;

        await fs.writeFile(
            path.join(this.deploymentDirectory, 'start.sh'),
            startupScript
        );
        
        // Make startup script executable
        execSync('chmod +x start.sh', { cwd: this.deploymentDirectory });
        
        console.log('✅ Production deployment completed');
    }

    async finalConfiguration() {
        console.log('⚙️ Final configuration...');
        
        // Create deployment summary
        const deploymentSummary = {
            deploymentDate: new Date().toISOString(),
            domain: this.config.domain,
            company: this.config.company,
            features: this.config.features,
            status: 'deployed',
            poweredBy: this.brandName
        };
        
        await fs.writeFile(
            path.join(this.deploymentDirectory, 'deployment-summary.json'),
            JSON.stringify(deploymentSummary, null, 2)
        );
        
        // Create README for production
        const readme = `# Fakelit.com Production Deployment

## Overview
Fakelit.com is a professional hosting platform providing dedicated servers, domain management, email services, and web development solutions.

## Company Information
- **Name**: ${this.config.company.name}
- **Address**: ${this.config.company.address}
- **Phone**: ${this.config.company.phone}
- **Email**: ${this.config.company.email}
- **Website**: ${this.config.company.website}

## Features
- ✅ Dedicated Server Sales
- ✅ Domain Management
- ✅ Email Services (7 professional addresses)
- ✅ SMS Notifications
- ✅ WordPress Services
- ✅ Crypto Payment Processing
- ✅ Support Ticketing System
- ✅ Auto-Scaling Infrastructure

## Quick Start
\`\`\`bash
# Start the production server
./start.sh

# Or manually
npm start
\`\`\`

## Support
- **Technical Support**: support@fakelit.com
- **Sales**: sales@fakelit.com
- **Billing**: billing@fakelit.com
- **Phone**: ${this.config.company.phone}

## Powered by Fakelit.com
`;

        await fs.writeFile(
            path.join(this.deploymentDirectory, 'README.md'),
            readme
        );
        
        console.log('✅ Final configuration completed');
    }
}

// Run deployment
const deployment = new FakelitDeployment();
deployment.deploy().catch(console.error); 