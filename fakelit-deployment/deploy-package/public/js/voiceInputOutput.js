// CareConnect Voice Input/Output System
class VoiceInputOutput {
    constructor(options = {}) {
        this.options = {
            apiUrl: '/api/voice',
            autoStart: false,
            continuousMode: false,
            language: 'en-US',
            ...options
        };

        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioStream = null;
        this.isRecording = false;
        this.isPlaying = false;
        this.audioQueue = [];
        this.currentAudio = null;
        this.recognition = null;
        this.synthesis = null;
        
        this.onTranscription = null;
        this.onAudioStart = null;
        this.onAudioEnd = null;
        this.onError = null;

        this.init();
    }

    async init() {
        try {
            await this.setupAudioContext();
            await this.setupSpeechRecognition();
            await this.setupSpeechSynthesis();
            this.setupEventListeners();
        } catch (error) {
            console.error('Voice I/O initialization error:', error);
            throw error;
        }
    }

    async setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            console.log('Audio context initialized');
        } catch (error) {
            console.error('Audio context setup error:', error);
            throw new Error('Failed to initialize audio context');
        }
    }

    async setupSpeechRecognition() {
        try {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                
                this.recognition.continuous = this.options.continuousMode;
                this.recognition.interimResults = true;
                this.recognition.lang = this.options.language;
                this.recognition.maxAlternatives = 3;

                this.recognition.onstart = () => {
                    console.log('Speech recognition started');
                    this.isRecording = true;
                };

                this.recognition.onresult = (event) => {
                    this.handleRecognitionResult(event);
                };

                this.recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    this.handleError(event.error);
                };

                this.recognition.onend = () => {
                    console.log('Speech recognition ended');
                    this.isRecording = false;
                };

            } else {
                throw new Error('Speech recognition not supported');
            }
        } catch (error) {
            console.error('Speech recognition setup error:', error);
            throw error;
        }
    }

    async setupSpeechSynthesis() {
        try {
            if ('speechSynthesis' in window) {
                this.synthesis = window.speechSynthesis;
                
                // Get available voices
                await this.loadVoices();
                
                console.log('Speech synthesis initialized');
            } else {
                throw new Error('Speech synthesis not supported');
            }
        } catch (error) {
            console.error('Speech synthesis setup error:', error);
            throw error;
        }
    }

    async loadVoices() {
        return new Promise((resolve) => {
            if (this.synthesis.getVoices().length > 0) {
                resolve();
            } else {
                this.synthesis.onvoiceschanged = () => resolve();
            }
        });
    }

    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopRecording();
                this.stopSpeaking();
            }
        });

        // Handle audio context suspension
        if (this.audioContext) {
            this.audioContext.onstatechange = () => {
                if (this.audioContext.state === 'suspended') {
                    console.log('Audio context suspended');
                }
            };
        }
    }

    // Speech-to-Text Methods
    async startRecording() {
        try {
            if (this.isRecording) {
                console.log('Already recording');
                return;
            }

            // Request microphone permission
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });

            // Start speech recognition
            this.recognition.start();
            
            console.log('Recording started');
            return true;

        } catch (error) {
            console.error('Start recording error:', error);
            this.handleError(error);
            return false;
        }
    }

    stopRecording() {
        try {
            if (this.recognition && this.isRecording) {
                this.recognition.stop();
            }

            if (this.audioStream) {
                this.audioStream.getTracks().forEach(track => track.stop());
                this.audioStream = null;
            }

            console.log('Recording stopped');
        } catch (error) {
            console.error('Stop recording error:', error);
        }
    }

    handleRecognitionResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;

            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Emit transcription event
        if (this.onTranscription) {
            this.onTranscription({
                final: finalTranscript,
                interim: interimTranscript,
                confidence: event.results[event.results.length - 1][0].confidence,
                isFinal: finalTranscript.length > 0
            });
        }

        // Send to backend for processing
        if (finalTranscript) {
            this.sendTranscriptionToBackend(finalTranscript);
        }
    }

    async sendTranscriptionToBackend(text) {
        try {
            const response = await fetch(`${this.options.apiUrl}/transcribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    language: this.options.language,
                    timestamp: Date.now()
                })
            });

            const data = await response.json();
            if (data.success) {
                console.log('Transcription sent to backend:', data);
            } else {
                throw new Error(data.error || 'Failed to send transcription');
            }
        } catch (error) {
            console.error('Send transcription error:', error);
            this.handleError(error);
        }
    }

    // Text-to-Speech Methods
    async speakText(text, options = {}) {
        try {
            const speakOptions = {
                voice: options.voice || this.getDefaultVoice(),
                rate: options.rate || 1.0,
                pitch: options.pitch || 1.0,
                volume: options.volume || 1.0,
                ...options
            };

            // Create speech utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = speakOptions.voice;
            utterance.rate = speakOptions.rate;
            utterance.pitch = speakOptions.pitch;
            utterance.volume = speakOptions.volume;

            // Setup event handlers
            utterance.onstart = () => {
                this.isPlaying = true;
                if (this.onAudioStart) this.onAudioStart(text);
            };

            utterance.onend = () => {
                this.isPlaying = false;
                if (this.onAudioEnd) this.onAudioEnd(text);
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                this.handleError(event.error);
            };

            // Speak the text
            this.synthesis.speak(utterance);

            return true;

        } catch (error) {
            console.error('Speak text error:', error);
            this.handleError(error);
            return false;
        }
    }

    async speakWithElevenLabs(text, counselorId, options = {}) {
        try {
            const response = await fetch(`${this.options.apiUrl}/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    counselor_id: counselorId,
                    provider: 'elevenlabs',
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            await this.playAudio(audioUrl);
            
            return true;

        } catch (error) {
            console.error('ElevenLabs TTS error:', error);
            this.handleError(error);
            return false;
        }
    }

    async speakWithPlayHT(text, counselorId, options = {}) {
        try {
            const response = await fetch(`${this.options.apiUrl}/synthesize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    counselor_id: counselorId,
                    provider: 'playht',
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            await this.playAudio(audioUrl);
            
            return true;

        } catch (error) {
            console.error('PlayHT TTS error:', error);
            this.handleError(error);
            return false;
        }
    }

    async playAudio(audioUrl) {
        try {
            const audio = new Audio(audioUrl);
            
            audio.onloadstart = () => {
                this.isPlaying = true;
                if (this.onAudioStart) this.onAudioStart();
            };

            audio.onended = () => {
                this.isPlaying = false;
                if (this.onAudioEnd) this.onAudioEnd();
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = (error) => {
                console.error('Audio playback error:', error);
                this.handleError(error);
                URL.revokeObjectURL(audioUrl);
            };

            await audio.play();

        } catch (error) {
            console.error('Play audio error:', error);
            this.handleError(error);
        }
    }

    stopSpeaking() {
        try {
            if (this.synthesis && this.isPlaying) {
                this.synthesis.cancel();
            }

            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
                this.currentAudio = null;
            }

            this.isPlaying = false;
            console.log('Speaking stopped');
        } catch (error) {
            console.error('Stop speaking error:', error);
        }
    }

    // Voice Management Methods
    getDefaultVoice() {
        const voices = this.synthesis.getVoices();
        
        // Try to find a good default voice
        const preferredVoices = ['en-US', 'en-GB', 'en'];
        for (const lang of preferredVoices) {
            const voice = voices.find(v => v.lang.startsWith(lang));
            if (voice) return voice;
        }

        return voices[0] || null;
    }

    getVoices() {
        return this.synthesis.getVoices();
    }

    getVoiceByLanguage(language) {
        const voices = this.synthesis.getVoices();
        return voices.find(voice => voice.lang.startsWith(language));
    }

    // Real-time Audio Processing
    async processAudioStream(audioChunk, sessionId) {
        try {
            const response = await fetch(`${this.options.apiUrl}/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                body: audioChunk
            });

            const data = await response.json();
            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || 'Stream processing failed');
            }
        } catch (error) {
            console.error('Audio stream processing error:', error);
            this.handleError(error);
            return null;
        }
    }

    // Audio Recording for File Upload
    async recordAudioFile(duration = 5000) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            const chunks = [];
            
            return new Promise((resolve, reject) => {
                mediaRecorder.ondataavailable = (event) => {
                    chunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    stream.getTracks().forEach(track => track.stop());
                    resolve(blob);
                };

                mediaRecorder.onerror = (error) => {
                    stream.getTracks().forEach(track => track.stop());
                    reject(error);
                };

                mediaRecorder.start();
                setTimeout(() => mediaRecorder.stop(), duration);
            });

        } catch (error) {
            console.error('Record audio file error:', error);
            throw error;
        }
    }

    async uploadAudioFile(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch(`${this.options.apiUrl}/transcribe`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                return data;
            } else {
                throw new Error(data.error || 'Audio upload failed');
            }
        } catch (error) {
            console.error('Upload audio file error:', error);
            throw error;
        }
    }

    // Error Handling
    handleError(error) {
        console.error('Voice I/O error:', error);
        if (this.onError) {
            this.onError(error);
        }
    }

    // Utility Methods
    isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && 
               !!window.speechSynthesis &&
               !!(window.AudioContext || window.webkitAudioContext);
    }

    getStatus() {
        return {
            isRecording: this.isRecording,
            isPlaying: this.isPlaying,
            isSupported: this.isSupported(),
            audioContextState: this.audioContext ? this.audioContext.state : 'unavailable'
        };
    }

    // Event Setters
    onTranscription(callback) {
        this.onTranscription = callback;
    }

    onAudioStart(callback) {
        this.onAudioStart = callback;
    }

    onAudioEnd(callback) {
        this.onAudioEnd = callback;
    }

    onError(callback) {
        this.onError = callback;
    }

    // Cleanup
    destroy() {
        this.stopRecording();
        this.stopSpeaking();
        
        if (this.audioContext) {
            this.audioContext.close();
        }

        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
        }

        console.log('Voice I/O destroyed');
    }
}

// Export for use in other modules
window.VoiceInputOutput = VoiceInputOutput; 