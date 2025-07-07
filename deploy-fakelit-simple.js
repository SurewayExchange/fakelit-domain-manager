const fs = require('fs').promises;
const path = require('path');

class FakelitSimpleDeployer {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.domainName = 'fakelit.com';
        this.appName = 'fakelit-app';
    }

    async deploy() {
        console.log('🚀 Fakelit.com Application Deployment');
        console.log('=====================================\n');

        try {
            // Step 1: Prepare application files
            await this.prepareApplication();

            // Step 2: Create deployment package
            await this.createDeploymentPackage();

            // Step 3: Generate deployment instructions
            await this.generateInstructions();

            console.log('\n🎉 Fakelit.com application prepared successfully!');
            console.log('📦 Deployment package created in: ./fakelit-deployment/');
            console.log('📋 Check deployment-instructions.md for next steps');
            console.log('🏢 Powered by Fakelit.com');

        } catch (error) {
            console.error('❌ Deployment preparation failed:', error.message);
            process.exit(1);
        }
    }

    async prepareApplication() {
        console.log('📦 Preparing Fakelit.com application files...');

        // Create deployment package
        const deploymentDir = './fakelit-deployment';
        await fs.mkdir(deploymentDir, { recursive: true });

        // Copy necessary files
        const filesToCopy = [
            'package.json',
            'server.js',
            'public/',
            'routes/',
            'services/',
            'middleware/',
            'config/',
            'models/',
            'utils/'
        ];

        for (const file of filesToCopy) {
            const sourcePath = path.join(process.cwd(), file);
            const destPath = path.join(deploymentDir, file);
            
            try {
                await this.copyFileOrDir(sourcePath, destPath);
                console.log(`   ✅ Copied: ${file}`);
            } catch (error) {
                console.log(`   ⚠️ Skipped: ${file} (${error.message})`);
            }
        }

        // Create production .env file
        await this.createProductionEnv(deploymentDir);

        // Create deployment script
        await this.createDeploymentScript(deploymentDir);

        // Create Fakelit.com specific files
        await this.createFakelitFiles(deploymentDir);

        console.log('✅ Application files prepared');
    }

    async copyFileOrDir(source, dest) {
        try {
            const stat = await fs.stat(source);
            
            if (stat.isDirectory()) {
                await fs.mkdir(dest, { recursive: true });
                const files = await fs.readdir(source);
                for (const file of files) {
                    await this.copyFileOrDir(
                        path.join(source, file),
                        path.join(dest, file)
                    );
                }
            } else {
                await fs.copyFile(source, dest);
            }
        } catch (error) {
            // Skip if file doesn't exist
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    async createProductionEnv(deploymentDir) {
        const envContent = `# Fakelit.com Production Environment
NODE_ENV=production
PORT=3000

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Secret
JWT_SECRET=fakelit-production-jwt-secret-2024

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# D-ID Configuration
DID_API_KEY=your_did_api_key_here

# Ready Player Me Configuration
RPM_API_KEY=your_rpm_api_key_here

# HeyGen Configuration
HEYGEN_API_KEY=your_heygen_api_key_here

# Cloudways Configuration
CLOUDWAYS_API_KEY=your_cloudways_api_key_here
CLOUDWAYS_EMAIL=your_cloudways_email_here

# Enom Configuration
ENOM_USERNAME=your_enom_username_here
ENOM_PASSWORD=your_enom_password_here

# Fakelit.com Branding
BRAND_NAME=Fakelit.com
DOMAIN_NAME=fakelit.com
`;

        await fs.writeFile(path.join(deploymentDir, '.env'), envContent);
    }

    async createDeploymentScript(deploymentDir) {
        const scriptContent = `#!/bin/bash
# Fakelit.com Deployment Script
echo "🚀 Deploying Fakelit.com application..."

# Install dependencies
npm install --production

# Start the application
npm start

echo "✅ Fakelit.com application started successfully!"
echo "🌐 Powered by Fakelit.com"
`;

        await fs.writeFile(path.join(deploymentDir, 'deploy.sh'), scriptContent);
        await fs.chmod(path.join(deploymentDir, 'deploy.sh'), 0o755);
    }

    async createFakelitFiles(deploymentDir) {
        // Create Fakelit.com specific index page
        const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fakelit.com - Domain Management System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 600px;
            width: 90%;
        }
        
        .logo {
            font-size: 3rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 1rem;
        }
        
        .tagline {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 2rem;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .feature {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .feature h3 {
            color: #333;
            margin-bottom: 0.5rem;
        }
        
        .feature p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .status {
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 10px;
            margin: 2rem 0;
        }
        
        .powered-by {
            font-size: 0.9rem;
            color: #999;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🌐 Fakelit.com</div>
        <div class="tagline">Professional Domain Management System</div>
        
        <div class="status">
            ✅ Application Status: Online<br>
            🚀 Deployment: Successful<br>
            🌐 Domain: fakelit.com
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>🌐 Domain Management</h3>
                <p>Unified management for multiple platforms</p>
            </div>
            <div class="feature">
                <h3>☁️ Cloudways Integration</h3>
                <p>Seamless deployment and hosting</p>
            </div>
            <div class="feature">
                <h3>🔧 Automated Operations</h3>
                <p>Streamlined domain and application management</p>
            </div>
            <div class="feature">
                <h3>📊 Professional Branding</h3>
                <p>Consistent "Powered by Fakelit.com" across all applications</p>
            </div>
        </div>
        
        <div class="powered-by">
            Powered by Fakelit.com
        </div>
    </div>
</body>
</html>`;

        await fs.writeFile(path.join(deploymentDir, 'public', 'index.html'), indexContent);
    }

    async createDeploymentPackage() {
        console.log('\n📦 Creating deployment package...');
        
        // Create package.json for deployment
        const packageJson = {
            name: "fakelit-app",
            version: "1.0.0",
            description: "Fakelit.com Domain Management System - Powered by Fakelit.com",
            main: "server.js",
            scripts: {
                start: "node server.js",
                dev: "nodemon server.js"
            },
            dependencies: {
                "express": "^4.18.2",
                "cors": "^2.8.5",
                "helmet": "^7.0.0",
                "compression": "^1.7.4",
                "dotenv": "^16.3.1",
                "axios": "^1.5.0",
                "uuid": "^9.0.0"
            },
            engines: {
                node: ">=18.0.0"
            },
            author: "Fakelit.com Team",
            license: "MIT"
        };

        await fs.writeFile(
            './fakelit-deployment/package.json',
            JSON.stringify(packageJson, null, 2)
        );

        console.log('✅ Deployment package created');
    }

    async generateInstructions() {
        console.log('\n📋 Generating deployment instructions...');

        const instructions = `# 🚀 Fakelit.com Deployment Instructions

## Overview
This package contains the Fakelit.com domain management system ready for deployment on Cloudways.

## 📦 Package Contents
- \`server.js\` - Main application server
- \`public/\` - Static files and frontend assets
- \`routes/\` - API route handlers
- \`services/\` - Business logic services
- \`middleware/\` - Express middleware
- \`config/\` - Configuration files
- \`.env\` - Environment variables (update with your values)

## 🚀 Deployment Steps

### 1. Cloudways Setup
1. Log into your Cloudways account
2. Create a new application
3. Choose PHP 8.1 or Node.js 18+
4. Set application name: \`fakelit-app\`
5. Choose your preferred server location

### 2. Upload Files
1. Connect to your Cloudways application via SFTP
2. Upload all files from \`fakelit-deployment/\` to the application root
3. Ensure \`.env\` file is uploaded with proper configuration

### 3. Configure Environment
1. Update \`.env\` file with your actual API keys and credentials
2. Set \`NODE_ENV=production\`
3. Configure your domain settings

### 4. Install Dependencies
\`\`\`bash
npm install --production
\`\`\`

### 5. Start Application
\`\`\`bash
npm start
\`\`\`

### 6. Domain Configuration
1. Point your domain \`fakelit.com\` to the Cloudways application
2. Configure SSL certificate
3. Set up DNS records

## 🔧 Configuration

### Required Environment Variables
- \`CLOUDWAYS_API_KEY\` - Your Cloudways API key
- \`CLOUDWAYS_EMAIL\` - Your Cloudways email
- \`SUPABASE_URL\` - Supabase project URL
- \`SUPABASE_ANON_KEY\` - Supabase anonymous key
- \`JWT_SECRET\` - JWT signing secret

### Optional Environment Variables
- \`OPENAI_API_KEY\` - For AI features
- \`ELEVENLABS_API_KEY\` - For voice synthesis
- \`DID_API_KEY\` - For lip sync features

## 🌐 Application Features

### Health Check
- Endpoint: \`/health\`
- Returns application status and Fakelit.com branding

### Main Application
- Endpoint: \`/\`
- Serves the Fakelit.com domain management interface

### API Routes
- \`/api/auth\` - Authentication endpoints
- \`/api/chat\` - Chat functionality
- \`/api/admin\` - Admin panel
- \`/api/avatar\` - Avatar management

## 🏢 Fakelit.com Branding

All endpoints and responses include "Powered by Fakelit.com" branding:

\`\`\`json
{
  "status": "healthy",
  "service": "Fakelit.com Domain Management",
  "poweredBy": "Fakelit.com"
}
\`\`\`

## 📞 Support

For technical support or questions about Fakelit.com:
- Email: support@fakelit.com
- Documentation: https://docs.fakelit.com
- Status: https://status.fakelit.com

## ✅ Verification

After deployment, verify the application is working:

1. Visit \`https://fakelit.com\`
2. Check health endpoint: \`https://fakelit.com/health\`
3. Verify all API endpoints are responding
4. Confirm Fakelit.com branding is displayed

---

**Powered by Fakelit.com** 🌐
`;

        await fs.writeFile('./deployment-instructions.md', instructions);
        console.log('✅ Deployment instructions generated');
    }
}

// Run deployment
async function main() {
    const deployer = new FakelitSimpleDeployer();
    await deployer.deploy();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { FakelitSimpleDeployer }; 