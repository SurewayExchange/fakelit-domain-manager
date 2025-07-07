const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class FakelitLauncher {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async launch() {
        console.log('🚀 FAKELIT.COM LAUNCH SEQUENCE');
        console.log('==============================\n');

        try {
            await this.verifyDeploymentPackage();
            await this.guideCloudwaysSetup();
            await this.guideFileUpload();
            await this.guideEnvironmentSetup();
            await this.guideDeployment();
            await this.guideDomainSetup();
            await this.guideTesting();
            
            console.log('\n🎉 FAKELIT.COM LAUNCH COMPLETE!');
            console.log('🌐 Your application is now live at: https://fakelit.com');
            console.log('🤖 AI Chatbot available at: https://fakelit.com/fakelit-chatbot.html');
            console.log('🏢 Powered by Fakelit.com');

        } catch (error) {
            console.error('❌ Launch failed:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async verifyDeploymentPackage() {
        console.log('📦 Step 1: Verifying Deployment Package');
        console.log('=====================================\n');

        const deploymentDir = './fakelit-deployment';
        
        try {
            const files = await fs.readdir(deploymentDir);
            console.log(`✅ Deployment package found with ${files.length} items`);
            
            const requiredFiles = ['server.js', 'package.json', 'public', 'routes', 'services'];
            for (const file of requiredFiles) {
                try {
                    await fs.access(path.join(deploymentDir, file));
                    console.log(`   ✅ ${file}`);
                } catch {
                    console.log(`   ❌ ${file} (missing)`);
                }
            }

            // Check for chatbot files specifically
            const chatbotFiles = [
                'services/fakelitChatbotService.js',
                'routes/fakelitChatbotRoutes.js',
                'public/fakelit-chatbot.html'
            ];

            console.log('\n🤖 AI Chatbot Files:');
            for (const file of chatbotFiles) {
                try {
                    await fs.access(path.join(deploymentDir, file));
                    console.log(`   ✅ ${file}`);
                } catch {
                    console.log(`   ❌ ${file} (missing)`);
                }
            }

        } catch (error) {
            throw new Error('Deployment package not found. Please run deployment preparation first.');
        }

        await this.promptContinue('Deployment package verification complete. Continue to Cloudways setup?');
    }

    async guideCloudwaysSetup() {
        console.log('\n☁️ Step 2: Cloudways Setup');
        console.log('=========================\n');

        console.log('📋 Prerequisites:');
        console.log('   • Cloudways account (free trial available)');
        console.log('   • Domain name: fakelit.com');
        console.log('   • OpenAI API key (for AI chatbot)\n');

        console.log('🔗 Cloudways Setup Steps:');
        console.log('   1. Go to: https://platform.cloudways.com');
        console.log('   2. Click "Start Free Trial" or "Sign Up"');
        console.log('   3. Complete registration process\n');

        console.log('🏗️ Server Creation:');
        console.log('   1. Click "Add Server"');
        console.log('   2. Choose cloud provider (AWS/DigitalOcean/Vultr)');
        console.log('   3. Select server size: 1GB RAM minimum');
        console.log('   4. Choose server location');
        console.log('   5. Click "Add Server"\n');

        console.log('📱 Application Creation:');
        console.log('   1. Click "Add Application"');
        console.log('   2. Choose "Node.js" as application type');
        console.log('   3. Select Node.js version 18 or higher');
        console.log('   4. Set application name: fakelit-app');
        console.log('   5. Click "Add Application"\n');

        await this.promptContinue('Have you completed the Cloudways setup? Continue to file upload?');
    }

    async guideFileUpload() {
        console.log('\n📤 Step 3: File Upload');
        console.log('=====================\n');

        console.log('📁 Your deployment package is ready in: ./fakelit-deployment/\n');

        console.log('🔑 SFTP Credentials (from Cloudways):');
        console.log('   • Host: Your server IP');
        console.log('   • Username: Your Cloudways username');
        console.log('   • Password: Your Cloudways password');
        console.log('   • Port: 22\n');

        console.log('📤 Upload Steps:');
        console.log('   1. Use SFTP client (FileZilla, Cyberduck, etc.)');
        console.log('   2. Connect using credentials above');
        console.log('   3. Navigate to application root directory');
        console.log('   4. Upload ALL files from ./fakelit-deployment/');
        console.log('   5. Ensure file structure is maintained\n');

        console.log('⚠️ Important: Upload these files:');
        console.log('   • server.js');
        console.log('   • package.json');
        console.log('   • public/ (entire directory)');
        console.log('   • routes/ (entire directory)');
        console.log('   • services/ (entire directory)');
        console.log('   • All other directories and files\n');

        await this.promptContinue('Have you uploaded all files? Continue to environment setup?');
    }

    async guideEnvironmentSetup() {
        console.log('\n⚙️ Step 4: Environment Configuration');
        console.log('===================================\n');

        console.log('🔧 Environment Variables Setup:');
        console.log('   1. In Cloudways dashboard, go to your application');
        console.log('   2. Click "Application Settings" → "Environment Variables"\n');

        console.log('📝 Required Variables:');
        console.log('   NODE_ENV=production');
        console.log('   PORT=3000');
        console.log('   JWT_SECRET=fakelit-production-jwt-secret-2024');
        console.log('   BRAND_NAME=Fakelit.com');
        console.log('   DOMAIN_NAME=fakelit.com');
        console.log('   OPENAI_API_KEY=your_openai_api_key_here\n');

        console.log('💡 Optional Variables:');
        console.log('   SUPABASE_URL=your_supabase_url');
        console.log('   SUPABASE_ANON_KEY=your_supabase_anon_key');
        console.log('   ELEVENLABS_API_KEY=your_elevenlabs_api_key');
        console.log('   DID_API_KEY=your_did_api_key\n');

        console.log('⚠️ Important: OpenAI API key is required for AI chatbot functionality!\n');

        await this.promptContinue('Have you configured all environment variables? Continue to deployment?');
    }

    async guideDeployment() {
        console.log('\n🚀 Step 5: Application Deployment');
        console.log('===============================\n');

        console.log('📦 Install Dependencies:');
        console.log('   1. In Cloudways dashboard, go to "Application Settings" → "SSH Terminal"');
        console.log('   2. Run: npm install --production');
        console.log('   3. Wait for installation to complete\n');

        console.log('▶️ Start Application:');
        console.log('   1. In the SSH terminal, run: npm start');
        console.log('   2. Or configure start command in "Application Settings" → "Deployment via Git"');
        console.log('   3. Verify application is running on port 3000\n');

        console.log('🔍 Verify Deployment:');
        console.log('   1. Check application logs for any errors');
        console.log('   2. Verify the application is responding');
        console.log('   3. Look for "Fakelit.com" branding in logs\n');

        await this.promptContinue('Is the application running successfully? Continue to domain setup?');
    }

    async guideDomainSetup() {
        console.log('\n🌐 Step 6: Domain Configuration');
        console.log('==============================\n');

        console.log('🔗 Add Domain:');
        console.log('   1. In Cloudways dashboard, go to "Application Settings" → "Domain Management"');
        console.log('   2. Click "Add Domain"');
        console.log('   3. Enter: fakelit.com (or your domain)');
        console.log('   4. Click "Add Domain"\n');

        console.log('🔒 Configure SSL:');
        console.log('   1. In the same Domain Management section');
        console.log('   2. Click "SSL Certificate" for your domain');
        console.log('   3. Choose "Let\'s Encrypt" (free)');
        console.log('   4. Click "Install Certificate"\n');

        console.log('📡 Update DNS:');
        console.log('   1. Go to your domain registrar (where you bought fakelit.com)');
        console.log('   2. Update DNS records:');
        console.log('      • A Record: Point to your Cloudways server IP');
        console.log('      • CNAME Record: www → fakelit.com');
        console.log('   3. Wait for DNS propagation (up to 24 hours)\n');

        await this.promptContinue('Have you configured the domain and SSL? Continue to testing?');
    }

    async guideTesting() {
        console.log('\n✅ Step 7: Application Testing');
        console.log('============================\n');

        console.log('🧪 Test Main Application:');
        console.log('   1. Visit: https://fakelit.com/');
        console.log('   2. Verify Fakelit.com branding is displayed');
        console.log('   3. Check all features are working\n');

        console.log('🤖 Test AI Chatbot:');
        console.log('   1. Visit: https://fakelit.com/fakelit-chatbot.html');
        console.log('   2. Test with questions like:');
        console.log('      • "How do I deploy to Cloudways?"');
        console.log('      • "What are the API endpoints?"');
        console.log('      • "How do I configure SSL?"');
        console.log('   3. Verify responses include "Powered by Fakelit.com"\n');

        console.log('🔍 Test Health Endpoint:');
        console.log('   1. Visit: https://fakelit.com/health');
        console.log('   2. Verify JSON response includes Fakelit.com branding');
        console.log('   3. Check all features are listed\n');

        console.log('🔌 Test API Endpoints:');
        console.log('   1. Test: https://fakelit.com/api/fakelit-chatbot/status');
        console.log('   2. Verify chatbot status is "online"');
        console.log('   3. Check capabilities and restrictions are listed\n');

        console.log('🎯 Success Criteria:');
        console.log('   ✅ Main application accessible');
        console.log('   ✅ AI chatbot responding');
        console.log('   ✅ Health endpoint working');
        console.log('   ✅ SSL certificate installed');
        console.log('   ✅ Domain resolving correctly');
        console.log('   ✅ Fakelit.com branding throughout\n');
    }

    async promptContinue(message) {
        return new Promise((resolve) => {
            this.rl.question(`${message} (y/n): `, (answer) => {
                if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                    resolve();
                } else {
                    console.log('\n⏸️ Launch paused. You can resume anytime by running this script again.');
                    this.rl.close();
                    process.exit(0);
                }
            });
        });
    }
}

// Run launch
async function main() {
    const launcher = new FakelitLauncher();
    await launcher.launch();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { FakelitLauncher }; 