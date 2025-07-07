const DomainManager = require('./services/domainManager');
const fs = require('fs').promises;
const path = require('path');

class FakelitSimpleLauncher {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.domainName = 'fakelit.com';
        this.appName = 'fakelit-app';
        this.domainManager = new DomainManager();
    }

    async launch() {
        console.log('🚀 Launching Fakelit.com on Cloudways');
        console.log('=====================================\n');

        try {
            // Step 1: Check if deployment package exists
            await this.checkDeploymentPackage();

            // Step 2: Create domain and application
            const appInfo = await this.createApplication();

            // Step 3: Generate launch instructions
            await this.generateLaunchInstructions(appInfo);

            // Step 4: Provide next steps
            await this.provideNextSteps(appInfo);

            console.log('\n🎉 Fakelit.com launch preparation complete!');
            console.log('📋 Check launch-instructions.md for deployment steps');
            console.log('🏢 Powered by Fakelit.com');

        } catch (error) {
            console.error('❌ Launch preparation failed:', error.message);
            process.exit(1);
        }
    }

    async checkDeploymentPackage() {
        console.log('📦 Checking deployment package...');
        
        const deploymentDir = './fakelit-deployment';
        try {
            await fs.access(deploymentDir);
            console.log('✅ Deployment package found');
        } catch (error) {
            console.log('❌ Deployment package not found');
            console.log('💡 Please run: node deploy-fakelit-simple.js first');
            throw new Error('Deployment package required');
        }
    }

    async createApplication() {
        console.log('\n🏗️ Creating Fakelit.com application...');
        
        // Check credentials
        const hasApiKey = process.env.CLOUDWAYS_API_KEY;
        const hasEmail = process.env.CLOUDWAYS_EMAIL;

        if (!hasApiKey || !hasEmail) {
            console.log('⚠️ Cloudways credentials not found - will create instructions for manual setup');
            return {
                appId: 'manual-setup-required',
                serverId: 'manual-setup-required',
                appName: this.appName,
                domainName: this.domainName,
                status: 'pending'
            };
        }

        try {
            const result = await this.domainManager.createDomain(this.domainName, 'Cloudways');
            
            if (result.success) {
                console.log('✅ Application created successfully');
                console.log(`   App ID: ${result.appId}`);
                console.log(`   Server ID: ${result.serverId}`);
                
                return {
                    appId: result.appId,
                    serverId: result.serverId,
                    appName: this.appName,
                    domainName: this.domainName,
                    status: 'created'
                };
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.log('⚠️ Automatic creation failed - will provide manual instructions');
            console.log(`   Error: ${error.message}`);
            
            return {
                appId: 'manual-setup-required',
                serverId: 'manual-setup-required',
                appName: this.appName,
                domainName: this.domainName,
                status: 'manual-required'
            };
        }
    }

    async generateLaunchInstructions(appInfo) {
        console.log('\n📋 Generating launch instructions...');
        
        const instructions = `# 🚀 Fakelit.com Launch Instructions

## Application Information
- **Domain**: ${appInfo.domainName}
- **Application Name**: ${appInfo.appName}
- **Status**: ${appInfo.status}
- **Platform**: Cloudways
- **Powered By**: ${this.brandName}

## 🚀 Launch Steps

### Option 1: Automatic Launch (If credentials are configured)
If you have Cloudways API credentials set up, the application should be created automatically.

### Option 2: Manual Launch (Recommended)

#### Step 1: Cloudways Setup
1. Log into your Cloudways account at https://platform.cloudways.com
2. Click "Add Server"
3. Choose your preferred cloud provider (AWS, DigitalOcean, Vultr, etc.)
4. Select server size (minimum 1GB RAM recommended)
5. Choose server location
6. Click "Add Server"

#### Step 2: Create Application
1. Once server is created, click "Add Application"
2. Choose "Node.js" as application type
3. Select Node.js version 18 or higher
4. Set application name: \`${appInfo.appName}\`
5. Click "Add Application"

#### Step 3: Upload Files
1. In your Cloudways dashboard, go to your application
2. Click "Application Settings" → "Git"
3. Or use SFTP to upload files:
   - Host: Your server IP
   - Username: Your Cloudways username
   - Password: Your Cloudways password
   - Port: 22
4. Upload all files from \`./fakelit-deployment/\` to the application root

#### Step 4: Configure Environment
1. In Cloudways dashboard, go to "Application Settings" → "Environment Variables"
2. Add the following variables:
   \`\`\`
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=fakelit-production-jwt-secret-2024
   BRAND_NAME=${this.brandName}
   DOMAIN_NAME=${appInfo.domainName}
   \`\`\`
3. Add your API keys for additional features (optional)

#### Step 5: Install Dependencies
1. In Cloudways dashboard, go to "Application Settings" → "SSH Terminal"
2. Run: \`npm install --production\`

#### Step 6: Start Application
1. In the SSH terminal, run: \`npm start\`
2. Or configure the start command in "Application Settings" → "Deployment via Git"

#### Step 7: Configure Domain
1. In Cloudways dashboard, go to "Application Settings" → "Domain Management"
2. Add domain: \`${appInfo.domainName}\`
3. Configure SSL certificate
4. Update DNS records to point to your Cloudways server

## 🔧 Configuration

### Required Environment Variables
- \`NODE_ENV=production\`
- \`PORT=3000\`
- \`JWT_SECRET=your-secret-key\`
- \`BRAND_NAME=${this.brandName}\`
- \`DOMAIN_NAME=${appInfo.domainName}\`

### Optional Environment Variables
- \`SUPABASE_URL\` - For database features
- \`OPENAI_API_KEY\` - For AI features
- \`ELEVENLABS_API_KEY\` - For voice synthesis
- \`DID_API_KEY\` - For lip sync features

## 🌐 Application Features

### Health Check
- Endpoint: \`https://${appInfo.domainName}/health\`
- Returns application status and ${this.brandName} branding

### Main Application
- Endpoint: \`https://${appInfo.domainName}/\`
- Serves the ${this.brandName} domain management interface

### API Routes
- \`/api/auth\` - Authentication endpoints
- \`/api/chat\` - Chat functionality
- \`/api/admin\` - Admin panel
- \`/api/avatar\` - Avatar management

## ✅ Verification

After deployment, verify the application is working:

1. Visit \`https://${appInfo.domainName}\`
2. Check health endpoint: \`https://${appInfo.domainName}/health\`
3. Verify all API endpoints are responding
4. Confirm ${this.brandName} branding is displayed

## 🏢 ${this.brandName} Branding

All endpoints and responses include "Powered by ${this.brandName}" branding:

\`\`\`json
{
  "status": "healthy",
  "service": "${this.brandName} Domain Management",
  "poweredBy": "${this.brandName}"
}
\`\`\`

## 📞 Support

For technical support or questions about ${this.brandName}:
- Email: support@${appInfo.domainName}
- Documentation: https://docs.${appInfo.domainName}
- Status: https://status.${appInfo.domainName}

## 🎯 Next Steps

1. Complete the manual deployment steps above
2. Test all application features
3. Configure monitoring and backups
4. Set up custom domain email
5. Configure CDN for better performance

---

**Powered by ${this.brandName}** 🌐
`;

        await fs.writeFile('./launch-instructions.md', instructions);
        console.log('✅ Launch instructions generated');
    }

    async provideNextSteps(appInfo) {
        console.log('\n🎯 Next Steps:');
        console.log('1. 📋 Review launch-instructions.md');
        console.log('2. ☁️ Set up Cloudways server and application');
        console.log('3. 📤 Upload files from ./fakelit-deployment/');
        console.log('4. ⚙️ Configure environment variables');
        console.log('5. 🚀 Start the application');
        console.log('6. 🌐 Configure domain and SSL');
        console.log('7. ✅ Test all features');
        
        if (appInfo.status === 'manual-required') {
            console.log('\n💡 Since automatic creation failed, follow the manual steps in launch-instructions.md');
        }
    }
}

// Run launch
async function main() {
    const launcher = new FakelitSimpleLauncher();
    await launcher.launch();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { FakelitSimpleLauncher }; 