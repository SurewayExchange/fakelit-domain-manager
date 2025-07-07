const axios = require('axios');
const { COUNSELORS } = require('../../shared/constants/counselors');

class AvatarService {
  constructor() {
    this.activeSessions = new Map();
    this.voiceQueue = new Map();
    this.emotionEngine = this.initializeEmotionEngine();
    this.voiceService = this.initializeVoiceService();
  }

  initializeEmotionEngine() {
    return {
      // Emotion detection from text
      detectEmotion: (text) => {
        const emotions = {
          joy: ['happy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic'],
          sadness: ['sad', 'depressed', 'lonely', 'hopeless', 'miserable', 'down'],
          anger: ['angry', 'furious', 'mad', 'frustrated', 'irritated', 'upset'],
          fear: ['scared', 'afraid', 'anxious', 'worried', 'terrified', 'nervous'],
          surprise: ['shocked', 'surprised', 'amazed', 'astonished', 'stunned'],
          disgust: ['disgusted', 'revolted', 'sickened', 'appalled'],
          neutral: ['okay', 'fine', 'alright', 'normal', 'stable']
        };

        const lowerText = text.toLowerCase();
        let detectedEmotions = [];

        for (const [emotion, keywords] of Object.entries(emotions)) {
          if (keywords.some(keyword => lowerText.includes(keyword))) {
            detectedEmotions.push(emotion);
          }
        }

        return detectedEmotions.length > 0 ? detectedEmotions[0] : 'neutral';
      },

      // Expression mapping
      getExpression: (emotion, counselorPersonality) => {
        const expressionMap = {
          joy: 'smile',
          sadness: 'concerned',
          anger: 'serious',
          fear: 'worried',
          surprise: 'surprised',
          disgust: 'neutral',
          neutral: 'professional'
        };

        return expressionMap[emotion] || 'professional';
      },

      // Gesture mapping
      getGesture: (emotion, context) => {
        const gestureMap = {
          joy: 'encouraging',
          sadness: 'supportive',
          anger: 'calming',
          fear: 'reassuring',
          surprise: 'attentive',
          disgust: 'neutral',
          neutral: 'listening'
        };

        return gestureMap[emotion] || 'listening';
      }
    };
  }

  initializeVoiceService() {
    return {
      // Voice synthesis using ElevenLabs
      synthesizeVoice: async (text, voiceId, emotion = 'neutral') => {
        try {
          if (!process.env.ELEVENLABS_API_KEY) {
            console.log('Voice service not configured, using text-to-speech fallback');
            return this.fallbackVoiceSynthesis(text);
          }

          const response = await axios.post(
            'https://api.elevenlabs.io/v1/text-to-speech',
            {
              text: text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
              }
            },
            {
              headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY
              },
              responseType: 'arraybuffer'
            }
          );

          return {
            audio: response.data,
            format: 'mp3',
            duration: this.estimateDuration(text)
          };
        } catch (error) {
          console.error('Voice synthesis error:', error.message);
          return this.fallbackVoiceSynthesis(text);
        }
      },

      // Fallback voice synthesis
      fallbackVoiceSynthesis: (text) => {
        // Simulate voice synthesis delay
        const duration = this.estimateDuration(text);
        
        return {
          audio: null,
          format: 'text',
          duration: duration,
          fallback: true
        };
      },

      // Estimate speech duration
      estimateDuration: (text) => {
        const wordsPerMinute = 150;
        const words = text.split(' ').length;
        return Math.ceil((words / wordsPerMinute) * 60);
      }
    };
  }

  async createAvatarSession(counselorId, clientId) {
    try {
      const counselor = COUNSELORS[counselorId];
      if (!counselor) {
        throw new Error(`Counselor ${counselorId} not found`);
      }

      const sessionId = `avatar_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session = {
        sessionId,
        counselorId,
        clientId,
        counselor,
        startTime: new Date(),
        status: 'active',
        messages: [],
        emotions: [],
        avatarState: {
          expression: 'professional',
          gesture: 'listening',
          mood: 'neutral',
          speaking: false
        }
      };

      this.activeSessions.set(sessionId, session);
      
      console.log(`🎭 Avatar session created: ${sessionId} for ${counselor.name}`);
      
      return {
        sessionId,
        counselor: {
          id: counselor.id,
          name: counselor.name,
          title: counselor.title,
          specialization: counselor.specialization,
          avatar: counselor.avatar
        },
        status: 'active'
      };
    } catch (error) {
      console.error('Create avatar session error:', error);
      throw error;
    }
  }

  async processMessage(sessionId, message, sender = 'client') {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Add message to session
      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message,
        sender,
        timestamp: new Date(),
        type: 'text'
      };

      session.messages.push(messageData);

      // If it's a client message, generate counselor response
      if (sender === 'client') {
        return await this.generateCounselorResponse(sessionId, message);
      }

      return { success: true, message: 'Message processed' };
    } catch (error) {
      console.error('Process message error:', error);
      throw error;
    }
  }

  async generateCounselorResponse(sessionId, clientMessage) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Detect emotion from client message
      const emotion = this.emotionEngine.detectEmotion(clientMessage);
      
      // Update avatar state
      session.avatarState.expression = this.emotionEngine.getExpression(emotion, session.counselor.personality);
      session.avatarState.gesture = this.emotionEngine.getGesture(emotion, 'response');
      session.avatarState.mood = emotion;
      session.avatarState.speaking = true;

      // Generate AI response using counselor's expertise
      const aiResponse = await this.generateAIResponse(clientMessage, session.counselor);
      
      // Create counselor message
      const counselorMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: aiResponse,
        sender: 'counselor',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          emotion: emotion,
          expression: session.avatarState.expression,
          gesture: session.avatarState.gesture
        }
      };

      session.messages.push(counselorMessage);

      // Generate voice for the response
      const voiceResult = await this.voiceService.synthesizeVoice(
        aiResponse,
        session.counselor.avatar.voice,
        emotion
      );

      // Update avatar state after response
      setTimeout(() => {
        session.avatarState.speaking = false;
        session.avatarState.expression = 'professional';
        session.avatarState.gesture = 'listening';
      }, voiceResult.duration * 1000);

      return {
        sessionId,
        message: counselorMessage,
        avatarState: session.avatarState,
        voice: voiceResult,
        emotion: emotion
      };
    } catch (error) {
      console.error('Generate counselor response error:', error);
      throw error;
    }
  }

  async generateAIResponse(clientMessage, counselor) {
    try {
      // Check for crisis keywords
      if (this.detectCrisisKeywords(clientMessage)) {
        return this.generateCrisisResponse(counselor);
      }

      // Generate contextual response based on counselor's expertise
      const systemPrompt = this.generateSystemPrompt(counselor);
      
      // For now, return a contextual response
      // In production, this would call OpenAI or another AI service
      return this.generateContextualResponse(clientMessage, counselor);
    } catch (error) {
      console.error('Generate AI response error:', error);
      return "I'm here to support you. Could you tell me more about what you're experiencing?";
    }
  }

  detectCrisisKeywords(message) {
    const crisisKeywords = [
      'suicide', 'kill myself', 'want to die', 'end it all',
      'self-harm', 'hurt myself', 'no reason to live',
      'better off dead', 'can\'t take it anymore'
    ];

    const lowerMessage = message.toLowerCase();
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  generateCrisisResponse(counselor) {
    return `I'm very concerned about what you're sharing, and your safety is my priority. 

${counselor.safety_guidelines.crisis_response}

Please know that you're not alone, and there are people who want to help you. The National Suicide Prevention Lifeline is available 24/7 at 988 or 1-800-273-8255.

Would you be willing to talk to a crisis counselor right now? I'm here to support you, but you may also benefit from speaking with someone who can provide immediate crisis intervention.`;
  }

  generateContextualResponse(clientMessage, counselor) {
    const responses = {
      'dr-sarah-mitchell': {
        anxiety: "I understand anxiety can feel overwhelming. Let's explore some grounding techniques together. Can you tell me more about what's triggering these feelings?",
        depression: "Depression can make everything feel heavy and hopeless. I want you to know that these feelings are treatable. What would be most helpful for you right now?",
        stress: "Stress can impact every aspect of our lives. Let's identify some healthy coping strategies that work for you. What have you found helpful in the past?"
      },
      'dr-emily-chen': {
        trauma: "I hear you're dealing with difficult experiences. Trauma can affect us in many ways. Let's work together to create a safe space for healing. What feels most supportive to you right now?",
        fear: "Fear and anxiety after trauma are very common responses. Your feelings are valid, and there are ways to work through them. Would you like to explore some grounding techniques?",
        safety: "Your safety is my priority. Let's talk about what helps you feel more secure and grounded. What makes you feel safe?"
      },
      'michael-rodriguez': {
        family: "Family dynamics can be complex and challenging. Let's explore how we can improve communication and understanding within your family. What specific situation would you like to focus on?",
        relationship: "Relationships require work and understanding from both sides. Let's identify what's working and what might need attention. What's most important to you in this relationship?",
        communication: "Good communication is the foundation of healthy relationships. Let's practice some effective communication skills together. What would you like to improve?"
      }
    };

    const counselorResponses = responses[counselor.id] || {};
    const lowerMessage = clientMessage.toLowerCase();

    // Match response based on keywords
    for (const [topic, response] of Object.entries(counselorResponses)) {
      if (lowerMessage.includes(topic)) {
        return response;
      }
    }

    // Default empathetic response
    return `I hear you, and I want you to know that your feelings are valid. As your ${counselor.specialization} specialist, I'm here to support you through this. 

Can you tell me more about what's happening? I'd like to understand better so I can provide the most helpful support for you.`;
  }

  generateSystemPrompt(counselor) {
    return `You are ${counselor.name}, a ${counselor.title} specializing in ${counselor.specialization}. 

Your expertise includes: ${counselor.expertise.join(', ')}.

Your communication style is ${counselor.personality.communicationStyle} and your approach is ${counselor.personality.approach}.

Your key strengths are: ${counselor.personality.strengths.join(', ')}.

IMPORTANT SAFETY GUIDELINES:
- Never provide advice that could harm the client or others
- If client mentions self-harm, suicide, or harm to others, immediately provide crisis resources
- Maintain professional boundaries at all times
- Refer to appropriate professionals when needed
- Focus on supportive, therapeutic responses

Always respond as ${counselor.name} with your specialized expertise in ${counselor.specialization}.`;
  }

  getAvatarState(sessionId) {
    const session = this.activeSessions.get(sessionId);
    return session ? session.avatarState : null;
  }

  updateAvatarState(sessionId, newState) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.avatarState = { ...session.avatarState, ...newState };
      return session.avatarState;
    }
    return null;
  }

  endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      session.endTime = new Date();
      this.activeSessions.delete(sessionId);
      return true;
    }
    return false;
  }

  getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }

  getSession(sessionId) {
    return this.activeSessions.get(sessionId);
  }
}

module.exports = new AvatarService(); 