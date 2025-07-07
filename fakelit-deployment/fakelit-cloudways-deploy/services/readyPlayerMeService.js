const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class ReadyPlayerMeService {
    constructor() {
        this.apiKey = process.env.RPM_API_KEY;
        this.baseUrl = 'https://api.readyplayer.me/v1';
        this.avatars = new Map();
        this.sessions = new Map();
        
        // Pre-configured avatar models including the provided one
        this.avatarModels = {
            'dr-sarah-mitchell': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Dr. Sarah Mitchell',
                gender: 'female',
                style: 'professional',
                specialty: 'Clinical Psychology'
            },
            'michael-rodriguez': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Michael Rodriguez',
                gender: 'male',
                style: 'friendly',
                specialty: 'Family Therapy'
            },
            'dr-emily-chen': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Dr. Emily Chen',
                gender: 'female',
                style: 'compassionate',
                specialty: 'Trauma Therapy'
            },
            'james-williams': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'James Williams',
                gender: 'male',
                style: 'supportive',
                specialty: 'Addiction Counseling'
            },
            'dr-maria-garcia': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Dr. Maria Garcia',
                gender: 'female',
                style: 'warm',
                specialty: 'Child Psychology'
            },
            'lisa-thompson': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Lisa Thompson',
                gender: 'female',
                style: 'empathetic',
                specialty: 'Relationship Counseling'
            }
        };
    }

    // Get authentication headers
    getAuthHeaders() {
        if (this.apiKey) {
            return {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    }

    // Create a new avatar session
    async createAvatarSession(counselorId, sessionId = null) {
        try {
            const finalSessionId = sessionId || `rpm_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const avatarModel = this.avatarModels[counselorId];
            
            if (!avatarModel) {
                throw new Error(`Counselor ${counselorId} not found`);
            }

            // Create session data
            const session = {
                id: finalSessionId,
                counselorId: counselorId,
                avatarModel: avatarModel,
                status: 'active',
                createdAt: Date.now(),
                lastActivity: Date.now(),
                messages: [],
                avatarState: {
                    isSpeaking: false,
                    currentExpression: 'neutral',
                    currentEmotion: 'calm',
                    currentGesture: 'none'
                }
            };

            this.sessions.set(finalSessionId, session);
            console.log(`🎭 RPM avatar session created: ${finalSessionId} for ${counselorId}`);
            
            return {
                sessionId: finalSessionId,
                counselorId: counselorId,
                avatarModel: avatarModel,
                status: 'active',
                message: 'Ready Player Me avatar session created successfully'
            };
        } catch (error) {
            console.error('Create RPM avatar session error:', error);
            throw error;
        }
    }

    // Make avatar speak with expressions
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

            // Simulate avatar response (since we're using pre-configured models)
            const response = {
                sessionId: sessionId,
                text: text,
                avatarState: session.avatarState,
                audioUrl: null, // Would be generated by voice service
                duration: text.length * 0.06, // Rough estimate
                timestamp: Date.now()
            };

            // Add to session messages
            session.messages.push({
                role: 'assistant',
                content: text,
                timestamp: Date.now(),
                avatarState: session.avatarState
            });

            // Reset speaking state after a delay
            setTimeout(() => {
                session.avatarState.isSpeaking = false;
            }, response.duration * 1000);

            console.log(`🎭 RPM avatar spoke: ${text.substring(0, 50)}...`);
            return response;
        } catch (error) {
            console.error('RPM speak error:', error);
            throw error;
        }
    }

    // Get avatar model info
    async getAvatarModel(counselorId) {
        try {
            const avatarModel = this.avatarModels[counselorId];
            if (!avatarModel) {
                throw new Error(`Avatar model not found for counselor: ${counselorId}`);
            }
            return avatarModel;
        } catch (error) {
            console.error('Get avatar model error:', error);
            throw error;
        }
    }

    // Get all available counselors
    async getCounselors() {
        try {
            const counselors = Object.keys(this.avatarModels).map(counselorId => {
                const model = this.avatarModels[counselorId];
                return {
                    id: counselorId,
                    name: model.name,
                    gender: model.gender,
                    style: model.style,
                    specialty: model.specialty,
                    avatarModel: model.modelUrl,
                    available: true
                };
            });
            return counselors;
        } catch (error) {
            console.error('Get counselors error:', error);
            throw error;
        }
    }

    // Get a specific avatar by ID
    async getAvatar(avatarId) {
        try {
            // Check if it's a session ID
            if (this.sessions.has(avatarId)) {
                return this.sessions.get(avatarId);
            }
            
            // Check if it's a counselor ID
            const avatarModel = this.avatarModels[avatarId];
            if (avatarModel) {
                return {
                    id: avatarId,
                    name: avatarModel.name,
                    gender: avatarModel.gender,
                    style: avatarModel.style,
                    specialty: avatarModel.specialty,
                    avatarModel: avatarModel.modelUrl,
                    available: true
                };
            }
            
            throw new Error(`Avatar not found: ${avatarId}`);
        } catch (error) {
            console.error('Get avatar error:', error);
            throw error;
        }
    }

    // Update avatar properties
    async updateAvatar(avatarId, updates) {
        try {
            const avatar = await this.getAvatar(avatarId);
            if (!avatar) {
                throw new Error(`Avatar not found: ${avatarId}`);
            }

            // Update avatar properties
            Object.assign(avatar, updates);
            
            // If it's a session, update the session
            if (this.sessions.has(avatarId)) {
                this.sessions.set(avatarId, avatar);
            }

            return avatar;
        } catch (error) {
            console.error('Update avatar error:', error);
            throw error;
        }
    }

    // Delete avatar
    async deleteAvatar(avatarId) {
        try {
            // Check if it's a session
            if (this.sessions.has(avatarId)) {
                this.sessions.delete(avatarId);
                return { success: true, message: 'Session deleted successfully' };
            }
            
            // For counselor avatars, we don't actually delete them, just return success
            if (this.avatarModels[avatarId]) {
                return { success: true, message: 'Avatar marked as unavailable' };
            }
            
            throw new Error(`Avatar not found: ${avatarId}`);
        } catch (error) {
            console.error('Delete avatar error:', error);
            throw error;
        }
    }

    // Get all counselor avatars (alias for getCounselors)
    async getAllCounselorAvatars() {
        return this.getCounselors();
    }

    // Create counselor avatar (alias for createAvatarSession)
    async createCounselorAvatar(counselorId, sessionId = null) {
        return this.createAvatarSession(counselorId, sessionId);
    }

    // Clean up session
    async cleanupSession(sessionId) {
        try {
            const session = this.sessions.get(sessionId);
            if (session) {
                this.sessions.delete(sessionId);
                console.log(`🧹 RPM session cleaned up: ${sessionId}`);
            }
        } catch (error) {
            console.error('Cleanup session error:', error);
        }
    }

    // Health check
    async healthCheck() {
        try {
            return {
                status: 'healthy',
                service: 'Ready Player Me Avatar Service',
                activeSessions: this.sessions.size,
                availableModels: Object.keys(this.avatarModels).length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                service: 'Ready Player Me Avatar Service',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = ReadyPlayerMeService; 