const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.emailDirectory = 'data/fakelit-emails';
        this.maxEmailAddresses = 15;
        
        // Fakelit.com email configuration
        this.fakelitEmails = [
            'support@fakelit.com',
            'sales@fakelit.com',
            'm.brooks@fakelit.com',
            'info@fakelit.com',
            'accounts@fakelit.com',
            'v.helems@fakelit.com',
            'billing@fakelit.com'
        ];
        
        this.forwardingEmail = 'marquibelbrooks@gmail.com';
        
        // Company information
        this.companyInfo = {
            name: 'Fakelit.com',
            address: '2300 W Sahara Ave Suite 800, Las Vegas, NV 89102',
            phone: '702-664-0009',
            website: 'https://fakelit.com',
            supportEmail: 'support@fakelit.com',
            salesEmail: 'sales@fakelit.com',
            accountsEmail: 'accounts@fakelit.com',
            billingEmail: 'billing@fakelit.com'
        };
        
        this.initializeService();
    }

    async initializeService() {
        try {
            // Create email directory
            await fs.mkdir(this.emailDirectory, { recursive: true });
            
            // Initialize Fakelit.com email addresses
            await this.initializeFakelitEmails();
            
            console.log('✅ Fakelit.com email service initialized successfully');
            console.log(`📧 ${this.fakelitEmails.length} email addresses configured`);
            console.log(`🔄 All emails forwarded to: ${this.forwardingEmail}`);
            console.log(`🏢 ${this.companyInfo.name} - ${this.companyInfo.address}`);
            console.log(`📞 ${this.companyInfo.phone} | 📧 ${this.companyInfo.supportEmail}`);
        } catch (error) {
            console.error('❌ Failed to initialize Fakelit.com email service:', error);
        }
    }

    async initializeFakelitEmails() {
        try {
            const emailConfig = {
                brandName: this.brandName,
                maxEmailAddresses: this.maxEmailAddresses,
                forwardingEmail: this.forwardingEmail,
                companyInfo: this.companyInfo,
                emailAddresses: this.fakelitEmails.map(email => ({
                    address: email,
                    forwarding: this.forwardingEmail,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    poweredBy: this.brandName
                })),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            // Save Fakelit.com email configuration
            await fs.writeFile(
                path.join(this.emailDirectory, 'fakelit-email-config.json'),
                JSON.stringify(emailConfig, null, 2)
            );

            console.log('✅ Fakelit.com email addresses initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Fakelit.com emails:', error);
        }
    }

    // Get all Fakelit.com email addresses
    async getFakelitEmails() {
        try {
            const configPath = path.join(this.emailDirectory, 'fakelit-email-config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);
            
            return config.emailAddresses;
        } catch (error) {
            console.error('❌ Failed to get Fakelit.com emails:', error);
            return this.fakelitEmails.map(email => ({
                address: email,
                forwarding: this.forwardingEmail,
                status: 'active',
                poweredBy: this.brandName
            }));
        }
    }

    // Get company information
    getCompanyInfo() {
        return this.companyInfo;
    }

    // Get forwarding email
    getForwardingEmail() {
        return this.forwardingEmail;
    }

    // Get maximum email addresses
    getMaxEmailAddresses() {
        return this.maxEmailAddresses;
    }

    // Check if email address is valid Fakelit.com address
    isValidFakelitEmail(email) {
        return this.fakelitEmails.includes(email.toLowerCase());
    }

    // Create new email address (up to max limit)
    async createEmailAddress(emailAddress) {
        try {
            const configPath = path.join(this.emailDirectory, 'fakelit-email-config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);

            // Check if we've reached the maximum
            if (config.emailAddresses.length >= this.maxEmailAddresses) {
                throw new Error(`Maximum email addresses (${this.maxEmailAddresses}) reached`);
            }

            // Check if email already exists
            const existingEmail = config.emailAddresses.find(email => 
                email.address.toLowerCase() === emailAddress.toLowerCase()
            );

            if (existingEmail) {
                throw new Error('Email address already exists');
            }

            // Add new email address
            const newEmail = {
                address: emailAddress.toLowerCase(),
                forwarding: this.forwardingEmail,
                status: 'active',
                createdAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            config.emailAddresses.push(newEmail);
            config.updatedAt = new Date().toISOString();

            // Save updated configuration
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));

            console.log(`✅ New Fakelit.com email address created: ${emailAddress}`);
            return newEmail;
        } catch (error) {
            console.error('❌ Failed to create email address:', error);
            throw error;
        }
    }

    // Update email forwarding
    async updateEmailForwarding(emailAddress, newForwardingEmail) {
        try {
            const configPath = path.join(this.emailDirectory, 'fakelit-email-config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);

            const emailIndex = config.emailAddresses.findIndex(email => 
                email.address.toLowerCase() === emailAddress.toLowerCase()
            );

            if (emailIndex === -1) {
                throw new Error('Email address not found');
            }

            config.emailAddresses[emailIndex].forwarding = newForwardingEmail;
            config.emailAddresses[emailIndex].updatedAt = new Date().toISOString();
            config.updatedAt = new Date().toISOString();

            // Save updated configuration
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));

            console.log(`✅ Email forwarding updated: ${emailAddress} → ${newForwardingEmail}`);
            return config.emailAddresses[emailIndex];
        } catch (error) {
            console.error('❌ Failed to update email forwarding:', error);
            throw error;
        }
    }

    // Deactivate email address
    async deactivateEmailAddress(emailAddress) {
        try {
            const configPath = path.join(this.emailDirectory, 'fakelit-email-config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);

            const emailIndex = config.emailAddresses.findIndex(email => 
                email.address.toLowerCase() === emailAddress.toLowerCase()
            );

            if (emailIndex === -1) {
                throw new Error('Email address not found');
            }

            config.emailAddresses[emailIndex].status = 'inactive';
            config.emailAddresses[emailIndex].updatedAt = new Date().toISOString();
            config.updatedAt = new Date().toISOString();

            // Save updated configuration
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));

            console.log(`✅ Email address deactivated: ${emailAddress}`);
            return config.emailAddresses[emailIndex];
        } catch (error) {
            console.error('❌ Failed to deactivate email address:', error);
            throw error;
        }
    }

    // Get email statistics
    async getEmailStats() {
        try {
            const configPath = path.join(this.emailDirectory, 'fakelit-email-config.json');
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);

            const activeEmails = config.emailAddresses.filter(email => email.status === 'active');
            const inactiveEmails = config.emailAddresses.filter(email => email.status === 'inactive');

            return {
                totalEmails: config.emailAddresses.length,
                activeEmails: activeEmails.length,
                inactiveEmails: inactiveEmails.length,
                maxEmails: this.maxEmailAddresses,
                availableSlots: this.maxEmailAddresses - config.emailAddresses.length,
                forwardingEmail: this.forwardingEmail,
                companyInfo: this.companyInfo,
                poweredBy: this.brandName
            };
        } catch (error) {
            console.error('❌ Failed to get email statistics:', error);
            return null;
        }
    }

    // Send email through Fakelit.com
    async sendEmail(fromEmail, toEmail, subject, content, options = {}) {
        try {
            // Validate sender email
            if (!this.isValidFakelitEmail(fromEmail)) {
                throw new Error('Invalid Fakelit.com sender email address');
            }

            // Create transporter (this would be configured with actual SMTP settings)
            const transporter = nodemailer.createTransporter({
                host: 'smtp.fakelit.com', // This would be your actual SMTP server
                port: 587,
                secure: false,
                auth: {
                    user: fromEmail,
                    pass: 'your-email-password' // This would be securely stored
                }
            });

            // Prepare email
            const mailOptions = {
                from: `${this.companyInfo.name} <${fromEmail}>`,
                to: toEmail,
                subject: subject,
                html: this.formatEmailContent(content, fromEmail),
                ...options
            };

            // Send email
            const result = await transporter.sendMail(mailOptions);

            console.log(`✅ Email sent successfully: ${fromEmail} → ${toEmail}`);
            return result;
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            throw error;
        }
    }

    // Format email content with Fakelit.com branding
    formatEmailContent(content, fromEmail) {
        const emailSignature = this.getEmailSignature(fromEmail);
        
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                    <img src="https://fakelit.com/images/logo.svg" alt="Fakelit.com" style="height: 40px;">
                    <h2 style="color: #333; margin: 10px 0;">Fakelit.com</h2>
                </div>
                
                <div style="padding: 20px; background-color: white;">
                    ${content}
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; font-size: 12px; color: #666;">
                    ${emailSignature}
                </div>
            </div>
        `;
    }

    // Get email signature based on sender
    getEmailSignature(fromEmail) {
        const signatures = {
            'support@fakelit.com': `
                <strong>Fakelit.com Support Team</strong><br>
                📞 Phone: ${this.companyInfo.phone}<br>
                📧 Email: ${this.companyInfo.supportEmail}<br>
                🌐 Website: ${this.companyInfo.website}<br>
                🏢 Address: ${this.companyInfo.address}<br>
                <br>
                <em>Thank you for choosing Fakelit.com</em>
            `,
            'sales@fakelit.com': `
                <strong>Fakelit.com Sales Team</strong><br>
                📞 Phone: ${this.companyInfo.phone}<br>
                📧 Email: ${this.companyInfo.salesEmail}<br>
                🌐 Website: ${this.companyInfo.website}<br>
                🏢 Address: ${this.companyInfo.address}<br>
                <br>
                <em>Professional hosting and domain solutions</em>
            `,
            'accounts@fakelit.com': `
                <strong>Fakelit.com Accounts Team</strong><br>
                📞 Phone: ${this.companyInfo.phone}<br>
                📧 Email: ${this.companyInfo.accountsEmail}<br>
                🌐 Website: ${this.companyInfo.website}<br>
                🏢 Address: ${this.companyInfo.address}<br>
                <br>
                <em>Professional account management</em>
            `,
            'info@fakelit.com': `
                <strong>Fakelit.com Information</strong><br>
                📞 Phone: ${this.companyInfo.phone}<br>
                📧 Email: ${this.companyInfo.supportEmail}<br>
                🌐 Website: ${this.companyInfo.website}<br>
                🏢 Address: ${this.companyInfo.address}<br>
                <br>
                <em>Professional hosting and domain solutions</em>
            `,
            'm.brooks@fakelit.com': `
                <strong>M. Brooks - Fakelit.com</strong><br>
                📞 Phone: ${this.companyInfo.phone}<br>
                📧 Email: m.brooks@fakelit.com<br>
                🌐 Website: ${this.companyInfo.website}<br>
                🏢 Address: ${this.companyInfo.address}<br>
                <br>
                <em>Fakelit.com Management</em>
            `,
            'v.helems@fakelit.com': `
                <strong>V. Helems - Fakelit.com</strong><br>
                📞 Phone: ${this.companyInfo.phone}<br>
                📧 Email: v.helems@fakelit.com<br>
                🌐 Website: ${this.companyInfo.website}<br>
                🏢 Address: ${this.companyInfo.address}<br>
                <br>
                <em>Fakelit.com Management</em>
            `,
            'billing@fakelit.com': `
                <strong>Fakelit.com Billing Team</strong><br>
                📞 Phone: ${this.companyInfo.phone}<br>
                📧 Email: ${this.companyInfo.billingEmail}<br>
                🌐 Website: ${this.companyInfo.website}<br>
                🏢 Address: ${this.companyInfo.address}<br>
                <br>
                <em>Professional billing and payment services</em>
            `
        };

        return signatures[fromEmail.toLowerCase()] || signatures['info@fakelit.com'];
    }

    // Get support contact information
    getSupportContactInfo() {
        return {
            supportEmail: this.companyInfo.supportEmail,
            salesEmail: this.companyInfo.salesEmail,
            accountsEmail: this.companyInfo.accountsEmail,
            phone: this.companyInfo.phone,
            address: this.companyInfo.address,
            website: this.companyInfo.website,
            companyName: this.companyInfo.name,
            poweredBy: this.brandName
        };
    }

    // Generate email access details for Fakelit.com
    generateFakelitEmailAccess() {
        return {
            domain: 'fakelit.com',
            webmailUrl: 'https://webmail.fakelit.com',
            imapSettings: {
                server: 'imap.fakelit.com',
                port: 993,
                security: 'SSL/TLS',
                username: 'your-email@fakelit.com'
            },
            smtpSettings: {
                server: 'smtp.fakelit.com',
                port: 587,
                security: 'STARTTLS',
                username: 'your-email@fakelit.com'
            },
            pop3Settings: {
                server: 'pop3.fakelit.com',
                port: 995,
                security: 'SSL/TLS',
                username: 'your-email@fakelit.com'
            },
            emailAddresses: this.fakelitEmails.map(email => ({
                address: email,
                password: this.generatePassword(),
                status: 'active',
                storage: '2GB',
                forwarding: this.forwardingEmail
            })),
            poweredBy: this.brandName
        };
    }

    // Generate email access details for purchased domains
    generateDomainEmailAccess(domainName) {
        return {
            domain: domainName,
            webmailUrl: `https://webmail.${domainName}`,
            imapSettings: {
                server: `imap.${domainName}`,
                port: 993,
                security: 'SSL/TLS',
                username: `your-email@${domainName}`
            },
            smtpSettings: {
                server: `smtp.${domainName}`,
                port: 587,
                security: 'STARTTLS',
                username: `your-email@${domainName}`
            },
            pop3Settings: {
                server: `pop3.${domainName}`,
                port: 995,
                security: 'SSL/TLS',
                username: `your-email@${domainName}`
            },
            defaultEmailAddresses: [
                'admin',
                'info',
                'support',
                'sales',
                'contact'
            ].map(email => ({
                address: `${email}@${domainName}`,
                password: this.generatePassword(),
                status: 'active',
                storage: '2GB',
                forwarding: this.forwardingEmail
            })),
            poweredBy: this.brandName
        };
    }

    // Get complete email access information
    async getCompleteEmailAccess() {
        try {
            const fakelitAccess = this.generateFakelitEmailAccess();
            
            // Get all purchased domains (this would be from your domain service)
            const purchasedDomains = await this.getPurchasedDomains();
            
            const domainAccess = purchasedDomains.map(domain => 
                this.generateDomainEmailAccess(domain.name)
            );

            return {
                fakelit: fakelitAccess,
                domains: domainAccess,
                totalDomains: domainAccess.length + 1, // +1 for Fakelit.com
                poweredBy: this.brandName
            };
        } catch (error) {
            console.error('❌ Failed to get complete email access:', error);
            return null;
        }
    }

    // Get purchased domains (placeholder - integrate with your domain service)
    async getPurchasedDomains() {
        try {
            // This would integrate with your domain management service
            // For now, returning a placeholder
            return [
                { name: 'example.com', status: 'active' },
                { name: 'mybusiness.com', status: 'active' }
            ];
        } catch (error) {
            console.error('❌ Failed to get purchased domains:', error);
            return [];
        }
    }
}

module.exports = EmailService; 