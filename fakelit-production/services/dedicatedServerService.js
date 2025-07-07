const fs = require('fs').promises;
const path = require('path');

class DedicatedServerService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.serversDirectory = 'data/dedicated-servers';
        this.clientsDirectory = 'data/dedicated-clients';
        this.emailDirectory = 'data/email-services';
        
        this.companyInfo = {
            name: 'Fakelit.com',
            address: '2300 W Sahara Ave Suite 800, Las Vegas, NV 89102',
            phone: '702-664-0009',
            email: 'sales@fakelit.com',
            website: 'https://fakelit.com'
        };
        
        this.serverConfigurations = {
            basic: {
                name: 'Basic Dedicated Server',
                price: 199.99,
                specs: {
                    cpu: '4 vCPU',
                    ram: '8GB DDR4',
                    storage: '500GB SSD',
                    bandwidth: '1TB/month',
                    ipAddresses: 1
                },
                features: [
                    'Full root access',
                    'DDoS protection',
                    '24/7 monitoring',
                    'Daily backups',
                    '5 free email addresses',
                    'Free SSL certificates'
                ]
            },
            professional: {
                name: 'Professional Dedicated Server',
                price: 399.99,
                specs: {
                    cpu: '8 vCPU',
                    ram: '16GB DDR4',
                    storage: '1TB SSD',
                    bandwidth: '2TB/month',
                    ipAddresses: 2
                },
                features: [
                    'All Basic features',
                    'Advanced DDoS protection',
                    'Load balancing',
                    'Priority support',
                    '10 free email addresses',
                    'Custom firewall rules'
                ]
            },
            enterprise: {
                name: 'Enterprise Dedicated Server',
                price: 799.99,
                specs: {
                    cpu: '16 vCPU',
                    ram: '32GB DDR4',
                    storage: '2TB SSD',
                    bandwidth: '5TB/month',
                    ipAddresses: 5
                },
                features: [
                    'All Professional features',
                    'High availability setup',
                    'Custom server configuration',
                    'Dedicated support team',
                    'Unlimited email addresses',
                    'Advanced security suite'
                ]
            }
        };
        
        this.initializeService();
    }

    async initializeService() {
        try {
            // Create directories if they don't exist
            await fs.mkdir(this.serversDirectory, { recursive: true });
            await fs.mkdir(this.clientsDirectory, { recursive: true });
            await fs.mkdir(this.emailDirectory, { recursive: true });
            
            console.log('✅ Dedicated server service initialized successfully');
            console.log(`🏢 ${this.companyInfo.name} - ${this.companyInfo.address}`);
            console.log(`📞 ${this.companyInfo.phone} | 📧 ${this.companyInfo.email}`);
        } catch (error) {
            console.error('❌ Failed to initialize dedicated server service:', error);
        }
    }

    // Client Management
    async createClient(clientData) {
        try {
            const clientId = `client_${Date.now()}`;
            const clientPath = path.join(this.clientsDirectory, clientId);
            
            await fs.mkdir(clientPath, { recursive: true });
            
            const client = {
                id: clientId,
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone,
                company: clientData.company,
                address: clientData.address,
                requirements: clientData.requirements,
                budget: clientData.budget,
                serverType: clientData.serverType || 'basic',
                domains: clientData.domains || [],
                emailAddresses: clientData.emailAddresses || [],
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            // Save client configuration
            await fs.writeFile(
                path.join(clientPath, 'client.json'),
                JSON.stringify(client, null, 2)
            );

            console.log(`✅ Dedicated server client created: ${clientId}`);
            return client;
        } catch (error) {
            console.error('❌ Failed to create dedicated server client:', error);
            throw error;
        }
    }

    async getClients(filters = {}) {
        try {
            const clients = [];
            const clientDirs = await fs.readdir(this.clientsDirectory);
            
            for (const dir of clientDirs) {
                const clientPath = path.join(this.clientsDirectory, dir);
                const clientFile = path.join(clientPath, 'client.json');
                
                try {
                    const clientData = await fs.readFile(clientFile, 'utf8');
                    const client = JSON.parse(clientData);
                    
                    // Apply filters
                    if (filters.serverType && client.serverType !== filters.serverType) continue;
                    if (filters.status && client.status !== filters.status) continue;
                    if (filters.budget && client.budget < filters.budget) continue;
                    
                    clients.push(client);
                } catch (error) {
                    console.warn(`Warning: Could not read client ${dir}`);
                }
            }
            
            return clients;
        } catch (error) {
            console.error('❌ Failed to get dedicated server clients:', error);
            return [];
        }
    }

    // Server Management
    async createDedicatedServer(serverData) {
        try {
            const serverId = `server_${Date.now()}`;
            const serverPath = path.join(this.serversDirectory, serverId);
            
            await fs.mkdir(serverPath, { recursive: true });
            
            const server = {
                id: serverId,
                clientId: serverData.clientId,
                configuration: serverData.configuration,
                specs: this.serverConfigurations[serverData.configuration].specs,
                price: this.serverConfigurations[serverData.configuration].price,
                features: this.serverConfigurations[serverData.configuration].features,
                ipAddresses: serverData.ipAddresses || [],
                domains: serverData.domains || [],
                emailAddresses: serverData.emailAddresses || [],
                status: 'provisioning',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            // Save server configuration
            await fs.writeFile(
                path.join(serverPath, 'server.json'),
                JSON.stringify(server, null, 2)
            );

            console.log(`✅ Dedicated server created: ${serverId}`);
            return server;
        } catch (error) {
            console.error('❌ Failed to create dedicated server:', error);
            throw error;
        }
    }

    async getServers(filters = {}) {
        try {
            const servers = [];
            const serverDirs = await fs.readdir(this.serversDirectory);
            
            for (const dir of serverDirs) {
                const serverPath = path.join(this.serversDirectory, dir);
                const serverFile = path.join(serverPath, 'server.json');
                
                try {
                    const serverData = await fs.readFile(serverFile, 'utf8');
                    const server = JSON.parse(serverData);
                    
                    // Apply filters
                    if (filters.clientId && server.clientId !== filters.clientId) continue;
                    if (filters.status && server.status !== filters.status) continue;
                    if (filters.configuration && server.configuration !== filters.configuration) continue;
                    
                    servers.push(server);
                } catch (error) {
                    console.warn(`Warning: Could not read server ${dir}`);
                }
            }
            
            return servers;
        } catch (error) {
            console.error('❌ Failed to get dedicated servers:', error);
            return [];
        }
    }

    // Email Service Management
    async createEmailService(emailData) {
        try {
            const emailId = `email_${Date.now()}`;
            const emailPath = path.join(this.emailDirectory, emailId);
            
            await fs.mkdir(emailPath, { recursive: true });
            
            const emailService = {
                id: emailId,
                clientId: emailData.clientId,
                domain: emailData.domain,
                emailAddresses: emailData.emailAddresses || [],
                storage: emailData.storage || '10GB',
                features: [
                    'Webmail access',
                    'IMAP/POP3 support',
                    'Spam protection',
                    'Virus scanning',
                    'Email forwarding',
                    'Auto-responders'
                ],
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            // Save email service configuration
            await fs.writeFile(
                path.join(emailPath, 'email.json'),
                JSON.stringify(emailService, null, 2)
            );

            console.log(`✅ Email service created: ${emailId}`);
            return emailService;
        } catch (error) {
            console.error('❌ Failed to create email service:', error);
            throw error;
        }
    }

    async createEmailAddress(clientId, domain, emailAddress) {
        try {
            const emailId = `email_${Date.now()}`;
            const emailPath = path.join(this.emailDirectory, emailId);
            
            await fs.mkdir(emailPath, { recursive: true });
            
            const emailAccount = {
                id: emailId,
                clientId: clientId,
                domain: domain,
                emailAddress: emailAddress,
                password: this.generatePassword(),
                storage: '2GB',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            // Save email account configuration
            await fs.writeFile(
                path.join(emailPath, 'account.json'),
                JSON.stringify(emailAccount, null, 2)
            );

            console.log(`✅ Email address created: ${emailAddress}@${domain}`);
            return emailAccount;
        } catch (error) {
            console.error('❌ Failed to create email address:', error);
            throw error;
        }
    }

    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    // Domain Management with Email
    async purchaseDomainWithEmail(domainData) {
        try {
            const domainId = `domain_${Date.now()}`;
            const domainPath = path.join(this.clientsDirectory, domainData.clientId, 'domains', domainId);
            
            await fs.mkdir(domainPath, { recursive: true });
            
            const domain = {
                id: domainId,
                clientId: domainData.clientId,
                domainName: domainData.domainName,
                registrationDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                status: 'active',
                emailAddresses: [],
                poweredBy: this.brandName
            };

            // Create 5 free email addresses
            const emailAddresses = [
                'admin',
                'info',
                'support',
                'sales',
                'contact'
            ];

            for (const email of emailAddresses) {
                const emailAccount = await this.createEmailAddress(
                    domainData.clientId,
                    domainData.domainName,
                    email
                );
                domain.emailAddresses.push(emailAccount);
            }

            // Save domain configuration
            await fs.writeFile(
                path.join(domainPath, 'domain.json'),
                JSON.stringify(domain, null, 2)
            );

            console.log(`✅ Domain purchased with 5 free email addresses: ${domainData.domainName}`);
            return domain;
        } catch (error) {
            console.error('❌ Failed to purchase domain with email:', error);
            throw error;
        }
    }

    // Server Configuration Management
    getServerConfigurations() {
        return this.serverConfigurations;
    }

    getServerConfiguration(type) {
        return this.serverConfigurations[type] || null;
    }

    // Quote Generation
    async generateQuote(quoteData) {
        try {
            const quoteId = `quote_${Date.now()}`;
            
            const serverConfig = this.serverConfigurations[quoteData.serverType];
            if (!serverConfig) {
                throw new Error('Invalid server configuration');
            }

            const quote = {
                id: quoteId,
                clientId: quoteData.clientId,
                serverType: quoteData.serverType,
                configuration: serverConfig,
                domains: quoteData.domains || [],
                additionalServices: quoteData.additionalServices || [],
                totalPrice: serverConfig.price,
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                status: 'pending',
                createdAt: new Date().toISOString(),
                poweredBy: this.brandName
            };

            // Calculate additional costs
            if (quoteData.domains && quoteData.domains.length > 0) {
                quote.totalPrice += quoteData.domains.length * 21.99; // Domain registration
            }

            if (quoteData.additionalServices && quoteData.additionalServices.length > 0) {
                quote.totalPrice += quoteData.additionalServices.length * 25; // Additional services
            }

            console.log(`✅ Quote generated: ${quoteId} - $${quote.totalPrice}`);
            return quote;
        } catch (error) {
            console.error('❌ Failed to generate quote:', error);
            throw error;
        }
    }

    // Statistics and Reporting
    async getDedicatedServerStats() {
        try {
            const clients = await this.getClients();
            const servers = await this.getServers();
            
            const stats = {
                totalClients: clients.length,
                totalServers: servers.length,
                serverTypeDistribution: {
                    basic: servers.filter(s => s.configuration === 'basic').length,
                    professional: servers.filter(s => s.configuration === 'professional').length,
                    enterprise: servers.filter(s => s.configuration === 'enterprise').length
                },
                totalRevenue: servers.reduce((sum, s) => sum + s.price, 0),
                averageServerPrice: servers.length > 0 ? servers.reduce((sum, s) => sum + s.price, 0) / servers.length : 0,
                companyInfo: this.companyInfo,
                poweredBy: this.brandName
            };
            
            return stats;
        } catch (error) {
            console.error('❌ Failed to get dedicated server stats:', error);
            return null;
        }
    }

    // Company Information
    getCompanyInfo() {
        return this.companyInfo;
    }

    // Update server status
    async updateServerStatus(serverId, newStatus) {
        try {
            const serverPath = path.join(this.serversDirectory, serverId);
            const serverFile = path.join(serverPath, 'server.json');
            
            const serverData = await fs.readFile(serverFile, 'utf8');
            const server = JSON.parse(serverData);
            
            server.status = newStatus;
            server.updatedAt = new Date().toISOString();
            
            await fs.writeFile(serverFile, JSON.stringify(server, null, 2));
            
            console.log(`✅ Server status updated: ${serverId} → ${newStatus}`);
            return server;
        } catch (error) {
            console.error('❌ Failed to update server status:', error);
            throw error;
        }
    }
}

module.exports = DedicatedServerService; 