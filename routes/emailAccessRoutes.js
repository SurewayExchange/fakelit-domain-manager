const express = require('express');
const router = express.Router();
const EmailAccessService = require('../services/emailAccessService');

const emailAccessService = new EmailAccessService();

// Get Fakelit.com email access details
router.get('/fakelit', async (req, res) => {
    try {
        const accessDetails = await emailAccessService.getFakelitEmailAccess();
        
        if (accessDetails) {
            res.json({
                success: true,
                accessDetails: accessDetails,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Fakelit.com email access details not found',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get Fakelit email access error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get Fakelit.com email access details',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get email access details for specific domain
router.get('/domain/:domainName', async (req, res) => {
    try {
        const { domainName } = req.params;
        const accessDetails = await emailAccessService.getDomainEmailAccess(domainName);
        
        if (accessDetails) {
            res.json({
                success: true,
                accessDetails: accessDetails,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(404).json({
                success: false,
                message: `Email access details not found for ${domainName}`,
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get domain email access error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get domain email access details',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get all domain email access details
router.get('/domains', async (req, res) => {
    try {
        const domainAccess = await emailAccessService.getAllDomainEmailAccess();
        
        res.json({
            success: true,
            domains: domainAccess,
            count: domainAccess.length,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get all domain email access error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get domain email access details',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get complete email access summary
router.get('/summary', async (req, res) => {
    try {
        const summary = await emailAccessService.getCompleteEmailAccessSummary();
        
        if (summary) {
            res.json({
                success: true,
                summary: summary,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get email access summary',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get email access summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get email access summary',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Generate email access details for new domain
router.post('/domain', async (req, res) => {
    try {
        const { domainName, clientId } = req.body;

        if (!domainName) {
            return res.status(400).json({
                success: false,
                message: 'Domain name is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const accessDetails = await emailAccessService.generateDomainEmailAccess(domainName, clientId);

        res.json({
            success: true,
            message: 'Email access details generated successfully',
            accessDetails: accessDetails,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Generate domain email access error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate domain email access details',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get email access instructions
router.get('/instructions/:domainName/:emailAddress', async (req, res) => {
    try {
        const { domainName, emailAddress } = req.params;
        
        const instructions = emailAccessService.generateEmailAccessInstructions(domainName, emailAddress);

        res.json({
            success: true,
            instructions: instructions,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get email access instructions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get email access instructions',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update email password
router.put('/password', async (req, res) => {
    try {
        const { domainName, emailAddress, newPassword } = req.body;

        if (!domainName || !emailAddress || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Domain name, email address, and new password are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const updatedEmail = await emailAccessService.updateEmailPassword(domainName, emailAddress, newPassword);

        res.json({
            success: true,
            message: 'Email password updated successfully',
            email: updatedEmail,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update email password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update email password',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get support contact information
router.get('/support', async (req, res) => {
    try {
        const supportInfo = emailAccessService.getSupportContactInfo();
        
        res.json({
            success: true,
            support: supportInfo,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get support info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get support contact information',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get webmail URLs
router.get('/webmail-urls', async (req, res) => {
    try {
        const fakelitAccess = await emailAccessService.getFakelitEmailAccess();
        const domainAccess = await emailAccessService.getAllDomainEmailAccess();

        const webmailUrls = {
            fakelit: {
                domain: 'fakelit.com',
                webmailUrl: 'https://webmail.fakelit.com',
                adminPanel: 'https://admin.fakelit.com'
            },
            domains: domainAccess.map(domain => ({
                domain: domain.domain,
                webmailUrl: domain.accessDetails.webmailUrl,
                adminPanel: domain.accessDetails.adminPanel
            }))
        };

        res.json({
            success: true,
            webmailUrls: webmailUrls,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get webmail URLs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get webmail URLs',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get email server settings
router.get('/server-settings/:domainName', async (req, res) => {
    try {
        const { domainName } = req.params;
        
        if (domainName === 'fakelit.com') {
            const fakelitAccess = await emailAccessService.getFakelitEmailAccess();
            if (fakelitAccess) {
                res.json({
                    success: true,
                    domain: 'fakelit.com',
                    settings: fakelitAccess.accessDetails,
                    poweredBy: 'Fakelit.com'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Fakelit.com settings not found',
                    poweredBy: 'Fakelit.com'
                });
            }
        } else {
            const domainAccess = await emailAccessService.getDomainEmailAccess(domainName);
            if (domainAccess) {
                res.json({
                    success: true,
                    domain: domainName,
                    settings: domainAccess.accessDetails,
                    poweredBy: 'Fakelit.com'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: `Settings not found for ${domainName}`,
                    poweredBy: 'Fakelit.com'
                });
            }
        }
    } catch (error) {
        console.error('Get server settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get server settings',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 