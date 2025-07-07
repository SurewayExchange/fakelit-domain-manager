const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const HeyGenAvatarService = require('../services/heygenAvatarService');

// Initialize HeyGen avatar service
const heygenService = new HeyGenAvatarService();

// Validation middleware
const validateSessionRequest = [
    body('counselorId').isString().notEmpty().withMessage('Counselor ID is required'),
    body('sessionId').optional().isString().withMessage('Session ID must be a string')
];

const validateSpeakRequest = [
    body('text').isString().notEmpty().withMessage('Text is required'),
    body('emotion').optional().isString().withMessage('Emotion must be a string'),
    body('expression').optional().isString().withMessage('Expression must be a string'),
    body('gesture').optional().isString().withMessage('Gesture must be a string'),
    body('speed').optional().isFloat({ min: 0.5, max: 2.0 }).withMessage('Speed must be between 0.5 and 2.0'),
    body('pitch').optional().isFloat({ min: 0.5, max: 2.0 }).withMessage('Pitch must be between 0.5 and 2.0')
];

const validateMessageRequest = [
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('context').optional().isObject().withMessage('Context must be an object')
];

// Create new avatar session
router.post('/session', validateSessionRequest, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { counselorId, sessionId } = req.body;
        const session = await heygenService.createAvatarSession(counselorId, sessionId);

        res.json({
            success: true,
            session: {
                id: session.id,
                counselorId: session.counselorId,
                counselorName: session.counselorConfig.name,
                specialty: session.counselorConfig.specialty,
                status: session.status,
                createdAt: session.createdAt
            }
        });

    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get session information
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = heygenService.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            session: {
                id: session.id,
                counselorId: session.counselorId,
                counselorName: session.counselorConfig.name,
                specialty: session.counselorConfig.specialty,
                status: session.status,
                avatarState: session.avatarState,
                messageCount: session.messages.length,
                lastActivity: session.lastActivity
            }
        });

    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Make avatar speak
router.post('/session/:sessionId/speak', validateSpeakRequest, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { sessionId } = req.params;
        const { text, emotion, expression, gesture, speed, pitch } = req.body;

        const result = await heygenService.speak(sessionId, text, {
            emotion,
            expression,
            gesture,
            speed,
            pitch
        });

        res.json({
            success: true,
            result: result,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('Speak error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate AI response and speak
router.post('/session/:sessionId/chat', validateMessageRequest, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { sessionId } = req.params;
        const { message, context } = req.body;

        const result = await heygenService.generateAndSpeak(sessionId, message, context);

        res.json({
            success: true,
            result: result
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get session messages
router.get('/session/:sessionId/messages', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = heygenService.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            messages: session.messages
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get avatar state
router.get('/session/:sessionId/state', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = heygenService.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            avatarState: session.avatarState,
            streamingData: {
                isConnected: session.streamingData.isConnected,
                streamId: session.streamingData.streamId
            }
        });

    } catch (error) {
        console.error('Get state error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get counselor configurations
router.get('/counselors', async (req, res) => {
    try {
        const configs = heygenService.getCounselorConfigs();
        
        const counselors = Object.entries(configs).map(([id, config]) => ({
            id: id,
            name: config.name,
            specialty: config.specialty,
            personality: config.personality,
            avatarUrl: config.avatarUrl,
            description: config.description,
            greeting: config.greeting
        }));

        res.json({
            success: true,
            counselors: counselors
        });

    } catch (error) {
        console.error('Get counselors error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get specific counselor configuration
router.get('/counselors/:counselorId', async (req, res) => {
    try {
        const { counselorId } = req.params;
        const config = heygenService.getCounselorConfig(counselorId);

        if (!config) {
            return res.status(404).json({
                success: false,
                error: 'Counselor not found'
            });
        }

        res.json({
            success: true,
            counselor: {
                id: counselorId,
                name: config.name,
                specialty: config.specialty,
                personality: config.personality,
                avatarUrl: config.avatarUrl,
                description: config.description,
                greeting: config.greeting,
                voiceId: config.voiceId
            }
        });

    } catch (error) {
        console.error('Get counselor error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all active sessions
router.get('/sessions', async (req, res) => {
    try {
        const sessions = heygenService.getAllSessions();
        
        const sessionList = sessions.map(session => ({
            id: session.id,
            counselorId: session.counselorId,
            counselorName: session.counselorConfig.name,
            status: session.status,
            messageCount: session.messages.length,
            lastActivity: session.lastActivity,
            createdAt: session.createdAt
        }));

        res.json({
            success: true,
            sessions: sessionList
        });

    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Clean up session
router.delete('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        await heygenService.cleanupSession(sessionId);

        res.json({
            success: true,
            message: 'Session cleaned up successfully'
        });

    } catch (error) {
        console.error('Cleanup session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
router.get('/health', async (req, res) => {
    try {
        const health = await heygenService.healthCheck();
        res.json(health);

    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'unhealthy',
            service: 'HeyGen Avatar Service',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test endpoint for development
router.post('/test', async (req, res) => {
    try {
        const { counselorId, text } = req.body;
        
        // Create a test session
        const session = await heygenService.createAvatarSession(counselorId);
        
        // Make avatar speak
        const result = await heygenService.speak(session.id, text || "Hello! This is a test of the HeyGen avatar system.");
        
        // Clean up
        await heygenService.cleanupSession(session.id);

        res.json({
            success: true,
            test: {
                sessionId: session.id,
                counselorName: session.counselorConfig.name,
                result: result
            }
        });

    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 