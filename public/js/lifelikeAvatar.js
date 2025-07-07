class LifelikeAvatar {
    constructor(containerId, counselorId) {
        this.container = document.getElementById(containerId);
        this.counselorId = counselorId;
        this.sessionId = this.generateSessionId();
        this.avatarElement = null;
        this.audioContext = null;
        this.currentExpression = 'neutral';
        this.isSpeaking = false;
        this.voiceQueue = [];
        this.expressionQueue = [];
        
        // Initialize
        this.init();
    }

    async init() {
        try {
            // Create avatar container
            this.createAvatarContainer();
            
            // Initialize audio context for voice synthesis
            await this.initializeAudio();
            
            // Connect to lifelike avatar service
            await this.connectToAvatarService();
            
            // Start expression loop
            this.startExpressionLoop();
            
            console.log('🎭 Lifelike avatar initialized for', this.counselorId);
            
        } catch (error) {
            console.error('Error initializing lifelike avatar:', error);
            this.showFallbackAvatar();
        }
    }

    createAvatarContainer() {
        // Create main avatar container
        this.avatarElement = document.createElement('div');
        this.avatarElement.className = 'lifelike-avatar';
        this.avatarElement.innerHTML = `
            <div class="avatar-face">
                <div class="avatar-eyes">
                    <div class="eye left-eye"></div>
                    <div class="eye right-eye"></div>
                </div>
                <div class="avatar-mouth"></div>
                <div class="avatar-eyebrows">
                    <div class="eyebrow left-eyebrow"></div>
                    <div class="eyebrow right-eyebrow"></div>
                </div>
                <div class="avatar-hair"></div>
                <div class="avatar-accessories"></div>
            </div>
            <div class="avatar-body">
                <div class="avatar-torso"></div>
                <div class="avatar-arms">
                    <div class="arm left-arm"></div>
                    <div class="arm right-arm"></div>
                </div>
            </div>
            <div class="avatar-status">
                <div class="speaking-indicator"></div>
                <div class="emotion-indicator"></div>
            </div>
            <div class="avatar-audio">
                <audio id="avatar-audio-${this.sessionId}" preload="auto"></audio>
            </div>
        `;
        
        this.container.appendChild(this.avatarElement);
        
        // Apply counselor-specific styling
        this.applyCounselorStyle();
    }

    applyCounselorStyle() {
        const counselorStyles = {
            'dr-sarah-mitchell': {
                hair: 'long_brown',
                skinTone: '#f4d03f',
                outfit: 'business_casual',
                accessories: ['glasses']
            },
            'michael-rodriguez': {
                hair: 'short_black',
                skinTone: '#d35400',
                outfit: 'casual_professional',
                accessories: []
            },
            'dr-emily-chen': {
                hair: 'long_black',
                skinTone: '#f4d03f',
                outfit: 'soft_professional',
                accessories: ['necklace']
            },
            'james-williams': {
                hair: 'short_brown',
                skinTone: '#f4d03f',
                outfit: 'business',
                accessories: ['watch']
            },
            'dr-maria-garcia': {
                hair: 'medium_brown',
                skinTone: '#d35400',
                outfit: 'medical_professional',
                accessories: ['stethoscope']
            },
            'lisa-thompson': {
                hair: 'long_blonde',
                skinTone: '#f4d03f',
                outfit: 'welcoming',
                accessories: ['name_tag']
            }
        };
        
        const style = counselorStyles[this.counselorId] || counselorStyles['dr-sarah-mitchell'];
        
        // Apply skin tone
        this.avatarElement.style.setProperty('--avatar-skin-tone', style.skinTone);
        
        // Apply hair style
        this.avatarElement.classList.add(`hair-${style.hair}`);
        
        // Apply outfit
        this.avatarElement.classList.add(`outfit-${style.outfit}`);
        
        // Apply accessories
        style.accessories.forEach(accessory => {
            this.avatarElement.classList.add(`accessory-${accessory}`);
        });
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎵 Audio context initialized');
        } catch (error) {
            console.warn('Audio context not available:', error);
        }
    }

    async connectToAvatarService() {
        try {
            const response = await fetch('/api/avatar/lifelike/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    counselorId: this.counselorId,
                    sessionId: this.sessionId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to connect to avatar service');
            }
            
            const data = await response.json();
            console.log('🔗 Connected to lifelike avatar service');
            
        } catch (error) {
            console.error('Error connecting to avatar service:', error);
            throw error;
        }
    }

    async processMessage(message) {
        try {
            // Show typing indicator
            this.showTypingIndicator();
            
            const response = await fetch('/api/avatar/lifelike/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    message: message
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to process message');
            }
            
            const data = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Apply expression
            this.applyExpression(data.expression);
            
            // Play voice if available
            if (data.audioUrl) {
                await this.playVoice(data.audioUrl);
            }
            
            return data.response;
            
        } catch (error) {
            console.error('Error processing message:', error);
            this.hideTypingIndicator();
            throw error;
        }
    }

    applyExpression(expression) {
        // Queue expression for smooth transitions
        this.expressionQueue.push(expression);
        
        if (this.expressionQueue.length === 1) {
            this.processExpressionQueue();
        }
    }

    async processExpressionQueue() {
        while (this.expressionQueue.length > 0) {
            const expression = this.expressionQueue.shift();
            await this.transitionToExpression(expression);
        }
    }

    async transitionToExpression(expression) {
        const duration = 300; // ms
        
        // Remove current expression classes
        this.avatarElement.classList.remove(`expression-${this.currentExpression}`);
        
        // Add new expression classes
        this.avatarElement.classList.add(`expression-${expression.type || expression}`);
        
        // Apply specific expression properties
        if (expression.eyes) {
            this.setEyeExpression(expression.eyes, expression.intensity || 0.5);
        }
        
        if (expression.mouth) {
            this.setMouthExpression(expression.mouth, expression.intensity || 0.5);
        }
        
        if (expression.eyebrows) {
            this.setEyebrowExpression(expression.eyebrows, expression.intensity || 0.5);
        }
        
        this.currentExpression = expression.type || expression;
        
        // Wait for transition
        await this.delay(duration);
    }

    setEyeExpression(type, intensity) {
        const eyes = this.avatarElement.querySelectorAll('.eye');
        
        eyes.forEach(eye => {
            eye.className = `eye ${type}`;
            eye.style.setProperty('--intensity', intensity);
        });
    }

    setMouthExpression(type, intensity) {
        const mouth = this.avatarElement.querySelector('.avatar-mouth');
        
        mouth.className = `avatar-mouth ${type}`;
        mouth.style.setProperty('--intensity', intensity);
    }

    setEyebrowExpression(type, intensity) {
        const eyebrows = this.avatarElement.querySelectorAll('.eyebrow');
        
        eyebrows.forEach(eyebrow => {
            eyebrow.className = `eyebrow ${type}`;
            eyebrow.style.setProperty('--intensity', intensity);
        });
    }

    async playVoice(audioUrl) {
        try {
            this.isSpeaking = true;
            this.showSpeakingIndicator();
            
            const audio = this.avatarElement.querySelector(`#avatar-audio-${this.sessionId}`);
            
            if (audioUrl.startsWith('data:')) {
                // Handle base64 audio data
                audio.src = audioUrl;
            } else {
                // Handle URL
                audio.src = audioUrl;
            }
            
            // Play audio
            await audio.play();
            
            // Wait for audio to finish
            await new Promise((resolve) => {
                audio.onended = resolve;
                audio.onerror = resolve;
            });
            
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
            
        } catch (error) {
            console.error('Error playing voice:', error);
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
        }
    }

    showTypingIndicator() {
        const indicator = this.avatarElement.querySelector('.speaking-indicator');
        indicator.classList.add('typing');
        indicator.textContent = 'Typing...';
    }

    hideTypingIndicator() {
        const indicator = this.avatarElement.querySelector('.speaking-indicator');
        indicator.classList.remove('typing');
        indicator.textContent = '';
    }

    showSpeakingIndicator() {
        const indicator = this.avatarElement.querySelector('.speaking-indicator');
        indicator.classList.add('speaking');
        indicator.textContent = 'Speaking...';
    }

    hideSpeakingIndicator() {
        const indicator = this.avatarElement.querySelector('.speaking-indicator');
        indicator.classList.remove('speaking');
        indicator.textContent = '';
    }

    startExpressionLoop() {
        // Subtle breathing and blinking animations
        setInterval(() => {
            if (!this.isSpeaking && this.expressionQueue.length === 0) {
                this.addSubtleMovement();
            }
        }, 3000);
        
        // Blinking
        setInterval(() => {
            if (!this.isSpeaking) {
                this.blink();
            }
        }, 4000 + Math.random() * 2000);
    }

    addSubtleMovement() {
        const face = this.avatarElement.querySelector('.avatar-face');
        face.style.animation = 'subtle-breathing 2s ease-in-out';
        
        setTimeout(() => {
            face.style.animation = '';
        }, 2000);
    }

    blink() {
        const eyes = this.avatarElement.querySelectorAll('.eye');
        eyes.forEach(eye => {
            eye.classList.add('blinking');
            setTimeout(() => {
                eye.classList.remove('blinking');
            }, 150);
        });
    }

    showFallbackAvatar() {
        this.avatarElement.innerHTML = `
            <div class="fallback-avatar">
                <div class="fallback-face">
                    <div class="fallback-eyes">👁️ 👁️</div>
                    <div class="fallback-mouth">👄</div>
                </div>
                <div class="fallback-message">
                    Avatar temporarily unavailable
                </div>
            </div>
        `;
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public methods for external use
    async speak(text, context = 'general') {
        try {
            const response = await fetch('/api/avatar/lifelike/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    text: text,
                    context: context
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to speak');
            }
            
            const data = await response.json();
            
            // Apply expression
            this.applyExpression(data.expression);
            
            // Play voice if available
            if (data.audioUrl) {
                await this.playVoice(data.audioUrl);
            }
            
            return data;
            
        } catch (error) {
            console.error('Error speaking:', error);
            throw error;
        }
    }

    getState() {
        return {
            counselorId: this.counselorId,
            sessionId: this.sessionId,
            currentExpression: this.currentExpression,
            isSpeaking: this.isSpeaking,
            voiceQueueLength: this.voiceQueue.length,
            expressionQueueLength: this.expressionQueue.length
        };
    }

    destroy() {
        // Cleanup session
        fetch('/api/avatar/lifelike/cleanup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: this.sessionId
            })
        }).catch(console.error);
        
        // Remove avatar element
        if (this.avatarElement && this.avatarElement.parentNode) {
            this.avatarElement.parentNode.removeChild(this.avatarElement);
        }
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Export for use in other modules
window.LifelikeAvatar = LifelikeAvatar; 