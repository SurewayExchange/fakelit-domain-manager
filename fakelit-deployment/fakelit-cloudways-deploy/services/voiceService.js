const axios = require('axios');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class VoiceService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        this.voiceProviders = {
            elevenlabs: {
                baseUrl: 'https://api.elevenlabs.io/v1',
                apiKey: process.env.ELEVENLABS_API_KEY
            },
            playht: {
                baseUrl: 'https://api.play.ht/api/v2',
                apiKey: process.env.PLAYHT_API_KEY,
                userId: process.env.PLAYHT_USER_ID
            },
            polly: {
                region: process.env.AWS_REGION || 'us-east-1',
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        };

        this.counselorVoices = {
            'dr-sarah-mitchell': {
                elevenlabs: '21m00Tcm4TlvDq8ikWAM', // Rachel - warm, professional
                playht: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json',
                polly: 'Joanna'
            },
            'michael-rodriguez': {
                elevenlabs: 'AZnzlk1XvdvUeBnXmlld', // Domi - supportive, calm
                playht: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/male-cs/manifest.json',
                polly: 'Miguel'
            },
            'dr-emily-chen': {
                elevenlabs: 'EXAVITQu4vr4xnSDxMaL', // Bella - compassionate, gentle
                playht: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json',
                polly: 'Salli'
            },
            'james-williams': {
                elevenlabs: 'VR6AewLTigWG4xSOukaG', // Josh - confident, encouraging
                playht: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/male-cs/manifest.json',
                polly: 'Matthew'
            },
            'dr-maria-garcia': {
                elevenlabs: 'pNInz6obpgDQGcFmaJgB', // Adam - calm, reassuring
                playht: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/male-cs/manifest.json',
                polly: 'Enrique'
            },
            'lisa-thompson': {
                elevenlabs: 'yoZ06aMxZJJ28mfd3POQ', // Sam - friendly, welcoming
                playht: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json',
                polly: 'Kimberly'
            }
        };
    }

    // Speech-to-Text using OpenAI Whisper
    async speechToText(audioBuffer, language = 'en') {
        try {
            // Create temporary file for Whisper API
            const tempFilePath = path.join(__dirname, '../temp', `audio_${Date.now()}.wav`);
            fs.writeFileSync(tempFilePath, audioBuffer);

            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: 'whisper-1',
                language: language,
                response_format: 'json'
            });

            // Clean up temporary file
            fs.unlinkSync(tempFilePath);

            return {
                success: true,
                text: transcription.text,
                language: transcription.language,
                confidence: transcription.confidence || 0.9
            };

        } catch (error) {
            console.error('Speech-to-Text error:', error);
            throw new Error(`Speech-to-Text failed: ${error.message}`);
        }
    }

    // Text-to-Speech using ElevenLabs
    async textToSpeechElevenLabs(text, counselorId, options = {}) {
        try {
            const voiceId = this.counselorVoices[counselorId]?.elevenlabs || this.counselorVoices['dr-sarah-mitchell'].elevenlabs;

            const response = await axios({
                method: 'POST',
                url: `${this.voiceProviders.elevenlabs.baseUrl}/text-to-speech/${voiceId}`,
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.voiceProviders.elevenlabs.apiKey
                },
                data: {
                    text: text,
                    model_id: options.model || 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: options.stability || 0.5,
                        similarity_boost: options.similarity_boost || 0.5,
                        style: options.style || 0.0,
                        use_speaker_boost: options.use_speaker_boost || true
                    }
                },
                responseType: 'arraybuffer'
            });

            return {
                success: true,
                audio: Buffer.from(response.data),
                format: 'mp3',
                provider: 'elevenlabs',
                voiceId: voiceId
            };

        } catch (error) {
            console.error('ElevenLabs TTS error:', error);
            throw new Error(`ElevenLabs TTS failed: ${error.message}`);
        }
    }

    // Text-to-Speech using PlayHT
    async textToSpeechPlayHT(text, counselorId, options = {}) {
        try {
            const voiceId = this.counselorVoices[counselorId]?.playht || this.counselorVoices['dr-sarah-mitchell'].playht;

            const response = await axios({
                method: 'POST',
                url: `${this.voiceProviders.playht.baseUrl}/tts`,
                headers: {
                    'Authorization': `Bearer ${this.voiceProviders.playht.apiKey}`,
                    'X-User-ID': this.voiceProviders.playht.userId,
                    'Content-Type': 'application/json'
                },
                data: {
                    text: text,
                    voice: voiceId,
                    quality: options.quality || 'medium',
                    output_format: options.output_format || 'mp3',
                    speed: options.speed || 1.0,
                    sample_rate: options.sample_rate || 24000
                }
            });

            // PlayHT returns a job ID, we need to poll for completion
            const jobId = response.data.id;
            const audioUrl = await this.pollPlayHTJob(jobId);

            // Download the audio file
            const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });

            return {
                success: true,
                audio: Buffer.from(audioResponse.data),
                format: 'mp3',
                provider: 'playht',
                voiceId: voiceId
            };

        } catch (error) {
            console.error('PlayHT TTS error:', error);
            throw new Error(`PlayHT TTS failed: ${error.message}`);
        }
    }

    // Poll PlayHT job for completion
    async pollPlayHTJob(jobId, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const response = await axios.get(`${this.voiceProviders.playht.baseUrl}/jobs/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.voiceProviders.playht.apiKey}`,
                        'X-User-ID': this.voiceProviders.playht.userId
                    }
                });

                if (response.data.status === 'COMPLETED') {
                    return response.data.output.url;
                } else if (response.data.status === 'FAILED') {
                    throw new Error('PlayHT job failed');
                }

                // Wait 2 seconds before next poll
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.error('PlayHT job polling error:', error);
                throw error;
            }
        }

        throw new Error('PlayHT job timeout');
    }

    // Text-to-Speech using Amazon Polly
    async textToSpeechPolly(text, counselorId, options = {}) {
        try {
            const AWS = require('aws-sdk');
            
            const polly = new AWS.Polly({
                region: this.voiceProviders.polly.region,
                accessKeyId: this.voiceProviders.polly.accessKeyId,
                secretAccessKey: this.voiceProviders.polly.secretAccessKey
            });

            const voiceId = this.counselorVoices[counselorId]?.polly || this.counselorVoices['dr-sarah-mitchell'].polly;

            const params = {
                Text: text,
                OutputFormat: options.output_format || 'mp3',
                VoiceId: voiceId,
                Engine: options.engine || 'neural',
                LanguageCode: options.language_code || 'en-US',
                SpeechMarkTypes: options.speech_mark_types || []
            };

            const result = await polly.synthesizeSpeech(params).promise();

            return {
                success: true,
                audio: result.AudioStream,
                format: 'mp3',
                provider: 'polly',
                voiceId: voiceId
            };

        } catch (error) {
            console.error('Polly TTS error:', error);
            throw new Error(`Polly TTS failed: ${error.message}`);
        }
    }

    // Main TTS method that tries providers in order
    async textToSpeech(text, counselorId, provider = 'elevenlabs', options = {}) {
        try {
            switch (provider.toLowerCase()) {
                case 'elevenlabs':
                    return await this.textToSpeechElevenLabs(text, counselorId, options);
                case 'playht':
                    return await this.textToSpeechPlayHT(text, counselorId, options);
                case 'polly':
                    return await this.textToSpeechPolly(text, counselorId, options);
                default:
                    // Try ElevenLabs first, fallback to others
                    try {
                        return await this.textToSpeechElevenLabs(text, counselorId, options);
                    } catch (error) {
                        console.log('ElevenLabs failed, trying PlayHT...');
                        return await this.textToSpeechPlayHT(text, counselorId, options);
                    }
            }
        } catch (error) {
            console.error('All TTS providers failed:', error);
            throw error;
        }
    }

    // Get available voices from ElevenLabs
    async getElevenLabsVoices() {
        try {
            const response = await axios.get(`${this.voiceProviders.elevenlabs.baseUrl}/voices`, {
                headers: {
                    'xi-api-key': this.voiceProviders.elevenlabs.apiKey
                }
            });

            return {
                success: true,
                voices: response.data.voices
            };

        } catch (error) {
            console.error('Error fetching ElevenLabs voices:', error);
            throw new Error(`Failed to fetch voices: ${error.message}`);
        }
    }

    // Get available voices from PlayHT
    async getPlayHTVoices() {
        try {
            const response = await axios.get(`${this.voiceProviders.playht.baseUrl}/voices`, {
                headers: {
                    'Authorization': `Bearer ${this.voiceProviders.playht.apiKey}`,
                    'X-User-ID': this.voiceProviders.playht.userId
                }
            });

            return {
                success: true,
                voices: response.data
            };

        } catch (error) {
            console.error('Error fetching PlayHT voices:', error);
            throw new Error(`Failed to fetch voices: ${error.message}`);
        }
    }

    // Generate lip sync data from audio
    async generateLipSyncData(audioBuffer, avatarId) {
        try {
            // This would integrate with D-ID API or similar service
            // For now, return mock viseme data based on audio analysis
            
            const audioContext = new (require('web-audio-api').AudioContext)();
            const audioBufferNode = await audioContext.decodeAudioData(audioBuffer);
            
            const sampleRate = audioBufferNode.sampleRate;
            const duration = audioBufferNode.duration;
            const channelData = audioBufferNode.getChannelData(0);
            
            // Generate visemes based on audio amplitude
            const visemes = [];
            const segmentDuration = 0.1; // 100ms segments
            const samplesPerSegment = Math.floor(sampleRate * segmentDuration);
            
            for (let i = 0; i < channelData.length; i += samplesPerSegment) {
                const segment = channelData.slice(i, i + samplesPerSegment);
                const amplitude = Math.sqrt(segment.reduce((sum, sample) => sum + sample * sample, 0) / segment.length);
                
                // Map amplitude to viseme
                const viseme = this.amplitudeToViseme(amplitude);
                
                visemes.push({
                    time: i / sampleRate,
                    viseme: viseme,
                    intensity: Math.min(amplitude * 10, 1.0)
                });
            }

            return {
                success: true,
                visemes: visemes,
                duration: duration,
                sample_rate: sampleRate
            };

        } catch (error) {
            console.error('Lip sync generation error:', error);
            throw new Error(`Lip sync generation failed: ${error.message}`);
        }
    }

    // Map audio amplitude to viseme
    amplitudeToViseme(amplitude) {
        const visemes = ['X', 'A', 'E', 'I', 'O', 'U', 'L', 'W', 'Q', 'M', 'B', 'P', 'F', 'V', 'D', 'T', 'S', 'Z', 'N', 'G', 'K'];
        const index = Math.floor(amplitude * visemes.length);
        return visemes[Math.min(index, visemes.length - 1)];
    }

    // Process real-time audio stream
    async processAudioStream(audioChunk, sessionId) {
        try {
            // Store audio chunk in session
            if (!this.audioSessions) this.audioSessions = new Map();
            
            if (!this.audioSessions.has(sessionId)) {
                this.audioSessions.set(sessionId, []);
            }
            
            this.audioSessions.get(sessionId).push(audioChunk);

            // Process accumulated audio if enough data
            const sessionAudio = this.audioSessions.get(sessionId);
            if (sessionAudio.length >= 10) { // Process every 10 chunks
                const combinedAudio = Buffer.concat(sessionAudio);
                const transcription = await this.speechToText(combinedAudio);
                
                // Clear processed audio
                this.audioSessions.set(sessionId, []);

                return {
                    success: true,
                    text: transcription.text,
                    isFinal: false,
                    confidence: transcription.confidence
                };
            }

            return {
                success: true,
                text: '',
                isFinal: false,
                confidence: 0
            };

        } catch (error) {
            console.error('Audio stream processing error:', error);
            throw new Error(`Audio stream processing failed: ${error.message}`);
        }
    }

    // Clean up session data
    cleanupSession(sessionId) {
        if (this.audioSessions && this.audioSessions.has(sessionId)) {
            this.audioSessions.delete(sessionId);
        }
    }
}

module.exports = VoiceService; 