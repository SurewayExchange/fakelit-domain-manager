const axios = require('axios');
const { promptTemplates, resourceRecommendations } = require('../utils/promptTemplates');
const { detectCrisis, getCrisisResponse } = require('../middleware/crisisDetection');
const Conversation = require('../models/Conversation');
const Counselor = require('../models/Counselor');
const AvatarService = require('./avatarService');

class AIChatService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.conversationModel = new Conversation();
    this.counselorModel = new Counselor();
    this.avatarService = new AvatarService();
    
    // Use mock mode if no API key is available
    this.mockMode = !this.openaiApiKey || this.openaiApiKey === 'your_openai_api_key_here';
    
    if (this.mockMode) {
      console.log('🤖 AI Chat Service running in mock mode (no external APIs)');
    }
  }

  // Get conversation context from session history
  getConversationContext(conversationHistory = [], maxMessages = 10) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return 'This is the beginning of our conversation.';
    }

    // Take the last N messages for context
    const recentMessages = conversationHistory.slice(-maxMessages);
    return recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }

  // Generate system prompt based on service type
  generateSystemPrompt(serviceType, conversationContext) {
    const basePrompt = promptTemplates[serviceType];
    
    if (!basePrompt) {
      throw new Error(`Unknown service type: ${serviceType}`);
    }

    return basePrompt.replace('{context}', conversationContext);
  }

  // Mock AI response generator
  generateMockResponse(userMessage, serviceType, counselorId) {
    const responses = {
      'mental-health': [
        "I hear you, and I want you to know that your feelings are valid. It sounds like you're going through a challenging time. Can you tell me more about what's been on your mind lately?",
        "Thank you for sharing that with me. It takes courage to open up about difficult experiences. I'm here to listen and support you through this.",
        "I can sense that this is really affecting you. Let's work together to understand what's happening and find ways to help you feel better."
      ],
      'drug-alcohol': [
        "I understand that recovery can be incredibly challenging, and you're showing real strength by reaching out. What's been the most difficult part of this journey for you?",
        "You're not alone in this struggle. Many people face similar challenges, and there's no shame in asking for help. What kind of support do you feel would be most helpful right now?",
        "Recovery is a process, and every step forward, no matter how small, is significant. Can you tell me about what's been working for you so far?"
      ],
      'social-family': [
        "Relationships can be complex and challenging. It sounds like you're dealing with some difficult dynamics. What would you like to see improve in these relationships?",
        "Family and social relationships often carry deep emotional weight. I'm here to help you navigate these complexities. What's been the most challenging aspect for you?",
        "Communication is often at the heart of relationship issues. Let's explore how we can work on improving the way you connect with the important people in your life."
      ],
      'career-school': [
        "Career and academic challenges can feel overwhelming, but you have more strength and capability than you might realize. What specific obstacles are you facing right now?",
        "It's completely normal to feel uncertain about career or academic paths. Let's work together to identify your strengths and explore your options.",
        "You're taking an important step by seeking support. What would success look like for you in this area? Let's break it down into manageable steps."
      ],
      'crisis-escalation': [
        "I'm here with you right now, and your safety is my top priority. Can you tell me more about what's happening so I can help you get the support you need?",
        "You're not alone, and there are people who want to help you. Let's work together to keep you safe and get you connected to the right resources.",
        "I want you to know that your life has value and meaning. Let's talk about what's bringing you to this point and find ways to help you through this difficult time."
      ],
      'onboarding': [
        "Welcome to CareConnect! I'm here to help you get started and make sure you feel comfortable with our platform. What questions do you have?",
        "I'm glad you're here! Let's take some time to understand what you're looking for and how I can best support you on your journey.",
        "Getting started can feel overwhelming, but I'm here to guide you through every step. What would be most helpful for you to know right now?"
      ]
    };

    const serviceResponses = responses[serviceType] || responses['mental-health'];
    const randomResponse = serviceResponses[Math.floor(Math.random() * serviceResponses.length)];
    
    return randomResponse;
  }

  // Make API call to OpenAI (or use mock)
  async callOpenAI(messages, options = {}) {
    if (this.mockMode) {
      // Return mock response
      const lastUserMessage = messages.find(msg => msg.role === 'user');
      const serviceType = this.detectServiceType(lastUserMessage?.content || '');
      const mockResponse = this.generateMockResponse(lastUserMessage?.content || '', serviceType);
      
      return {
        choices: [{
          message: {
            content: mockResponse
          }
        }],
        model: 'gpt-4-mock',
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150
        }
      };
    }

    const {
      model = 'gpt-4.1',
      maxTokens = 1000,
      temperature = 0.7,
      language = 'en'
    } = options;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          // Add language instruction if not English
          ...(language !== 'en' && {
            system_message: `Please respond in ${language}.`
          })
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiApiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error(`AI service error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Detect service type from message content
  detectServiceType(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('depression') || lowerMessage.includes('anxiety') || lowerMessage.includes('mental health')) {
      return 'mental-health';
    } else if (lowerMessage.includes('drug') || lowerMessage.includes('alcohol') || lowerMessage.includes('recovery')) {
      return 'drug-alcohol';
    } else if (lowerMessage.includes('family') || lowerMessage.includes('relationship') || lowerMessage.includes('social')) {
      return 'social-family';
    } else if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('school') || lowerMessage.includes('academic')) {
      return 'career-school';
    } else if (lowerMessage.includes('crisis') || lowerMessage.includes('emergency') || lowerMessage.includes('suicide') || lowerMessage.includes('self-harm')) {
      return 'crisis-escalation';
    } else {
      return 'mental-health'; // default
    }
  }

  // Main chat method with counselor integration
  async chat(userMessage, serviceType, options = {}) {
    const {
      conversationId = null,
      clientId = null,
      language = 'en',
      anonymous = false,
      sessionId = null
    } = options;

    // Detect crisis first
    const crisisAnalysis = detectCrisis(userMessage, serviceType);
    
    // Get or assign counselor
    const counselor = this.counselorModel.getCounselorForService(serviceType);
    
    // Handle conversation persistence
    let currentConversation;
    if (conversationId) {
      currentConversation = this.conversationModel.getConversation(conversationId);
      if (!currentConversation) {
        throw new Error('Conversation not found');
      }
    } else {
      // Create new conversation
      currentConversation = this.conversationModel.createConversation(
        clientId || 'anonymous',
        counselor.id,
        serviceType,
        userMessage
      );
    }

    // If crisis detected, handle crisis and update conversation
    if (crisisAnalysis.crisisLevel !== 'none') {
      const crisisResponse = getCrisisResponse(crisisAnalysis.crisisLevel);
      
      // Flag crisis in conversation
      this.conversationModel.flagCrisis(currentConversation.id, {
        level: crisisAnalysis.crisisLevel,
        keywords: crisisAnalysis.detectedKeywords,
        escalated: crisisResponse.escalationRequired
      });

      // Add crisis message to conversation
      this.conversationModel.addMessage(currentConversation.id, {
        role: 'assistant',
        content: crisisResponse.message,
        counselorId: counselor.id,
        metadata: {
          crisisLevel: crisisAnalysis.crisisLevel,
          escalated: crisisResponse.escalationRequired
        }
      });

      return {
        response: crisisResponse.message,
        crisisLevel: crisisAnalysis.crisisLevel,
        requiresEscalation: crisisResponse.escalationRequired,
        priority: crisisResponse.priority,
        aiGenerated: false,
        resources: this.getCrisisResources(crisisAnalysis.crisisLevel),
        conversationId: currentConversation.id,
        counselor: {
          id: counselor.id,
          name: counselor.name,
          title: counselor.title,
          avatar: this.getCounselorAvatarWithContext(counselor, 'crisis')
        }
      };
    }

    // Get conversation history for context
    const conversationHistory = this.conversationModel.getConversationHistory(currentConversation.id);
    
    // Generate counselor-specific prompt
    const conversationContext = this.getConversationContext(conversationHistory);
    const systemPrompt = this.counselorModel.generateCounselorPrompt(counselor.id, conversationContext);

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    // Call OpenAI API
    const aiResponse = await this.callOpenAI(messages, { language });
    const aiMessage = aiResponse.choices[0].message.content;

    // Add messages to conversation
    this.conversationModel.addMessage(currentConversation.id, {
      role: 'user',
      content: userMessage,
      metadata: {
        mood: this.extractMood(userMessage),
        timestamp: new Date().toISOString()
      }
    });

    this.conversationModel.addMessage(currentConversation.id, {
      role: 'assistant',
      content: aiMessage,
      counselorId: counselor.id,
      metadata: {
        aiGenerated: true,
        model: aiResponse.model,
        usage: aiResponse.usage
      }
    });

    // Get relevant resources
    const resources = this.getRelevantResources(serviceType, userMessage, aiMessage);

    return {
      response: aiMessage,
      crisisLevel: 'none',
      requiresEscalation: false,
      priority: 'normal',
      aiGenerated: true,
      resources,
      usage: aiResponse.usage,
      model: aiResponse.model,
      conversationId: currentConversation.id,
      counselor: {
        id: counselor.id,
        name: counselor.name,
        title: counselor.title,
        avatar: this.getCounselorAvatarWithContext(counselor, this.determineAvatarContext(userMessage, aiMessage)),
        specialization: counselor.specialization
      },
      sessionCount: currentConversation.sessionCount,
      totalMessages: currentConversation.totalMessages
    };
  }

  // Get crisis-specific resources
  getCrisisResources(crisisLevel) {
    const crisisResources = {
      immediate: [
        {
          title: 'National Suicide Prevention Lifeline',
          description: '24/7 crisis support',
          contact: '988',
          type: 'phone'
        },
        {
          title: 'Crisis Text Line',
          description: 'Text-based crisis support',
          contact: 'Text HOME to 741741',
          type: 'text'
        },
        {
          title: 'Emergency Services',
          description: 'For immediate danger',
          contact: '911',
          type: 'emergency'
        }
      ],
      severe: [
        {
          title: 'CareConnect Crisis Counselor',
          description: 'Immediate human support',
          contact: 'Schedule now',
          type: 'counselor'
        },
        {
          title: 'Local Crisis Center',
          description: 'Find nearby help',
          contact: 'Search directory',
          type: 'directory'
        }
      ]
    };

    return crisisResources[crisisLevel] || [];
  }

  // Get relevant resources based on service type and conversation
  getRelevantResources(serviceType, userMessage, aiResponse) {
    const baseResources = resourceRecommendations[serviceType] || [];
    
    // Add dynamic resources based on conversation content
    const dynamicResources = this.extractDynamicResources(userMessage, aiResponse);
    
    return [...baseResources, ...dynamicResources];
  }

  // Extract dynamic resources based on conversation content
  extractDynamicResources(userMessage, aiResponse) {
    const resources = [];
    const message = userMessage.toLowerCase();
    const response = aiResponse.toLowerCase();

    // Add resources based on keywords
    if (message.includes('anxiety') || response.includes('anxiety')) {
      resources.push('Anxiety Relief Breathing Exercise');
    }
    
    if (message.includes('depression') || response.includes('depression')) {
      resources.push('Depression Self-Care Checklist');
    }
    
    if (message.includes('stress') || response.includes('stress')) {
      resources.push('Stress Management Techniques');
    }
    
    if (message.includes('sleep') || response.includes('sleep')) {
      resources.push('Sleep Hygiene Guide');
    }
    
    if (message.includes('relationship') || response.includes('relationship')) {
      resources.push('Healthy Communication Skills');
    }

    return resources;
  }

  // Pre-session check-in
  async preSessionCheckIn(userId, concerns, goals) {
    const systemPrompt = promptTemplates['pre-session'].replace('{context}', 'Pre-session preparation');
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Concerns: ${concerns}\nGoals: ${goals}\n\nPlease help me prepare for my counseling session.` }
    ];

    const response = await this.callOpenAI(messages);
    return {
      summary: response.choices[0].message.content,
      concerns: concerns,
      goals: goals,
      timestamp: new Date().toISOString()
    };
  }

  // Post-session follow-up
  async postSessionFollowUp(userId, sessionNotes, mood, nextSteps) {
    const systemPrompt = promptTemplates['post-session'].replace('{context}', 'Post-session follow-up');
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Session Notes: ${sessionNotes}\nCurrent Mood: ${mood}\nNext Steps: ${nextSteps}\n\nPlease provide follow-up support and suggestions.` }
    ];

    const response = await this.callOpenAI(messages);
    return {
      followUp: response.choices[0].message.content,
      suggestedResources: this.getRelevantResources('mental-health', sessionNotes, response.choices[0].message.content),
      nextCheckIn: this.scheduleNextCheckIn(),
      timestamp: new Date().toISOString()
    };
  }

  // Schedule next check-in
  scheduleNextCheckIn() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString();
  }

  // Extract mood from user message
  extractMood(message) {
    const moodKeywords = {
      'happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing'],
      'sad': ['sad', 'depressed', 'miserable', 'hopeless', 'empty', 'down'],
      'anxious': ['anxious', 'worried', 'nervous', 'stressed', 'panicked', 'overwhelmed'],
      'angry': ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'upset'],
      'calm': ['calm', 'peaceful', 'relaxed', 'content', 'serene', 'at ease'],
      'confused': ['confused', 'lost', 'uncertain', 'unsure', 'mixed up', 'disoriented']
    };

    const lowerMessage = message.toLowerCase();
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return mood;
      }
    }
    return 'neutral';
  }

  // Multi-language support
  async translateMessage(message, targetLanguage) {
    if (targetLanguage === 'en') {
      return message;
    }

    const messages = [
      { role: 'system', content: `Translate the following message to ${targetLanguage}. Maintain the same tone and meaning.` },
      { role: 'user', content: message }
    ];

    const response = await this.callOpenAI(messages);
    return response.choices[0].message.content;
  }

  // Get conversation summary for follow-up
  async getConversationSummary(conversationId) {
    const summary = this.conversationModel.getConversationSummary(conversationId);
    if (!summary) {
      throw new Error('Conversation not found');
    }

    // Generate AI summary
    const messages = [
      { role: 'system', content: 'You are a professional counselor creating a session summary. Be concise but comprehensive.' },
      { role: 'user', content: `Create a professional summary of this counseling session based on the following information:
        Service Type: ${summary.serviceType}
        Recent Topics: ${summary.recentTopics.join(', ')}
        Goals: ${summary.goals.join(', ')}
        Progress: ${JSON.stringify(summary.progress)}
        Crisis Flags: ${summary.crisisFlags.length} flags detected` }
    ];

    const response = await this.callOpenAI(messages);
    return {
      ...summary,
      aiSummary: response.choices[0].message.content
    };
  }

  // Get client conversation history
  getClientConversations(clientId) {
    return this.conversationModel.getClientConversations(clientId);
  }

  // Get counselor information
  getCounselor(counselorId) {
    return this.counselorModel.getCounselor(counselorId);
  }

  // Get all counselors
  getAllCounselors() {
    return this.counselorModel.getAllCounselors();
  }

  // Get analytics
  getAnalytics() {
    return this.conversationModel.getAnalytics();
  }

  // Get counselor avatar with context
  getCounselorAvatarWithContext(counselor, context = 'general') {
    try {
      const counselorId = counselor.id;
      const counselorName = counselor.name;
      
      return this.avatarService.getContextualAvatar(counselorId, counselorName, context);
    } catch (error) {
      console.error('Error getting counselor avatar:', error);
      // Return fallback avatar
      return this.avatarService.getFallbackAvatar(counselor.name);
    }
  }

  // Determine avatar context based on conversation
  determineAvatarContext(userMessage, aiResponse) {
    const message = userMessage.toLowerCase();
    const response = aiResponse.toLowerCase();

    // Crisis detection
    if (message.includes('suicide') || message.includes('kill myself') || message.includes('want to die')) {
      return 'crisis';
    }

    // Greeting context
    if (message.includes('hello') || message.includes('hi') || message.includes('good morning') || message.includes('good afternoon')) {
      return 'greeting';
    }

    // Listening context
    if (message.length > 100 || message.includes('feel') || message.includes('think') || message.includes('experience')) {
      return 'listening';
    }

    // Supportive context
    if (response.includes('understand') || response.includes('support') || response.includes('here for you')) {
      return 'supportive';
    }

    // Professional context
    if (response.includes('recommend') || response.includes('suggest') || response.includes('professional')) {
      return 'professional';
    }

    return 'general';
  }

  // Get counselor avatar with mood
  getCounselorAvatarWithMood(counselor, mood = 'neutral') {
    try {
      const counselorId = counselor.id;
      const counselorName = counselor.name;
      
      return this.avatarService.getAvatarWithMood(counselorId, counselorName, mood);
    } catch (error) {
      console.error('Error getting counselor avatar with mood:', error);
      return this.avatarService.getFallbackAvatar(counselor.name);
    }
  }

  // Get counselor avatar with expression
  getCounselorAvatarWithExpression(counselor, expression = 'smile') {
    try {
      const counselorId = counselor.id;
      const counselorName = counselor.name;
      
      return this.avatarService.getAvatarWithExpression(counselorId, counselorName, expression);
    } catch (error) {
      console.error('Error getting counselor avatar with expression:', error);
      return this.avatarService.getFallbackAvatar(counselor.name);
    }
  }

  // Get animated counselor avatar
  getAnimatedCounselorAvatar(counselor) {
    try {
      const counselorId = counselor.id;
      const counselorName = counselor.name;
      
      return this.avatarService.generateAnimatedAvatar(counselorId, counselorName);
    } catch (error) {
      console.error('Error getting animated counselor avatar:', error);
      return null;
    }
  }

  // Update counselor avatar based on conversation flow
  updateCounselorAvatar(counselor, conversationFlow) {
    try {
      const counselorId = counselor.id;
      const counselorName = counselor.name;
      
      // Determine appropriate avatar based on conversation flow
      let avatarContext = 'general';
      let avatarMood = 'neutral';
      let avatarExpression = 'smile';

      switch (conversationFlow) {
        case 'greeting':
          avatarContext = 'greeting';
          avatarMood = 'happy';
          avatarExpression = 'smile';
          break;
        case 'listening':
          avatarContext = 'listening';
          avatarMood = 'attentive';
          avatarExpression = 'neutral';
          break;
        case 'supportive':
          avatarContext = 'supportive';
          avatarMood = 'caring';
          avatarExpression = 'smile';
          break;
        case 'crisis':
          avatarContext = 'crisis';
          avatarMood = 'concerned';
          avatarExpression = 'concerned';
          break;
        case 'professional':
          avatarContext = 'professional';
          avatarMood = 'focused';
          avatarExpression = 'neutral';
          break;
        default:
          avatarContext = 'general';
          avatarMood = 'neutral';
          avatarExpression = 'smile';
      }

      return {
        contextual: this.avatarService.getContextualAvatar(counselorId, counselorName, avatarContext),
        mood: this.avatarService.getAvatarWithMood(counselorId, counselorName, avatarMood),
        expression: this.avatarService.getAvatarWithExpression(counselorId, counselorName, avatarExpression)
      };
    } catch (error) {
      console.error('Error updating counselor avatar:', error);
      return {
        contextual: this.avatarService.getFallbackAvatar(counselor.name),
        mood: this.avatarService.getFallbackAvatar(counselor.name),
        type: 'fallback'
      };
    }
  }
}

module.exports = AIChatService; 