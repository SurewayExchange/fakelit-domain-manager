const express = require('express');
const router = express.Router();
const DedicatedServerService = require('../services/dedicatedServerService');

const dedicatedServerService = new DedicatedServerService();

// Get company information
router.get('/company-info', async (req, res) => {
    try {
        const companyInfo = dedicatedServerService.getCompanyInfo();
        
        res.json({
            success: true,
            companyInfo: companyInfo,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get company info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get company information',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get server configurations
router.get('/configurations', async (req, res) => {
    try {
        const configurations = dedicatedServerService.getServerConfigurations();
        
        res.json({
            success: true,
            configurations: configurations,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get configurations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get server configurations',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get specific server configuration
router.get('/configurations/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const configuration = dedicatedServerService.getServerConfiguration(type);
        
        if (configuration) {
            res.json({
                success: true,
                configuration: configuration,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Server configuration not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get configuration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get server configuration',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Create dedicated server client
router.post('/clients', async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            company,
            address,
            requirements,
            budget,
            serverType
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Client name and email are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const client = await dedicatedServerService.createClient({
            name,
            email,
            phone,
            company,
            address,
            requirements,
            budget: parseFloat(budget) || 0,
            serverType: serverType || 'basic'
        });

        res.json({
            success: true,
            message: 'Dedicated server client created successfully',
            client: client,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create dedicated server client',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get all clients
router.get('/clients', async (req, res) => {
    try {
        const filters = {
            serverType: req.query.serverType,
            status: req.query.status,
            budget: req.query.budget ? parseFloat(req.query.budget) : null
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === null) {
                delete filters[key];
            }
        });

        const clients = await dedicatedServerService.getClients(filters);

        res.json({
            success: true,
            clients: clients,
            count: clients.length,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dedicated server clients',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Create dedicated server
router.post('/servers', async (req, res) => {
    try {
        const {
            clientId,
            configuration,
            ipAddresses,
            domains,
            emailAddresses
        } = req.body;

        if (!clientId || !configuration) {
            return res.status(400).json({
                success: false,
                message: 'Client ID and server configuration are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const server = await dedicatedServerService.createDedicatedServer({
            clientId,
            configuration,
            ipAddresses: ipAddresses || [],
            domains: domains || [],
            emailAddresses: emailAddresses || []
        });

        res.json({
            success: true,
            message: 'Dedicated server created successfully',
            server: server,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Create server error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create dedicated server',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get all servers
router.get('/servers', async (req, res) => {
    try {
        const filters = {
            clientId: req.query.clientId,
            status: req.query.status,
            configuration: req.query.configuration
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        const servers = await dedicatedServerService.getServers(filters);

        res.json({
            success: true,
            servers: servers,
            count: servers.length,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get servers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dedicated servers',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update server status
router.put('/servers/:serverId/status', async (req, res) => {
    try {
        const { serverId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Server status is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const validStatuses = ['provisioning', 'active', 'maintenance', 'suspended', 'decommissioned'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid server status',
                validStatuses: validStatuses,
                poweredBy: 'Fakelit.com'
            });
        }

        const server = await dedicatedServerService.updateServerStatus(serverId, status);

        res.json({
            success: true,
            message: 'Server status updated successfully',
            server: server,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update server status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update server status',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Create email service
router.post('/email-services', async (req, res) => {
    try {
        const {
            clientId,
            domain,
            emailAddresses,
            storage
        } = req.body;

        if (!clientId || !domain) {
            return res.status(400).json({
                success: false,
                message: 'Client ID and domain are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const emailService = await dedicatedServerService.createEmailService({
            clientId,
            domain,
            emailAddresses: emailAddresses || [],
            storage: storage || '10GB'
        });

        res.json({
            success: true,
            message: 'Email service created successfully',
            emailService: emailService,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Create email service error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create email service',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Create email address
router.post('/email-addresses', async (req, res) => {
    try {
        const {
            clientId,
            domain,
            emailAddress
        } = req.body;

        if (!clientId || !domain || !emailAddress) {
            return res.status(400).json({
                success: false,
                message: 'Client ID, domain, and email address are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const emailAccount = await dedicatedServerService.createEmailAddress(
            clientId,
            domain,
            emailAddress
        );

        res.json({
            success: true,
            message: 'Email address created successfully',
            emailAccount: emailAccount,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Create email address error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create email address',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Purchase domain with 5 free email addresses
router.post('/domains/purchase', async (req, res) => {
    try {
        const {
            clientId,
            domainName
        } = req.body;

        if (!clientId || !domainName) {
            return res.status(400).json({
                success: false,
                message: 'Client ID and domain name are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const domain = await dedicatedServerService.purchaseDomainWithEmail({
            clientId,
            domainName
        });

        res.json({
            success: true,
            message: 'Domain purchased successfully with 5 free email addresses',
            domain: domain,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Purchase domain error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to purchase domain',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Generate quote
router.post('/quotes', async (req, res) => {
    try {
        const {
            clientId,
            serverType,
            domains,
            additionalServices
        } = req.body;

        if (!clientId || !serverType) {
            return res.status(400).json({
                success: false,
                message: 'Client ID and server type are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const quote = await dedicatedServerService.generateQuote({
            clientId,
            serverType,
            domains: domains || [],
            additionalServices: additionalServices || []
        });

        res.json({
            success: true,
            message: 'Quote generated successfully',
            quote: quote,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Generate quote error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate quote',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get dedicated server statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await dedicatedServerService.getDedicatedServerStats();

        if (stats) {
            res.json({
                success: true,
                stats: stats,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get dedicated server statistics',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dedicated server statistics',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get client by ID
router.get('/clients/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const clients = await dedicatedServerService.getClients();
        const client = clients.find(c => c.id === clientId);

        if (client) {
            res.json({
                success: true,
                client: client,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Client not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get client',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get server by ID
router.get('/servers/:serverId', async (req, res) => {
    try {
        const { serverId } = req.params;
        const servers = await dedicatedServerService.getServers();
        const server = servers.find(s => s.id === serverId);

        if (server) {
            res.json({
                success: true,
                server: server,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Server not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get server error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get server',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update client
router.put('/clients/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const updates = req.body;

        // This would require additional implementation in the service
        // For now, return a placeholder response
        res.json({
            success: true,
            message: 'Client update functionality coming soon',
            clientId: clientId,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update client',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update server
router.put('/servers/:serverId', async (req, res) => {
    try {
        const { serverId } = req.params;
        const updates = req.body;

        // This would require additional implementation in the service
        // For now, return a placeholder response
        res.json({
            success: true,
            message: 'Server update functionality coming soon',
            serverId: serverId,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update server error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update server',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 