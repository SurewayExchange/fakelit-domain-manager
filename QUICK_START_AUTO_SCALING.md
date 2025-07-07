# 🚀 Fakelit.com Auto-Scaling - Quick Start Guide

## Overview

This guide will help you set up the Fakelit.com auto-scaling system that automatically scales your server from 50 to 150 Magento websites when the threshold is reached.

**🏢 Powered by: Fakelit.com**

## 📋 Prerequisites

Before starting, make sure you have:

1. **Cloudways Account**: Active account with API access
2. **Cloudways API Key**: Generated from your Cloudways dashboard
3. **Server ID**: Your Cloudways server identifier
4. **Node.js**: Version 16 or higher installed

## 🔧 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm install axios fs path
```

### Step 2: Run the Setup Wizard

```bash
node setup-auto-scaling.js
```

The setup wizard will guide you through:

1. **Cloudways Credentials**:
   - Email address
   - API key
   - Server ID

2. **Scaling Configuration**:
   - Current limit (default: 50)
   - Target limit (default: 150)
   - Scaling threshold (default: 45)

3. **Monitoring Settings**:
   - Check interval (default: 5 minutes)

### Step 3: Test Configuration

The setup wizard will automatically test:
- ✅ Cloudways API connection
- ✅ Server access
- ✅ Application listing
- ✅ Current Magento count

### Step 4: Start Auto-Scaling Monitor

```bash
npm run scaling:start
```

## 📊 How It Works

### Monitoring Cycle
- **Every 5 minutes**: Checks current Magento application count
- **At 45+ apps**: Triggers automatic scaling
- **Scales to 150**: Increases server capacity
- **Verifies success**: Confirms scaling completion

### Scaling Specifications

| Resource | Current (50 sites) | Target (150 sites) | Increase |
|----------|-------------------|-------------------|----------|
| **RAM** | 40GB | 91GB | +51GB |
| **CPU** | 18 vCPUs | 38 vCPUs | +20 vCPUs |
| **Storage** | 350GB | 850GB | +500GB |

## 🛠️ Available Commands

```bash
# Setup and configuration
npm run scaling:setup          # Run setup wizard
npm run scaling:start          # Start auto-scaling monitor
npm run scaling:stop           # Stop auto-scaling monitor
npm run scaling:status         # Check current status
npm run scaling:manual         # Trigger manual scaling
npm run scaling:logs           # View scaling logs
npm run scaling:alerts         # View scaling alerts
```

## 📈 Status Monitoring

### Check Current Status
```bash
npm run scaling:status
```

Example output:
```
📊 Fakelit.com Auto-Scaling Status
=================================
🔄 Currently Scaling: No
🎯 Current Limit: 50 Magento websites
🎯 Target Limit: 150 Magento websites
📅 Last Check: 2024-01-15T10:30:00.000Z
📚 Recent Events: 3
```

### View Logs
```bash
npm run scaling:logs
```

### View Alerts
```bash
npm run scaling:alerts
```

## 🔍 Troubleshooting

### Common Issues

#### 1. API Authentication Failed
**Error**: `401 Unauthorized`

**Solution**:
- Verify API key in Cloudways dashboard
- Check API key permissions
- Ensure email matches API key owner

#### 2. Server Not Found
**Error**: `404 Server not found`

**Solution**:
- Verify server ID in Cloudways dashboard
- Check server exists in your account
- Ensure API key has access to server

#### 3. Port Already in Use
**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
npm run scaling:stop
npm run scaling:start
```

### Getting Help

If you encounter issues:

1. **Check logs**: `npm run scaling:logs`
2. **Check alerts**: `npm run scaling:alerts`
3. **Restart monitor**: `npm run scaling:stop && npm run scaling:start`
4. **Contact support**: support@fakelit.com

## 🎯 Configuration Files

### Main Configuration
- **File**: `fakelit-auto-scaling-config.json`
- **Purpose**: All scaling settings and credentials
- **Backup**: Keep a secure copy of this file

### Log Files
- **Scaling Logs**: `fakelit-scaling-logs.json`
- **Alerts**: `fakelit-scaling-alerts.json`
- **Metrics**: `fakelit-scaling-metrics.json`

## 🔒 Security Notes

### API Key Security
- Store API keys securely
- Don't commit credentials to git
- Rotate API keys regularly
- Use environment variables when possible

### Access Control
- Monitor access to scaling logs
- Implement IP whitelisting if needed
- Regular security audits

## 📞 Support

### Fakelit.com Support
- **Email**: support@fakelit.com
- **Documentation**: docs.fakelit.com
- **Status**: status.fakelit.com

### Cloudways Support
- **Support Portal**: support.cloudways.com
- **API Docs**: api.cloudways.com

## 🎉 Success Indicators

### Auto-Scaling Success
- ✅ Monitor starts without errors
- ✅ API connection successful
- ✅ Application listing works
- ✅ Scaling triggers at threshold
- ✅ Server scales successfully

### Performance Metrics
- **Response Time**: <2 seconds for scaling trigger
- **Scaling Time**: <10 minutes for full scaling
- **Uptime**: 99.9% availability
- **Success Rate**: 99.5% scaling success

---

**🏢 Powered by: Fakelit.com**

*Professional hosting, domain management, and auto-scaling solutions for your business.* 