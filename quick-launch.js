const fs = require('fs').promises;

class QuickLauncher {
    constructor() {
        this.brandName = 'Fakelit.com';
    }

    async launch() {
        console.log('🚀 FAKELIT.COM QUICK LAUNCH');
        console.log('===========================\n');

        await this.showDeploymentPackage();
        await this.showQuickSteps();
        await this.showCredentials();
        await this.showTestCommands();
        
        console.log('\n🎉 READY TO LAUNCH!');
        console.log('Follow the steps above to get Fakelit.com live in 5 minutes!');
        console.log('🏢 Powered by Fakelit.com');
    }

    async showDeploymentPackage() {
        console.log('📦 DEPLOYMENT PACKAGE READY');
        console.log('===========================\n');
        
        try {
            const files = await fs.readdir('./fakelit-deployment');
            console.log(`✅ ${files.length} files ready for upload:`);
            
            const importantFiles = ['server.js', 'package.json', 'public', 'routes', 'services'];
            for (const file of importantFiles) {
                try {
                    await fs.access(`./fakelit-deployment/${file}`);
                    console.log(`   ✅ ${file}`);
                } catch {
                    console.log(`   ❌ ${file} (missing)`);
                }
            }
            
            console.log('\n🤖 AI Chatbot Files:');
            const chatbotFiles = [
                'services/fakelitChatbotService.js',
                'routes/fakelitChatbotRoutes.js', 
                'public/fakelit-chatbot.html'
            ];
            
            for (const file of chatbotFiles) {
                try {
                    await fs.access(`./fakelit-deployment/${file}`);
                    console.log(`   ✅ ${file}`);
                } catch {
                    console.log(`   ❌ ${file} (missing)`);
                }
            }
        } catch (error) {
            console.log('❌ Deployment package not found');
        }
    }

    showQuickSteps() {
        console.log('\n⚡ QUICK LAUNCH STEPS (5 minutes)');
        console.log('================================\n');
        
        console.log('1️⃣ CLOUDWAYS SETUP (2 min)');
        console.log('   • Go to: https://platform.cloudways.com');
        console.log('   • Click "Start Free Trial"');
        console.log('   • Create account\n');
        
        console.log('2️⃣ CREATE SERVER & APP (1 min)');
        console.log('   • Click "Add Server"');
        console.log('   • Choose DigitalOcean → 1GB RAM');
        console.log('   • Click "Add Application"');
        console.log('   • Choose Node.js → Version 18');
        console.log('   • Name: fakelit-app\n');
        
        console.log('3️⃣ UPLOAD FILES (1 min)');
        console.log('   • Get SFTP credentials from Cloudways');
        console.log('   • Upload ALL files from ./fakelit-deployment/');
        console.log('   • Use FileZilla or Cyberduck\n');
        
        console.log('4️⃣ CONFIGURE & DEPLOY (1 min)');
        console.log('   • Add environment variables (see below)');
        console.log('   • Run: npm install --production');
        console.log('   • Run: npm start\n');
        
        console.log('5️⃣ ADD DOMAIN (1 min)');
        console.log('   • Add domain: fakelit.com');
        console.log('   • Install SSL certificate');
        console.log('   • Update DNS records\n');
    }

    showCredentials() {
        console.log('\n🔑 ENVIRONMENT VARIABLES');
        console.log('========================\n');
        
        console.log('Add these in Cloudways → Application Settings → Environment Variables:\n');
        
        console.log('REQUIRED:');
        console.log('NODE_ENV=production');
        console.log('PORT=3000');
        console.log('JWT_SECRET=fakelit-secret-2024');
        console.log('BRAND_NAME=Fakelit.com');
        console.log('DOMAIN_NAME=fakelit.com');
        console.log('OPENAI_API_KEY=your_openai_key_here\n');
        
        console.log('OPTIONAL:');
        console.log('SUPABASE_URL=your_supabase_url');
        console.log('SUPABASE_ANON_KEY=your_supabase_anon_key');
        console.log('ELEVENLABS_API_KEY=your_elevenlabs_key');
        console.log('DID_API_KEY=your_did_key\n');
        
        console.log('⚠️  IMPORTANT: OpenAI API key is required for AI chatbot!');
    }

    showTestCommands() {
        console.log('\n🧪 TEST COMMANDS');
        console.log('===============\n');
        
        console.log('After deployment, test these URLs:\n');
        
        console.log('✅ Main Application:');
        console.log('   https://fakelit.com/\n');
        
        console.log('🤖 AI Chatbot:');
        console.log('   https://fakelit.com/fakelit-chatbot.html\n');
        
        console.log('🔍 Health Check:');
        console.log('   https://fakelit.com/health\n');
        
        console.log('🔌 API Status:');
        console.log('   https://fakelit.com/api/fakelit-chatbot/status\n');
        
        console.log('💬 Test Chatbot Questions:');
        console.log('   • "How do I deploy to Cloudways?"');
        console.log('   • "What are the API endpoints?"');
        console.log('   • "How do I configure SSL?"');
        console.log('   • "Tell me about Fakelit.com features"');
    }
}

// Run quick launch
async function main() {
    const launcher = new QuickLauncher();
    await launcher.launch();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { QuickLauncher }; 