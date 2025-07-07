/**
 * ☁️ Fakelit.com Cloudways Deployment Script
 * Deploy the domain management system to Cloudways
 */

const fs = require('fs');
const path = require('path');

console.log('☁️ Fakelit.com Cloudways Deployment');
console.log('====================================');
console.log('');

// Load configuration
const configPath = path.join(__dirname, 'cloudways-deploy.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('📋 Deployment Configuration:');
console.log(`   App Name: ${config.app.name}`);
console.log(`   Domain: ${config.server.domain}`);
console.log(`   Cloudways Domain: ${config.server.cloudwaysDomain}`);
console.log(`   Platform: ${config.deployment.platform}`);
console.log(`   Payment Gateway: ${config.payment.gateway}`);
console.log('');

console.log('🚀 Deployment Steps:');
console.log('');
console.log('1. **Cloudways App Setup**');
console.log('   - Log into Cloudways dashboard');
console.log('   - Create new application');
console.log('   - Choose Node.js as application type');
console.log('   - Select your preferred server (DigitalOcean/AWS/GCE)');
console.log('   - Set application name: fakelit-domain-manager');
console.log('');

console.log('2. **Domain Configuration**');
console.log('   - Add custom domain: fakelit.com');
console.log('   - Configure SSL certificate');
console.log('   - Set up DNS records');
console.log('');

console.log('3. **Environment Variables**');
console.log('   - Set NODE_ENV=production');
console.log('   - Set PORT=80');
console.log('   - Set DOMAIN=fakelit.com');
console.log('   - Set CLOUDWAYS_DOMAIN=your-app.cloudwaysapps.com');
console.log('   - Configure NMI payment credentials');
console.log('   - Set up database credentials');
console.log('');

console.log('4. **File Upload**');
console.log('   - Upload all files to Cloudways');
console.log('   - Ensure package.json is in root directory');
console.log('   - Upload .env file with credentials');
console.log('');

console.log('5. **Dependencies Installation**');
console.log('   - Run: npm install');
console.log('   - Install production dependencies');
console.log('');

console.log('6. **Database Setup**');
console.log('   - Configure Supabase connection');
console.log('   - Run database migrations');
console.log('   - Set up initial data');
console.log('');

console.log('7. **Payment Gateway Testing**');
console.log('   - Test NMI connection');
console.log('   - Verify payment processing');
console.log('   - Test Magento integration');
console.log('');

console.log('8. **Domain Management Testing**');
console.log('   - Test Cloudways API integration');
console.log('   - Test Enom domain management');
console.log('   - Verify domain creation process');
console.log('');

console.log('9. **SSL & Security**');
console.log('   - Enable SSL certificate');
console.log('   - Configure security headers');
console.log('   - Set up rate limiting');
console.log('');

console.log('10. **Monitoring & Logs**');
console.log('    - Set up application monitoring');
console.log('    - Configure error logging');
console.log('    - Set up performance monitoring');
console.log('');

console.log('📊 Post-Deployment URLs:');
console.log(`   🌐 Main Site: https://${config.server.domain}`);
console.log(`   ☁️ Cloudways: https://${config.server.cloudwaysDomain}`);
console.log(`   📊 Health Check: https://${config.server.domain}/health`);
console.log(`   🔗 API Base: https://${config.server.domain}/api`);
console.log(`   💳 Payment API: https://${config.server.domain}/api/payments`);
console.log(`   🏢 Admin Dashboard: https://${config.server.domain}/admin`);
console.log('');

console.log('🔧 Environment Variables to Set:');
console.log('');
console.log('# Server Configuration');
console.log('NODE_ENV=production');
console.log('PORT=80');
console.log('DOMAIN=fakelit.com');
console.log('CLOUDWAYS_DOMAIN=your-app.cloudwaysapps.com');
console.log('');
console.log('# NMI Payment Gateway');
console.log('NMI_GATEWAY_ID=17449');
console.log('NMI_USERNAME=BrooksM1874');
console.log('NMI_PASSWORD=chgM110171b$');
console.log('NMI_API_KEY=104.175.148.157');
console.log('NMI_ENDPOINT=https://secure.networkmerchants.com/api/transact.php');
console.log('');
console.log('# Database & Services');
console.log('SUPABASE_URL=your_supabase_url');
console.log('SUPABASE_ANON_KEY=your_supabase_anon_key');
console.log('OPENAI_API_KEY=your_openai_api_key');
console.log('');

console.log('💳 Payment Gateway: NMI + Magento');
console.log('🏢 Powered by: Fakelit.com');
console.log('☁️ Platform: Cloudways'); 