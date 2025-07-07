const express = require('express');
const { body, validationResult } = require('express-validator');
const AIChatService = require('../services/aiChatService');
const { crisisDetectionMiddleware } = require('../middleware/crisisDetection');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const aiChatService = new AIChatService();

// In-memory conversation storage (replace with database in production)
const conversations = new Map();

// Validation middleware
const validateChatRequest = [
  body('message').notEmpty().withMessage('Message is required'),
  body('language').optional().isString().withMessage('Language must be a string'),
  body('anonymous').optional().isBoolean().withMessage('Anonymous must be a boolean')
];

// Main chat endpoint
router.post('/:serviceType', 
  authenticateToken, // Require authentication
  validateChatRequest,
  crisisDetectionMiddleware,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { serviceType } = req.params;
      const { message, language = 'en', anonymous = false } = req.body;
      const sessionId = req.sessionId || req.headers['x-session-id'] || 'anonymous';

      // Get conversation history
      const conversationHistory = conversations.get(sessionId) || [];

      // If crisis detected, return crisis response immediately
      if (req.crisisResponse) {
        return res.json({
          response: req.crisisResponse.message,
          crisisLevel: req.crisisAnalysis.crisisLevel,
          requiresEscalation: req.crisisResponse.escalationRequired,
          priority: req.crisisResponse.priority,
          aiGenerated: false,
          resources: aiChatService.getCrisisResources(req.crisisAnalysis.crisisLevel),
          sessionId
        });
      }

      // Get AI response
      const aiResponse = await aiChatService.chat(message, serviceType, {
        conversationHistory,
        language,
        anonymous,
        sessionId
      });

      // Update conversation history
      conversationHistory.push(
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: aiResponse.response, timestamp: new Date().toISOString() }
      );

      // Keep only last 20 messages to manage memory
      if (conversationHistory.length > 20) {
        conversationHistory.splice(0, conversationHistory.length - 20);
      }

      conversations.set(sessionId, conversationHistory);

      res.json({
        ...aiResponse,
        sessionId
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
);

// 24/7 instant support endpoint
router.post('/talk-now', 
  // optionalAuth, // Optional authentication for crisis support - temporarily disabled for debugging
  [body('message').notEmpty().withMessage('Message is required')],
  crisisDetectionMiddleware,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { message, language = 'en' } = req.body;
      const sessionId = req.sessionId || req.headers['x-session-id'] || 'anonymous';

      // Auto-detect service type based on message content
      const serviceType = detectServiceType(message);

      // Get conversation history
      const conversationHistory = conversations.get(sessionId) || [];

      // If crisis detected, return crisis response immediately
      if (req.crisisResponse) {
        return res.json({
          response: req.crisisResponse.message,
          crisisLevel: req.crisisAnalysis.crisisLevel,
          requiresEscalation: req.crisisResponse.escalationRequired,
          priority: req.crisisResponse.priority,
          aiGenerated: false,
          resources: aiChatService.getCrisisResources(req.crisisAnalysis.crisisLevel),
          sessionId,
          suggestedServiceType: serviceType
        });
      }

      // Get AI response
      const aiResponse = await aiChatService.chat(message, serviceType, {
        conversationHistory,
        language,
        anonymous: true,
        sessionId
      });

      // Update conversation history
      conversationHistory.push(
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: aiResponse.response, timestamp: new Date().toISOString() }
      );

      conversations.set(sessionId, conversationHistory);

      res.json({
        ...aiResponse,
        sessionId,
        suggestedServiceType: serviceType
      });

    } catch (error) {
      console.error('Talk now error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
);

// Pre-session check-in endpoint
router.post('/pre-session', 
  [
    body('concerns').notEmpty().withMessage('Concerns are required'),
    body('goals').optional().isString().withMessage('Goals must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { concerns, goals = '' } = req.body;
      const userId = req.user?.id || req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({ error: 'User ID required for pre-session check-in' });
      }

      const checkIn = await aiChatService.preSessionCheckIn(userId, concerns, goals);

      res.json(checkIn);

    } catch (error) {
      console.error('Pre-session error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
);

// Post-session follow-up endpoint
router.post('/post-session', 
  [
    body('sessionNotes').notEmpty().withMessage('Session notes are required'),
    body('mood').notEmpty().withMessage('Current mood is required'),
    body('nextSteps').optional().isString().withMessage('Next steps must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { sessionNotes, mood, nextSteps = '' } = req.body;
      const userId = req.user?.id || req.headers['x-user-id'];

      if (!userId) {
        return res.status(401).json({ error: 'User ID required for post-session follow-up' });
      }

      const followUp = await aiChatService.postSessionFollowUp(userId, sessionNotes, mood, nextSteps);

      res.json(followUp);

    } catch (error) {
      console.error('Post-session error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
);

// Get conversation history
router.get('/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversation = conversations.get(sessionId) || [];
  
  res.json({
    sessionId,
    conversation,
    messageCount: conversation.length
  });
});

// Clear conversation history
router.delete('/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  conversations.delete(sessionId);
  
  res.json({
    message: 'Conversation cleared successfully',
    sessionId
  });
});

// Service type detection based on message content
function detectServiceType(message) {
  const lowerMessage = message.toLowerCase();
  
  // Mental health keywords
  if (lowerMessage.includes('anxiety') || lowerMessage.includes('depression') || 
      lowerMessage.includes('stress') || lowerMessage.includes('panic') ||
      lowerMessage.includes('mood') || lowerMessage.includes('feeling')) {
    return 'mental-health';
  }
  
  // Drug & alcohol keywords
  if (lowerMessage.includes('alcohol') || lowerMessage.includes('drug') ||
      lowerMessage.includes('substance') || lowerMessage.includes('addiction') ||
      lowerMessage.includes('recovery') || lowerMessage.includes('relapse')) {
    return 'drug-alcohol';
  }
  
  // Social & family keywords
  if (lowerMessage.includes('relationship') || lowerMessage.includes('family') ||
      lowerMessage.includes('partner') || lowerMessage.includes('marriage') ||
      lowerMessage.includes('communication') || lowerMessage.includes('conflict')) {
    return 'social-family';
  }
  
  // Career & school keywords
  if (lowerMessage.includes('work') || lowerMessage.includes('job') ||
      lowerMessage.includes('career') || lowerMessage.includes('school') ||
      lowerMessage.includes('study') || lowerMessage.includes('academic')) {
    return 'career-school';
  }
  
  // Default to mental health for general emotional support
  return 'mental-health';
}

module.exports = router; 