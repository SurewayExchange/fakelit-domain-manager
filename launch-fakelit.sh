#!/bin/bash

# Fakelit.com Launch Script
# Professional Hosting Platform

echo "🚀 Launching Fakelit.com"
echo "========================"
echo "🏢 Fakelit.com - Professional Hosting Platform"
echo "🌐 Domain: fakelit.com"
echo "📞 Phone: 702-664-0009"
echo "📧 Email: sales@fakelit.com"
echo "🏢 Address: 2300 W Sahara Ave Suite 800, Las Vegas, NV 89102"
echo ""

# Set environment variables
export NODE_ENV=production
export PORT=3000
export DOMAIN=fakelit.com

# Company information
export FAKELIT_COMPANY_NAME="Fakelit.com"
export FAKELIT_ADDRESS="2300 W Sahara Ave Suite 800, Las Vegas, NV 89102"
export FAKELIT_PHONE="702-664-0009"
export FAKELIT_EMAIL="sales@fakelit.com"
export FAKELIT_WEBSITE="https://fakelit.com"

# Email configuration
export FAKELIT_SUPPORT_EMAIL="support@fakelit.com"
export FAKELIT_SALES_EMAIL="sales@fakelit.com"
export FAKELIT_BILLING_EMAIL="billing@fakelit.com"
export FAKELIT_ACCOUNTS_EMAIL="accounts@fakelit.com"
export FAKELIT_INFO_EMAIL="info@fakelit.com"
export FAKELIT_MBROOKS_EMAIL="m.brooks@fakelit.com"
export FAKELIT_VHELEMS_EMAIL="v.helems@fakelit.com"

# SMS configuration
export TWILIO_ACCOUNT_SID="your_twilio_account_sid"
export TWILIO_AUTH_TOKEN="your_twilio_auth_token"
export TWILIO_FROM_NUMBER="+17026640009"

# Domain pricing
export DOMAIN_PRICE="21.99"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the Fakelit.com project directory."
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data/fakelit-emails
mkdir -p data/email-access
mkdir -p data/sms-notifications
mkdir -p data/dedicated-servers
mkdir -p data/dedicated-clients
mkdir -p data/wordpress
mkdir -p data/tickets
echo "✅ Directories created"
echo ""

# Initialize services
echo "🔧 Initializing Fakelit.com services..."

# Start the server
echo "🚀 Starting Fakelit.com server..."
echo "🌐 Website will be available at: https://fakelit.com"
echo "📊 Health check: https://fakelit.com/health"
echo "🔗 API base: https://fakelit.com/api"
echo ""

# Display startup information
echo "🎯 Fakelit.com Features:"
echo "   ✅ Dedicated Server Sales"
echo "   ✅ Domain Management ($21.99/year)"
echo "   ✅ Email Services (7 professional addresses)"
echo "   ✅ SMS Notifications"
echo "   ✅ WordPress Services"
echo "   ✅ Crypto Payment Processing"
echo "   ✅ Support Ticketing System"
echo "   ✅ Auto-Scaling Infrastructure"
echo ""

echo "📞 Support Contact:"
echo "   📧 Support: support@fakelit.com"
echo "   📧 Sales: sales@fakelit.com"
echo "   📧 Billing: billing@fakelit.com"
echo "   📧 Accounts: accounts@fakelit.com"
echo "   📧 Info: info@fakelit.com"
echo "   📧 M. Brooks: m.brooks@fakelit.com"
echo "   📧 V. Helems: v.helems@fakelit.com"
echo "   📞 Phone: 702-664-0009"
echo ""

echo "🏢 Company Address:"
echo "   2300 W Sahara Ave Suite 800"
echo "   Las Vegas, NV 89102"
echo ""

echo "🚀 Starting server... (Press Ctrl+C to stop)"
echo ""

# Start the server
npm start 