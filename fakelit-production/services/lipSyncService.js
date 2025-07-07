const axios = require('axios');
const fs = require('fs');
const path = require('path');

class LipSyncService {
    constructor() {
        this.providers = {
            did: {
                baseUrl: 'https://api.d-id.com',
                apiKey: process.env.DID_API_KEY
            },
            readyPlayerMe: {
                baseUrl: 'https://api.readyplayer.me/v1',
                apiKey: process.env.RPM_API_KEY
            }
        };

        this.visemeMapping = {
            'A': { mouth: 'open', intensity: 0.8 },
            'B': { mouth: 'closed', intensity: 0.3 },
            'C': { mouth: 'wide', intensity: 0.9 },
            'D': { mouth: 'tight', intensity: 0.6 },
            'E': { mouth: 'open', intensity: 0.7 },
            'F': { mouth: 'closed', intensity: 0.2 },
            'G': { mouth: 'wide', intensity: 0.8 },
            'H': { mouth: 'open', intensity: 0.5 },
            'X': { mouth: 'neutral', intensity: 0.1 },
            'L': { mouth: 'closed', intensity: 0.4 },
            'M': { mouth: 'closed', intensity: 0.5 },
            'N': { mouth: 'open', intensity: 0.3 },
            'O': { mouth: 'round', intensity: 0.7 },
            'P': { mouth: 'closed', intensity: 0.6 },
            'Q': { mouth: 'round', intensity: 0.8 },
            'R': { mouth: 'open', intensity: 0.4 },
            'S': { mouth: 'tight', intensity: 0.5 },
            'T': { mouth: 'closed', intensity: 0.4 },
            'U': { mouth: 'round', intensity: 0.6 },
            'V': { mouth: 'closed', intensity: 0.3 },
            'W': { mouth: 'round', intensity: 0.7 },
            'Y': { mouth: 'wide', intensity: 0.6 },
            'Z': { mouth: 'tight', intensity: 0.4 }
        };

        this.expressionMapping = {
            'happy': { smile: 0.8, eyebrows: 'raised', eyes: 'bright' },
            'concerned': { smile: 0.2, eyebrows: 'furrowed', eyes: 'worried' },
            'listening': { smile: 0.4, eyebrows: 'neutral', eyes: 'attentive' },
            'supportive': { smile: 0.6, eyebrows: 'raised', eyes: 'caring' },
            'professional': { smile: 0.3, eyebrows: 'neutral', eyes: 'focused' },
            'neutral': { smile: 0.0, eyebrows: 'neutral', eyes: 'normal' }
        };
    }

    // Generate lip sync using D-ID API
    async generateDIDLipSync(audioUrl, avatarUrl, options = {}) {
        try {
            const response = await axios({
                method: 'POST',
                url: `${this.providers.did.baseUrl}/talks`,
                headers: {
                    'Authorization': `Basic ${Buffer.from(this.providers.did.apiKey + ':').toString('base64')}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    script: {
                        type: 'audio',
                        audio_url: audioUrl
                    },
                    config: {
                        fluent: true,
                        pad_audio: 0.0,
                        stitch: true,
                        driver_expressions: {
                            transition_frames: 30,
                            transition_offset: 0.1
                        }
                    },
                    source_url: avatarUrl,
                    ...options
                }
            });

            const talkId = response.data.id;
            const result = await this.pollDIDTalk(talkId);

            return {
                success: true,
                video_url: result.result_url,
                duration: result.duration,
                provider: 'd-id',
                talk_id: talkId
            };

        } catch (error) {
            console.error('D-ID lip sync error:', error);
            throw new Error(`D-ID lip sync failed: ${error.message}`);
        }
    }

    // Poll D-ID talk for completion
    async pollDIDTalk(talkId, maxAttempts = 60) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await axios.get(`${this.providers.did.baseUrl}/talks/${talkId}`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(this.providers.did.apiKey + ':').toString('base64')}`
                    }
                });

                if (response.data.status === 'done') {
                    return response.data;
                } else if (response.data.status === 'error') {
                    throw new Error('D-ID talk failed');
                }

                // Wait 3 seconds before next poll
                await new Promise(resolve => setTimeout(resolve, 3000));

            } catch (error) {
                console.error('D-ID talk polling error:', error);
                throw error;
            }
        }

        throw new Error('D-ID talk timeout');
    }

    // Generate lip sync using Ready Player Me
    async generateRPMLipSync(audioUrl, avatarId, options = {}) {
        try {
            const response = await axios({
                method: 'POST',
                url: `${this.providers.readyPlayerMe.baseUrl}/animations`,
                headers: {
                    'Authorization': `Bearer ${this.providers.readyPlayerMe.apiKey}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    avatar_id: avatarId,
                    audio_url: audioUrl,
                    animation_type: 'lip_sync',
                    quality: options.quality || 'high',
                    format: options.format || 'glb',
                    ...options
                }
            });

            const animationId = response.data.id;
            const result = await this.pollRPMAnimation(animationId);

            return {
                success: true,
                animation_url: result.download_url,
                duration: result.duration,
                provider: 'ready-player-me',
                animation_id: animationId
            };

        } catch (error) {
            console.error('RPM lip sync error:', error);
            throw new Error(`RPM lip sync failed: ${error.message}`);
        }
    }

    // Poll Ready Player Me animation for completion
    async pollRPMAnimation(animationId, maxAttempts = 40) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await axios.get(`${this.providers.readyPlayerMe.baseUrl}/animations/${animationId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.providers.readyPlayerMe.apiKey}`
                    }
                });

                if (response.data.status === 'completed') {
                    return response.data;
                } else if (response.data.status === 'failed') {
                    throw new Error('RPM animation failed');
                }

                // Wait 2 seconds before next poll
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.error('RPM animation polling error:', error);
                throw error;
            }
        }

        throw new Error('RPM animation timeout');
    }

    // Generate viseme data from audio analysis
    async generateVisemeData(audioBuffer, options = {}) {
        try {
            // Analyze audio to extract phonemes and generate visemes
            const audioAnalysis = await this.analyzeAudio(audioBuffer);
            const visemes = this.audioToVisemes(audioAnalysis);

            return {
                success: true,
                visemes: visemes,
                duration: audioAnalysis.duration,
                sample_rate: audioAnalysis.sampleRate,
                provider: 'custom'
            };

        } catch (error) {
            console.error('Viseme generation error:', error);
            throw new Error(`Viseme generation failed: ${error.message}`);
        }
    }

    // Analyze audio buffer for phoneme detection
    async analyzeAudio(audioBuffer) {
        // This is a simplified audio analysis
        // In a real implementation, you'd use more sophisticated audio processing
        
        const sampleRate = 44100; // Assuming 44.1kHz
        const duration = audioBuffer.length / sampleRate;
        
        // Simple amplitude analysis
        const amplitudes = [];
        const segmentSize = Math.floor(sampleRate * 0.1); // 100ms segments
        
        for (let i = 0; i < audioBuffer.length; i += segmentSize) {
            const segment = audioBuffer.slice(i, Math.min(i + segmentSize, audioBuffer.length));
            const amplitude = Math.sqrt(segment.reduce((sum, sample) => sum + sample * sample, 0) / segment.length);
            amplitudes.push(amplitude);
        }

        return {
            duration: duration,
            sampleRate: sampleRate,
            amplitudes: amplitudes,
            segments: amplitudes.length
        };
    }

    // Convert audio analysis to visemes
    audioToVisemes(audioAnalysis) {
        const visemes = [];
        const segmentDuration = audioAnalysis.duration / audioAnalysis.segments;

        audioAnalysis.amplitudes.forEach((amplitude, index) => {
            const time = index * segmentDuration;
            const viseme = this.amplitudeToViseme(amplitude);
            
            visemes.push({
                time: time,
                viseme: viseme,
                intensity: Math.min(amplitude * 10, 1.0),
                duration: segmentDuration
            });
        });

        return visemes;
    }

    // Map amplitude to viseme
    amplitudeToViseme(amplitude) {
        const visemes = ['X', 'A', 'E', 'I', 'O', 'U', 'L', 'W', 'Q', 'M', 'B', 'P', 'F', 'V', 'D', 'T', 'S', 'Z', 'N', 'G', 'K'];
        const index = Math.floor(amplitude * visemes.length);
        return visemes[Math.min(index, visemes.length - 1)];
    }

    // Generate expression data based on context
    generateExpressionData(context, mood = 'neutral') {
        const baseExpression = this.expressionMapping[mood] || this.expressionMapping['neutral'];
        
        // Modify expression based on context
        const contextModifiers = {
            'crisis': { eyebrows: 'furrowed', eyes: 'concerned', smile: 0.1 },
            'support': { eyebrows: 'raised', eyes: 'caring', smile: 0.6 },
            'listening': { eyebrows: 'neutral', eyes: 'attentive', smile: 0.3 },
            'explaining': { eyebrows: 'raised', eyes: 'focused', smile: 0.4 },
            'reassuring': { eyebrows: 'raised', eyes: 'warm', smile: 0.7 }
        };

        const modifier = contextModifiers[context] || {};
        const expression = { ...baseExpression, ...modifier };

        return {
            success: true,
            expression: expression,
            context: context,
            mood: mood
        };
    }

    // Generate complete lip sync animation data
    async generateLipSyncAnimation(audioBuffer, avatarId, counselorId, context = 'general', options = {}) {
        try {
            // Generate viseme data
            const visemeData = await this.generateVisemeData(audioBuffer, options);
            
            // Generate expression data
            const expressionData = this.generateExpressionData(context, options.mood);
            
            // Combine into animation data
            const animationData = {
                visemes: visemeData.visemes,
                expressions: this.interpolateExpressions(expressionData.expression, visemeData.visemes.length),
                duration: visemeData.duration,
                avatar_id: avatarId,
                counselor_id: counselorId,
                context: context,
                mood: options.mood
            };

            return {
                success: true,
                animation_data: animationData,
                viseme_count: visemeData.visemes.length,
                duration: visemeData.duration
            };

        } catch (error) {
            console.error('Lip sync animation generation error:', error);
            throw new Error(`Lip sync animation generation failed: ${error.message}`);
        }
    }

    // Interpolate expressions across viseme timeline
    interpolateExpressions(baseExpression, visemeCount) {
        const expressions = [];
        
        for (let i = 0; i < visemeCount; i++) {
            // Add slight variation to make it more natural
            const variation = (Math.random() - 0.5) * 0.1;
            const smile = Math.max(0, Math.min(1, baseExpression.smile + variation));
            
            expressions.push({
                smile: smile,
                eyebrows: baseExpression.eyebrows,
                eyes: baseExpression.eyes,
                time: i * 0.1 // Assuming 100ms per viseme
            });
        }

        return expressions;
    }

    // Generate real-time lip sync data for streaming
    generateRealTimeLipSync(audioChunk, previousVisemes = []) {
        try {
            // Analyze audio chunk
            const amplitude = this.calculateChunkAmplitude(audioChunk);
            const viseme = this.amplitudeToViseme(amplitude);
            
            const newViseme = {
                time: Date.now() / 1000,
                viseme: viseme,
                intensity: Math.min(amplitude * 10, 1.0),
                duration: 0.1
            };

            // Combine with previous visemes
            const allVisemes = [...previousVisemes, newViseme];
            
            // Keep only recent visemes (last 2 seconds)
            const recentVisemes = allVisemes.filter(v => v.time > (Date.now() / 1000) - 2);

            return {
                success: true,
                current_viseme: newViseme,
                viseme_history: recentVisemes,
                amplitude: amplitude
            };

        } catch (error) {
            console.error('Real-time lip sync error:', error);
            throw new Error(`Real-time lip sync failed: ${error.message}`);
        }
    }

    // Calculate amplitude of audio chunk
    calculateChunkAmplitude(audioChunk) {
        if (!audioChunk || audioChunk.length === 0) return 0;
        
        const sum = audioChunk.reduce((acc, sample) => acc + Math.abs(sample), 0);
        return sum / audioChunk.length;
    }

    // Get viseme mapping for a specific counselor
    getCounselorVisemeMapping(counselorId) {
        const counselorMappings = {
            'dr-sarah-mitchell': { style: 'professional', intensity: 0.8 },
            'michael-rodriguez': { style: 'supportive', intensity: 0.7 },
            'dr-emily-chen': { style: 'gentle', intensity: 0.6 },
            'james-williams': { style: 'confident', intensity: 0.9 },
            'dr-maria-garcia': { style: 'calm', intensity: 0.5 },
            'lisa-thompson': { style: 'friendly', intensity: 0.8 }
        };

        return counselorMappings[counselorId] || counselorMappings['dr-sarah-mitchell'];
    }

    // Validate lip sync data
    validateLipSyncData(lipSyncData) {
        const required = ['visemes', 'duration'];
        const missing = required.filter(field => !lipSyncData[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }

        if (!Array.isArray(lipSyncData.visemes)) {
            throw new Error('Visemes must be an array');
        }

        if (lipSyncData.duration <= 0) {
            throw new Error('Duration must be positive');
        }

        return true;
    }
}

module.exports = LipSyncService; 