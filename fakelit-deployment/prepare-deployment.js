/**
 * 📦 Fakelit.com Deployment Package Preparation
 * Prepare all files for Cloudways deployment
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Fakelit.com Deployment Package Preparation');
console.log('============================================');
console.log('');

// Create deployment directory
const deployDir = path.join(__dirname, 'deploy-package');
if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir);
}

// Files to copy
const filesToCopy = [
    'server.js',
    'package.json',
    'package-lock.json',
    '.env',
    'cloudways-deploy.json',
    'DEPLOY_NOW.md',
    'NMI_FINAL_SETUP_GUIDE.md'
];

// Directories to copy
const dirsToCopy = [
    'routes',
    'services',
    'middleware',
    'models',
    'config',
    'public',
    'utils'
];

console.log('📁 Copying files...');

// Copy individual files
filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(deployDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ⚠️ ${file} (not found)`);
    }
});

// Copy directories
dirsToCopy.forEach(dir => {
    const sourcePath = path.join(__dirname, dir);
    const destPath = path.join(deployDir, dir);
    
    if (fs.existsSync(sourcePath)) {
        copyDirectory(sourcePath, destPath);
        console.log(`   ✅ ${dir}/`);
    } else {
        console.log(`   ⚠️ ${dir}/ (not found)`);
    }
});

// Create deployment instructions
const deployInstructions = `# 🚀 Fakelit.com Cloudways Deployment

## 📦 Package Contents
This package contains your complete Fakelit.com domain management system.

## 🚀 Quick Deploy Steps

1. **Upload to Cloudways**:
   - Log into Cloudways dashboard
   - Create new Node.js application
   - Upload all files from this package

2. **Set Environment Variables**:
   - NODE_ENV=production
   - PORT=80
   - DOMAIN=fakelit.com
   - NMI_GATEWAY_ID=17449
   - NMI_USERNAME=BrooksM1874
   - NMI_PASSWORD=chgM110171b$
   - NMI_API_KEY=104.175.148.157

3. **Install & Start**:
   - Run: npm install
   - Run: npm start

4. **Add Domain**:
   - Add fakelit.com as custom domain
   - Enable SSL certificate

## 📊 Post-Deployment URLs
- Main Site: https://fakelit.com
- Health Check: https://fakelit.com/health
- Payment API: https://fakelit.com/api/payments
- Admin: https://fakelit.com/admin

## 💳 Payment Gateway
- NMI Gateway: Configured and ready
- Magento Integration: Ready for setup
- Test Transactions: Available

🏢 Powered by: Fakelit.com
`;

fs.writeFileSync(path.join(deployDir, 'DEPLOYMENT_INSTRUCTIONS.md'), deployInstructions);

console.log('');
console.log('✅ Deployment package created successfully!');
console.log(`📁 Location: ${deployDir}`);
console.log('');
console.log('📋 Package Contents:');
console.log('   📄 server.js - Main application server');
console.log('   📄 package.json - Dependencies');
console.log('   📄 .env - Environment variables');
console.log('   📁 routes/ - API routes');
console.log('   📁 services/ - Business logic');
console.log('   📁 public/ - Frontend files');
console.log('   📁 config/ - Configuration files');
console.log('   📄 DEPLOYMENT_INSTRUCTIONS.md - Setup guide');
console.log('');
console.log('🚀 Next Steps:');
console.log('1. Upload this package to Cloudways');
console.log('2. Follow DEPLOYMENT_INSTRUCTIONS.md');
console.log('3. Your site will be live at https://fakelit.com');
console.log('');
console.log('💳 Payment Gateway: NMI + Magento');
console.log('🏢 Powered by: Fakelit.com');

function copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const destPath = path.join(destination, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirectory(sourcePath, destPath);
        } else {
            fs.copyFileSync(sourcePath, destPath);
        }
    });
} 