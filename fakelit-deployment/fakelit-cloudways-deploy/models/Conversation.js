const { v4: uuidv4 } = require('uuid');

class Conversation {
  constructor() {
    // In-memory storage (replace with database in production)
    this.conversations = new Map();
    this.clientProfiles = new Map();
    this.counselorProfiles = new Map();
  }

  // Create a new conversation
  createConversation(clientId, counselorId, serviceType, initialMessage = null) {
    const conversationId = uuidv4();
    const conversation = {
      id: conversationId,
      clientId,
      counselorId,
      serviceType,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      sessionCount: 1,
      totalMessages: 0,
      crisisFlags: [],
      goals: [],
      progress: {
        mood: [],
        copingSkills: [],
        challenges: [],
        achievements: []
      }
    };

    if (initialMessage) {
      conversation.messages.push({
        id: uuidv4(),
        role: 'user',
        content: initialMessage,
        timestamp: new Date().toISOString(),
        counselorId: null
      });
      conversation.totalMessages = 1;
    }

    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  // Add message to conversation
  addMessage(conversationId, message) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messageObj = {
      id: uuidv4(),
      role: message.role,
      content: message.content,
      timestamp: new Date().toISOString(),
      counselorId: message.counselorId || null,
      metadata: message.metadata || {}
    };

    conversation.messages.push(messageObj);
    conversation.totalMessages++;
    conversation.updatedAt = new Date().toISOString();

    // Update progress tracking
    if (message.metadata?.mood) {
      conversation.progress.mood.push({
        value: message.metadata.mood,
        timestamp: new Date().toISOString()
      });
    }

    if (message.metadata?.copingSkill) {
      conversation.progress.copingSkills.push({
        skill: message.metadata.copingSkill,
        timestamp: new Date().toISOString()
      });
    }

    return messageObj;
  }

  // Get conversation by ID
  getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  // Get all conversations for a client
  getClientConversations(clientId) {
    const clientConversations = [];
    for (const [id, conversation] of this.conversations) {
      if (conversation.clientId === clientId) {
        clientConversations.push(conversation);
      }
    }
    return clientConversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  // Get conversation history for context
  getConversationHistory(conversationId, maxMessages = 20) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return [];
    }

    return conversation.messages.slice(-maxMessages);
  }

  // Get conversation summary for follow-up
  getConversationSummary(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return null;
    }

    const recentMessages = conversation.messages.slice(-10);
    const userMessages = recentMessages.filter(msg => msg.role === 'user');
    const counselorMessages = recentMessages.filter(msg => msg.role === 'assistant');

    return {
      conversationId,
      serviceType: conversation.serviceType,
      totalSessions: conversation.sessionCount,
      lastSession: conversation.updatedAt,
      recentTopics: this.extractTopics(userMessages),
      progress: conversation.progress,
      goals: conversation.goals,
      crisisFlags: conversation.crisisFlags
    };
  }

  // Extract topics from messages
  extractTopics(messages) {
    const topics = new Set();
    const keywords = {
      'anxiety': ['anxiety', 'anxious', 'panic', 'worry', 'stress'],
      'depression': ['depression', 'depressed', 'sad', 'hopeless', 'empty'],
      'relationships': ['relationship', 'partner', 'family', 'marriage', 'communication'],
      'substance': ['alcohol', 'drug', 'substance', 'addiction', 'recovery'],
      'work': ['work', 'job', 'career', 'boss', 'colleague'],
      'sleep': ['sleep', 'insomnia', 'tired', 'rest', 'bed'],
      'trauma': ['trauma', 'abuse', 'ptsd', 'flashback', 'trigger']
    };

    messages.forEach(message => {
      const content = message.content.toLowerCase();
      Object.entries(keywords).forEach(([topic, words]) => {
        if (words.some(word => content.includes(word))) {
          topics.add(topic);
        }
      });
    });

    return Array.from(topics);
  }

  // Update conversation goals
  updateGoals(conversationId, goals) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.goals = goals;
    conversation.updatedAt = new Date().toISOString();
    return conversation.goals;
  }

  // Flag crisis in conversation
  flagCrisis(conversationId, crisisData) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const crisisFlag = {
      id: uuidv4(),
      level: crisisData.level,
      keywords: crisisData.keywords,
      timestamp: new Date().toISOString(),
      resolved: false,
      escalated: crisisData.escalated || false
    };

    conversation.crisisFlags.push(crisisFlag);
    conversation.updatedAt = new Date().toISOString();
    return crisisFlag;
  }

  // Start new session (increment session count)
  startNewSession(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.sessionCount++;
    conversation.updatedAt = new Date().toISOString();
    return conversation.sessionCount;
  }

  // Get analytics for admin dashboard
  getAnalytics() {
    const analytics = {
      totalConversations: this.conversations.size,
      activeConversations: 0,
      totalMessages: 0,
      crisisFlags: 0,
      serviceTypeBreakdown: {},
      averageSessionLength: 0,
      recentActivity: []
    };

    let totalSessions = 0;
    const recentActivity = [];

    for (const [id, conversation] of this.conversations) {
      if (conversation.status === 'active') {
        analytics.activeConversations++;
      }

      analytics.totalMessages += conversation.totalMessages;
      totalSessions += conversation.sessionCount;

      analytics.serviceTypeBreakdown[conversation.serviceType] = 
        (analytics.serviceTypeBreakdown[conversation.serviceType] || 0) + 1;

      analytics.crisisFlags += conversation.crisisFlags.length;

      recentActivity.push({
        conversationId: id,
        clientId: conversation.clientId,
        counselorId: conversation.counselorId,
        lastActivity: conversation.updatedAt,
        serviceType: conversation.serviceType
      });
    }

    analytics.averageSessionLength = totalSessions / this.conversations.size || 0;
    analytics.recentActivity = recentActivity
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
      .slice(0, 10);

    return analytics;
  }

  // Search conversations
  searchConversations(query, filters = {}) {
    const results = [];
    const searchTerm = query.toLowerCase();

    for (const [id, conversation] of this.conversations) {
      let matches = false;

      // Search in messages
      for (const message of conversation.messages) {
        if (message.content.toLowerCase().includes(searchTerm)) {
          matches = true;
          break;
        }
      }

      // Apply filters
      if (filters.serviceType && conversation.serviceType !== filters.serviceType) {
        matches = false;
      }

      if (filters.clientId && conversation.clientId !== filters.clientId) {
        matches = false;
      }

      if (filters.counselorId && conversation.counselorId !== filters.counselorId) {
        matches = false;
      }

      if (matches) {
        results.push({
          id,
          clientId: conversation.clientId,
          counselorId: conversation.counselorId,
          serviceType: conversation.serviceType,
          lastActivity: conversation.updatedAt,
          totalMessages: conversation.totalMessages
        });
      }
    }

    return results;
  }
}

module.exports = Conversation; 