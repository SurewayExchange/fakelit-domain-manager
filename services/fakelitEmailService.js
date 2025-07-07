const fs = require('fs').promises;
const path = require('path');
const SMSNotificationService = require('./smsNotificationService');

class FakelitEmailService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.emailDirectory = 'data/fakelit-emails';
        this.smsService = new SMSNotificationService();
        
        // Fakelit.com email configuration
        this.fakelitEmails = {
            'support@fakelit.com': {
                name: 'Fakelit Support',
                forwardTo: 'marquibelbrooks@gmail.com',
                signature: 'Fakelit.com Technical Support Team',
                department: 'Support'
            },
            'sales@fakelit.com': {
                name: 'Fakelit Sales',
                forwardTo: 'marquibelbrooks@gmail.com',
                signature: 'Fakelit.com Sales Team',
                department: 'Sales'
            },
            'm.brooks@fakelit.com': {
                name: 'M. Brooks',
                forwardTo: 'marquibelbrooks@gmail.com',
                signature: 'M. Brooks - Fakelit.com',
                department: 'Management'
            },
            'info@fakelit.com': {
                name: 'Fakelit Information',
                forwardTo: 'marquibelbrooks@gmail.com',
                signature: 'Fakelit.com Information Team',
                department: 'General'
            },
            'accounts@fakelit.com': {
                name: 'Fakelit Accounts',
                forwardTo: 'marquibelbrooks@gmail.com',
                signature: 'Fakelit.com Accounts Team',
                department: 'Accounts'
            },
            'v.helems@fakelit.com': {
                name: 'V. Helems',
                forwardTo: 'marquibelbrooks@gmail.com',
                signature: 'V. Helems - Fakelit.com',
                department: 'Management'
            },
            'billing@fakelit.com': {
                name: 'Fakelit Billing',
                forwardTo: 'marquibelbrooks@gmail.com',
                signature: 'Fakelit.com Billing Team',
                department: 'Billing'
            }
        };

        // SMTP configuration for Fakelit.com
        this.smtpConfig = {
            host: 'smtp.fakelit.com',
            port: 587,
            secure: false,
            auth: {
                user: 'noreply@fakelit.com',
                pass: process.env.FAKELIT_EMAIL_PASSWORD || 'secure-password'
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        // Initialize transporter only if credentials are valid
        this.transporter = null;
        this.initializeTransporter();
        
        this.initializeService();
    }

    initializeTransporter() {
        try {
            // Only initialize if we have valid SMTP credentials
            if (this.smtpConfig.auth.user && 
                this.smtpConfig.auth.pass && 
                this.smtpConfig.auth.pass !== 'secure-password') {
                
                const nodemailer = require('nodemailer');
                this.transporter = nodemailer.createTransporter(this.smtpConfig);
                console.log('✅ SMTP transporter initialized successfully');
            } else {
                console.log('⚠️ SMTP credentials not configured, email will run in mock mode');
            }
        } catch (error) {
            console.log('⚠️ Failed to initialize SMTP transporter, email will run in mock mode:', error.message);
        }
    }

    async initializeService() {
        try {
            await fs.mkdir(this.emailDirectory, { recursive: true });
            
            console.log('✅ Fakelit.com email service initialized successfully');
            console.log(`📧 Fakelit emails configured: ${Object.keys(this.fakelitEmails).length}`);
            console.log(`📱 SMS notifications: ${this.smsService.smsConfig.enabled ? 'Enabled' : 'Disabled'}`);
            console.log(`🏢 ${this.brandName} - Professional email management`);
        } catch (error) {
            console.error('❌ Failed to initialize Fakelit email service:', error);
        }
    }

    // Send email from Fakelit.com address
    async sendFakelitEmail(fromAddress, to, subject, content, attachments = []) {
        try {
            if (!this.fakelitEmails[fromAddress]) {
                throw new Error(`Invalid Fakelit.com email address: ${fromAddress}`);
            }

            const emailConfig = this.fakelitEmails[fromAddress];
            
            // Create email options
            const mailOptions = {
                from: `"${emailConfig.name}" <${fromAddress}>`,
                to: to,
                subject: subject,
                html: this.createEmailTemplate(content, emailConfig),
                attachments: attachments
            };

            // Send email if transporter is available, otherwise mock
            let result;
            if (this.transporter) {
                result = await this.transporter.sendMail(mailOptions);
                console.log(`✅ Fakelit email sent from ${fromAddress} to ${to}: ${result.messageId}`);
            } else {
                // Mock email sending
                result = {
                    messageId: 'mock-email-' + Date.now(),
                    status: 'mock-sent'
                };
                console.log(`📧 Mock email sent from ${fromAddress} to ${to}: ${result.messageId}`);
            }

            // Log email
            await this.logEmail({
                from: fromAddress,
                to: to,
                subject: subject,
                messageId: result.messageId,
                status: result.status || 'sent',
                timestamp: new Date().toISOString(),
                poweredBy: this.brandName
            });

            // Send SMS notification
            await this.smsService.notifyFakelitEmail(fromAddress, to, subject);

            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to send Fakelit email:', error);
            
            // Log failed email
            await this.logEmail({
                from: fromAddress,
                to: to,
                subject: subject,
                error: error.message,
                status: 'failed',
                timestamp: new Date().toISOString(),
                poweredBy: this.brandName
            });
            
            return { success: false, error: error.message };
        }
    }

    // Process incoming email (forwarding logic)
    async processIncomingEmail(from, to, subject, content, isFakelitEmail = false) {
        try {
            if (isFakelitEmail) {
                // Fakelit.com emails forward to marquibelbrooks@gmail.com
                const forwardResult = await this.forwardFakelitEmail(from, to, subject, content);
                
                // Send SMS notification
                await this.smsService.notifyEmailReceived(to, from, subject);
                
                return forwardResult;
            } else {
                // Client emails forward to their specified address
                const forwardResult = await this.forwardClientEmail(from, to, subject, content);
                
                return forwardResult;
            }
        } catch (error) {
            console.error('❌ Failed to process incoming email:', error);
            return { success: false, error: error.message };
        }
    }

    // Forward Fakelit.com emails to marquibelbrooks@gmail.com
    async forwardFakelitEmail(from, to, subject, content) {
        try {
            const forwardOptions = {
                from: `"Fakelit.com Email Forward" <noreply@fakelit.com>`,
                to: 'marquibelbrooks@gmail.com',
                subject: `[FORWARDED] ${subject} - From: ${from} To: ${to}`,
                html: this.createForwardTemplate(from, to, subject, content, true)
            };

            let result;
            if (this.transporter) {
                result = await this.transporter.sendMail(forwardOptions);
                console.log(`✅ Fakelit email forwarded from ${from} to marquibelbrooks@gmail.com`);
            } else {
                // Mock forwarding
                result = {
                    messageId: 'mock-forward-' + Date.now(),
                    status: 'mock-forwarded'
                };
                console.log(`📧 Mock email forwarded from ${from} to marquibelbrooks@gmail.com`);
            }

            // Log forwarding
            await this.logEmail({
                from: from,
                to: to,
                forwardedTo: 'marquibelbrooks@gmail.com',
                subject: subject,
                messageId: result.messageId,
                status: result.status || 'forwarded',
                timestamp: new Date().toISOString(),
                poweredBy: this.brandName
            });

            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to forward Fakelit email:', error);
            return { success: false, error: error.message };
        }
    }

    // Forward client emails to their specified address
    async forwardClientEmail(from, to, subject, content) {
        try {
            // Get client's forwarding address from their email configuration
            const clientConfig = await this.getClientEmailConfig(to);
            
            if (!clientConfig || !clientConfig.forwardTo) {
                throw new Error(`No forwarding address configured for ${to}`);
            }

            const forwardOptions = {
                from: `"${this.brandName} Email Forward" <noreply@fakelit.com>`,
                to: clientConfig.forwardTo,
                subject: `[FORWARDED] ${subject} - From: ${from} To: ${to}`,
                html: this.createForwardTemplate(from, to, subject, content, false)
            };

            let result;
            if (this.transporter) {
                result = await this.transporter.sendMail(forwardOptions);
                console.log(`✅ Client email forwarded from ${from} to ${clientConfig.forwardTo}`);
            } else {
                // Mock forwarding
                result = {
                    messageId: 'mock-client-forward-' + Date.now(),
                    status: 'mock-forwarded'
                };
                console.log(`📧 Mock client email forwarded from ${from} to ${clientConfig.forwardTo}`);
            }

            // Log forwarding
            await this.logEmail({
                from: from,
                to: to,
                forwardedTo: clientConfig.forwardTo,
                subject: subject,
                messageId: result.messageId,
                status: result.status || 'forwarded',
                timestamp: new Date().toISOString(),
                poweredBy: this.brandName
            });

            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to forward client email:', error);
            return { success: false, error: error.message };
        }
    }

    // Get client email configuration
    async getClientEmailConfig(emailAddress) {
        try {
            const configFile = path.join(this.emailDirectory, 'client-email-config.json');
            const configData = await fs.readFile(configFile, 'utf8');
            const configs = JSON.parse(configData);
            
            return configs[emailAddress] || null;
        } catch (error) {
            console.error('❌ Failed to get client email config:', error);
            return null;
        }
    }

    // Create email template
    createEmailTemplate(content, emailConfig) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fakelit.com Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d; }
        .signature { border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${this.brandName}</h1>
        <p>Professional Hosting & Domain Services</p>
    </div>
    
    <div class="content">
        ${content}
        
        <div class="signature">
            <p><strong>${emailConfig.signature}</strong></p>
            <p>📞 Phone: 702-664-0009</p>
            <p>🏢 Address: 2300 W Sahara Ave Suite 800, Las Vegas, NV 89102</p>
            <p>🌐 Website: https://fakelit.com</p>
        </div>
    </div>
    
    <div class="footer">
        <p>Powered by ${this.brandName} - Professional hosting and domain management services</p>
    </div>
</body>
</html>
        `;
    }

    // Create forward template
    createForwardTemplate(from, to, subject, content, isFakelitEmail) {
        const forwardType = isFakelitEmail ? 'Fakelit.com Email' : 'Client Email';
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Forward - ${this.brandName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #e74c3c; color: white; padding: 15px; text-align: center; }
        .forward-info { background: #f8f9fa; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0; }
        .content { padding: 20px; border: 1px solid #ddd; margin: 20px 0; }
        .footer { background: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="header">
        <h2>�� Email Forward - ${forwardType}</h2>
        <p>${this.brandName} Email Management System</p>
    </div>
    
    <div class="forward-info">
        <h3>Forward Information:</h3>
        <p><strong>From:</strong> ${from}</p>
        <p><strong>To:</strong> ${to}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Forwarded:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="content">
        <h3>Original Email Content:</h3>
        ${content}
    </div>
    
    <div class="footer">
        <p>This email was automatically forwarded by ${this.brandName} email management system</p>
        <p>📞 Support: 702-664-0009 | 📧 support@fakelit.com</p>
    </div>
</body>
</html>
        `;
    }

    // Log email
    async logEmail(emailData) {
        try {
            const logFile = path.join(this.emailDirectory, `email-log-${new Date().toISOString().split('T')[0]}.json`);
            
            let logs = [];
            try {
                const existingLogs = await fs.readFile(logFile, 'utf8');
                logs = JSON.parse(existingLogs);
            } catch (error) {
                // File doesn't exist or is empty, start with empty array
            }
            
            logs.push(emailData);
            
            await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('❌ Failed to log email:', error);
        }
    }

    // Get email statistics
    async getEmailStats() {
        try {
            const files = await fs.readdir(this.emailDirectory);
            const stats = {
                totalEmails: 0,
                sentEmails: 0,
                forwardedEmails: 0,
                failedEmails: 0,
                mockEmails: 0,
                todayEmails: 0,
                fakelitEmails: Object.keys(this.fakelitEmails),
                enabled: true,
                poweredBy: this.brandName
            };

            for (const file of files) {
                if (file.startsWith('email-log-') && file.endsWith('.json')) {
                    const logData = await fs.readFile(path.join(this.emailDirectory, file), 'utf8');
                    const logs = JSON.parse(logData);
                    
                    stats.totalEmails += logs.length;
                    stats.sentEmails += logs.filter(log => log.status === 'sent').length;
                    stats.forwardedEmails += logs.filter(log => log.status === 'forwarded').length;
                    stats.failedEmails += logs.filter(log => log.status === 'failed').length;
                    stats.mockEmails += logs.filter(log => log.status === 'mock-sent' || log.status === 'mock-forwarded').length;
                    
                    // Count today's emails
                    const today = new Date().toISOString().split('T')[0];
                    if (file.includes(today)) {
                        stats.todayEmails = logs.length;
                    }
                }
            }

            return stats;
        } catch (error) {
            console.error('❌ Failed to get email stats:', error);
            return null;
        }
    }

    // Get Fakelit email addresses
    getFakelitEmails() {
        return this.fakelitEmails;
    }

    // Add client email configuration
    async addClientEmailConfig(emailAddress, config) {
        try {
            const configFile = path.join(this.emailDirectory, 'client-email-config.json');
            
            let configs = {};
            try {
                const existingConfig = await fs.readFile(configFile, 'utf8');
                configs = JSON.parse(existingConfig);
            } catch (error) {
                // File doesn't exist, start with empty object
            }
            
            configs[emailAddress] = {
                ...config,
                createdAt: new Date().toISOString(),
                poweredBy: this.brandName
            };
            
            await fs.writeFile(configFile, JSON.stringify(configs, null, 2));
            
            console.log(`✅ Client email config added for ${emailAddress}`);
            return { success: true, config: configs[emailAddress] };
        } catch (error) {
            console.error('❌ Failed to add client email config:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = FakelitEmailService; 