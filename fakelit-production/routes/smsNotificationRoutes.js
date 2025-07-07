const express = require('express');
const router = express.Router();
const SMSNotificationService = require('../services/smsNotificationService');

const smsNotificationService = new SMSNotificationService();

// Send SMS notification
router.post('/send', async (req, res) => {
    try {
        const { toNumber, message, template, data } = req.body;

        if (!toNumber || (!message && !template)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and message or template are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.sendSMS(toNumber, message, template, data);

        res.json({
            success: result.success,
            message: result.success ? 'SMS sent successfully' : 'Failed to send SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Send SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Email system SMS notifications
router.post('/email/received', async (req, res) => {
    try {
        const { emailAddress, sender, subject } = req.body;

        if (!emailAddress || !sender || !subject) {
            return res.status(400).json({
                success: false,
                message: 'Email address, sender, and subject are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyEmailReceived(emailAddress, sender, subject);

        res.json({
            success: result.success,
            message: result.success ? 'Email notification SMS sent' : 'Failed to send email notification SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Email received SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email received SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Fakelit email notifications
router.post('/fakelit-email', async (req, res) => {
    try {
        const { from, to, subject } = req.body;

        if (!from || !to || !subject) {
            return res.status(400).json({
                success: false,
                message: 'From, to, and subject are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyFakelitEmail(from, to, subject);

        res.json({
            success: result.success,
            message: result.success ? 'Fakelit email notification SMS sent' : 'Failed to send Fakelit email SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Fakelit email SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send Fakelit email SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.post('/domain/purchase', async (req, res) => {
    try {
        const { domainName } = req.body;

        if (!domainName) {
            return res.status(400).json({
                success: false,
                message: 'Domain name is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyDomainPurchase(domainName);

        res.json({
            success: result.success,
            message: result.success ? 'Domain purchase notification SMS sent' : 'Failed to send domain purchase SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Domain purchase SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send domain purchase SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.post('/email/setup', async (req, res) => {
    try {
        const { domainName, webmailUrl } = req.body;

        if (!domainName || !webmailUrl) {
            return res.status(400).json({
                success: false,
                message: 'Domain name and webmail URL are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyEmailSetup(domainName, webmailUrl);

        res.json({
            success: result.success,
            message: result.success ? 'Email setup notification SMS sent' : 'Failed to send email setup SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Email setup SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email setup SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Ticketing system SMS notifications
router.post('/ticket/new', async (req, res) => {
    try {
        const { ticketId, customer, priority } = req.body;

        if (!ticketId || !customer || !priority) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID, customer, and priority are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyNewTicket(ticketId, customer, priority);

        res.json({
            success: result.success,
            message: result.success ? 'New ticket notification SMS sent' : 'Failed to send new ticket SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('New ticket SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send new ticket SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.post('/ticket/update', async (req, res) => {
    try {
        const { ticketId, status, message } = req.body;

        if (!ticketId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID and status are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyTicketUpdate(ticketId, status, message);

        res.json({
            success: result.success,
            message: result.success ? 'Ticket update notification SMS sent' : 'Failed to send ticket update SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Ticket update SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send ticket update SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.post('/ticket/resolved', async (req, res) => {
    try {
        const { ticketId, agent, customer } = req.body;

        if (!ticketId || !agent || !customer) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID, agent, and customer are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyTicketResolved(ticketId, agent, customer);

        res.json({
            success: result.success,
            message: result.success ? 'Ticket resolved notification SMS sent' : 'Failed to send ticket resolved SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Ticket resolved SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send ticket resolved SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.post('/ticket/escalated', async (req, res) => {
    try {
        const { ticketId, level, customer } = req.body;

        if (!ticketId || !level || !customer) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID, level, and customer are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyTicketEscalated(ticketId, level, customer);

        res.json({
            success: result.success,
            message: result.success ? 'Ticket escalated notification SMS sent' : 'Failed to send ticket escalated SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Ticket escalated SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send ticket escalated SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

// System notifications
router.post('/server/alert', async (req, res) => {
    try {
        const { message, server } = req.body;

        if (!message || !server) {
            return res.status(400).json({
                success: false,
                message: 'Message and server are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyServerAlert(message, server);

        res.json({
            success: result.success,
            message: result.success ? 'Server alert SMS sent' : 'Failed to send server alert SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Server alert SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send server alert SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.post('/billing/alert', async (req, res) => {
    try {
        const { message, account, amount } = req.body;

        if (!message || !account || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Message, account, and amount are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifyBillingAlert(message, account, amount);

        res.json({
            success: result.success,
            message: result.success ? 'Billing alert SMS sent' : 'Failed to send billing alert SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Billing alert SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send billing alert SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.post('/security/alert', async (req, res) => {
    try {
        const { message, account } = req.body;

        if (!message || !account) {
            return res.status(400).json({
                success: false,
                message: 'Message and account are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.notifySecurityAlert(message, account);

        res.json({
            success: result.success,
            message: result.success ? 'Security alert SMS sent' : 'Failed to send security alert SMS',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Security alert SMS error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send security alert SMS notification',
            poweredBy: 'Fakelit.com'
        });
    }
});

// SMS management
router.get('/stats', async (req, res) => {
    try {
        const stats = await smsNotificationService.getSMSStats();

        if (stats) {
            res.json({
                success: true,
                stats: stats,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get SMS statistics',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get SMS stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get SMS statistics',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.get('/templates', async (req, res) => {
    try {
        const templates = smsNotificationService.getNotificationTemplates();

        res.json({
            success: true,
            templates: templates,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notification templates',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.post('/templates', async (req, res) => {
    try {
        const { name, template, priority } = req.body;

        if (!name || !template) {
            return res.status(400).json({
                success: false,
                message: 'Template name and template content are required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.addNotificationTemplate(name, template, priority);

        res.json({
            success: result.success,
            message: result.success ? 'Template added successfully' : 'Failed to add template',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Add template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add notification template',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.put('/config', async (req, res) => {
    try {
        const { enabled, fromNumber, accountSid, authToken } = req.body;

        const newConfig = {};
        if (enabled !== undefined) newConfig.enabled = enabled;
        if (fromNumber) newConfig.fromNumber = fromNumber;
        if (accountSid) newConfig.accountSid = accountSid;
        if (authToken) newConfig.authToken = authToken;

        const result = await smsNotificationService.updateSMSConfig(newConfig);

        res.json({
            success: result.success,
            message: result.success ? 'SMS configuration updated' : 'Failed to update SMS configuration',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update SMS config error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update SMS configuration',
            poweredBy: 'Fakelit.com'
        });
    }
});

router.post('/toggle', async (req, res) => {
    try {
        const { enabled } = req.body;

        if (enabled === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Enabled status is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await smsNotificationService.toggleSMSNotifications(enabled);

        res.json({
            success: result.success,
            message: result.success ? `SMS notifications ${enabled ? 'enabled' : 'disabled'}` : 'Failed to toggle SMS notifications',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Toggle SMS notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle SMS notifications',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 