const express = require('express');
const { body, validationResult } = require('express-validator');
const AIChatService = require('../services/aiChatService');

const router = express.Router();
const aiChatService = new AIChatService();

// Admin authentication middleware (simplified - replace with proper auth)
const requireAdmin = (req, res, next) => {
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Admin access required' });
  }
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get system analytics
router.get('/analytics', async (req, res) => {
  try {
    const analytics = aiChatService.getAnalytics();
    const counselorStats = aiChatService.counselorModel.getCounselorStats();

    res.json({
      system: {
        ...analytics,
        counselorStats,
        timestamp: new Date().toISOString(),
        company: {
          name: 'CareConnect',
          address: '2300 W Sahara Ave Suite 800, Las Vegas NV 89102',
          phone: '702-664-0009',
          email: 'info@quibe.ai',
          poweredBy: 'Fakelit.com'
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get all conversations (admin view)
router.get('/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 20, serviceType, status } = req.query;
    const offset = (page - 1) * limit;

    let conversations = [];
    for (const [id, conversation] of aiChatService.conversationModel.conversations) {
      if (serviceType && conversation.serviceType !== serviceType) continue;
      if (status && conversation.status !== status) continue;
      conversations.push(conversation);
    }

    // Sort by most recent
    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Pagination
    const total = conversations.length;
    const paginatedConversations = conversations.slice(offset, offset + parseInt(limit));

    res.json({
      conversations: paginatedConversations.map(conv => ({
        id: conv.id,
        clientId: conv.clientId,
        counselorId: conv.counselorId,
        serviceType: conv.serviceType,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        sessionCount: conv.sessionCount,
        totalMessages: conv.totalMessages,
        status: conv.status,
        crisisFlags: conv.crisisFlags.length,
        recentTopics: conv.recentTopics || []
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get specific conversation (admin view)
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = aiChatService.conversationModel.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const counselor = aiChatService.getCounselor(conversation.counselorId);

    res.json({
      conversation: {
        ...conversation,
        counselor: counselor ? {
          id: counselor.id,
          name: counselor.name,
          title: counselor.title,
          specialization: counselor.specialization
        } : null
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

// Search conversations (admin)
router.get('/search', async (req, res) => {
  try {
    const { q: query, serviceType, counselorId, clientId } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = aiChatService.conversationModel.searchConversations(query, {
      serviceType,
      counselorId,
      clientId
    });

    res.json({
      query,
      results: results.map(result => ({
        id: result.id,
        clientId: result.clientId,
        counselorId: result.counselorId,
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

// Get crisis flags
router.get('/crisis-flags', async (req, res) => {
  try {
    const { resolved, escalated } = req.query;
    
    const crisisFlags = [];
    
    for (const [conversationId, conversation] of aiChatService.conversationModel.conversations) {
      conversation.crisisFlags.forEach(flag => {
        if (resolved !== undefined && flag.resolved !== (resolved === 'true')) return;
        if (escalated !== undefined && flag.escalated !== (escalated === 'true')) return;
        
        crisisFlags.push({
          ...flag,
          conversationId,
          clientId: conversation.clientId,
          serviceType: conversation.serviceType
        });
      });
    }

    // Sort by most recent
    crisisFlags.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      crisisFlags,
      total: crisisFlags.length,
      unresolved: crisisFlags.filter(f => !f.resolved).length,
      escalated: crisisFlags.filter(f => f.escalated).length
    });

  } catch (error) {
    console.error('Get crisis flags error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Mark crisis flag as resolved
router.put('/crisis-flags/:flagId/resolve', async (req, res) => {
  try {
    const { flagId } = req.params;
    const { notes } = req.body;

    let flagFound = false;
    
    for (const [conversationId, conversation] of aiChatService.conversationModel.conversations) {
      const flag = conversation.crisisFlags.find(f => f.id === flagId);
      if (flag) {
        flag.resolved = true;
        flag.resolvedAt = new Date().toISOString();
        flag.resolvedBy = req.headers['x-admin-user'] || 'admin';
        flag.notes = notes;
        flagFound = true;
        break;
      }
    }

    if (!flagFound) {
      return res.status(404).json({ error: 'Crisis flag not found' });
    }

    res.json({
      message: 'Crisis flag marked as resolved',
      flagId
    });

  } catch (error) {
    console.error('Resolve crisis flag error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get all counselors (admin view)
router.get('/counselors', async (req, res) => {
  try {
    const counselors = aiChatService.getAllCounselors();
    const stats = aiChatService.counselorModel.getCounselorStats();

    res.json({
      counselors: counselors.map(counselor => ({
        ...counselor,
        // Add conversation count for each counselor
        conversationCount: Array.from(aiChatService.conversationModel.conversations.values())
          .filter(conv => conv.counselorId === counselor.id).length
      })),
      stats
    });

  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get counselor performance
router.get('/counselors/:counselorId/performance', async (req, res) => {
  try {
    const { counselorId } = req.params;
    
    const counselor = aiChatService.getCounselor(counselorId);
    if (!counselor) {
      return res.status(404).json({ error: 'Counselor not found' });
    }

    // Get counselor's conversations
    const conversations = Array.from(aiChatService.conversationModel.conversations.values())
      .filter(conv => conv.counselorId === counselorId);

    const performance = {
      counselor: {
        id: counselor.id,
        name: counselor.name,
        title: counselor.title,
        specialization: counselor.specialization
      },
      stats: {
        totalConversations: conversations.length,
        totalMessages: conversations.reduce((sum, conv) => sum + conv.totalMessages, 0),
        averageSessionLength: conversations.reduce((sum, conv) => sum + conv.sessionCount, 0) / conversations.length || 0,
        crisisFlags: conversations.reduce((sum, conv) => sum + conv.crisisFlags.length, 0),
        activeConversations: conversations.filter(conv => conv.status === 'active').length
      },
      recentActivity: conversations
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10)
        .map(conv => ({
          conversationId: conv.id,
          clientId: conv.clientId,
          serviceType: conv.serviceType,
          lastActivity: conv.updatedAt,
          sessionCount: conv.sessionCount
        }))
    };

    res.json(performance);

  } catch (error) {
    console.error('Get counselor performance error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get client insights
router.get('/clients/:clientId/insights', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    const conversations = aiChatService.getClientConversations(clientId);
    
    if (conversations.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const insights = {
      clientId,
      stats: {
        totalConversations: conversations.length,
        totalSessions: conversations.reduce((sum, conv) => sum + conv.sessionCount, 0),
        totalMessages: conversations.reduce((sum, conv) => sum + conv.totalMessages, 0),
        crisisFlags: conversations.reduce((sum, conv) => sum + conv.crisisFlags.length, 0),
        firstSession: conversations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]?.createdAt,
        lastSession: conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]?.updatedAt
      },
      serviceBreakdown: conversations.reduce((acc, conv) => {
        acc[conv.serviceType] = (acc[conv.serviceType] || 0) + 1;
        return acc;
      }, {}),
      counselors: [...new Set(conversations.map(conv => conv.counselorId))],
      conversations: conversations.map(conv => ({
        id: conv.id,
        serviceType: conv.serviceType,
        counselorId: conv.counselorId,
        sessionCount: conv.sessionCount,
        totalMessages: conv.totalMessages,
        status: conv.status,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        recentTopics: conv.recentTopics || []
      }))
    };

    res.json(insights);

  } catch (error) {
    console.error('Get client insights error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// System health check
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        conversation: aiChatService.conversationModel.conversations.size,
        counselors: aiChatService.counselorModel.counselors.size
      },
      memory: {
        conversations: aiChatService.conversationModel.conversations.size,
        counselors: aiChatService.counselorModel.counselors.size
      },
      uptime: process.uptime()
    };

    res.json(health);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

// Export conversation data
router.get('/export/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = aiChatService.conversationModel.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const counselor = aiChatService.getCounselor(conversation.counselorId);

    const exportData = {
      conversation: {
        ...conversation,
        counselor: counselor ? {
          id: counselor.id,
          name: counselor.name,
          title: counselor.title,
          specialization: counselor.specialization
        } : null
      },
      exportInfo: {
        exportedAt: new Date().toISOString(),
        exportedBy: req.headers['x-admin-user'] || 'admin',
        company: {
          name: 'CareConnect',
          address: '2300 W Sahara Ave Suite 800, Las Vegas NV 89102',
          phone: '702-664-0009',
          email: 'info@quibe.ai',
          poweredBy: 'Fakelit.com'
        }
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="conversation-${conversationId}.json"`);
    res.json(exportData);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router; 