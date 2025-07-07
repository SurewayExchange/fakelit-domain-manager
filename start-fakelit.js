#!/usr/bin/env node

console.log('');
console.log('🚀 Starting Fakelit.com - Professional Hosting Platform');
console.log('======================================================');

// Set default environment variables if not present
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
    console.log('✅ Set NODE_ENV to production');
}

if (!process.env.PORT) {
    process.env.PORT = 3000;
    console.log('✅ Set PORT to 3000');
}

if (!process.env.DOMAIN) {
    process.env.DOMAIN = 'fakelit.com';
    console.log('✅ Set DOMAIN to fakelit.com');
}

// Set mock API keys if not present to prevent crashes
if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = 'mock-key-for-development';
    console.log('⚠️ OpenAI API key not found, using mock mode');
}

if (!process.env.SUPABASE_URL) {
    process.env.SUPABASE_URL = 'https://mock.supabase.co';
    console.log('⚠️ Supabase URL not found, using mock mode');
}

if (!process.env.SUPABASE_ANON_KEY) {
    process.env.SUPABASE_ANON_KEY = 'mock-anon-key';
    console.log('⚠️ Supabase anon key not found, using mock mode');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-key';
    console.log('⚠️ Supabase service key not found, using mock mode');
}

if (!process.env.TWILIO_ACCOUNT_SID) {
    process.env.TWILIO_ACCOUNT_SID = 'mock-account-sid';
    console.log('⚠️ Twilio account SID not found, using mock mode');
}

if (!process.env.TWILIO_AUTH_TOKEN) {
    process.env.TWILIO_AUTH_TOKEN = 'mock-auth-token';
    console.log('⚠️ Twilio auth token not found, using mock mode');
}

if (!process.env.TWILIO_PHONE_NUMBER) {
    process.env.TWILIO_PHONE_NUMBER = '513-441-9772';
    console.log('✅ Set Twilio phone number to 513-441-9772');
}

if (!process.env.EMAIL_HOST) {
    process.env.EMAIL_HOST = 'smtp.gmail.com';
    console.log('✅ Set email host to smtp.gmail.com');
}

if (!process.env.EMAIL_PORT) {
    process.env.EMAIL_PORT = '587';
    console.log('✅ Set email port to 587');
}

if (!process.env.EMAIL_USER) {
    process.env.EMAIL_USER = 'support@fakelit.com';
    console.log('✅ Set email user to support@fakelit.com');
}

if (!process.env.EMAIL_PASS) {
    process.env.EMAIL_PASS = 'mock-email-password';
    console.log('⚠️ Email password not found, using mock mode');
}

console.log('');
console.log('🏢 Fakelit.com Configuration:');
console.log('   🌐 Domain: fakelit.com');
console.log('   📞 Phone: 702-664-0009');
console.log('   📧 Support: support@fakelit.com');
console.log('   📧 Sales: sales@fakelit.com');
console.log('   📧 Billing: billing@fakelit.com');
console.log('   📧 Accounts: accounts@fakelit.com');
console.log('   📧 Info: info@fakelit.com');
console.log('   📧 M. Brooks: m.brooks@fakelit.com');
console.log('   📧 V. Helems: v.helems@fakelit.com');
console.log('');
console.log('🏢 Company Address:');
console.log('   2300 W Sahara Ave Suite 800');
console.log('   Las Vegas, NV 89102');
console.log('');

// Start the server
console.log('🚀 Starting server...');
require('./server.js'); 