const express = require('express');
const router = express.Router();
const FakelitChatbotService = require('../services/fakelitChatbotService');

const chatbotService = new FakelitChatbotService();

// Middleware to add Fakelit.com branding
const addFakelitBranding = (req, res, next) => {
    res.setHeader('X-Powered-By', 'Fakelit.com');
    next();
};

router.use(addFakelitBranding);

/**
 * @route POST /api/fakelit-chatbot/chat
 * @desc Send a message to the Fakelit.com AI chatbot
 * @access Public
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, userId, sessionId } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Message is required and must be a string',
                poweredBy: 'Fakelit.com'
            });
        }

        console.log(`🤖 Fakelit.com Chatbot: Processing message from user ${userId || 'anonymous'}`);

        const response = await chatbotService.processMessage(userId, message, sessionId);

        res.json({
            success: true,
            data: response,
            poweredBy: 'Fakelit.com',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Fakelit chatbot route error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process chatbot message',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * @route GET /api/fakelit-chatbot/faq
 * @desc Get FAQ responses for common questions
 * @access Public
 */
router.get('/faq', (req, res) => {
    try {
        const faqResponses = chatbotService.getFaqResponses();
        
        res.json({
            success: true,
            data: {
                faqs: faqResponses,
                total: Object.keys(faqResponses).length
            },
            poweredBy: 'Fakelit.com',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('FAQ route error:', error);
        res.status(500).json({
            error: 'Internal server error',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * @route GET /api/fakelit-chatbot/quick-responses
 * @desc Get quick response suggestions
 * @access Public
 */
router.get('/quick-responses', (req, res) => {
    try {
        const quickResponses = chatbotService.getQuickResponses();
        
        res.json({
            success: true,
            data: {
                suggestions: quickResponses,
                total: quickResponses.length
            },
            poweredBy: 'Fakelit.com',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Quick responses route error:', error);
        res.status(500).json({
            error: 'Internal server error',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * @route POST /api/fakelit-chatbot/clear-history
 * @desc Clear conversation history for a user
 * @access Public
 */
router.post('/clear-history', (req, res) => {
    try {
        const { userId, sessionId } = req.body;

        if (!userId && !sessionId) {
            return res.status(400).json({
                error: 'Either userId or sessionId is required',
                poweredBy: 'Fakelit.com'
            });
        }

        chatbotService.clearHistory(userId, sessionId);

        res.json({
            success: true,
            message: 'Conversation history cleared successfully',
            poweredBy: 'Fakelit.com',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Clear history route error:', error);
        res.status(500).json({
            error: 'Internal server error',
            poweredBy: 'Fakelit.com'
        });
    }
});

/**
 * @route GET /api/fakelit-chatbot/status
 * @desc Get chatbot status and capabilities
 * @access Public
 */
router.get('/status', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                status: 'online',
                service: 'Fakelit.com AI Assistant',
                capabilities: [
                    'Site-related questions',
                    'Integration support',
                    'Domain management assistance',
                    'Deployment guidance',
                    'API documentation'
                ],
                restrictions: [
                    'No mental health advice',
                    'No medical advice',
                    'No legal advice',
                    'No financial advice',
                    'Site and integration questions only'
                ],
                poweredBy: 'Fakelit.com',
                version: '1.0.0'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Status route error:', error);
        res.status(500).json({
            error: 'Internal server error',
            poweredBy: 'Fakelit.com'
        });
    }
});

module.exports = router; 