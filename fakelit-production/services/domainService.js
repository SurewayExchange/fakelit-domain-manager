const axios = require('axios');
const xml2js = require('xml2js');

class DomainService {
    constructor() {
        this.enomApiUrl = 'https://reseller.enom.com/interface.asp';
        this.username = process.env.ENOM_USERNAME;
        this.password = process.env.ENOM_PASSWORD;
        this.apiKey = process.env.TUCOW_API_KEY;
    }

    /**
     * Get all domains from Enom/Tucow
     */
    async getDomains() {
        try {
            if (!this.username || !this.password) {
                throw new Error('Enom credentials not configured');
            }

            const params = {
                command: 'GetDomains',
                uid: this.username,
                pw: this.password,
                responseformat: 'xml'
            };

            console.log('🔍 Making API request to Enom...');
            const response = await axios.get(this.enomApiUrl, { 
                params,
                timeout: 10000,
                headers: {
                    'User-Agent': 'CareConnect-Domain-Manager/1.0'
                }
            });

            console.log('📡 Response received:', response.status);
            console.log('📄 Response data preview:', response.data.substring(0, 200));

            // Try to parse as XML
            try {
                const parser = new xml2js.Parser({ explicitArray: false });
                const result = await parser.parseStringPromise(response.data);
                return this.parseDomainResponse(result);
            } catch (xmlError) {
                console.log('⚠️ XML parsing failed, trying alternative parsing...');
                return this.parseTextResponse(response.data);
            }

        } catch (error) {
            console.error('❌ Error fetching domains:', error.message);
            if (error.response) {
                console.error('📡 Response status:', error.response.status);
                console.error('📄 Response data:', error.response.data);
            }
            throw error;
        }
    }

    /**
     * Parse XML response from Enom
     */
    parseDomainResponse(result) {
        try {
            const domains = [];
            
            if (result && result.interface && result.interface.GetDomains) {
                const domainList = result.interface.GetDomains;
                
                if (domainList.domain) {
                    const domainArray = Array.isArray(domainList.domain) ? domainList.domain : [domainList.domain];
                    
                    domainArray.forEach(domain => {
                        domains.push({
                            name: domain.name || domain.$.name,
                            expiry: domain.expiry || domain.$.expiry,
                            status: domain.status || domain.$.status,
                            autoRenew: domain.autoRenew || domain.$.autoRenew
                        });
                    });
                }
            }
            
            return domains;
        } catch (error) {
            console.error('❌ Error parsing domain response:', error.message);
            return [];
        }
    }

    /**
     * Parse text response as fallback
     */
    parseTextResponse(data) {
        try {
            const domains = [];
            
            // Look for domain patterns in the response
            const domainPattern = /([a-zA-Z0-9-]+\.(?:ai|com|net|org|io))/g;
            const matches = data.match(domainPattern);
            
            if (matches) {
                matches.forEach(domain => {
                    domains.push({
                        name: domain,
                        status: 'Active',
                        source: 'Text parsing'
                    });
                });
            }
            
            return domains;
        } catch (error) {
            console.error('❌ Error parsing text response:', error.message);
            return [];
        }
    }

    /**
     * Get domain information
     */
    async getDomainInfo(domainName) {
        try {
            if (!this.username || !this.password) {
                throw new Error('Enom credentials not configured');
            }

            const params = {
                command: 'GetDomainInfo',
                uid: this.username,
                pw: this.password,
                domain: domainName,
                responseformat: 'xml'
            };

            const response = await axios.get(this.enomApiUrl, { params });
            
            try {
                const parser = new xml2js.Parser({ explicitArray: false });
                const result = await parser.parseStringPromise(response.data);
                return result;
            } catch (xmlError) {
                return { raw: response.data };
            }

        } catch (error) {
            console.error(`❌ Error fetching info for ${domainName}:`, error.message);
            throw error;
        }
    }

    /**
     * Check domain availability
     */
    async checkDomainAvailability(domainName) {
        try {
            if (!this.username || !this.password) {
                throw new Error('Enom credentials not configured');
            }

            const params = {
                command: 'Check',
                uid: this.username,
                pw: this.password,
                domain: domainName,
                responseformat: 'xml'
            };

            const response = await axios.get(this.enomApiUrl, { params });
            
            try {
                const parser = new xml2js.Parser({ explicitArray: false });
                const result = await parser.parseStringPromise(response.data);
                return result;
            } catch (xmlError) {
                return { raw: response.data };
            }

        } catch (error) {
            console.error(`❌ Error checking availability for ${domainName}:`, error.message);
            throw error;
        }
    }
}

module.exports = DomainService; 