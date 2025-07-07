# 🚀 Fakelit.com - Auto Scaling System Guide

## Overview

The Fakelit.com Auto Scaling System automatically monitors your server capacity and scales from 50 to 150 Magento websites when the threshold is reached. This ensures your hosting platform can handle increased demand without manual intervention.

**Powered by: Fakelit.com**

## 🎯 Key Features

- **Automatic Monitoring**: Continuously monitors server load every 5 minutes
- **Smart Scaling**: Triggers scaling when 45+ Magento applications are detected
- **Capacity Expansion**: Automatically scales from 50 to 150 Magento websites
- **Professional Branding**: Consistent "Powered by Fakelit.com" throughout
- **Comprehensive Logging**: Detailed logs and alerts for all scaling events
- **Graceful Handling**: Proper error handling and recovery mechanisms

## 📋 Prerequisites

1. **Cloudways Account**: Active Cloudways account with API access
2. **Server Access**: Cloudways server with existing applications
3. **API Credentials**: Cloudways email and API key
4. **Node.js**: Version 16 or higher installed

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install axios fs path
```

### 2. Configure Auto-Scaling

Edit the configuration file:

```bash
nano fakelit-auto-scaling-config.json
```

Update with your Cloudways credentials:

```json
{
  "cloudways": {
    "email": "your-email@fakelit.com",
    "apiKey": "your-cloudways-api-key",
    "serverId": "your-server-id"
  }
}
```

### 3. Start Auto-Scaling Monitor

```bash
node start-auto-scaling.js
```

## 📊 How It Works

### Monitoring Cycle

1. **Every 5 Minutes**: System checks current Magento application count
2. **Threshold Detection**: When 45+ Magento apps detected, scaling triggers
3. **Capacity Calculation**: Calculates required RAM, CPU, and storage for 150 sites
4. **Server Scaling**: Sends scaling request to Cloudways API
5. **Verification**: Waits for scaling completion and verifies success
6. **Logging**: Records all events and sends alerts

### Scaling Specifications

| Component | Current (50 sites) | Target (150 sites) | Increase |
|-----------|-------------------|-------------------|----------|
| **RAM** | 40GB | 91GB | +51GB |
| **CPU** | 18 vCPUs | 38 vCPUs | +20 vCPUs |
| **Storage** | 350GB | 850GB | +500GB |

### Calculation Formula

```javascript
// Base requirements + per-site requirements + safety margin
RAM = (150 × 0.5GB) + 16GB + 8GB = 91GB
CPU = (150 × 0.2 vCPU) + 8 vCPU + 4 vCPU = 38 vCPUs
Storage = (150 × 5GB) + 100GB + 50GB = 850GB
```

## 🛠️ Configuration Options

### Scaling Thresholds

```json
{
  "scaling": {
    "currentLimit": 50,        // Current capacity
    "targetLimit": 150,        // Target capacity after scaling
    "scalingThreshold": 45,    // Trigger scaling at this number
    "checkInterval": 300000    // Check every 5 minutes (ms)
  }
}
```

### Monitoring Settings

```json
{
  "monitoring": {
    "logFile": "fakelit-scaling-logs.json",
    "alertFile": "fakelit-scaling-alerts.json",
    "metricsFile": "fakelit-scaling-metrics.json"
  }
}
```

### Resource Requirements

```json
{
  "specifications": {
    "baseRequirements": {
      "ram": 16,    // Base RAM for system
      "cpu": 8,     // Base CPU cores
      "storage": 100 // Base storage (GB)
    },
    "perSiteRequirements": {
      "ram": 0.5,     // RAM per Magento site (GB)
      "cpu": 0.2,     // CPU per Magento site (vCPU)
      "storage": 5    // Storage per Magento site (GB)
    }
  }
}
```

## 📈 Usage Commands

### Start Auto-Scaling Monitor

```bash
node start-auto-scaling.js
```

### Check Status

```bash
node start-auto-scaling.js --status
```

### Stop Monitor

```bash
node start-auto-scaling.js --stop
```

### Manual Scaling Trigger

```bash
node auto-scaling-monitor.js --manual-scale
```

### View Logs

```bash
# View scaling logs
cat fakelit-scaling-logs.json

# View alerts
cat fakelit-scaling-alerts.json
```

## 📊 Monitoring Dashboard

### Real-Time Status

The system provides real-time status information:

```
📊 Fakelit.com Auto-Scaling Status
=================================
🔄 Currently Scaling: No
🎯 Current Limit: 50 Magento websites
🎯 Target Limit: 150 Magento websites
📅 Last Check: 2024-01-15T10:30:00.000Z
📚 Recent Events: 3
```

### Scaling Events Log

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "event": "AUTO_SCALING_TRIGGERED",
  "currentCount": 47,
  "currentLimit": 50,
  "targetLimit": 150,
  "status": "COMPLETED",
  "newSpecs": {
    "ram": 91,
    "cpu": 38,
    "storage": 850
  }
}
```

## 🔧 Advanced Configuration

### Custom Scaling Rules

You can modify the scaling behavior by editing the configuration:

```json
{
  "scaling": {
    "scalingThreshold": 40,    // Scale earlier
    "targetLimit": 200,        // Scale to 200 sites
    "checkInterval": 60000     // Check every minute
  }
}
```

### Resource Optimization

Adjust resource requirements based on your specific needs:

```json
{
  "specifications": {
    "perSiteRequirements": {
      "ram": 0.3,     // Less RAM per site
      "cpu": 0.15,    // Less CPU per site
      "storage": 3    // Less storage per site
    }
  }
}
```

## 🚨 Alert System

### Alert Types

1. **CAPACITY_CHECK_FAILED**: Monitoring check failed
2. **SCALING_SUCCESS**: Auto-scaling completed successfully
3. **SCALING_FAILED**: Auto-scaling failed
4. **THRESHOLD_REACHED**: Scaling threshold triggered

### Alert Format

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "type": "SCALING_SUCCESS",
  "data": {
    "message": "Server successfully scaled to 150 Magento websites",
    "newSpecs": {
      "ram": 91,
      "cpu": 38,
      "storage": 850
    }
  },
  "serverId": "your-server-id"
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. API Authentication Failed

**Error**: `401 Unauthorized`

**Solution**:
- Verify Cloudways API key is correct
- Check API key permissions
- Ensure email matches API key owner

#### 2. Server Not Found

**Error**: `404 Server not found`

**Solution**:
- Verify server ID in configuration
- Check server exists in Cloudways account
- Ensure API key has access to server

#### 3. Scaling Timeout

**Error**: `Scaling timeout - server may still be scaling`

**Solution**:
- Check Cloudways dashboard for scaling status
- Wait for manual completion
- Restart monitor after scaling completes

#### 4. Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Stop existing monitor
node start-auto-scaling.js --stop

# Start fresh
node start-auto-scaling.js
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=fakelit:* node start-auto-scaling.js
```

### Manual Recovery

If auto-scaling fails, manual recovery steps:

1. **Check Cloudways Dashboard**: Verify server status
2. **Review Logs**: Check `fakelit-scaling-logs.json`
3. **Manual Scaling**: Use Cloudways dashboard if needed
4. **Restart Monitor**: `node start-auto-scaling.js --stop && node start-auto-scaling.js`

## 📈 Performance Optimization

### Recommended Server Specs

For 150 Magento websites:

- **RAM**: 96GB (with 5GB buffer)
- **CPU**: 40 vCPUs (with 2 vCPU buffer)
- **Storage**: 900GB (with 50GB buffer)
- **Network**: 1Gbps minimum

### Caching Strategy

```json
{
  "optimization": {
    "caching": {
      "redis": true,
      "varnish": true,
      "cdn": true
    }
  }
}
```

### Database Optimization

```json
{
  "optimization": {
    "database": {
      "connectionPooling": true,
      "readReplicas": 2,
      "backupRetention": 7
    }
  }
}
```

## 🔒 Security Considerations

### API Key Security

- Store API keys in environment variables
- Use `.env` file (not committed to git)
- Rotate API keys regularly
- Limit API key permissions

### Access Control

- Monitor access to scaling logs
- Implement IP whitelisting
- Use HTTPS for all API calls
- Regular security audits

## 📞 Support

### Fakelit.com Support

For technical support with the auto-scaling system:

- **Email**: support@fakelit.com
- **Documentation**: docs.fakelit.com
- **Status Page**: status.fakelit.com

### Cloudways Support

For Cloudways-specific issues:

- **Support Portal**: support.cloudways.com
- **API Documentation**: api.cloudways.com
- **Community Forum**: community.cloudways.com

## 🎉 Success Metrics

### Auto-Scaling Success Rate

- **Target**: 99.5% success rate
- **Monitoring**: Continuous tracking
- **Alerts**: Immediate notification on failures

### Performance Improvements

- **Response Time**: <2 seconds for scaling trigger
- **Scaling Time**: <10 minutes for full scaling
- **Uptime**: 99.9% availability

### Cost Optimization

- **Resource Efficiency**: Optimal resource allocation
- **Scaling Accuracy**: Precise capacity calculation
- **Waste Reduction**: Minimal over-provisioning

---

**🏢 Powered by: Fakelit.com**

*Professional hosting, domain management, and auto-scaling solutions for your business.* 