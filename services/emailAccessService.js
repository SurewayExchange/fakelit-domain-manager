const fs = require('fs').promises;
const path = require('path');

class EmailAccessService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.accessDirectory = 'data/email-access';
        
        // Fakelit.com email access configuration
        this.fakelitAccess = {
            domain: 'fakelit.com',
            webmailUrl: 'https://webmail.fakelit.com',
            adminPanel: 'https://admin.fakelit.com',
            supportUrl: 'https://support.fakelit.com',
            imapSettings: {
                server: 'imap.fakelit.com',
                port: 993,
                security: 'SSL/TLS',
                username: 'your-email@fakelit.com',
                authentication: 'Normal password'
            },
            smtpSettings: {
                server: 'smtp.fakelit.com',
                port: 587,
                security: 'STARTTLS',
                username: 'your-email@fakelit.com',
                authentication: 'Normal password'
            },
            pop3Settings: {
                server: 'pop3.fakelit.com',
                port: 995,
                security: 'SSL/TLS',
                username: 'your-email@fakelit.com',
                authentication: 'Normal password'
            },
            mobileSettings: {
                imap: {
                    server: 'imap.fakelit.com',
                    port: 993,
                    security: 'SSL/TLS'
                },
                smtp: {
                    server: 'smtp.fakelit.com',
                    port: 587,
                    security: 'STARTTLS'
                }
            }
        };
        
        this.initializeService();
    }

    async initializeService() {
        try {
            await fs.mkdir(this.accessDirectory, { recursive: true });
            
            // Create Fakelit.com access details
            await this.createFakelitAccessDetails();
            
            console.log('✅ Email access service initialized successfully');
            console.log(`🌐 Fakelit.com webmail: ${this.fakelitAccess.webmailUrl}`);
            console.log(`🔧 Admin panel: ${this.fakelitAccess.adminPanel}`);
        } catch (error) {
            console.error('❌ Failed to initialize email access service:', error);
        }
    }

    async createFakelitAccessDetails() {
        try {
            const fakelitEmails = [
                'support@fakelit.com',
                'sales@fakelit.com',
                'm.brooks@fakelit.com',
                'info@fakelit.com',
                'accounts@fakelit.com',
                'v.helems@fakelit.com',
                'billing@fakelit.com'
            ];

            const emailAccessDetails = fakelitEmails.map(email => ({
                address: email,
                password: this.generateSecurePassword(),
                status: 'active',
                storage: '2GB',
                forwarding: 'marquibelbrooks@gmail.com',
                accessDetails: {
                    webmail: this.fakelitAccess.webmailUrl,
                    imap: this.fakelitAccess.imapSettings,
                    smtp: this.fakelitAccess.smtpSettings,
                    pop3: this.fakelitAccess.pop3Settings,
                    mobile: this.fakelitAccess.mobileSettings
                },
                createdAt: new Date().toISOString(),
                poweredBy: this.brandName
            }));

            const accessConfig = {
                domain: 'fakelit.com',
                accessDetails: this.fakelitAccess,
                emailAddresses: emailAccessDetails,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            await fs.writeFile(
                path.join(this.accessDirectory, 'fakelit-access.json'),
                JSON.stringify(accessConfig, null, 2)
            );

            console.log('✅ Fakelit.com email access details created');
        } catch (error) {
            console.error('❌ Failed to create Fakelit.com access details:', error);
        }
    }

    generateSecurePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    // Get Fakelit.com email access details
    async getFakelitEmailAccess() {
        try {
            const configPath = path.join(this.accessDirectory, 'fakelit-access.json');
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);
            
            return config;
        } catch (error) {
            console.error('❌ Failed to get Fakelit.com email access:', error);
            return null;
        }
    }

    // Generate email access details for purchased domain
    async generateDomainEmailAccess(domainName, clientId) {
        try {
            const domainAccess = {
                domain: domainName,
                clientId: clientId,
                webmailUrl: `https://webmail.${domainName}`,
                adminPanel: `https://admin.${domainName}`,
                supportUrl: 'https://support.fakelit.com',
                imapSettings: {
                    server: `imap.${domainName}`,
                    port: 993,
                    security: 'SSL/TLS',
                    username: `your-email@${domainName}`,
                    authentication: 'Normal password'
                },
                smtpSettings: {
                    server: `smtp.${domainName}`,
                    port: 587,
                    security: 'STARTTLS',
                    username: `your-email@${domainName}`,
                    authentication: 'Normal password'
                },
                pop3Settings: {
                    server: `pop3.${domainName}`,
                    port: 995,
                    security: 'SSL/TLS',
                    username: `your-email@${domainName}`,
                    authentication: 'Normal password'
                },
                mobileSettings: {
                    imap: {
                        server: `imap.${domainName}`,
                        port: 993,
                        security: 'SSL/TLS'
                    },
                    smtp: {
                        server: `smtp.${domainName}`,
                        port: 587,
                        security: 'STARTTLS'
                    }
                }
            };

            // Create default email addresses
            const defaultEmails = [
                'admin',
                'info',
                'support',
                'sales',
                'contact'
            ];

            const emailAddresses = defaultEmails.map(email => ({
                address: `${email}@${domainName}`,
                password: this.generateSecurePassword(),
                status: 'active',
                storage: '2GB',
                forwarding: 'marquibelbrooks@gmail.com',
                accessDetails: {
                    webmail: domainAccess.webmailUrl,
                    imap: domainAccess.imapSettings,
                    smtp: domainAccess.smtpSettings,
                    pop3: domainAccess.pop3Settings,
                    mobile: domainAccess.mobileSettings
                },
                createdAt: new Date().toISOString(),
                poweredBy: this.brandName
            }));

            const domainConfig = {
                domain: domainName,
                clientId: clientId,
                accessDetails: domainAccess,
                emailAddresses: emailAddresses,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            // Save domain access details
            await fs.writeFile(
                path.join(this.accessDirectory, `${domainName}-access.json`),
                JSON.stringify(domainConfig, null, 2)
            );

            console.log(`✅ Email access details created for ${domainName}`);
            return domainConfig;
        } catch (error) {
            console.error(`❌ Failed to create email access for ${domainName}:`, error);
            throw error;
        }
    }

    // Get email access details for specific domain
    async getDomainEmailAccess(domainName) {
        try {
            const configPath = path.join(this.accessDirectory, `${domainName}-access.json`);
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);
            
            return config;
        } catch (error) {
            console.error(`❌ Failed to get email access for ${domainName}:`, error);
            return null;
        }
    }

    // Get all domain email access details
    async getAllDomainEmailAccess() {
        try {
            const files = await fs.readdir(this.accessDirectory);
            const domainConfigs = [];

            for (const file of files) {
                if (file.endsWith('-access.json') && file !== 'fakelit-access.json') {
                    const domainName = file.replace('-access.json', '');
                    const config = await this.getDomainEmailAccess(domainName);
                    if (config) {
                        domainConfigs.push(config);
                    }
                }
            }

            return domainConfigs;
        } catch (error) {
            console.error('❌ Failed to get all domain email access:', error);
            return [];
        }
    }

    // Get complete email access summary
    async getCompleteEmailAccessSummary() {
        try {
            const fakelitAccess = await this.getFakelitEmailAccess();
            const domainAccess = await this.getAllDomainEmailAccess();

            return {
                fakelit: {
                    domain: 'fakelit.com',
                    emailCount: fakelitAccess ? fakelitAccess.emailAddresses.length : 0,
                    webmailUrl: this.fakelitAccess.webmailUrl,
                    adminPanel: this.fakelitAccess.adminPanel
                },
                domains: domainAccess.map(domain => ({
                    domain: domain.domain,
                    emailCount: domain.emailAddresses.length,
                    webmailUrl: domain.accessDetails.webmailUrl,
                    adminPanel: domain.accessDetails.adminPanel
                })),
                totalDomains: domainAccess.length + 1,
                totalEmails: (fakelitAccess ? fakelitAccess.emailAddresses.length : 0) + 
                           domainAccess.reduce((sum, domain) => sum + domain.emailAddresses.length, 0),
                poweredBy: this.brandName
            };
        } catch (error) {
            console.error('❌ Failed to get complete email access summary:', error);
            return null;
        }
    }

    // Create email access instructions
    generateEmailAccessInstructions(domainName, emailAddress) {
        const instructions = {
            webmail: {
                title: 'Webmail Access',
                steps: [
                    'Open your web browser',
                    `Go to: https://webmail.${domainName}`,
                    'Enter your email address and password',
                    'Click "Sign In" to access your email'
                ]
            },
            outlook: {
                title: 'Microsoft Outlook Setup',
                steps: [
                    'Open Microsoft Outlook',
                    'Go to File > Add Account',
                    `Enter your email: ${emailAddress}`,
                    'Enter your password',
                    'Click "Next" and follow the setup wizard'
                ]
            },
            mobile: {
                title: 'Mobile Email Setup',
                steps: [
                    'Open your device\'s email app',
                    'Add new email account',
                    `Enter email: ${emailAddress}`,
                    'Enter password',
                    'Select IMAP or POP3 settings',
                    'Complete setup'
                ]
            },
            settings: {
                imap: {
                    server: `imap.${domainName}`,
                    port: 993,
                    security: 'SSL/TLS'
                },
                smtp: {
                    server: `smtp.${domainName}`,
                    port: 587,
                    security: 'STARTTLS'
                }
            }
        };

        return instructions;
    }

    // Update email password
    async updateEmailPassword(domainName, emailAddress, newPassword) {
        try {
            const configPath = path.join(this.accessDirectory, `${domainName}-access.json`);
            const configData = await fs.readFile(configPath, 'utf8');
            const config = JSON.parse(configData);

            const emailIndex = config.emailAddresses.findIndex(email => 
                email.address.toLowerCase() === emailAddress.toLowerCase()
            );

            if (emailIndex === -1) {
                throw new Error('Email address not found');
            }

            config.emailAddresses[emailIndex].password = newPassword;
            config.emailAddresses[emailIndex].updatedAt = new Date().toISOString();
            config.updatedAt = new Date().toISOString();

            await fs.writeFile(configPath, JSON.stringify(config, null, 2));

            console.log(`✅ Password updated for ${emailAddress}`);
            return config.emailAddresses[emailIndex];
        } catch (error) {
            console.error('❌ Failed to update email password:', error);
            throw error;
        }
    }

    // Get support contact information
    getSupportContactInfo() {
        return {
            supportEmail: 'support@fakelit.com',
            billingEmail: 'billing@fakelit.com',
            salesEmail: 'sales@fakelit.com',
            accountsEmail: 'accounts@fakelit.com',
            phone: '702-664-0009',
            address: '2300 W Sahara Ave Suite 800, Las Vegas, NV 89102',
            website: 'https://fakelit.com',
            supportUrl: 'https://support.fakelit.com',
            poweredBy: this.brandName
        };
    }
}

module.exports = EmailAccessService; 