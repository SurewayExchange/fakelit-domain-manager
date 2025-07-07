# 🚀 Fakelit.com Quick Setup Guide

## 💳 NMI Payment Gateway Setup

### Step 1: Get NMI Account
1. **Sign up** at https://www.nmi.com/
2. **Complete** merchant application
3. **Receive** gateway credentials

### Step 2: NMI Credentials
You'll need these from your NMI dashboard:
- **Gateway ID**: Your merchant gateway identifier
- **Username**: NMI account username
- **Password**: NMI account password
- **Endpoint**: Usually `https://secure.networkmerchants.com/api/transact.php`

### Step 3: Test Mode
- Start with **sandbox/test mode** for development
- Use test card numbers for validation
- Switch to **production mode** when ready

## 🛒 Magento E-commerce Setup

### Step 1: Magento Store
1. **Install** Magento 2.x on your server
2. **Configure** basic store settings
3. **Set up** payment methods

### Step 2: REST API Configuration
1. **Enable** REST API in Magento admin
2. **Create** integration user
3. **Generate** API credentials

### Step 3: Magento Credentials
You'll need these from your Magento admin:
- **Base URL**: Your Magento store URL
- **Consumer Key**: REST API consumer key
- **Consumer Secret**: REST API consumer secret
- **Access Token**: REST API access token
- **Access Token Secret**: REST API access token secret

## 🔧 Quick Configuration

### Option 1: Interactive Setup
```bash
node setup-nmi-magento.js
```

### Option 2: Manual Setup
1. **Edit** `.env` file with your credentials
2. **Update** `config/payment-config.json`
3. **Test** with `node test-payment-direct.js`

### Option 3: Cloudways Setup
1. **Upload** files to Cloudways
2. **Set** environment variables in dashboard
3. **Install** dependencies: `npm install`
4. **Start** application: `npm start`

## 🧪 Testing

### Test Payment Processing
```bash
node test-payment-direct.js
```

### Test Card Numbers
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005
- **Discover**: 6011111111111117

### Test CVV & Expiry
- **CVV**: Any 3-digit number (e.g., 123)
- **Expiry**: Any future date (e.g., 12/25)

## 📋 Required Environment Variables

```env
# NMI Payment Gateway
NMI_GATEWAY_ID=your_gateway_id
NMI_USERNAME=your_username
NMI_PASSWORD=your_password
NMI_ENDPOINT=https://secure.networkmerchants.com/api/transact.php

# Magento E-commerce
MAGENTO_BASE_URL=https://your-store.com
MAGENTO_CONSUMER_KEY=your_consumer_key
MAGENTO_CONSUMER_SECRET=your_consumer_secret
MAGENTO_ACCESS_TOKEN=your_access_token
MAGENTO_ACCESS_TOKEN_SECRET=your_access_token_secret
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] NMI account created and verified
- [ ] Magento store configured
- [ ] API credentials generated
- [ ] Test mode verified

### Cloudways Deployment
- [ ] Files uploaded to Cloudways
- [ ] Environment variables set
- [ ] Dependencies installed
- [ ] Application started

### Post-Deployment
- [ ] Payment processing tested
- [ ] Order creation verified
- [ ] Customer management working
- [ ] Service activation confirmed

## 📞 Support Resources

### NMI Support
- **Website**: https://www.nmi.com/support/
- **Documentation**: https://www.nmi.com/developers/
- **Test Cards**: https://www.nmi.com/developers/test-cards/

### Magento Support
- **Documentation**: https://devdocs.magento.com/
- **API Reference**: https://devdocs.magento.com/guides/v2.4/rest/
- **Community**: https://community.magento.com/

### Fakelit.com Support
- **Email**: support@fakelit.com
- **Documentation**: See project docs folder
- **Configuration**: Use setup scripts provided

## 🎯 Success Indicators

### Payment Processing
- ✅ Test transactions processed successfully
- ✅ Real transactions working in production
- ✅ Error handling working properly
- ✅ Transaction logging functional

### Magento Integration
- ✅ Orders created automatically
- ✅ Customer accounts synchronized
- ✅ Product inventory updated
- ✅ Payment status tracked

### System Performance
- ✅ Response times under 2 seconds
- ✅ 99.9% uptime maintained
- ✅ Error rates below 1%
- ✅ Customer satisfaction high

## 🌐 Fakelit.com Integration

### Branding
- ✅ "Powered by Fakelit.com" displayed
- ✅ Professional appearance maintained
- ✅ Consistent user experience
- ✅ Trust indicators present

### Domain Management
- ✅ Cloudways integration working
- ✅ Enom/Tucows domain registration
- ✅ DNS management functional
- ✅ SSL certificates provisioned

### Customer Support
- ✅ 24/7 support available
- ✅ AI chatbot assisting customers
- ✅ Professional response times
- ✅ Issue resolution tracking

---

🌐 **Powered by: Fakelit.com**
💳 **Payment Gateway: NMI + Magento**
🏢 **Domain Management: Cloudways + Enom/Tucows** 