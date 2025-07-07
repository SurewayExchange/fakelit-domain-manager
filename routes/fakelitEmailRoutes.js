const express = require('express');
const router = express.Router();
const EmailService = require('../services/emailService');

const emailService = new EmailService();

// Get all Fakelit.com email addresses
router.get('/addresses', async (req, res) => {
    try {
        const emails = await emailService.getFakelitEmails();
        
        res.json({
            success: true,
            emails: emails,
            count: emails.length,
            maxEmails: emailService.getMaxEmailAddresses(),
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get Fakelit emails error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get Fakelit.com email addresses',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get email statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await emailService.getEmailStats();
        
        if (stats) {
            res.json({
                success: true,
                stats: stats,
                poweredBy: 'Fakelit.com'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get email statistics',
                poweredBy: 'Fakelit.com'
            });
        }
    } catch (error) {
        console.error('Get email stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get email statistics',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get support contact information
router.get('/support', async (req, res) => {
    try {
        const supportInfo = emailService.getSupportContactInfo();
        
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

// Create new email address
router.post('/addresses', async (req, res) => {
    try {
        const { emailAddress } = req.body;

        if (!emailAddress) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required',
                poweredBy: 'Fakelit.com'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@fakelit\.com$/;
        if (!emailRegex.test(emailAddress)) {
            return res.status(400).json({
                success: false,
                message: 'Email must be a valid Fakelit.com address',
                poweredBy: 'Fakelit.com'
            });
        }

        const newEmail = await emailService.createEmailAddress(emailAddress);

        res.json({
            success: true,
            message: 'Fakelit.com email address created successfully',
            email: newEmail,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Create email address error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create email address',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Update email forwarding
router.put('/addresses/:emailAddress/forwarding', async (req, res) => {
    try {
        const { emailAddress } = req.params;
        const { forwardingEmail } = req.body;

        if (!forwardingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Forwarding email is required',
                poweredBy: 'Fakelit.com'
            });
        }

        // Validate forwarding email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(forwardingEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid forwarding email format',
                poweredBy: 'Fakelit.com'
            });
        }

        const updatedEmail = await emailService.updateEmailForwarding(emailAddress, forwardingEmail);

        res.json({
            success: true,
            message: 'Email forwarding updated successfully',
            email: updatedEmail,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Update email forwarding error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update email forwarding',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Deactivate email address
router.put('/addresses/:emailAddress/deactivate', async (req, res) => {
    try {
        const { emailAddress } = req.params;

        const deactivatedEmail = await emailService.deactivateEmailAddress(emailAddress);

        res.json({
            success: true,
            message: 'Email address deactivated successfully',
            email: deactivatedEmail,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Deactivate email address error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to deactivate email address',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Send email through Fakelit.com
router.post('/send', async (req, res) => {
    try {
        const { fromEmail, toEmail, subject, content, options } = req.body;

        if (!fromEmail || !toEmail || !subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'From email, to email, subject, and content are required',
                poweredBy: 'Fakelit.com'
            });
        }

        // Validate sender email
        if (!emailService.isValidFakelitEmail(fromEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Fakelit.com sender email address',
                poweredBy: 'Fakelit.com'
            });
        }

        const result = await emailService.sendEmail(fromEmail, toEmail, subject, content, options);

        res.json({
            success: true,
            message: 'Email sent successfully',
            result: result,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send email',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Get company information
router.get('/company-info', async (req, res) => {
    try {
        const companyInfo = emailService.getCompanyInfo();
        
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

// Get forwarding email
router.get('/forwarding-email', async (req, res) => {
    try {
        const forwardingEmail = emailService.getForwardingEmail();
        
        res.json({
            success: true,
            forwardingEmail: forwardingEmail,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Get forwarding email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get forwarding email',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Validate Fakelit.com email address
router.post('/validate', async (req, res) => {
    try {
        const { emailAddress } = req.body;

        if (!emailAddress) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required',
                poweredBy: 'Fakelit.com'
            });
        }

        const isValid = emailService.isValidFakelitEmail(emailAddress);

        res.json({
            success: true,
            isValid: isValid,
            emailAddress: emailAddress,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Validate email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate email address',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 