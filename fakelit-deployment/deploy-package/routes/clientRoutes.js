const express = require('express');
const { body, validationResult } = require('express-validator');
const AIChatService = require('../services/aiChatService');

const router = express.Router();
const aiChatService = new AIChatService();

// Validation middleware
const validateClientRequest = [
  body('message').notEmpty().withMessage('Message is required'),
  body('serviceType').isIn(['mental-health', 'drug-alcohol', 'social-family', 'career-school']).withMessage('Invalid service type'),
  body('language').optional().isString().withMessage('Language must be a string')
];

// Client chat endpoint with conversation persistence
router.post('/chat', validateClientRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { message, serviceType, language = 'en', conversationId = null } = req.body;
    const clientId = req.headers['x-client-id'] || req.user?.id || 'anonymous';

    const chatResponse = await aiChatService.chat(message, serviceType, {
      conversationId,
      clientId,
      language,
      anonymous: false
    });

    res.json(chatResponse);

  } catch (error) {
    console.error('Client chat error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get client's conversation history
router.get('/conversations', async (req, res) => {
  try {
    const clientId = req.headers['x-client-id'] || req.user?.id;
    
    if (!clientId) {
      return res.status(401).json({ error: 'Client ID required' });
    }

    const conversations = aiChatService.getClientConversations(clientId);
    
    res.json({
      clientId,
      conversations: conversations.map(conv => ({
        id: conv.id,
        serviceType: conv.serviceType,
        counselorId: conv.counselorId,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        sessionCount: conv.sessionCount,
        totalMessages: conv.totalMessages,
        status: conv.status,
        recentTopics: conv.recentTopics || []
      }))
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get specific conversation with messages
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const clientId = req.headers['x-client-id'] || req.user?.id;

    if (!clientId) {
      return res.status(401).json({ error: 'Client ID required' });
    }

    const conversation = aiChatService.conversationModel.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify client owns this conversation
    if (conversation.clientId !== clientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get counselor info
    const counselor = aiChatService.getCounselor(conversation.counselorId);

    res.json({
      conversation: {
        id: conversation.id,
        serviceType: conversation.serviceType,
        counselor: counselor ? {
          id: counselor.id,
          name: counselor.name,
          title: counselor.title,
          avatar: counselor.avatar,
          specialization: counselor.specialization
        } : null,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        sessionCount: conversation.sessionCount,
        totalMessages: conversation.totalMessages,
        status: conversation.status,
        goals: conversation.goals,
        progress: conversation.progress
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get conversation summary for follow-up
router.get('/conversations/:conversationId/summary', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const clientId = req.headers['x-client-id'] || req.user?.id;

    if (!clientId) {
      return res.status(401).json({ error: 'Client ID required' });
    }

    const conversation = aiChatService.conversationModel.getConversation(conversationId);
    
    if (!conversation || conversation.clientId !== clientId) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const summary = await aiChatService.getConversationSummary(conversationId);
    
    res.json(summary);

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Update conversation goals
router.put('/conversations/:conversationId/goals', [
  body('goals').isArray().withMessage('Goals must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { conversationId } = req.params;
    const { goals } = req.body;
    const clientId = req.headers['x-client-id'] || req.user?.id;

    if (!clientId) {
      return res.status(401).json({ error: 'Client ID required' });
    }

    const conversation = aiChatService.conversationModel.getConversation(conversationId);
    
    if (!conversation || conversation.clientId !== clientId) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const updatedGoals = aiChatService.conversationModel.updateGoals(conversationId, goals);
    
    res.json({
      conversationId,
      goals: updatedGoals,
      message: 'Goals updated successfully'
    });

  } catch (error) {
    console.error('Update goals error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get available counselors
router.get('/counselors', async (req, res) => {
  try {
    const { specialization } = req.query;
    
    let counselors;
    if (specialization) {
      counselors = aiChatService.counselorModel.getCounselorsBySpecialization(specialization);
    } else {
      counselors = aiChatService.getAllCounselors();
    }

    res.json({
      counselors: counselors.map(counselor => ({
        id: counselor.id,
        name: counselor.name,
        title: counselor.title,
        specialization: counselor.specialization,
        avatar: counselor.avatar,
        availability: counselor.availability,
        languages: counselor.languages,
        credentials: counselor.credentials,
        personality: {
          approach: counselor.personality.approach,
          style: counselor.personality.style,
          strengths: counselor.personality.strengths
        }
      }))
    });

  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get specific counselor
router.get('/counselors/:counselorId', async (req, res) => {
  try {
    const { counselorId } = req.params;
    
    const counselor = aiChatService.getCounselor(counselorId);
    
    if (!counselor) {
      return res.status(404).json({ error: 'Counselor not found' });
    }

    res.json({
      counselor: {
        id: counselor.id,
        name: counselor.name,
        title: counselor.title,
        specialization: counselor.specialization,
        avatar: counselor.avatar,
        availability: counselor.availability,
        languages: counselor.languages,
        credentials: counselor.credentials,
        personality: counselor.personality,
        greeting: counselor.greeting
      }
    });

  } catch (error) {
    console.error('Get counselor error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Start new session (increment session count)
router.post('/conversations/:conversationId/new-session', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const clientId = req.headers['x-client-id'] || req.user?.id;

    if (!clientId) {
      return res.status(401).json({ error: 'Client ID required' });
    }

    const conversation = aiChatService.conversationModel.getConversation(conversationId);
    
    if (!conversation || conversation.clientId !== clientId) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const sessionCount = aiChatService.conversationModel.startNewSession(conversationId);
    
    res.json({
      conversationId,
      sessionCount,
      message: 'New session started'
    });

  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Search conversations
router.get('/search', async (req, res) => {
  try {
    const { q: query, serviceType } = req.query;
    const clientId = req.headers['x-client-id'] || req.user?.id;

    if (!clientId) {
      return res.status(401).json({ error: 'Client ID required' });
    }

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = aiChatService.conversationModel.searchConversations(query, {
      clientId,
      serviceType
    });

    res.json({
      query,
      results: results.map(result => ({
        id: result.id,
        serviceType: result.serviceType,
        lastActivity: result.lastActivity,
        totalMessages: result.totalMessages
      }))
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router; 