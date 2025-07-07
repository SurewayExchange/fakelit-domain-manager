# 💳 Fakelit.com NMI Payment Gateway Setup - Complete Guide

## ✅ Your NMI Credentials Configured

Your NMI payment gateway has been configured with the following credentials:

- **Gateway ID**: 17449
- **Username**: BrooksM1874  
- **Password**: chgM110171b$
- **Endpoint**: https://secure.networkmerchants.com/api/transact.php
- **Sandbox**: false (Production mode)

## 🔧 Current Status

✅ **Environment file created**: `.env` with NMI credentials  
✅ **Configuration file created**: `config/nmi-config.json`  
✅ **Test scripts ready**: `test-nmi-connection.js`  
✅ **Troubleshooting script**: `troubleshoot-nmi.js`  

❌ **Authentication issue detected**: Response code 300 (Authentication Failed)

## 🚀 Quick Setup Steps

### 1. Test NMI Connection
```bash
cd fakelit-deployment
node test-nmi-connection.js
```

### 2. Troubleshoot if Needed
```bash
node troubleshoot-nmi.js
```

### 3. Start the Server
```bash
npm start
```

## 🔧 Troubleshooting Authentication Issues

### Common Causes & Solutions

#### 1. **Account Status**
- **Issue**: NMI account not active or approved
- **Solution**: 
  - Log into NMI merchant dashboard
  - Check account status
  - Contact NMI support if account is pending

#### 2. **API Access**
- **Issue**: API access not enabled
- **Solution**:
  - Contact NMI support: 1-866-509-7199
  - Request API credentials activation
  - Verify API permissions

#### 3. **Credential Format**
- **Issue**: Incorrect credential format
- **Solution**:
  - Gateway ID: Should be numeric (17449 ✅)
  - Username: Should match NMI login (BrooksM1874 ✅)
  - Password: Should be NMI account password (chgM110171b$ ✅)

#### 4. **IP Restrictions**
- **Issue**: IP address not whitelisted
- **Solution**:
  - Contact NMI support to whitelist your IP
  - Provide your current IP address
  - Request API access from your IP

#### 5. **Sandbox vs Production**
- **Issue**: Using production credentials in sandbox
- **Solution**:
  - Request sandbox credentials from NMI
  - Test with sandbox environment first
  - Switch to production when ready

## 📞 NMI Support Contact

- **Phone**: 1-866-509-7199
- **Email**: support@nmi.com
- **Website**: https://www.nmi.com/support/
- **Developer Docs**: https://www.nmi.com/developers/

## 🔄 Alternative Setup Options

### Option 1: Request New API Credentials
1. Contact NMI support
2. Request fresh API credentials
3. Update configuration with new credentials
4. Test connection

### Option 2: Use Sandbox Environment
1. Request sandbox credentials from NMI
2. Update configuration for sandbox mode
3. Test with sandbox environment
4. Switch to production when ready

### Option 3: Verify Account Details
1. Log into NMI merchant dashboard
2. Verify account information
3. Check API settings
4. Confirm credentials are correct

## 📋 Next Steps

### Immediate Actions
1. **Contact NMI Support** with your merchant account details
2. **Verify account status** in NMI dashboard
3. **Request API access** if not already enabled
4. **Test with sandbox** if production credentials don't work

### Once Authentication Works
1. **Test payment processing** with small amounts
2. **Configure Magento integration** (if needed)
3. **Set up webhook endpoints** for payment notifications
4. **Deploy to production** environment

## 🏢 Fakelit.com Integration

Once NMI is working, your Fakelit.com system will provide:

- ✅ **Secure payment processing** via NMI gateway
- ✅ **Professional branding** with "Powered by Fakelit.com"
- ✅ **Complete transaction tracking** and history
- ✅ **Magento e-commerce integration** (when configured)
- ✅ **Automated domain management** with payment processing

## 💳 Payment Gateway: NMI + Magento

Your Fakelit.com domain management system is configured to use **NMI + Magento** as the standard payment processing solution for all app development services.

---

**Need Help?** Contact NMI support or refer to the troubleshooting script for detailed diagnostics. 