const axios = require('axios');

class CloudwaysService {
    constructor() {
        this.baseUrl = 'https://api.cloudways.com/api/v1';
        this.apiKey = process.env.CLOUDWAYS_API_KEY;
        this.email = process.env.CLOUDWAYS_EMAIL;
    }

    /**
     * Get authentication headers
     */
    getAuthHeaders() {
        if (!this.apiKey || !this.email) {
            throw new Error('Cloudways API credentials not configured. Please set CLOUDWAYS_API_KEY and CLOUDWAYS_EMAIL in your .env file');
        }

        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Get all servers
     */
    async getServers() {
        try {
            console.log('🔍 Fetching Cloudways servers...');
            const response = await axios.get(`${this.baseUrl}/server`, {
                headers: this.getAuthHeaders(),
                timeout: 10000
            });

            console.log(`✅ Found ${response.data.servers?.length || 0} servers`);
            return response.data.servers || [];
        } catch (error) {
            console.error('❌ Error fetching servers:', error.message);
            if (error.response) {
                console.error('📡 Response status:', error.response.status);
                console.error('📄 Response data:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Get all applications
     */
    async getApplications() {
        try {
            console.log('🔍 Fetching Cloudways applications...');
            const response = await axios.get(`${this.baseUrl}/app`, {
                headers: this.getAuthHeaders(),
                timeout: 10000
            });

            console.log(`✅ Found ${response.data.apps?.length || 0} applications`);
            return response.data.apps || [];
        } catch (error) {
            console.error('❌ Error fetching applications:', error.message);
            if (error.response) {
                console.error('📡 Response status:', error.response.status);
                console.error('📄 Response data:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Get applications by server
     */
    async getApplicationsByServer(serverId) {
        try {
            console.log(`🔍 Fetching applications for server ${serverId}...`);
            const response = await axios.get(`${this.baseUrl}/app/${serverId}`, {
                headers: this.getAuthHeaders(),
                timeout: 10000
            });

            console.log(`✅ Found ${response.data.apps?.length || 0} applications on server ${serverId}`);
            return response.data.apps || [];
        } catch (error) {
            console.error(`❌ Error fetching applications for server ${serverId}:`, error.message);
            if (error.response) {
                console.error('📡 Response status:', error.response.status);
                console.error('📄 Response data:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Find test applications
     */
    async findTestApplications() {
        try {
            console.log('🔍 Searching for test applications...');
            const applications = await this.getApplications();
            
            const testApps = applications.filter(app => {
                const name = app.label?.toLowerCase() || '';
                const url = app.url?.toLowerCase() || '';
                
                return name.includes('test') || 
                       name.includes('dev') || 
                       name.includes('staging') ||
                       url.includes('test') || 
                       url.includes('dev') || 
                       url.includes('staging');
            });

            console.log(`✅ Found ${testApps.length} test applications`);
            return testApps;
        } catch (error) {
            console.error('❌ Error finding test applications:', error.message);
            throw error;
        }
    }

    /**
     * Get application details
     */
    async getApplicationDetails(serverId, appId) {
        try {
            console.log(`🔍 Fetching details for application ${appId} on server ${serverId}...`);
            const response = await axios.get(`${this.baseUrl}/app/${serverId}/${appId}`, {
                headers: this.getAuthHeaders(),
                timeout: 10000
            });

            console.log('✅ Application details retrieved successfully');
            return response.data.app || {};
        } catch (error) {
            console.error(`❌ Error fetching application details:`, error.message);
            if (error.response) {
                console.error('📡 Response status:', error.response.status);
                console.error('📄 Response data:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Add domain to application
     */
    async addDomainToApp(serverId, appId, domainName) {
        try {
            console.log(`🌐 Adding domain ${domainName} to application ${appId} on server ${serverId}...`);
            
            const response = await axios.post(`${this.baseUrl}/app/${serverId}/${appId}/domain`, {
                domain: domainName
            }, {
                headers: this.getAuthHeaders(),
                timeout: 15000
            });

            console.log(`✅ Domain ${domainName} added successfully to application ${appId}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error adding domain ${domainName}:`, error.message);
            if (error.response) {
                console.error('📡 Response status:', error.response.status);
                console.error('📄 Response data:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Get domains for an application
     */
    async getAppDomains(serverId, appId) {
        try {
            console.log(`🔍 Fetching domains for application ${appId} on server ${serverId}...`);
            const response = await axios.get(`${this.baseUrl}/app/${serverId}/${appId}/domain`, {
                headers: this.getAuthHeaders(),
                timeout: 10000
            });

            console.log(`✅ Found ${response.data.domains?.length || 0} domains for application ${appId}`);
            return response.data.domains || [];
        } catch (error) {
            console.error(`❌ Error fetching domains for application ${appId}:`, error.message);
            if (error.response) {
                console.error('📡 Response status:', error.response.status);
                console.error('📄 Response data:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Remove domain from application
     */
    async removeDomainFromApp(serverId, appId, domainName) {
        try {
            console.log(`🗑️ Removing domain ${domainName} from application ${appId} on server ${serverId}...`);
            
            const response = await axios.delete(`${this.baseUrl}/app/${serverId}/${appId}/domain/${domainName}`, {
                headers: this.getAuthHeaders(),
                timeout: 15000
            });

            console.log(`✅ Domain ${domainName} removed successfully from application ${appId}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error removing domain ${domainName}:`, error.message);
            if (error.response) {
                console.error('📡 Response status:', error.response.status);
                console.error('📄 Response data:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Find Fakelit server and applications
     */
    async findFakelitServer() {
        try {
            console.log('🔍 Searching for Fakelit server...');
            const servers = await this.getServers();
            
            const fakelitServer = servers.find(server => {
                const name = server.label?.toLowerCase() || '';
                const provider = server.provider?.toLowerCase() || '';
                
                return name.includes('fakelit') || 
                       name.includes('fakelit') ||
                       provider.includes('fakelit');
            });

            if (fakelitServer) {
                console.log(`✅ Found Fakelit server: ${fakelitServer.label} (ID: ${fakelitServer.id})`);
                return fakelitServer;
            } else {
                console.log('❌ Fakelit server not found');
                return null;
            }
        } catch (error) {
            console.error('❌ Error finding Fakelit server:', error.message);
            throw error;
        }
    }

    /**
     * Add selectiveadvertisinggroup.com to Fakelit server
     */
    async addSelectiveAdvertisingDomain() {
        try {
            console.log('🌐 Adding selectiveadvertisinggroup.com to Fakelit server...');
            
            // Find Fakelit server
            const fakelitServer = await this.findFakelitServer();
            if (!fakelitServer) {
                throw new Error('Fakelit server not found');
            }

            // Get applications on Fakelit server
            const applications = await this.getApplicationsByServer(fakelitServer.id);
            if (applications.length === 0) {
                throw new Error('No applications found on Fakelit server');
            }

            // Use the first application or find a suitable one
            const targetApp = applications[0];
            console.log(`📱 Using application: ${targetApp.label} (ID: ${targetApp.id})`);

            // Add the domain
            const result = await this.addDomainToApp(
                fakelitServer.id, 
                targetApp.id, 
                'selectiveadvertisinggroup.com'
            );

            console.log('✅ selectiveadvertisinggroup.com added successfully to Fakelit server');
            console.log(`🌐 Domain will be available at: https://selectiveadvertisinggroup.com`);
            
            return {
                server: fakelitServer,
                application: targetApp,
                domain: 'selectiveadvertisinggroup.com',
                result: result
            };

        } catch (error) {
            console.error('❌ Error adding selectiveadvertisinggroup.com:', error.message);
            throw error;
        }
    }

    /**
     * List all applications with details
     */
    async listAllApplications() {
        try {
            console.log('🌐 Cloudways Application Manager');
            console.log('================================\n');

            // Check if credentials are configured
            if (!this.apiKey || !this.email) {
                console.log('❌ Cloudways credentials not found in environment');
                console.log('Please add the following to your .env file:');
                console.log('CLOUDWAYS_API_KEY=your_cloudways_api_key');
                console.log('CLOUDWAYS_EMAIL=your_cloudways_email');
                return;
            }

            console.log('✅ Cloudways credentials found');
            console.log('🔍 Fetching all applications...\n');

            const applications = await this.getApplications();
            
            if (applications.length === 0) {
                console.log('📭 No applications found');
                return;
            }

            console.log('📋 All Applications:');
            console.log('===================');
            
            applications.forEach((app, index) => {
                console.log(`${index + 1}. ${app.label || 'Unnamed App'}`);
                console.log(`   Server: ${app.server_label || 'Unknown'}`);
                console.log(`   URL: ${app.url || 'No URL'}`);
                console.log(`   Status: ${app.status || 'Unknown'}`);
                console.log(`   Type: ${app.application?.application_name || 'Unknown'}`);
                console.log(`   PHP Version: ${app.application?.php_version || 'N/A'}`);
                console.log('');
            });

            // Find test applications
            const testApps = await this.findTestApplications();
            
            if (testApps.length > 0) {
                console.log('🧪 Test Applications:');
                console.log('====================');
                
                testApps.forEach((app, index) => {
                    console.log(`${index + 1}. ${app.label || 'Unnamed Test App'}`);
                    console.log(`   Server: ${app.server_label || 'Unknown'}`);
                    console.log(`   URL: ${app.url || 'No URL'}`);
                    console.log(`   Status: ${app.status || 'Unknown'}`);
                    console.log('');
                });
            }

            console.log(`📊 Summary: ${applications.length} total applications, ${testApps.length} test applications`);

        } catch (error) {
            console.error('❌ Error listing applications:', error.message);
        }
    }
}

module.exports = CloudwaysService; 