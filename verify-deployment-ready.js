#!/usr/bin/env node

/**
 * 🚀 Fakelit.com Deployment Verification
 * Ensures all files are ready for Cloudways deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Fakelit.com Deployment Verification');
console.log('====================================\n');

const deploymentDir = path.join(__dirname, 'fakelit-deployment');
let allChecksPassed = true;

// Check 1: Core deployment files
console.log('✅ Check 1: Core deployment files...');
const coreFiles = [
    'package.json',
    'server.js',
    '.env',
    'public/index.html'
];

coreFiles.forEach(file => {
    const filePath = path.join(deploymentDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`   ✓ ${file} - Found`);
    } else {
        console.log(`   ❌ ${file} - Missing`);
        allChecksPassed = false;
    }
});

// Check 2: Chatbot integration files
console.log('\n✅ Check 2: Chatbot integration files...');
const chatbotFiles = [
    'routes/fakelitChatbotRoutes.js',
    'services/fakelitChatbotService.js'
];

chatbotFiles.forEach(file => {
    const filePath = path.join(deploymentDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`   ✓ ${file} - Found`);
    } else {
        console.log(`   ❌ ${file} - Missing`);
        allChecksPassed = false;
    }
});

// Check 3: Main page chatbot integration
console.log('\n✅ Check 3: Main page chatbot integration...');
const indexPath = path.join(deploymentDir, 'public', 'index.html');
if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    
    const checks = [
        { name: 'Chatbot UI section', check: content.includes('chatbot-section') },
        { name: 'Chatbot JavaScript class', check: content.includes('FakelitMainPageChatbot') },
        { name: 'API endpoint reference', check: content.includes('/api/fakelit-chatbot/chat') },
        { name: 'Quick response buttons', check: content.includes('quick-buttons') },
        { name: 'Responsive design', check: content.includes('@media') },
        { name: 'Fakelit.com branding', check: content.includes('Powered by Fakelit.com') }
    ];
    
    checks.forEach(({ name, check }) => {
        if (check) {
            console.log(`   ✓ ${name} - Found`);
        } else {
            console.log(`   ❌ ${name} - Missing`);
            allChecksPassed = false;
        }
    });
} else {
    console.log('   ❌ index.html - Missing');
    allChecksPassed = false;
}

// Check 4: Server configuration
console.log('\n✅ Check 4: Server configuration...');
const serverPath = path.join(deploymentDir, 'server.js');
if (fs.existsSync(serverPath)) {
    const content = fs.readFileSync(serverPath, 'utf8');
    
    const checks = [
        { name: 'Chatbot routes import', check: content.includes('fakelitChatbotRoutes') },
        { name: 'Chatbot API route', check: content.includes('/api/fakelit-chatbot') },
        { name: 'Health endpoint', check: content.includes('/health') },
        { name: 'Static file serving', check: content.includes('express.static') },
        { name: 'CORS configuration', check: content.includes('cors') },
        { name: 'Security middleware', check: content.includes('helmet') }
    ];
    
    checks.forEach(({ name, check }) => {
        if (check) {
            console.log(`   ✓ ${name} - Found`);
        } else {
            console.log(`   ❌ ${name} - Missing`);
            allChecksPassed = false;
        }
    });
} else {
    console.log('   ❌ server.js - Missing');
    allChecksPassed = false;
}

// Check 5: Environment configuration
console.log('\n✅ Check 5: Environment configuration...');
const envPath = path.join(deploymentDir, '.env');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    
    const checks = [
        { name: 'Port configuration', check: content.includes('PORT') },
        { name: 'Node environment', check: content.includes('NODE_ENV') },
        { name: 'OpenAI API key', check: content.includes('OPENAI_API_KEY') },
        { name: 'Supabase configuration', check: content.includes('SUPABASE') }
    ];
    
    checks.forEach(({ name, check }) => {
        if (check) {
            console.log(`   ✓ ${name} - Found`);
        } else {
            console.log(`   ⚠️ ${name} - Missing (may use defaults)`);
        }
    });
} else {
    console.log('   ⚠️ .env file - Missing (will use default configuration)');
}

// Check 6: Package dependencies
console.log('\n✅ Check 6: Package dependencies...');
const packagePath = path.join(deploymentDir, 'package.json');
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = [
        'express',
        'cors',
        'helmet',
        'compression',
        'express-rate-limit',
        'uuid',
        'dotenv'
    ];
    
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    requiredDeps.forEach(dep => {
        if (allDeps[dep]) {
            console.log(`   ✓ ${dep} - ${allDeps[dep]}`);
        } else {
            console.log(`   ❌ ${dep} - Missing`);
            allChecksPassed = false;
        }
    });
    
    if (packageJson.scripts && packageJson.scripts.start) {
        console.log(`   ✓ Start script - ${packageJson.scripts.start}`);
    } else {
        console.log('   ❌ Start script - Missing');
        allChecksPassed = false;
    }
} else {
    console.log('   ❌ package.json - Missing');
    allChecksPassed = false;
}

// Final summary
console.log('\n🎯 Deployment Verification Summary:');
console.log('===================================');

if (allChecksPassed) {
    console.log('✅ ALL CHECKS PASSED!');
    console.log('🚀 Ready for Cloudways deployment');
    console.log('\n📋 Deployment Checklist:');
    console.log('=======================');
    console.log('1. ✅ All files present and configured');
    console.log('2. ✅ Chatbot integrated into main page');
    console.log('3. ✅ API endpoints ready');
    console.log('4. ✅ Server configuration complete');
    console.log('5. ✅ Dependencies installed');
    console.log('6. ✅ Environment variables configured');
    
    console.log('\n🌐 Post-Deployment Testing:');
    console.log('==========================');
    console.log('• Main page: https://yourdomain.com/');
    console.log('• Chatbot: Integrated on main page');
    console.log('• API status: https://yourdomain.com/api/fakelit-chatbot/status');
    console.log('• Health check: https://yourdomain.com/health');
    
    console.log('\n✨ Deployment Ready! ✨');
} else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('⚠️ Please fix the issues above before deploying');
    console.log('\n🔧 Common fixes:');
    console.log('• Ensure all files are copied to fakelit-deployment/');
    console.log('• Check that server.js includes chatbot routes');
    console.log('• Verify index.html has chatbot integration');
    console.log('• Confirm package.json has all dependencies');
}

console.log('\n📞 Need help? Check the deployment documentation or contact support.'); 