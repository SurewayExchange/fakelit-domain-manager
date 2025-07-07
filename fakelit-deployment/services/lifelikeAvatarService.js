const axios = require('axios');
const WebSocket = require('ws');

class LifelikeAvatarService {
    constructor() {
        this.avatars = new Map();
        this.voiceService = null;
        this.expressionEngine = null;
        this.emotionAnalyzer = null;
        
        // Initialize services
        this.initializeVoiceService();
        this.initializeExpressionEngine();
        this.initializeEmotionAnalyzer();
    }

    // Initialize ElevenLabs voice service
    async initializeVoiceService() {
        try {
            this.voiceService = {
                apiKey: process.env.ELEVENLABS_API_KEY,
                baseUrl: 'https://api.elevenlabs.io/v1',
                voices: {
                    'dr-sarah-mitchell': '21m00Tcm4TlvDq8ikWAM', // Rachel - warm, professional
                    'michael-rodriguez': 'AZnzlk1XvdvUeBnXmlld', // Domi - supportive, calm
                    'dr-emily-chen': 'EXAVITQu4vr4xnSDxMaL', // Bella - gentle, caring
                    'james-williams': 'VR6AewLTigWG4xSOukaG', // Arnold - confident, motivational
                    'dr-maria-garcia': 'pNInz6obpgDQGcFmaJgB', // Adam - professional, medical
                    'lisa-thompson': 'ThT5KcBeYPX3keUQqHPh' // Josh - friendly, approachable
                }
            };
            console.log('🎤 Voice service initialized');
        } catch (error) {
            console.error('Voice service initialization error:', error);
        }
    }

    // Initialize expression engine for real-time facial expressions
    initializeExpressionEngine() {
        this.expressionEngine = {
            expressions: {
                neutral: { eyes: 'normal', mouth: 'neutral', eyebrows: 'relaxed' },
                listening: { eyes: 'focused', mouth: 'slightly_open', eyebrows: 'attentive' },
                concerned: { eyes: 'worried', mouth: 'slightly_frown', eyebrows: 'furrowed' },
                encouraging: { eyes: 'warm', mouth: 'gentle_smile', eyebrows: 'raised' },
                thoughtful: { eyes: 'distant', mouth: 'neutral', eyebrows: 'slightly_furrowed' },
                empathetic: { eyes: 'caring', mouth: 'gentle_smile', eyebrows: 'soft' },
                professional: { eyes: 'focused', mouth: 'neutral', eyebrows: 'straight' },
                supportive: { eyes: 'encouraging', mouth: 'warm_smile', eyebrows: 'open' }
            },
            
            // Generate expression based on context and emotion
            generateExpression(context, emotion, intensity = 0.5) {
                const baseExpression = this.expressions[context] || this.expressions.neutral;
                const emotionModifier = this.getEmotionModifier(emotion, intensity);
                
                return {
                    ...baseExpression,
                    ...emotionModifier,
                    intensity: intensity,
                    timestamp: Date.now()
                };
            },
            
            getEmotionModifier(emotion, intensity) {
                const modifiers = {
                    happy: { mouth: 'smile', eyes: 'bright' },
                    sad: { mouth: 'slight_frown', eyes: 'soft' },
                    concerned: { eyebrows: 'furrowed', eyes: 'worried' },
                    excited: { mouth: 'open_smile', eyes: 'wide' },
                    calm: { mouth: 'gentle_smile', eyes: 'relaxed' },
                    focused: { eyes: 'intense', eyebrows: 'straight' }
                };
                
                return modifiers[emotion] || {};
            }
        };
        console.log('😊 Expression engine initialized');
    }

    // Initialize emotion analyzer for context-aware responses
    initializeEmotionAnalyzer() {
        this.emotionAnalyzer = {
            // Analyze text sentiment and extract emotions
            analyzeText(text) {
                const emotions = {
                    joy: this.detectJoy(text),
                    sadness: this.detectSadness(text),
                    anger: this.detectAnger(text),
                    fear: this.detectFear(text),
                    surprise: this.detectSurprise(text),
                    trust: this.detectTrust(text),
                    anticipation: this.detectAnticipation(text)
                };
                
                const dominantEmotion = this.getDominantEmotion(emotions);
                const intensity = this.calculateIntensity(emotions);
                
                return {
                    emotions,
                    dominant: dominantEmotion,
                    intensity,
                    context: this.analyzeContext(text)
                };
            },
            
            detectJoy(text) {
                const joyWords = ['happy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'joy', 'pleased'];
                return this.countEmotionWords(text, joyWords);
            },
            
            detectSadness(text) {
                const sadWords = ['sad', 'depressed', 'lonely', 'hopeless', 'miserable', 'down', 'blue', 'unhappy'];
                return this.countEmotionWords(text, sadWords);
            },
            
            detectAnger(text) {
                const angerWords = ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'annoyed', 'upset'];
                return this.countEmotionWords(text, angerWords);
            },
            
            detectFear(text) {
                const fearWords = ['afraid', 'scared', 'anxious', 'worried', 'terrified', 'nervous', 'fear'];
                return this.countEmotionWords(text, fearWords);
            },
            
            detectSurprise(text) {
                const surpriseWords = ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'wow'];
                return this.countEmotionWords(text, surpriseWords);
            },
            
            detectTrust(text) {
                const trustWords = ['trust', 'believe', 'confident', 'sure', 'certain', 'reliable'];
                return this.countEmotionWords(text, trustWords);
            },
            
            detectAnticipation(text) {
                const anticipationWords = ['hope', 'expect', 'look forward', 'anticipate', 'excited about'];
                return this.countEmotionWords(text, anticipationWords);
            },
            
            countEmotionWords(text, words) {
                const lowerText = text.toLowerCase();
                return words.reduce((count, word) => {
                    const regex = new RegExp(`\\b${word}\\b`, 'gi');
                    const matches = lowerText.match(regex);
                    return count + (matches ? matches.length : 0);
                }, 0);
            },
            
            getDominantEmotion(emotions) {
                return Object.entries(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b)[0];
            },
            
            calculateIntensity(emotions) {
                const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
                return total > 0 ? Math.min(total / 10, 1) : 0;
            },
            
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
        };
        console.log('🧠 Emotion analyzer initialized');
    }

    // Create a lifelike avatar session
    async createLifelikeAvatar(counselorId, sessionId) {
        try {
            const avatarConfig = this.getCounselorConfig(counselorId);
            
            const avatar = {
                id: sessionId,
                counselorId: counselorId,
                config: avatarConfig,
                currentExpression: 'neutral',
                currentEmotion: 'neutral',
                voiceQueue: [],
                isSpeaking: false,
                lastInteraction: Date.now(),
                sessionData: {
                    messages: [],
                    emotions: [],
                    expressions: []
                }
            };
            
            this.avatars.set(sessionId, avatar);
            
            // Initialize avatar with greeting
            await this.speak(avatar, avatarConfig.greeting, 'greeting');
            
            return {
                success: true,
                avatarId: sessionId,
                counselorId: counselorId,
                config: avatarConfig
            };
            
        } catch (error) {
            console.error('Error creating lifelike avatar:', error);
            throw new Error(`Lifelike avatar creation failed: ${error.message}`);
        }
    }

    // Get counselor configuration
    getCounselorConfig(counselorId) {
        const configs = {
            'dr-sarah-mitchell': {
                name: 'Dr. Sarah Mitchell',
                specialty: 'Mental Health & CBT',
                voiceId: '21m00Tcm4TlvDq8ikWAM',
                personality: 'compassionate, professional, evidence-based',
                greeting: "Hello, I'm Dr. Sarah Mitchell. I'm here to support you with a compassionate, evidence-based approach. How are you feeling today?",
                expressions: ['listening', 'concerned', 'encouraging', 'thoughtful'],
                speakingStyle: 'warm, professional, measured',
                responseDelay: 1000
            },
            'michael-rodriguez': {
                name: 'Michael Rodriguez',
                specialty: 'Substance Abuse & Recovery',
                voiceId: 'AZnzlk1XvdvUeBnXmlld',
                personality: 'supportive, understanding, recovery-focused',
                greeting: "Hi, I'm Michael. I understand the challenges you're facing, and I'm here to walk this journey with you. What's on your mind?",
                expressions: ['supportive', 'empathetic', 'encouraging', 'focused'],
                speakingStyle: 'calm, supportive, understanding',
                responseDelay: 1200
            },
            'dr-emily-chen': {
                name: 'Dr. Emily Chen',
                specialty: 'Relationships & Family',
                voiceId: 'EXAVITQu4vr4xnSDxMaL',
                personality: 'warm, insightful, relationship-oriented',
                greeting: "Hello, I'm Dr. Emily Chen. I specialize in helping people navigate relationships and family dynamics. How can I support you today?",
                expressions: ['warm', 'understanding', 'insightful', 'caring'],
                speakingStyle: 'gentle, warm, insightful',
                responseDelay: 1100
            },
            'james-williams': {
                name: 'James Williams',
                specialty: 'Career & Life Coaching',
                voiceId: 'VR6AewLTigWG4xSOukaG',
                personality: 'motivational, practical, goal-oriented',
                greeting: "Hey there, I'm James! I'm passionate about helping people achieve their goals and find their path. What would you like to work on?",
                expressions: ['motivated', 'focused', 'encouraging', 'practical'],
                speakingStyle: 'energetic, motivational, practical',
                responseDelay: 900
            },
            'dr-maria-garcia': {
                name: 'Dr. Maria Garcia',
                specialty: 'Medical & Health Psychology',
                voiceId: 'pNInz6obpgDQGcFmaJgB',
                personality: 'professional, medical, caring',
                greeting: "Hello, I'm Dr. Maria Garcia. I'm here to help you with health-related concerns and medical psychology. How are you feeling?",
                expressions: ['professional', 'caring', 'focused', 'medical'],
                speakingStyle: 'professional, caring, medical',
                responseDelay: 1000
            },
            'lisa-thompson': {
                name: 'Lisa Thompson',
                specialty: 'General Counseling & Support',
                voiceId: 'ThT5KcBeYPX3keUQqHPh',
                personality: 'friendly, approachable, supportive',
                greeting: "Hi, I'm Lisa! I'm here to provide a safe, supportive space for you to share and work through whatever you're experiencing. How are you doing?",
                expressions: ['friendly', 'supportive', 'empathetic', 'warm'],
                speakingStyle: 'friendly, approachable, supportive',
                responseDelay: 1000
            }
        };
        
        return configs[counselorId] || configs['dr-sarah-mitchell'];
    }

    // Process user message and generate lifelike response
    async processMessage(sessionId, userMessage) {
        try {
            const avatar = this.avatars.get(sessionId);
            if (!avatar) {
                throw new Error('Avatar session not found');
            }
            
            // Analyze user's emotional state
            const emotionAnalysis = this.emotionAnalyzer.analyzeText(userMessage);
            
            // Update avatar's emotional state
            avatar.currentEmotion = emotionAnalysis.dominant;
            avatar.sessionData.emotions.push({
                timestamp: Date.now(),
                emotion: emotionAnalysis.dominant,
                intensity: emotionAnalysis.intensity,
                context: emotionAnalysis.context
            });
            
            // Generate appropriate expression
            const expression = this.expressionEngine.generateExpression(
                this.getContextualExpression(emotionAnalysis),
                emotionAnalysis.dominant,
                emotionAnalysis.intensity
            );
            
            avatar.currentExpression = expression;
            avatar.sessionData.expressions.push({
                timestamp: Date.now(),
                expression: expression
            });
            
            // Store message
            avatar.sessionData.messages.push({
                timestamp: Date.now(),
                type: 'user',
                content: userMessage,
                emotion: emotionAnalysis
            });
            
            // Generate AI response (this would integrate with your existing AI service)
            const aiResponse = await this.generateAIResponse(userMessage, avatar);
            
            // Add natural delay for more human-like interaction
            await this.delay(avatar.config.responseDelay);
            
            // Speak the response with appropriate expression
            await this.speak(avatar, aiResponse, emotionAnalysis.context);
            
            return {
                success: true,
                response: aiResponse,
                expression: expression,
                emotion: emotionAnalysis,
                avatarState: {
                    currentExpression: avatar.currentExpression,
                    currentEmotion: avatar.currentEmotion,
                    isSpeaking: avatar.isSpeaking
                }
            };
            
        } catch (error) {
            console.error('Error processing message:', error);
            throw new Error(`Message processing failed: ${error.message}`);
        }
    }

    // Generate AI response (integrate with your existing AI service)
    async generateAIResponse(userMessage, avatar) {
        // This would integrate with your existing AI chat service
        // For now, return a placeholder response
        const responses = {
            crisis: "I hear that you're going through something very difficult. Your feelings are valid, and I want you to know that you're not alone. Would you like to talk more about what's happening?",
            relationship: "Relationships can be complex and challenging. I'm here to help you explore your feelings and find healthy ways to navigate this situation.",
            work: "Work-related stress can be overwhelming. Let's talk about what's happening and explore some strategies to help you manage this better.",
            health: "Health concerns can be very stressful. I'm here to support you emotionally as you navigate this challenging time.",
            general: "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about how you're feeling?"
        };
        
        const context = this.emotionAnalyzer.analyzeContext(userMessage);
        return responses[context] || responses.general;
    }

    // Speak with voice synthesis and expression
    async speak(avatar, text, context = 'general') {
        try {
            avatar.isSpeaking = true;
            
            // Generate appropriate expression for speaking
            const speakingExpression = this.expressionEngine.generateExpression(
                context,
                avatar.currentEmotion,
                0.7
            );
            
            avatar.currentExpression = speakingExpression;
            
            // Add to voice queue
            avatar.voiceQueue.push({
                text: text,
                expression: speakingExpression,
                timestamp: Date.now()
            });
            
            // Process voice synthesis
            const audioUrl = await this.synthesizeVoice(avatar.config.voiceId, text);
            
            // Simulate speaking duration
            const speakingDuration = text.length * 50; // Rough estimate
            await this.delay(speakingDuration);
            
            avatar.isSpeaking = false;
            
            return {
                success: true,
                audioUrl: audioUrl,
                expression: speakingExpression,
                duration: speakingDuration
            };
            
        } catch (error) {
            console.error('Error speaking:', error);
            avatar.isSpeaking = false;
            throw new Error(`Speech synthesis failed: ${error.message}`);
        }
    }

    // Synthesize voice using ElevenLabs
    async synthesizeVoice(voiceId, text) {
        try {
            if (!this.voiceService || !this.voiceService.apiKey) {
                console.warn('Voice service not configured, using text-to-speech fallback');
                return null;
            }
            
            const response = await axios.post(
                `${this.voiceService.baseUrl}/text-to-speech/${voiceId}`,
                {
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                },
                {
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': this.voiceService.apiKey
                    },
                    responseType: 'arraybuffer'
                }
            );
            
            // In a real implementation, you'd save this to a file or stream it
            // For now, return a placeholder URL
            return `data:audio/mpeg;base64,${Buffer.from(response.data).toString('base64')}`;
            
        } catch (error) {
            console.error('Voice synthesis error:', error);
            return null;
        }
    }

    // Get contextual expression based on emotion analysis
    getContextualExpression(emotionAnalysis) {
        const { dominant, context, intensity } = emotionAnalysis;
        
        if (intensity > 0.7) {
            return 'concerned';
        }
        
        const contextExpressions = {
            crisis: 'concerned',
            relationship: 'empathetic',
            work: 'focused',
            health: 'caring',
            general: 'listening'
        };
        
        return contextExpressions[context] || 'listening';
    }

    // Utility function for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get avatar state
    getAvatarState(sessionId) {
        const avatar = this.avatars.get(sessionId);
        if (!avatar) {
            return null;
        }
        
        return {
            counselorId: avatar.counselorId,
            currentExpression: avatar.currentExpression,
            currentEmotion: avatar.currentEmotion,
            isSpeaking: avatar.isSpeaking,
            lastInteraction: avatar.lastInteraction,
            sessionData: avatar.sessionData
        };
    }

    // Clean up avatar session
    cleanupSession(sessionId) {
        this.avatars.delete(sessionId);
        return { success: true, message: 'Session cleaned up' };
    }
}

module.exports = LifelikeAvatarService; 