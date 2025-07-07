# 🔒 Fakelit.com - Manual SSL Certificate Setup Guide

## 🚀 **IMMEDIATE ACTION REQUIRED**

Follow these exact steps to set up SSL certificates for Fakelit.com on Cloudways.

---

## 📋 **PRE-REQUISITES**

✅ Fakelit.com application deployed on Cloudways  
✅ Cloudways dashboard access  
✅ Domain fakelit.com pointing to Cloudways server  
✅ DNS records configured  

---

## 🔧 **STEP-BY-STEP SSL SETUP**

### **Step 1: Access Cloudways Dashboard**
1. Open browser: https://platform.cloudways.com/
2. Log in with your Cloudways credentials
3. Navigate to your Fakelit.com application

### **Step 2: Navigate to SSL Settings**
1. Click on your **Fakelit.com** application
2. Go to **"Application Settings"** tab
3. Click **"SSL Certificate"** sub-tab

### **Step 3: Add Primary Domain**
1. Click **"Add Domain"** button
2. Enter domain name: `fakelit.com`
3. Click **"Add Domain"** to confirm
4. Wait for domain to be added (usually instant)

### **Step 4: Enable SSL for Primary Domain**
1. Find `fakelit.com` in the domain list
2. Click **"Enable SSL"** button next to it
3. Choose **"Let's Encrypt"** (free option)
4. Click **"Enable SSL"** to confirm
5. Wait 5-10 minutes for certificate installation

### **Step 5: Add www Subdomain**
1. Click **"Add Domain"** button again
2. Enter domain name: `www.fakelit.com`
3. Click **"Add Domain"** to confirm

### **Step 6: Enable SSL for www Subdomain**
1. Find `www.fakelit.com` in the domain list
2. Click **"Enable SSL"** button next to it
3. Choose **"Let's Encrypt"** (free option)
4. Click **"Enable SSL"** to confirm
5. Wait 5-10 minutes for certificate installation

### **Step 7: Force HTTPS Redirect**
1. In SSL settings, find **"Force HTTPS"** option
2. Enable the **"Force HTTPS"** toggle
3. This will automatically redirect HTTP to HTTPS

### **Step 8: Verify SSL Installation**
1. Wait 10-15 minutes for all certificates to install
2. Test the following URLs:
   - https://fakelit.com
   - https://www.fakelit.com
   - http://fakelit.com (should redirect to HTTPS)
   - http://www.fakelit.com (should redirect to HTTPS)
3. Check for green padlock in browser address bar

---

## 🔍 **TROUBLESHOOTING**

### **Issue: Certificate Not Installing**
**Solution:**
- Check DNS records are correct
- Ensure domain resolves to Cloudways IP
- Wait 10-15 minutes and try again
- Check Cloudways application logs

### **Issue: DNS Resolution Problems**
**Solution:**
- Verify A record points to Cloudways server IP
- Add CNAME record: www → fakelit.com
- Wait for DNS propagation (up to 48 hours)
- Use DNS checker tools to verify

### **Issue: Mixed Content Warnings**
**Solution:**
- Update all internal links to use HTTPS
- Check for hardcoded HTTP URLs in code
- Update image and script sources to HTTPS

### **Issue: Certificate Expired**
**Solution:**
- Let's Encrypt auto-renews every 90 days
- Check Cloudways auto-renewal settings
- Manual renewal available in SSL settings

---

## ✅ **SSL BENEFITS**

🔒 Secure HTTPS connections  
🏆 Better SEO rankings  
💳 PCI compliance for payments  
🎯 Customer trust and security  
📈 Improved website performance  

---

## 📞 **SUPPORT INFORMATION**

- **Cloudways Support**: Available 24/7
- **Fakelit.com Support**: 702-664-0009
- **Email**: support@fakelit.com
- **Address**: 2300 W Sahara Ave Suite 800, Las Vegas, NV 89102

---

## 🎯 **POST-SETUP CHECKLIST**

1. ✅ SSL certificates installed
2. ✅ HTTPS working on both domains
3. ✅ HTTP redirecting to HTTPS
4. ✅ Green padlock visible in browser
5. ✅ No mixed content warnings
6. ✅ Payment gateways configured for HTTPS
7. ✅ Sitemap updated with HTTPS URLs
8. ✅ SSL monitoring set up

---

## 🔒 **SSL CONFIGURATION SUMMARY**

- **Domain**: fakelit.com
- **Subdomain**: www.fakelit.com
- **Certificate Type**: Let's Encrypt
- **Auto-renewal**: Enabled
- **Force HTTPS**: Enabled
- **Status**: Ready for setup

---

## 🚀 **READY TO PROCEED**

Follow the steps above to complete SSL setup.  
Run `node verify-ssl-installation.js` after setup to verify installation.

**🏢 Powered by Fakelit.com**

---

**Setup Date**: July 7, 2025  
**Status**: Ready for manual setup  
**Next Review**: After SSL installation 