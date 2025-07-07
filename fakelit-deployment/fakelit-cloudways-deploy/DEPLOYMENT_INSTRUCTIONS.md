# 🚀 Fakelit.com Cloudways Deployment Instructions

## 📋 Prerequisites
- Cloudways account with Node.js application created
- Domain: fakelit.com (already configured)

## 🔧 Deployment Steps

### 1. Upload Files
- Upload all files from this directory to your Cloudways application root
- Ensure package.json is in the root directory

### 2. Install Dependencies
- Go to Cloudways Dashboard → Application Settings → SSH Terminal
- Run: `npm install --production`

### 3. Configure Environment Variables
- Go to Application Settings → Environment Variables
- Add all variables from .env file

### 4. Add Domain
- Go to Application Settings → Domain Management
- Add: fakelit.com
- Add: www.fakelit.com

### 5. Enable SSL
- Go to Application Settings → SSL Certificate
- Enable SSL for fakelit.com

### 6. Restart Application
- Go to Application Settings → Deploy
- Click "Deploy" button

## ✅ Verification
- Visit: https://fakelit.com
- Health check: https://fakelit.com/health
- API test: https://fakelit.com/api

## 🆘 Troubleshooting 502 Error
If you get 502 Bad Gateway:
1. Check application logs in Cloudways
2. Ensure PORT=80 in environment variables
3. Verify all dependencies are installed
4. Restart the application

## 📞 Support
- Phone: 702-664-0009
- Email: support@fakelit.com
- Address: 2300 W Sahara Ave Suite 800, Las Vegas, NV 89102

Powered by Fakelit.com
