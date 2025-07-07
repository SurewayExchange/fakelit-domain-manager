const express = require('express');
const router = express.Router();
const EmailAutomationService = require('../services/emailAutomation');

const emailService = new EmailAutomationService();

// Contact form submission
router.post('/contact', async (req, res) => {
    try {
        const { firstName, lastName, email, company, service, budget, message } = req.body;
        
        // Send automated reply to customer
        await emailService.sendAutomatedReply('inquiry', email, {
            recipientName: firstName,
            serviceInterest: service || 'General Inquiry',
            company: company || 'Not specified',
            budget: budget || 'Not specified',
            message: message || 'No message provided'
        });
        
        // Send notification to sales team
        await emailService.sendAutomatedReply('inquiry', 'sales@fakelit.com', {
            recipientName: 'Sales Team',
            customerName: `${firstName} ${lastName}`,
            customerEmail: email,
            company: company || 'Not specified',
            serviceInterest: service || 'General Inquiry',
            budget: budget || 'Not specified',
            message: message || 'No message provided'
        });
        
        res.json({
            success: true,
            message: 'Thank you for your inquiry! We will respond within 2 hours.',
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Email automation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email. Please try again or contact us directly.',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Quote request
router.post('/quote', async (req, res) => {
    try {
        const { firstName, lastName, email, serviceType, packageName, setupFee, monthlyFee, additionalFeatures } = req.body;
        
        // Send quote to customer
        await emailService.sendAutomatedReply('quote', email, {
            recipientName: firstName,
            serviceType: serviceType || 'Web Hosting',
            packageName: packageName || 'Professional Package',
            setupFee: setupFee || '250',
            monthlyFee: monthlyFee || '199',
            additionalFeatures: additionalFeatures || 'Standard features included',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
        
        res.json({
            success: true,
            message: 'Your quote has been sent to your email address.',
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Quote email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send quote. Please try again.',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Support ticket creation
router.post('/support', async (req, res) => {
    try {
        const { firstName, lastName, email, category, priority, subject, message } = req.body;
        const ticketId = 'TKT-' + Date.now();
        
        // Send confirmation to customer
        await emailService.sendAutomatedReply('support', email, {
            recipientName: firstName,
            ticketId: ticketId,
            priority: priority || 'Normal',
            category: category || 'General',
            status: 'Open',
            subject: subject || 'Support Request'
        });
        
        // Send notification to support team
        await emailService.sendAutomatedReply('support', 'support@fakelit.com', {
            recipientName: 'Support Team',
            ticketId: ticketId,
            customerName: `${firstName} ${lastName}`,
            customerEmail: email,
            priority: priority || 'Normal',
            category: category || 'General',
            status: 'New',
            subject: subject || 'Support Request',
            message: message || 'No message provided'
        });
        
        res.json({
            success: true,
            message: 'Support ticket created successfully. You will receive a confirmation email.',
            ticketId: ticketId,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Support email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create support ticket. Please try again.',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Order confirmation
router.post('/order', async (req, res) => {
    try {
        const { firstName, lastName, email, orderId, productName, totalAmount, setupTime } = req.body;
        
        await emailService.sendAutomatedReply('order', email, {
            recipientName: firstName,
            orderId: orderId || 'ORD-' + Date.now(),
            productName: productName || 'Professional Hosting Package',
            totalAmount: totalAmount || '199.00',
            orderDate: new Date().toLocaleDateString(),
            setupTime: setupTime || '24-48 hours'
        });
        
        res.json({
            success: true,
            message: 'Order confirmation sent to your email address.',
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Order email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send order confirmation. Please try again.',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Payment notification
router.post('/payment', async (req, res) => {
    try {
        const { firstName, lastName, email, paymentStatus, transactionId, amount, paymentMethod, statusDescription, nextSteps } = req.body;
        
        await emailService.sendAutomatedReply('payment', email, {
            recipientName: firstName,
            paymentStatus: paymentStatus || 'Processed',
            transactionId: transactionId || 'TXN-' + Date.now(),
            amount: amount || '199.00',
            paymentDate: new Date().toLocaleDateString(),
            paymentMethod: paymentMethod || 'Credit Card',
            statusDescription: statusDescription || 'Your payment has been processed successfully.',
            nextSteps: nextSteps || 'Your service will be activated within 24 hours.'
        });
        
        res.json({
            success: true,
            message: 'Payment notification sent successfully.',
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Payment email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send payment notification. Please try again.',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Server scaling notification
router.post('/scaling', async (req, res) => {
    try {
        const { firstName, lastName, email, previousCapacity, newCapacity, scalingReason, newMonthlyFee } = req.body;
        
        await emailService.sendAutomatedReply('scaling', email, {
            recipientName: firstName,
            previousCapacity: previousCapacity || '50',
            newCapacity: newCapacity || '150',
            scalingDate: new Date().toLocaleDateString(),
            scalingReason: scalingReason || 'Automatic scaling triggered due to increased usage',
            newMonthlyFee: newMonthlyFee || '399.00'
        });
        
        res.json({
            success: true,
            message: 'Scaling notification sent successfully.',
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Scaling email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send scaling notification. Please try again.',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Newsletter subscription
router.post('/newsletter', async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        
        await emailService.sendAutomatedReply('newsletter', email, {
            recipientName: firstName,
            newsletterTitle: 'Welcome to Fakelit.com Newsletter',
            updateTitle1: 'New Hosting Packages Available',
            updateContent1: 'We\'ve launched new hosting packages with enhanced features and competitive pricing.',
            updateLink1: 'https://fakelit.com/products',
            updateTitle2: 'Payment Processing Updates',
            updateContent2: 'Enhanced NMI terminal features and improved payment gateway integration.',
            updateLink2: 'https://fakelit.com/services',
            specialOffer: 'Get 25% off your first month with code NEWCUSTOMER25',
            unsubscribeLink: 'https://fakelit.com/unsubscribe'
        });
        
        res.json({
            success: true,
            message: 'Newsletter subscription confirmed. Welcome to Fakelit.com!',
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Newsletter email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send newsletter confirmation. Please try again.',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Welcome email for new customers
router.post('/welcome', async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        
        await emailService.sendAutomatedReply('welcome', email, {
            recipientName: firstName
        });
        
        res.json({
            success: true,
            message: 'Welcome email sent successfully.',
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Welcome email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send welcome email. Please try again.',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Test email endpoint
router.post('/test', async (req, res) => {
    try {
        const { email, template } = req.body;
        
        await emailService.sendAutomatedReply(template || 'welcome', email, {
            recipientName: 'Test User',
            serviceInterest: 'Test Service',
            company: 'Test Company',
            budget: 'Test Budget',
            message: 'This is a test message'
        });
        
        res.json({
            success: true,
            message: `Test email sent successfully using ${template || 'welcome'} template.`,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email. Please try again.',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 