# Manual Domain Setup Guide

## 🌐 Adding selectiveadvertisinggroup.com to Fakelit Server

Since the API authentication is having issues, here's the manual approach to add selectiveadvertisinggroup.com to your Cloudways Fakelit server.

### 📋 Prerequisites
- **Server Name**: Fakelit
- **Server IP**: 35.184.78.205
- **Cloudways Account**: marquibelbrooks@gmail.com
- **Domain**: selectiveadvertisinggroup.com

---

## 🚀 Step-by-Step Instructions

### Step 1: Access Cloudways Dashboard
1. Go to: https://platform.cloudways.com/
2. Log in with: `marquibelbrooks@gmail.com`
3. You should see your **"Fakelit"** server

### Step 2: Navigate to Your Server
1. **Click on the "Fakelit" server**
2. You'll see the server dashboard with applications

### Step 3: Select or Create Application
1. **If you have applications:**
   - Click on an existing application
   - Go to **Application Settings**

2. **If no applications exist:**
   - Click **"Add Application"**
   - Choose your preferred application type (PHP, Node.js, etc.)
   - Give it a name (e.g., "selective-advertising")
   - Click **"Add Application"**

### Step 4: Add Domain
1. **In Application Settings**, click on **"Domains"** tab
2. **Click "Add Domain"**
3. **Enter domain name**: `selectiveadvertisinggroup.com`
4. **Click "Add Domain"**
5. **Wait for the domain to be added** (usually takes a few seconds)

### Step 5: Verify Domain Addition
1. The domain should appear in the domains list
2. Status should show as "Active" or "Pending"
3. SSL certificate will be auto-provisioned

---

## 🌐 DNS Configuration

After adding the domain in Cloudways, you need to point your domain to the server:

### In Your Domain Registrar's DNS Settings:

**Add these A records:**
```
Type: A
Name: @ (or leave blank)
Value: 35.184.78.205
TTL: 3600 (or default)

Type: A
Name: www
Value: 35.184.78.205
TTL: 3600 (or default)
```

### Popular Domain Registrars:

**GoDaddy:**
1. Go to Domain Management
2. Click "DNS"
3. Add A records as shown above

**Namecheap:**
1. Go to Domain List
2. Click "Manage"
3. Go to "Advanced DNS"
4. Add A records

**Google Domains:**
1. Go to Domain Settings
2. Click "DNS"
3. Add A records

---

## ⏱️ Timeline

- **Domain Addition**: Immediate (in Cloudways)
- **DNS Propagation**: 15 minutes to 24 hours
- **SSL Certificate**: Auto-provisioned (usually within 1 hour)
- **Full Availability**: 24-48 hours

---

## 🧪 Testing

Once DNS is configured, test the domain:

1. **Check if domain resolves:**
   ```bash
   ping selectiveadvertisinggroup.com
   ```

2. **Check SSL certificate:**
   - Visit: https://selectiveadvertisinggroup.com
   - Should show secure connection

3. **Test subdomains:**
   - https://www.selectiveadvertisinggroup.com

---

## 🎨 Development Workflow

With selectiveadvertisinggroup.com added to your Fakelit server:

### App-Specific Branding
- Each application can have its own branding
- No consistent Fakelit branding across apps
- Each app maintains its unique identity

### Subdomain Structure
```
app1.selectiveadvertisinggroup.com  → App 1 with its own branding
app2.selectiveadvertisinggroup.com  → App 2 with its own branding
app3.selectiveadvertisinggroup.com  → App 3 with its own branding
```

### Deployment Process
1. **Development**: Use selectiveadvertisinggroup.com subdomains
2. **Testing**: Test on selectiveadvertisinggroup.com
3. **Production**: Deploy to individual domain names when ready

---

## 🔧 Troubleshooting

### Domain Not Working
1. **Check DNS settings** - Make sure A records point to 35.184.78.205
2. **Wait for propagation** - DNS changes can take up to 24 hours
3. **Check Cloudways** - Verify domain is added in application settings

### SSL Issues
1. **Wait for auto-provisioning** - SSL certificates are automatic
2. **Check domain status** - Make sure domain is active in Cloudways
3. **Contact support** - If SSL doesn't provision within 24 hours

### Application Issues
1. **Check application status** - Make sure it's running
2. **Check logs** - Look for errors in application logs
3. **Restart application** - If needed, restart the application

---

## 📞 Support

If you encounter issues:
1. **Cloudways Support**: Available 24/7 through dashboard
2. **Documentation**: Check Cloudways documentation
3. **Community**: Cloudways community forums

---

## ✅ Success Checklist

- [ ] Domain added to Cloudways application
- [ ] DNS A records configured
- [ ] Domain resolves to server IP
- [ ] SSL certificate active
- [ ] Website accessible via HTTPS
- [ ] Ready for application deployment

---

**🏢 All domains will be launched from this Fakelit server** 