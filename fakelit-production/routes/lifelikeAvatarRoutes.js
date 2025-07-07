const express = require('express');
const router = express.Router();
const LifelikeAvatarService = require('../services/lifelikeAvatarService');

// Initialize the lifelike avatar service
const lifelikeAvatarService = new LifelikeAvatarService();

// Create a new lifelike avatar session
router.post('/create', async (req, res) => {
    try {
        const { counselorId, sessionId } = req.body;
        
        if (!counselorId) {
            return res.status(400).json({ error: 'Counselor ID is required' });
        }
        
        const result = await lifelikeAvatarService.createLifelikeAvatar(
            counselorId, 
            sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        );
        
        res.json(result);
        
    } catch (error) {
        console.error('Error creating lifelike avatar:', error);
        res.status(500).json({ error: error.message });
    }
});

// Process a message and get lifelike response
router.post('/message', async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        
        if (!sessionId || !message) {
            return res.status(400).json({ error: 'Session ID and message are required' });
        }
        
        const result = await lifelikeAvatarService.processMessage(sessionId, message);
        res.json(result);
        
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Make avatar speak with voice synthesis
router.post('/speak', async (req, res) => {
    try {
        const { sessionId, text, context } = req.body;
        
        if (!sessionId || !text) {
            return res.status(400).json({ error: 'Session ID and text are required' });
        }
        
        const avatar = lifelikeAvatarService.avatars.get(sessionId);
        if (!avatar) {
            return res.status(404).json({ error: 'Avatar session not found' });
        }
        
        const result = await lifelikeAvatarService.speak(avatar, text, context || 'general');
        res.json(result);
        
    } catch (error) {
        console.error('Error speaking:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get avatar state
router.get('/state/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const state = lifelikeAvatarService.getAvatarState(sessionId);
        if (!state) {
            return res.status(404).json({ error: 'Avatar session not found' });
        }
        
        res.json({ success: true, state });
        
    } catch (error) {
        console.error('Error getting avatar state:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update avatar expression
router.post('/expression', async (req, res) => {
    try {
        const { sessionId, expression, context, emotion, intensity } = req.body;
        
        if (!sessionId || !expression) {
            return res.status(400).json({ error: 'Session ID and expression are required' });
        }
        
        const avatar = lifelikeAvatarService.avatars.get(sessionId);
        if (!avatar) {
            return res.status(404).json({ error: 'Avatar session not found' });
        }
        
        const generatedExpression = lifelikeAvatarService.expressionEngine.generateExpression(
            context || 'general',
            emotion || 'neutral',
            intensity || 0.5
        );
        
        avatar.currentExpression = generatedExpression;
        
        res.json({
            success: true,
            expression: generatedExpression,
            avatarState: {
                currentExpression: avatar.currentExpression,
                currentEmotion: avatar.currentEmotion
            }
        });
        
    } catch (error) {
        console.error('Error updating expression:', error);
        res.status(500).json({ error: error.message });
    }
});

// Analyze text emotion
router.post('/analyze-emotion', (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        const analysis = lifelikeAvatarService.emotionAnalyzer.analyzeText(text);
        
        res.json({
            success: true,
            analysis
        });
        
    } catch (error) {
        console.error('Error analyzing emotion:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get counselor configuration
router.get('/counselor/:counselorId', (req, res) => {
    try {
        const { counselorId } = req.params;
        
        const config = lifelikeAvatarService.getCounselorConfig(counselorId);
        
        res.json({
            success: true,
            counselorId,
            config
        });
        
    } catch (error) {
        console.error('Error getting counselor config:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all available counselors
router.get('/counselors', (req, res) => {
    try {
        const counselors = [
            'dr-sarah-mitchell',
            'michael-rodriguez',
            'dr-emily-chen',
            'james-williams',
            'dr-maria-garcia',
            'lisa-thompson'
        ];
        
        const counselorConfigs = counselors.map(id => ({
            id,
            config: lifelikeAvatarService.getCounselorConfig(id)
        }));
        
        res.json({
            success: true,
            counselors: counselorConfigs
        });
        
    } catch (error) {
        console.error('Error getting counselors:', error);
        res.status(500).json({ error: error.message });
    }
});

// Clean up avatar session
router.post('/cleanup', (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }
        
        const result = lifelikeAvatarService.cleanupSession(sessionId);
        res.json(result);
        
    } catch (error) {
        console.error('Error cleaning up session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check for lifelike avatar service
router.get('/health', (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            activeSessions: lifelikeAvatarService.avatars.size,
            services: {
                voiceService: !!lifelikeAvatarService.voiceService,
                expressionEngine: !!lifelikeAvatarService.expressionEngine,
                emotionAnalyzer: !!lifelikeAvatarService.emotionAnalyzer
            }
        };
        
        res.json(health);
        
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ 
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get service statistics
router.get('/stats', (req, res) => {
    try {
        const stats = {
            totalSessions: lifelikeAvatarService.avatars.size,
            activeSessions: Array.from(lifelikeAvatarService.avatars.values()).filter(
                avatar => Date.now() - avatar.lastInteraction < 300000 // 5 minutes
            ).length,
            counselors: Array.from(lifelikeAvatarService.avatars.values()).reduce((acc, avatar) => {
                acc[avatar.counselorId] = (acc[avatar.counselorId] || 0) + 1;
                return acc;
            }, {}),
            averageSessionDuration: this.calculateAverageSessionDuration(),
            totalMessages: this.calculateTotalMessages(),
            totalExpressions: this.calculateTotalExpressions()
        };
        
        res.json({
            success: true,
            stats
        });
        
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper methods for statistics
function calculateAverageSessionDuration() {
    const sessions = Array.from(lifelikeAvatarService.avatars.values());
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce((sum, session) => {
        return sum + (Date.now() - session.lastInteraction);
    }, 0);
    
    return Math.round(totalDuration / sessions.length / 1000); // in seconds
}

function calculateTotalMessages() {
    return Array.from(lifelikeAvatarService.avatars.values()).reduce((sum, session) => {
        return sum + session.sessionData.messages.length;
    }, 0);
}

function calculateTotalExpressions() {
    return Array.from(lifelikeAvatarService.avatars.values()).reduce((sum, session) => {
        return sum + session.sessionData.expressions.length;
    }, 0);
}

module.exports = router; 