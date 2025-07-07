const axios = require('axios');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

class HeyGenAvatarService {
    constructor() {
        this.apiKey = process.env.HEYGEN_API_KEY;
        this.baseUrl = 'https://api.heygen.com/v1';
        this.streamingUrl = 'wss://api.heygen.com/v1/streaming';
        this.avatars = new Map();
        this.sessions = new Map();
        this.voiceService = null;
        this.initializeVoiceService();
        
        // Counselor configurations
        this.counselorConfigs = {
            'dr-sarah-mitchell': {
                avatarId: 'dr-sarah-mitchell-001',
                name: 'Dr. Sarah Mitchell',
                specialty: 'Mental Health & CBT',
                voiceId: 'en-US-Neural2-F',
                personality: 'professional, empathetic, warm',
                greeting: "Hello, I'm Dr. Sarah Mitchell. I specialize in cognitive behavioral therapy and mental health counseling. How can I help you today?",
                avatarUrl: '/images/counselors/dr-sarah-mitchell.jpg',
                description: 'Licensed clinical psychologist with 15+ years experience in anxiety, depression, and trauma therapy.'
            },
            'michael-rodriguez': {
                avatarId: 'michael-rodriguez-001',
                name: 'Michael Rodriguez',
                specialty: 'Substance Abuse & Recovery',
                voiceId: 'en-US-Neural2-M',
                personality: 'supportive, understanding, motivational',
                greeting: "Hi, I'm Michael Rodriguez. I work with individuals on their recovery journey and substance abuse challenges. What's on your mind?",
                avatarUrl: '/images/counselors/michael-rodriguez.jpg',
                description: 'Certified addiction counselor with expertise in recovery support and relapse prevention.'
            },
            'dr-emily-chen': {
                avatarId: 'dr-emily-chen-001',
                name: 'Dr. Emily Chen',
                specialty: 'Relationships & Family',
                voiceId: 'en-US-Neural2-F',
                personality: 'gentle, caring, insightful',
                greeting: "Welcome, I'm Dr. Emily Chen. I specialize in relationship counseling and family therapy. How are you feeling today?",
                avatarUrl: '/images/counselors/dr-emily-chen.jpg',
                description: 'Marriage and family therapist with deep expertise in communication and conflict resolution.'
            },
            'james-williams': {
                avatarId: 'james-williams-001',
                name: 'James Williams',
                specialty: 'Career & Life Coaching',
                voiceId: 'en-US-Neural2-M',
                personality: 'confident, motivational, practical',
                greeting: "Hello, I'm James Williams. I help people navigate career transitions and life challenges. What would you like to work on?",
                avatarUrl: '/images/counselors/james-williams.jpg',
                description: 'Professional life coach with background in organizational psychology and career development.'
            },
            'dr-maria-garcia': {
                avatarId: 'dr-maria-garcia-001',
                name: 'Dr. Maria Garcia',
                specialty: 'Medical & Health Psychology',
                voiceId: 'en-US-Neural2-F',
                personality: 'professional, medical, compassionate',
                greeting: "Good day, I'm Dr. Maria Garcia. I specialize in health psychology and medical counseling. How can I support your health journey?",
                avatarUrl: '/images/counselors/dr-maria-garcia.jpg',
                description: 'Health psychologist with expertise in chronic illness, pain management, and medical trauma.'
            },
            'lisa-thompson': {
                avatarId: 'lisa-thompson-001',
                name: 'Lisa Thompson',
                specialty: 'General Counseling & Support',
                voiceId: 'en-US-Neural2-F',
                personality: 'friendly, approachable, supportive',
                greeting: "Hi there, I'm Lisa Thompson. I provide general counseling and emotional support. What brings you here today?",
                avatarUrl: '/images/counselors/lisa-thompson.jpg',
                description: 'Licensed professional counselor offering compassionate support for life challenges and personal growth.'
            }
        };
    }

    // Remove initializeAuthentication, login, refreshAuth

    // Get authentication headers
    getAuthHeaders() {
        if (this.apiKey) {
            return {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            };
        } else {
            throw new Error('No API key available for HeyGen');
        }
    }

    // Initialize voice service for text-to-speech
    async initializeVoiceService() {
        try {
            this.voiceService = {
                apiKey: process.env.ELEVENLABS_API_KEY || process.env.OPENAI_API_KEY,
                baseUrl: process.env.ELEVENLABS_API_KEY ? 
                    'https://api.elevenlabs.io/v1' : 
                    'https://api.openai.com/v1/audio/speech',
                provider: process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'openai',
                voices: {
                    'dr-sarah-mitchell': '21m00Tcm4TlvDq8ikWAM', // Rachel - warm, professional
                    'michael-rodriguez': 'AZnzlk1XvdvUeBnXmlld', // Domi - supportive, calm
                    'dr-emily-chen': 'EXAVITQu4vr4xnSDxMaL', // Bella - gentle, caring
                    'james-williams': 'VR6AewLTigWG4xSOukaG', // Arnold - confident, motivational
                    'dr-maria-garcia': 'pNInz6obpgDQGcFmaJgB', // Adam - professional, medical
                    'lisa-thompson': 'ThT5KcBeYPX3keUQqHPh' // Josh - friendly, approachable
                }
            };
            console.log('🎤 HeyGen voice service initialized');
        } catch (error) {
            console.error('Voice service initialization error:', error);
        }
    }

    // Create a new avatar session
    async createAvatarSession(counselorId, sessionId = null) {
        try {
            const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const counselorConfig = this.counselorConfigs[counselorId];
            
            if (!counselorConfig) {
                throw new Error(`Counselor ${counselorId} not found`);
            }

            // Create session data
            const session = {
                id: finalSessionId,
                counselorId: counselorId,
                counselorConfig: counselorConfig,
                status: 'initializing',
                createdAt: Date.now(),
                lastActivity: Date.now(),
                messages: [],
                avatarState: {
                    isSpeaking: false,
                    currentExpression: 'neutral',
                    currentEmotion: 'neutral',
                    isListening: false
                },
                streamingData: {
                    isConnected: false,
                    websocket: null,
                    streamId: null
                }
            };

            // Store session
            this.sessions.set(finalSessionId, session);

            // Try to initialize streaming connection, fallback to mock mode if it fails
            try {
                await this.initializeStreaming(finalSessionId);
            } catch (streamingError) {
                console.log('⚠️ HeyGen streaming not available, using fallback mode');
                session.status = 'ready';
                session.streamingData.isConnected = true;
                session.streamingData.streamId = `mock_${finalSessionId}`;
            }

            console.log(`🎭 HeyGen avatar session created: ${finalSessionId} for ${counselorConfig.name}`);
            return session;

        } catch (error) {
            console.error('Create avatar session error:', error);
            throw error;
        }
    }

    // Initialize streaming connection for real-time avatar
    async initializeStreaming(sessionId) {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            // Create streaming session with HeyGen
            const streamingResponse = await axios.post(`${this.baseUrl}/streaming`, {
                avatar_id: session.counselorConfig.avatarId,
                voice_id: session.counselorConfig.voiceId,
                quality: 'high',
                background: 'blur',
                ratio: '16:9',
                enable_face_swap: false,
                enable_auto_focus: true,
                enable_emotion: true,
                enable_gesture: true
            }, {
                headers: this.getAuthHeaders()
            });

            const streamId = streamingResponse.data.data.stream_id;
            session.streamingData.streamId = streamId;
            session.status = 'ready';

            console.log(`🎬 HeyGen streaming initialized: ${streamId}`);
            return streamId;

        } catch (error) {
            console.error('Initialize streaming error:', error);
            throw error;
        }
    }

    // Make avatar speak with text and expressions
    async speak(sessionId, text, options = {}) {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            const {
                emotion = 'neutral',
                expression = 'speaking',
                gesture = 'none',
                speed = 1.0,
                pitch = 1.0
            } = options;

            // Update avatar state
            session.avatarState.isSpeaking = true;
            session.avatarState.currentExpression = expression;
            session.avatarState.currentEmotion = emotion;
            session.lastActivity = Date.now();

            // Check if we're in fallback mode
            if (session.streamingData.streamId && session.streamingData.streamId.startsWith('mock_')) {
                // Mock mode - simulate speaking
                console.log(`🗣️ Mock avatar speaking: ${text.substring(0, 50)}...`);
                
                // Simulate speaking delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Add message to session history
                session.messages.push({
                    id: uuidv4(),
                    type: 'counselor',
                    text: text,
                    timestamp: Date.now(),
                    emotion: emotion,
                    expression: expression
                });

                session.avatarState.isSpeaking = false;
                
                return {
                    success: true,
                    message: 'Mock avatar spoke successfully',
                    sessionId: sessionId
                };
            }

            // Real HeyGen API mode
            const speechData = {
                stream_id: session.streamingData.streamId,
                text: text,
                voice_id: session.counselorConfig.voiceId,
                emotion: emotion,
                expression: expression,
                gesture: gesture,
                speed: speed,
                pitch: pitch
            };

            const response = await axios.post(`${this.baseUrl}/streaming/speak`, speechData, {
                headers: this.getAuthHeaders()
            });

            // Add message to session history
            session.messages.push({
                id: uuidv4(),
                type: 'counselor',
                text: text,
                timestamp: Date.now(),
                emotion: emotion,
                expression: expression
            });

            console.log(`🗣️ HeyGen avatar speaking: ${text.substring(0, 50)}...`);
            return response.data;

        } catch (error) {
            console.error('HeyGen speak error:', error);
            throw error;
        }
    }

    // Generate AI response and speak it
    async generateAndSpeak(sessionId, userMessage, context = {}) {
        try {
            const session = this.sessions.get(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            // Add user message to history
            session.messages.push({
                id: uuidv4(),
                type: 'user',
                text: userMessage,
                timestamp: Date.now()
            });

            // Generate AI response using OpenAI
            const aiResponse = await this.generateAIResponse(userMessage, session, context);
            
            // Determine emotion and expression based on response
            const emotionAnalysis = this.analyzeEmotion(aiResponse);
            const expression = this.getContextualExpression(emotionAnalysis);

            // Speak the response
            await this.speak(sessionId, aiResponse, {
                emotion: emotionAnalysis.dominant,
                expression: expression,
                gesture: this.getContextualGesture(emotionAnalysis)
            });

            return {
                response: aiResponse,
                emotion: emotionAnalysis.dominant,
                expression: expression,
                sessionId: sessionId
            };

        } catch (error) {
            console.error('Generate and speak error:', error);
            throw error;
        }
    }

    // Generate AI response using OpenAI
    async generateAIResponse(userMessage, session, context = {}) {
        try {
            const counselorConfig = session.counselorConfig;
            
            const prompt = `You are ${counselorConfig.name}, a professional counselor specializing in ${counselorConfig.specialty}. 
            
Your personality: ${counselorConfig.personality}
Your background: ${counselorConfig.description}

IMPORTANT SAFETY GUIDELINES:
- NEVER discuss self-harm, suicide, or methods of harm
- NEVER provide medical advice or diagnosis
- ALWAYS maintain professional boundaries
- If someone mentions self-harm or crisis, provide crisis resources
- Focus on emotional support, coping strategies, and professional guidance

User message: "${userMessage}"

Respond as ${counselorConfig.name} would, maintaining your professional expertise and personality. Keep responses conversational and supportive, typically 2-4 sentences.`;

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: prompt
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                max_tokens: 200,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content.trim();

        } catch (error) {
            console.error('AI response generation error:', error);
            return "I understand you're going through a difficult time. I'm here to listen and support you. Would you like to tell me more about what's on your mind?";
        }
    }

    // Analyze emotion from text
    analyzeEmotion(text) {
        const emotions = {
            joy: this.detectEmotion(text, ['happy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'joy', 'pleased']),
            sadness: this.detectEmotion(text, ['sad', 'depressed', 'lonely', 'hopeless', 'miserable', 'down', 'blue', 'unhappy']),
            concern: this.detectEmotion(text, ['worried', 'concerned', 'anxious', 'nervous', 'stress', 'overwhelmed']),
            empathy: this.detectEmotion(text, ['understand', 'feel', 'hear', 'support', 'care', 'help']),
            encouragement: this.detectEmotion(text, ['hope', 'believe', 'strength', 'courage', 'progress', 'growth']),
            professional: this.detectEmotion(text, ['therapy', 'treatment', 'professional', 'clinical', 'assessment'])
        };

        const dominant = Object.entries(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b)[0];
        const intensity = Math.min(Object.values(emotions).reduce((sum, val) => sum + val, 0) / 10, 1);

        return {
            emotions,
            dominant,
            intensity,
            context: this.analyzeContext(text)
        };
    }

    detectEmotion(text, keywords) {
        const lowerText = text.toLowerCase();
        return keywords.reduce((count, word) => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = lowerText.match(regex);
            return count + (matches ? matches.length : 0);
        }, 0);
    }

    analyzeContext(text) {
        const contexts = {
            crisis: /(suicide|self.?harm|kill.*self|end.*life|want.*die)/i,
            relationship: /(relationship|partner|marriage|family|friend)/i,
            work: /(work|job|career|boss|colleague|stress)/i,
            health: /(health|medical|doctor|symptoms|pain)/i,
            general: /(feel|emotion|mood|life|problem)/i
        };

        for (const [context, pattern] of Object.entries(contexts)) {
            if (pattern.test(text)) {
                return context;
            }
        }
        return 'general';
    }

    // Get contextual expression based on emotion
    getContextualExpression(emotionAnalysis) {
        const { dominant, intensity } = emotionAnalysis;
        
        const expressions = {
            joy: 'happy',
            sadness: 'concerned',
            concern: 'worried',
            empathy: 'caring',
            encouragement: 'supportive',
            professional: 'focused'
        };

        return expressions[dominant] || 'neutral';
    }

    // Get contextual gesture based on emotion
    getContextualGesture(emotionAnalysis) {
        const { dominant, intensity } = emotionAnalysis;
        
        const gestures = {
            joy: 'nod',
            sadness: 'lean_forward',
            concern: 'tilt_head',
            empathy: 'open_palms',
            encouragement: 'thumbs_up',
            professional: 'straight_posture'
        };

        return gestures[dominant] || 'none';
    }

    // Get session information
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    // Get all active sessions
    getAllSessions() {
        return Array.from(this.sessions.values());
    }

    // Clean up session
    async cleanupSession(sessionId) {
        try {
            const session = this.sessions.get(sessionId);
            if (session) {
                // Close streaming connection
                if (session.streamingData.streamId) {
                    await axios.delete(`${this.baseUrl}/streaming/${session.streamingData.streamId}`, {
                        headers: this.getAuthHeaders()
                    });
                }

                // Remove session
                this.sessions.delete(sessionId);
                console.log(`🧹 HeyGen session cleaned up: ${sessionId}`);
            }
        } catch (error) {
            console.error('Cleanup session error:', error);
        }
    }

    // Get counselor configurations
    getCounselorConfigs() {
        return this.counselorConfigs;
    }

    // Get specific counselor config
    getCounselorConfig(counselorId) {
        return this.counselorConfigs[counselorId];
    }

    // Health check
    async healthCheck() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`, {
                headers: this.getAuthHeaders()
            });
            return {
                status: 'healthy',
                service: 'HeyGen Avatar Service',
                activeSessions: this.sessions.size,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                service: 'HeyGen Avatar Service',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = HeyGenAvatarService; 