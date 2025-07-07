const express = require('express');
const router = express.Router();
const WordPressService = require('../services/wordpressService');

const wordpressService = new WordPressService();

// Get all support tiers
router.get('/support-tiers', async (req, res) => {
    try {
        const supportTiers = wordpressService.getSupportTiers();
        
        res.json({
            success: true,
            supportTiers: supportTiers,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get support tiers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get support tiers',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get specific support tier
router.get('/support-tier/:tierName', async (req, res) => {
    try {
        const { tierName } = req.params;
        const supportTier = wordpressService.getSupportTier(tierName);
        
        if (supportTier) {
            res.json({
                success: true,
                supportTier: supportTier,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Support tier not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get support tier error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get support tier',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Create WordPress theme
router.post('/themes', async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            tags,
            features,
            price,
            isCustom,
            clientId,
            customCSS,
            customFunctions
        } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Theme name and description are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const theme = await wordpressService.createTheme({
            name,
            description,
            category,
            tags,
            features,
            price: parseFloat(price) || 0,
            isCustom: isCustom || false,
            clientId,
            customCSS,
            customFunctions
        });

        res.json({
            success: true,
            message: 'WordPress theme created successfully',
            theme: theme,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Create theme error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WordPress theme',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get all themes
router.get('/themes', async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            isCustom: req.query.isCustom === 'true',
            clientId: req.query.clientId
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        const themes = await wordpressService.getThemes(filters);

        res.json({
            success: true,
            themes: themes,
            count: themes.length,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get themes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get themes',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Create WordPress site
router.post('/sites', async (req, res) => {
    try {
        const {
            name,
            domain,
            themeId,
            clientId,
            hostingPlan,
            supportTier,
            plugins,
            customizations
        } = req.body;

        if (!name || !domain || !themeId) {
            return res.status(400).json({
                success: false,
                message: 'Site name, domain, and theme ID are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const site = await wordpressService.createWordPressSite({
            name,
            domain,
            themeId,
            clientId,
            hostingPlan: hostingPlan || 'basic',
            supportTier: supportTier || 'free',
            plugins: plugins || [],
            customizations: customizations || []
        });

        res.json({
            success: true,
            message: 'WordPress site created successfully',
            site: site,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Create site error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create WordPress site',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get all WordPress sites
router.get('/sites', async (req, res) => {
    try {
        const filters = {
            clientId: req.query.clientId,
            status: req.query.status,
            supportTier: req.query.supportTier
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        const sites = await wordpressService.getWordPressSites(filters);

        res.json({
            success: true,
            sites: sites,
            count: sites.length,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get sites error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WordPress sites',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Create client server
router.post('/client-servers', async (req, res) => {
    try {
        const {
            name,
            email,
            company,
            phone,
            serverType,
            serverSpecs,
            supportTier,
            services,
            budget,
            requirements
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Client name and email are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const client = await wordpressService.createClientServer({
            name,
            email,
            company,
            phone,
            serverType: serverType || 'shared',
            serverSpecs: serverSpecs || {},
            supportTier: supportTier || 'free',
            services: services || [],
            budget: parseFloat(budget) || 0,
            requirements
        });

        res.json({
            success: true,
            message: 'Client server created successfully',
            client: client,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Create client server error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create client server',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get all client servers
router.get('/client-servers', async (req, res) => {
    try {
        const filters = {
            serverType: req.query.serverType,
            supportTier: req.query.supportTier,
            status: req.query.status
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        const clients = await wordpressService.getClientServers(filters);

        res.json({
            success: true,
            clients: clients,
            count: clients.length,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get client servers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get client servers',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Upgrade client support tier
router.put('/client-servers/:clientId/upgrade-support', async (req, res) => {
    try {
        const { clientId } = req.params;
        const { newTier } = req.body;

        if (!newTier) {
            return res.status(400).json({
                success: false,
                message: 'New support tier is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const validTiers = Object.keys(wordpressService.getSupportTiers());
        if (!validTiers.includes(newTier)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid support tier',
                validTiers: validTiers,
                poweredBy: 'Fakelit.com'
            });
        }

        const client = await wordpressService.upgradeSupport(clientId, newTier);

        res.json({
            success: true,
            message: 'Support tier upgraded successfully',
            client: client,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Upgrade support error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upgrade support tier',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get WordPress statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await wordpressService.getWordPressStats();

        if (stats) {
            res.json({
                success: true,
                stats: stats,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get WordPress statistics',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get WordPress stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WordPress statistics',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get theme by ID
router.get('/themes/:themeId', async (req, res) => {
    try {
        const { themeId } = req.params;
        const themes = await wordpressService.getThemes();
        const theme = themes.find(t => t.id === themeId);

        if (theme) {
            res.json({
                success: true,
                theme: theme,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Theme not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get theme error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get theme',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get site by ID
router.get('/sites/:siteId', async (req, res) => {
    try {
        const { siteId } = req.params;
        const sites = await wordpressService.getWordPressSites();
        const site = sites.find(s => s.id === siteId);

        if (site) {
            res.json({
                success: true,
                site: site,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Site not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get site error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get site',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get client server by ID
router.get('/client-servers/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const clients = await wordpressService.getClientServers();
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
                message: 'Client server not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get client server error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get client server',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update theme
router.put('/themes/:themeId', async (req, res) => {
    try {
        const { themeId } = req.params;
        const updates = req.body;

        // This would require additional implementation in the service
        // For now, return a placeholder response
        res.json({
            success: true,
            message: 'Theme update functionality coming soon',
            themeId: themeId,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update theme error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update theme',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update site
router.put('/sites/:siteId', async (req, res) => {
    try {
        const { siteId } = req.params;
        const updates = req.body;

        // This would require additional implementation in the service
        // For now, return a placeholder response
        res.json({
            success: true,
            message: 'Site update functionality coming soon',
            siteId: siteId,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update site error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update site',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update client server
router.put('/client-servers/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const updates = req.body;

        // This would require additional implementation in the service
        // For now, return a placeholder response
        res.json({
            success: true,
            message: 'Client server update functionality coming soon',
            clientId: clientId,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update client server error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update client server',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 