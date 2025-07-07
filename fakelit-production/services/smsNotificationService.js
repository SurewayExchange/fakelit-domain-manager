const fs = require('fs').promises;
const path = require('path');

class SMSNotificationService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.smsDirectory = 'data/sms-notifications';
        
        // SMS configuration
        this.smsConfig = {
            accountSid: process.env.TWILIO_ACCOUNT_SID || 'your_twilio_account_sid',
            authToken: process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token',
            fromNumber: process.env.TWILIO_FROM_NUMBER || '+15134419772', // Twilio verified number
            defaultToNumber: '513-441-9772', // Updated forwarding number
            enabled: true
        };
        
        // Initialize Twilio client only if credentials are valid
        this.twilioClient = null;
        this.initializeTwilioClient();
        
        // Notification templates
        this.notificationTemplates = {
            emailReceived: {
                template: "📧 New email received at {email} from {sender}. Subject: {subject}",
                priority: 'high'
            },
            domainPurchase: {
                template: "🌐 Domain {domain} purchased successfully! Email access details available.",
                priority: 'high'
            },
            serverAlert: {
                template: "⚠️ Server alert: {message} for {server}. Action required.",
                priority: 'critical'
            },
            billingAlert: {
                template: "💰 Billing alert: {message} for {account}. Amount: ${amount}",
                priority: 'high'
            },
            supportTicket: {
                template: "🆘 New support ticket #{ticketId} from {customer}. Priority: {priority}",
                priority: 'medium'
            },
            ticketUpdate: {
                template: "📝 Ticket #{ticketId} updated: {status} - {message}",
                priority: 'medium'
            },
            ticketResolved: {
                template: "✅ Ticket #{ticketId} resolved by {agent}. Customer: {customer}",
                priority: 'medium'
            },
            ticketEscalated: {
                template: "🚨 Ticket #{ticketId} escalated to {level}. Customer: {customer}",
                priority: 'high'
            },
            emailSetup: {
                template: "📧 Email setup completed for {domain}. Access: {webmailUrl}",
                priority: 'medium'
            },
            securityAlert: {
                template: "🔒 Security alert: {message} for {account}. Immediate attention required.",
                priority: 'critical'
            },
            fakelitEmail: {
                template: "📧 Fakelit.com email: {from} to {to}. Subject: {subject}",
                priority: 'medium'
            }
        };
        
        this.initializeService();
    }

    initializeTwilioClient() {
        try {
            // Only initialize Twilio if we have valid credentials
            if (this.smsConfig.accountSid && 
                this.smsConfig.accountSid.startsWith('AC') && 
                this.smsConfig.authToken && 
                this.smsConfig.authToken.length > 10) {
                
                const twilio = require('twilio');
                this.twilioClient = twilio(this.smsConfig.accountSid, this.smsConfig.authToken);
                console.log('✅ Twilio client initialized successfully');
            } else {
                console.log('⚠️ Twilio credentials not configured, SMS will run in mock mode');
                this.smsConfig.enabled = false;
            }
        } catch (error) {
            console.log('⚠️ Failed to initialize Twilio client, SMS will run in mock mode:', error.message);
            this.smsConfig.enabled = false;
        }
    }

    async initializeService() {
        try {
            await fs.mkdir(this.smsDirectory, { recursive: true });
            
            console.log('✅ SMS notification service initialized successfully');
            console.log(`📱 SMS notifications enabled: ${this.smsConfig.enabled}`);
            console.log(`📞 From number: ${this.smsConfig.fromNumber}`);
            console.log(`📱 Forwarding to: ${this.smsConfig.defaultToNumber}`);
            console.log(`🏢 ${this.brandName} - Professional SMS notifications`);
        } catch (error) {
            console.error('❌ Failed to initialize SMS notification service:', error);
        }
    }

    // Send SMS notification
    async sendSMS(toNumber, message, template = null, data = {}) {
        try {
            if (!this.smsConfig.enabled) {
                console.log('📱 SMS notifications disabled, logging notification in mock mode');
                
                // Log mock SMS notification
                await this.logSMSNotification({
                    to: toNumber,
                    message: message || this.formatTemplate(this.notificationTemplates[template]?.template || '', data),
                    template: template,
                    data: data,
                    sid: 'mock-sms-' + Date.now(),
                    status: 'mock-sent',
                    timestamp: new Date().toISOString(),
                    poweredBy: this.brandName
                });
                
                return { success: true, sid: 'mock-sms-' + Date.now(), status: 'mock-sent' };
            }

            // Format message if template provided
            let formattedMessage = message;
            if (template && this.notificationTemplates[template]) {
                formattedMessage = this.formatTemplate(this.notificationTemplates[template].template, data);
            }

            // Add Fakelit.com branding
            formattedMessage += `\n\nPowered by ${this.brandName}`;

            // Send SMS via Twilio
            const smsResult = await this.twilioClient.messages.create({
                body: formattedMessage,
                from: this.smsConfig.fromNumber,
                to: toNumber
            });

            // Log SMS notification
            await this.logSMSNotification({
                to: toNumber,
                message: formattedMessage,
                template: template,
                data: data,
                sid: smsResult.sid,
                status: smsResult.status,
                timestamp: new Date().toISOString(),
                poweredBy: this.brandName
            });

            console.log(`✅ SMS sent successfully to ${toNumber}: ${smsResult.sid}`);
            return { success: true, sid: smsResult.sid, status: smsResult.status };
        } catch (error) {
            console.error('❌ Failed to send SMS:', error);
            
            // Log failed SMS
            await this.logSMSNotification({
                to: toNumber,
                message: message,
                template: template,
                data: data,
                error: error.message,
                status: 'failed',
                timestamp: new Date().toISOString(),
                poweredBy: this.brandName
            });
            
            return { success: false, error: error.message };
        }
    }

    // Format template with data
    formatTemplate(template, data) {
        let formatted = template;
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            formatted = formatted.replace(new RegExp(placeholder, 'g'), data[key] || '');
        });
        return formatted;
    }

    // Email system SMS notifications
    async notifyEmailReceived(emailAddress, sender, subject) {
        const data = {
            email: emailAddress,
            sender: sender,
            subject: subject
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'emailReceived',
            data
        );
    }

    async notifyFakelitEmail(from, to, subject) {
        const data = {
            from: from,
            to: to,
            subject: subject
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'fakelitEmail',
            data
        );
    }

    async notifyDomainPurchase(domainName) {
        const data = {
            domain: domainName
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'domainPurchase',
            data
        );
    }

    async notifyEmailSetup(domainName, webmailUrl) {
        const data = {
            domain: domainName,
            webmailUrl: webmailUrl
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'emailSetup',
            data
        );
    }

    // Ticketing system SMS notifications
    async notifyNewTicket(ticketId, customer, priority) {
        const data = {
            ticketId: ticketId,
            customer: customer,
            priority: priority
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'supportTicket',
            data
        );
    }

    async notifyTicketUpdate(ticketId, status, message) {
        const data = {
            ticketId: ticketId,
            status: status,
            message: message
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'ticketUpdate',
            data
        );
    }

    async notifyTicketResolved(ticketId, agent, customer) {
        const data = {
            ticketId: ticketId,
            agent: agent,
            customer: customer
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'ticketResolved',
            data
        );
    }

    async notifyTicketEscalated(ticketId, level, customer) {
        const data = {
            ticketId: ticketId,
            level: level,
            customer: customer
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'ticketEscalated',
            data
        );
    }

    // Server and system notifications
    async notifyServerAlert(message, server) {
        const data = {
            message: message,
            server: server
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'serverAlert',
            data
        );
    }

    async notifyBillingAlert(message, account, amount) {
        const data = {
            message: message,
            account: account,
            amount: amount
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'billingAlert',
            data
        );
    }

    async notifySecurityAlert(message, account) {
        const data = {
            message: message,
            account: account
        };
        
        return await this.sendSMS(
            this.smsConfig.defaultToNumber,
            null,
            'securityAlert',
            data
        );
    }

    // Log SMS notification
    async logSMSNotification(notificationData) {
        try {
            const logFile = path.join(this.smsDirectory, `sms-log-${new Date().toISOString().split('T')[0]}.json`);
            
            let logs = [];
            try {
                const existingLogs = await fs.readFile(logFile, 'utf8');
                logs = JSON.parse(existingLogs);
            } catch (error) {
                // File doesn't exist or is empty, start with empty array
            }
            
            logs.push(notificationData);
            
            await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('❌ Failed to log SMS notification:', error);
        }
    }

    // Get SMS statistics
    async getSMSStats() {
        try {
            const files = await fs.readdir(this.smsDirectory);
            const stats = {
                totalSMS: 0,
                successfulSMS: 0,
                failedSMS: 0,
                mockSMS: 0,
                todaySMS: 0,
                templates: Object.keys(this.notificationTemplates),
                enabled: this.smsConfig.enabled,
                fromNumber: this.smsConfig.fromNumber,
                toNumber: this.smsConfig.defaultToNumber,
                poweredBy: this.brandName
            };

            for (const file of files) {
                if (file.startsWith('sms-log-') && file.endsWith('.json')) {
                    const logData = await fs.readFile(path.join(this.smsDirectory, file), 'utf8');
                    const logs = JSON.parse(logData);
                    
                    stats.totalSMS += logs.length;
                    stats.successfulSMS += logs.filter(log => log.status === 'delivered').length;
                    stats.failedSMS += logs.filter(log => log.status === 'failed').length;
                    stats.mockSMS += logs.filter(log => log.status === 'mock-sent').length;
                    
                    // Count today's SMS
                    const today = new Date().toISOString().split('T')[0];
                    if (file.includes(today)) {
                        stats.todaySMS = logs.length;
                    }
                }
            }

            return stats;
        } catch (error) {
            console.error('❌ Failed to get SMS stats:', error);
            return null;
        }
    }

    // Update SMS configuration
    async updateSMSConfig(newConfig) {
        try {
            this.smsConfig = { ...this.smsConfig, ...newConfig };
            
            // Reinitialize Twilio client if credentials changed
            if (newConfig.accountSid || newConfig.authToken) {
                this.initializeTwilioClient();
            }
            
            // Save configuration
            await fs.writeFile(
                path.join(this.smsDirectory, 'sms-config.json'),
                JSON.stringify(this.smsConfig, null, 2)
            );
            
            console.log('✅ SMS configuration updated successfully');
            return { success: true, config: this.smsConfig };
        } catch (error) {
            console.error('❌ Failed to update SMS configuration:', error);
            return { success: false, error: error.message };
        }
    }

    // Enable/disable SMS notifications
    async toggleSMSNotifications(enabled) {
        return await this.updateSMSConfig({ enabled: enabled });
    }

    // Get notification templates
    getNotificationTemplates() {
        return this.notificationTemplates;
    }

    // Add custom notification template
    async addNotificationTemplate(name, template, priority = 'medium') {
        try {
            this.notificationTemplates[name] = {
                template: template,
                priority: priority
            };
            
            // Save templates
            await fs.writeFile(
                path.join(this.smsDirectory, 'notification-templates.json'),
                JSON.stringify(this.notificationTemplates, null, 2)
            );
            
            console.log(`✅ Notification template '${name}' added successfully`);
            return { success: true, template: this.notificationTemplates[name] };
        } catch (error) {
            console.error('❌ Failed to add notification template:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = SMSNotificationService; 