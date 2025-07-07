const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class DomainManager {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.enomConfig = {
            username: process.env.ENOM_USERNAME,
            password: process.env.ENOM_PASSWORD,
            baseUrl: 'https://reseller.enom.com/interface.asp'
        };
        
        this.cloudwaysConfig = {
            apiKey: process.env.CLOUDWAYS_API_KEY,
            email: process.env.CLOUDWAYS_EMAIL,
            baseUrl: 'https://api.cloudways.com/api/v1'
        };
        
        this.domainsFile = 'DomainCreate_File.json';
    }

    /**
     * Get authentication headers for Cloudways
     */
    getCloudwaysAuthHeaders() {
        if (!this.cloudwaysConfig.apiKey || !this.cloudwaysConfig.email) {
            throw new Error('Cloudways API credentials not configured');
        }

        return {
            'Authorization': `Bearer ${this.cloudwaysConfig.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Get all Cloudways servers and applications
     */
    async getCloudwaysApplications() {
        try {
            console.log(`🌐 Fetching Cloudways applications for ${this.brandName}...`);
            
            const headers = this.getCloudwaysAuthHeaders();
            const response = await axios.get(`${this.cloudwaysConfig.baseUrl}/servers`, { headers });
            
            const applications = [];
            
            for (const server of response.data.servers) {
                const appsResponse = await axios.get(
                    `${this.cloudwaysConfig.baseUrl}/servers/${server.id}/apps`,
                    { headers }
                );
                
                for (const app of appsResponse.data.apps) {
                    applications.push({
                        platform: 'Cloudways',
                        serverId: server.id,
                        serverName: server.name,
                        serverIp: server.ip,
                        appId: app.id,
                        appName: app.name,
                        appUrl: app.url,
                        appStatus: app.status,
                        appType: app.application_type,
                        appVersion: app.application_version,
                        domains: app.domains || [],
                        ssl: app.ssl,
                        createdAt: app.created_at,
                        updatedAt: app.updated_at,
                        poweredBy: this.brandName
                    });
                }
            }
            
            console.log(`✅ Found ${applications.length} Cloudways applications for ${this.brandName}`);
            return applications;
            
        } catch (error) {
            console.error('❌ Cloudways API Error:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Get all Enom domains
     */
    async getEnomDomains() {
        try {
            console.log(`🌐 Fetching Enom domains for ${this.brandName}...`);
            
            if (!this.enomConfig.username || !this.enomConfig.password) {
                console.log('⚠️ Enom credentials not configured, skipping Enom domains');
                return [];
            }

            const params = new URLSearchParams({
                command: 'GetDomains',
                uid: this.enomConfig.username,
                pw: this.enomConfig.password,
                ResponseType: 'JSON'
            });

            const response = await axios.get(`${this.enomConfig.baseUrl}?${params}`);
            
            if (response.data && response.data.GetDomains) {
                const domains = response.data.GetDomains.Domains || [];
                console.log(`✅ Found ${domains.length} Enom domains for ${this.brandName}`);
                
                return domains.map(domain => ({
                    platform: 'Enom',
                    domainName: domain.DomainName,
                    expiryDate: domain.ExpirationDate,
                    autoRenew: domain.AutoRenew,
                    status: domain.Status,
                    registrar: 'Enom',
                    poweredBy: this.brandName
                }));
            }
            
            return [];
            
        } catch (error) {
            console.error('❌ Enom API Error:', error.response?.data || error.message);
            return [];
        }
    }

    /**
     * Create a new domain
     */
    async createDomain(domainName, platform = 'Cloudways') {
        try {
            console.log(`🌐 Creating domain: ${domainName} on ${platform} for ${this.brandName}`);
            
            if (platform === 'Cloudways') {
                return await this.createCloudwaysDomain(domainName);
            } else if (platform === 'Enom') {
                return await this.createEnomDomain(domainName);
            }
            
        } catch (error) {
            console.error(`❌ Error creating domain ${domainName}:`, error.message);
            throw error;
        }
    }

    /**
     * Create domain on Cloudways
     */
    async createCloudwaysDomain(domainName) {
        const headers = this.getCloudwaysAuthHeaders();
        
        // First, get available servers
        const serversResponse = await axios.get(`${this.cloudwaysConfig.baseUrl}/servers`, { headers });
        const server = serversResponse.data.servers[0]; // Use first server
        
        if (!server) {
            throw new Error('No Cloudways servers available');
        }

        // Create application
        const appData = {
            name: domainName.replace('.com', '').replace('.', '-'),
            application: 'php',
            application_version: '8.1',
            server_id: server.id
        };

        const appResponse = await axios.post(
            `${this.cloudwaysConfig.baseUrl}/apps`,
            appData,
            { headers }
        );

        return {
            success: true,
            platform: 'Cloudways',
            domainName,
            appId: appResponse.data.app.id,
            serverId: server.id,
            poweredBy: this.brandName,
            message: `Domain ${domainName} created successfully on Cloudways for ${this.brandName}`
        };
    }

    /**
     * Create domain on Enom
     */
    async createEnomDomain(domainName) {
        const params = new URLSearchParams({
            command: 'Purchase',
            uid: this.enomConfig.username,
            pw: this.enomConfig.password,
            sld: domainName.split('.')[0],
            tld: domainName.split('.')[1],
            ResponseType: 'JSON'
        });

        const response = await axios.get(`${this.enomConfig.baseUrl}?${params}`);
        
        return {
            success: true,
            platform: 'Enom',
            domainName,
            poweredBy: this.brandName,
            message: `Domain ${domainName} created successfully on Enom for ${this.brandName}`
        };
    }

    /**
     * Merge and list all applications and domains
     */
    async getAllApplications() {
        console.log('🔄 Merging Enom and Cloudways data...');
        
        const [cloudwaysApps, enomDomains] = await Promise.all([
            this.getCloudwaysApplications(),
            this.getEnomDomains()
        ]);

        const mergedData = {
            timestamp: new Date().toISOString(),
            totalApplications: cloudwaysApps.length,
            totalDomains: enomDomains.length,
            cloudways: {
                applications: cloudwaysApps,
                count: cloudwaysApps.length
            },
            enom: {
                domains: enomDomains,
                count: enomDomains.length
            },
            summary: {
                totalServers: cloudwaysApps.length > 0 ? new Set(cloudwaysApps.map(app => app.serverId)).size : 0,
                activeApplications: cloudwaysApps.filter(app => app.appStatus === 'running').length,
                expiringDomains: enomDomains.filter(domain => {
                    const expiryDate = new Date(domain.expiryDate);
                    const thirtyDaysFromNow = new Date();
                    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                    return expiryDate <= thirtyDaysFromNow;
                }).length
            }
        };

        return mergedData;
    }

    /**
     * Save domain creation file
     */
    async saveDomainCreateFile(data) {
        try {
            const filePath = path.join(process.cwd(), this.domainsFile);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            console.log(`✅ Domain creation file saved: ${filePath}`);
            return filePath;
        } catch (error) {
            console.error('❌ Error saving domain file:', error.message);
            throw error;
        }
    }

    /**
     * Load domain creation file
     */
    async loadDomainCreateFile() {
        try {
            const filePath = path.join(process.cwd(), this.domainsFile);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log('⚠️ No existing domain file found');
            return null;
        }
    }

    /**
     * Generate domain creation report
     */
    async generateReport() {
        const data = await this.getAllApplications();
        const report = {
            ...data,
            reportGenerated: new Date().toISOString(),
            recommendations: this.generateRecommendations(data)
        };

        await this.saveDomainCreateFile(report);
        return report;
    }

    /**
     * Generate recommendations based on data
     */
    generateRecommendations(data) {
        const recommendations = [];

        if (data.summary.expiringDomains > 0) {
            recommendations.push({
                type: 'warning',
                message: `${data.summary.expiringDomains} domains are expiring within 30 days`,
                action: 'Review and renew expiring domains'
            });
        }

        if (data.cloudways.count === 0) {
            recommendations.push({
                type: 'info',
                message: 'No Cloudways applications found',
                action: 'Consider deploying applications to Cloudways'
            });
        }

        if (data.enom.count === 0) {
            recommendations.push({
                type: 'info',
                message: 'No Enom domains found',
                action: 'Consider registering domains through Enom'
            });
        }

        return recommendations;
    }

    /**
     * List all applications in a formatted way
     */
    async listAllApplications() {
        const data = await this.getAllApplications();
        
        console.log('\n🌐 DOMAIN AND APPLICATION INVENTORY');
        console.log('=====================================');
        console.log(`📊 Total Applications: ${data.totalApplications}`);
        console.log(`🌍 Total Domains: ${data.totalDomains}`);
        console.log(`🖥️  Total Servers: ${data.summary.totalServers}`);
        console.log(`✅ Active Applications: ${data.summary.activeApplications}`);
        console.log(`⚠️  Expiring Domains: ${data.summary.expiringDomains}`);

        if (data.cloudways.applications.length > 0) {
            console.log('\n☁️ CLOUDWAYS APPLICATIONS:');
            console.log('==========================');
            data.cloudways.applications.forEach((app, index) => {
                console.log(`${index + 1}. ${app.appName} (${app.appType})`);
                console.log(`   Server: ${app.serverName} (${app.serverIp})`);
                console.log(`   URL: ${app.appUrl}`);
                console.log(`   Status: ${app.appStatus}`);
                console.log(`   Domains: ${app.domains.join(', ') || 'None'}`);
                console.log('');
            });
        }

        if (data.enom.domains.length > 0) {
            console.log('\n🏷️ ENOM DOMAINS:');
            console.log('================');
            data.enom.domains.forEach((domain, index) => {
                console.log(`${index + 1}. ${domain.domainName}`);
                console.log(`   Expires: ${domain.expiryDate}`);
                console.log(`   Auto-Renew: ${domain.autoRenew ? 'Yes' : 'No'}`);
                console.log(`   Status: ${domain.status}`);
                console.log('');
            });
        }

        if (data.recommendations && data.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            console.log('==================');
            data.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. [${rec.type.toUpperCase()}] ${rec.message}`);
                console.log(`   Action: ${rec.action}`);
                console.log('');
            });
        }

        return data;
    }
}

module.exports = DomainManager; 