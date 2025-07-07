# 🌐 Fakelit.com Domain Management System

A comprehensive domain and application management system that integrates **Enom** and **Cloudways** to provide a unified view of all your domains and applications. All applications are powered by **Fakelit.com**.

## 🚀 Features

- **Multi-Platform Integration**: Manage both Enom domains and Cloudways applications
- **Unified Inventory**: Single view of all domains and applications
- **Domain Creation**: Create new domains on either platform
- **Automated Reports**: Generate comprehensive reports with recommendations
- **Expiry Monitoring**: Track domain expiration dates
- **SSL Status**: Monitor SSL certificate status
- **Application Health**: Check application status and performance
- **Fakelit.com Branding**: All applications display "Powered by Fakelit.com"

## 📋 Prerequisites

### Cloudways Setup
1. Log into [Cloudways Platform](https://platform.cloudways.com)
2. Go to **Account** → **API Keys**
3. Generate a new API key
4. Note your Cloudways email address

### Enom Setup
1. Log into your [Enom Account](https://www.enom.com)
2. Get your username and password
3. Ensure account has API access

## 🔧 Configuration

Add the following to your `.env` file:

```bash
# Cloudways Configuration
CLOUDWAYS_API_KEY=your_cloudways_api_key_here
CLOUDWAYS_EMAIL=your_cloudways_email_here

# Enom Configuration
ENOM_USERNAME=your_enom_username_here
ENOM_PASSWORD=your_enom_password_here
```

## 📖 Usage

### 1. List All Applications and Domains

```bash
node list-all-applications.js
```

This will:
- Fetch all Cloudways applications and servers
- Fetch all Enom domains
- Generate a comprehensive report
- Create `DomainCreate_File.json`
- Display formatted output with recommendations
- Show "Powered by Fakelit.com" branding

### 2. Create New Domain

```bash
# Create on Cloudways
node create-domain.js myapp.com Cloudways

# Create on Enom
node create-domain.js mydomain.com Enom
```

### 3. Check Specific Platform

```bash
# Check Cloudways only
node check-cloudways.js

# Check Enom only
node check-enom.js
```

## 📊 Generated Files

### DomainCreate_File.json

The system generates a comprehensive JSON file containing:

```json
{
  "timestamp": "2025-01-05T12:00:00.000Z",
  "brandName": "Fakelit.com",
  "totalApplications": 5,
  "totalDomains": 12,
  "cloudways": {
    "applications": [...],
    "count": 5
  },
  "enom": {
    "domains": [...],
    "count": 12
  },
  "summary": {
    "totalServers": 3,
    "activeApplications": 4,
    "expiringDomains": 2
  },
  "recommendations": [...]
}
```

## 🔍 Data Structure

### Cloudways Applications
- Server information (ID, name, IP)
- Application details (name, type, version)
- Domain associations
- SSL status
- Creation and update dates
- Powered by: Fakelit.com

### Enom Domains
- Domain name
- Expiration date
- Auto-renewal status
- Domain status
- Registrar information
- Powered by: Fakelit.com

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify API keys are correct
   - Check account permissions
   - Ensure account is active

2. **No Data Found**
   - Check if you have applications/domains
   - Verify credentials are working
   - Check network connectivity

3. **Permission Errors**
   - Ensure API keys have proper scope
   - Check account status
   - Verify username/password

### Error Messages

- `Cloudways API credentials not configured`: Add CLOUDWAYS_API_KEY and CLOUDWAYS_EMAIL to .env
- `Enom credentials not found`: Add ENOM_USERNAME and ENOM_PASSWORD to .env
- `No applications found`: No Cloudways applications exist
- `No domains found`: No Enom domains exist

## 📈 Monitoring and Alerts

The system provides:

- **Expiry Alerts**: Domains expiring within 30 days
- **Status Monitoring**: Application and domain health
- **SSL Status**: Certificate expiration tracking
- **Auto-Renewal**: Domain renewal status
- **Fakelit.com Branding**: Consistent branding across all applications

## 🔄 Automation

### Scheduled Reports

You can set up automated reports using cron:

```bash
# Daily report at 9 AM
0 9 * * * cd /path/to/fakelit && node list-all-applications.js

# Weekly comprehensive report
0 9 * * 1 cd /path/to/fakelit && node list-all-applications.js
```

### Integration

The system can be integrated with:
- Email notifications
- Slack alerts
- Monitoring dashboards
- CI/CD pipelines

## 📞 Support

For issues with:
- **Cloudways**: Contact Cloudways support
- **Enom**: Contact Enom support
- **System**: Check logs and configuration
- **Fakelit.com**: Contact Fakelit.com support

## 🔐 Security

- API keys are stored in environment variables
- No credentials are logged
- HTTPS connections for all API calls
- Secure credential validation

## 📝 Logs

The system provides detailed logging:
- API call results
- Error messages
- Success confirmations
- Recommendations
- Fakelit.com branding confirmations

Check console output for detailed information about operations.

## 🏢 About Fakelit.com

Fakelit.com is a comprehensive domain and application management platform that provides:

- **Unified Management**: Single interface for multiple platforms
- **Automated Operations**: Streamlined domain and application management
- **Professional Branding**: Consistent "Powered by Fakelit.com" across all applications
- **24/7 Support**: Round-the-clock technical support
- **Scalable Solutions**: Enterprise-grade domain management

All applications managed through this system proudly display "Powered by Fakelit.com" branding. 