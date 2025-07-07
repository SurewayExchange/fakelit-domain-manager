class HeyGenAvatar {
    constructor() {
        this.currentSession = null;
        this.currentCounselor = null;
        this.isConnected = false;
        this.isSpeaking = false;
        this.messageQueue = [];
        this.avatarContainer = null;
        this.chatContainer = null;
        this.statusIndicator = null;
        
        // Initialize
        this.initialize();
    }

    // Initialize the avatar system
    initialize() {
        console.log('🎭 HeyGen Avatar system initializing...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI elements
        this.initializeUI();
        
        console.log('🎭 HeyGen Avatar system ready');
    }

    // Set up event listeners
    setupEventListeners() {
        // Counselor selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-counselor')) {
                const counselorCard = e.target.closest('.counselor-card');
                const counselorId = counselorCard.dataset.counselor;
                this.selectCounselor(counselorId);
            }
        });

        // Send message
        document.addEventListener('click', (e) => {
            if (e.target.id === 'send-message' || e.target.closest('#send-message')) {
                this.sendMessage();
            }
        });

        // Enter key in message input
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'message-input' && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Demo controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('demo-control')) {
                const action = e.target.dataset.action;
                const value = e.target.dataset.value;
                this.handleDemoControl(action, value);
            }
        });
    }

    // Initialize UI elements
    initializeUI() {
        this.avatarContainer = document.getElementById('heygen-avatar-container');
        this.chatContainer = document.getElementById('chat-messages');
        this.statusIndicator = document.getElementById('avatar-status');
        
        if (this.avatarContainer) {
            this.avatarContainer.innerHTML = `
                <div class="avatar-placeholder">
                    <i class="fas fa-user-circle"></i>
                    <p>Select a counselor to begin</p>
                </div>
            `;
        }
    }

    // Select a counselor and create session
    async selectCounselor(counselorId) {
        try {
            console.log(`🎭 Selecting counselor: ${counselorId}`);
            
            // Update UI to show loading
            this.updateStatus('Connecting...', 'connecting');
            
            // Get counselor configuration
            const counselorResponse = await fetch(`/api/heygen/counselors/${counselorId}`);
            const counselorData = await counselorResponse.json();
            
            if (!counselorData.success) {
                throw new Error('Failed to get counselor configuration');
            }
            
            this.currentCounselor = counselorData.counselor;
            
            // Create avatar session
            const sessionResponse = await fetch('/api/heygen/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    counselorId: counselorId
                })
            });
            
            const sessionData = await sessionResponse.json();
            
            if (!sessionData.success) {
                throw new Error('Failed to create avatar session');
            }
            
            this.currentSession = sessionData.session;
            this.isConnected = true;
            
            // Update UI
            this.updateCounselorDisplay();
            this.updateStatus('Ready', 'ready');
            
            // Show avatar demo area
            this.showAvatarDemo();
            
            // Send greeting
            await this.sendGreeting();
            
            console.log(`🎭 Session created: ${this.currentSession.id}`);
            
        } catch (error) {
            console.error('Select counselor error:', error);
            this.updateStatus('Connection failed', 'error');
            this.showError('Failed to connect to avatar. Please try again.');
        }
    }

    // Update counselor display
    updateCounselorDisplay() {
        if (!this.currentCounselor) return;
        
        // Update counselor info
        const counselorName = document.getElementById('selected-counselor-name');
        const counselorSpecialty = document.getElementById('selected-counselor-specialty');
        
        if (counselorName) {
            counselorName.textContent = this.currentCounselor.name;
        }
        
        if (counselorSpecialty) {
            counselorSpecialty.textContent = this.currentCounselor.specialty;
        }
        
        // Update avatar container
        if (this.avatarContainer) {
            this.avatarContainer.innerHTML = `
                <div class="heygen-avatar-display">
                    <div class="avatar-video-container">
                        <div class="avatar-placeholder">
                            <img src="${this.currentCounselor.avatarUrl}" alt="${this.currentCounselor.name}" class="counselor-avatar">
                            <div class="avatar-overlay">
                                <div class="avatar-status-indicator">
                                    <span class="status-dot"></span>
                                    <span class="status-text">Connected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="avatar-controls">
                        <button class="btn-secondary demo-control" data-action="test-expression" data-value="listening">
                            <i class="fas fa-eye"></i>
                            Listening
                        </button>
                        <button class="btn-secondary demo-control" data-action="test-expression" data-value="concerned">
                            <i class="fas fa-frown"></i>
                            Concerned
                        </button>
                        <button class="btn-secondary demo-control" data-action="test-expression" data-value="encouraging">
                            <i class="fas fa-smile"></i>
                            Encouraging
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // Show avatar demo area
    showAvatarDemo() {
        const avatarDemo = document.getElementById('avatar-demo');
        if (avatarDemo) {
            avatarDemo.style.display = 'block';
            avatarDemo.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Send greeting message
    async sendGreeting() {
        if (!this.currentCounselor || !this.currentSession) return;
        
        try {
            // Add greeting to chat
            this.addMessage('counselor', this.currentCounselor.greeting);
            
            // Make avatar speak the greeting
            await this.makeAvatarSpeak(this.currentCounselor.greeting, {
                emotion: 'friendly',
                expression: 'welcoming'
            });
            
        } catch (error) {
            console.error('Send greeting error:', error);
        }
    }

    // Send user message
    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message || !this.currentSession) return;
        
        try {
            // Clear input
            messageInput.value = '';
            
            // Add user message to chat
            this.addMessage('user', message);
            
            // Update status
            this.updateStatus('Thinking...', 'thinking');
            
            // Send to avatar service
            const response = await fetch(`/api/heygen/session/${this.currentSession.id}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        timestamp: Date.now(),
                        sessionId: this.currentSession.id
                    }
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Add counselor response to chat
                this.addMessage('counselor', data.result.response);
                
                // Update status
                this.updateStatus('Ready', 'ready');
                
                // Update avatar state
                this.updateAvatarState(data.result);
                
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
            
        } catch (error) {
            console.error('Send message error:', error);
            this.updateStatus('Error', 'error');
            this.showError('Failed to send message. Please try again.');
        }
    }

    // Make avatar speak
    async makeAvatarSpeak(text, options = {}) {
        if (!this.currentSession) return;
        
        try {
            this.isSpeaking = true;
            this.updateStatus('Speaking...', 'speaking');
            
            const response = await fetch(`/api/heygen/session/${this.currentSession.id}/speak`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    emotion: options.emotion || 'neutral',
                    expression: options.expression || 'speaking',
                    gesture: options.gesture || 'none',
                    speed: options.speed || 1.0,
                    pitch: options.pitch || 1.0
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update avatar state
                this.updateAvatarState({
                    emotion: options.emotion || 'neutral',
                    expression: options.expression || 'speaking'
                });
            }
            
        } catch (error) {
            console.error('Make avatar speak error:', error);
        } finally {
            this.isSpeaking = false;
            this.updateStatus('Ready', 'ready');
        }
    }

    // Add message to chat
    addMessage(type, text) {
        if (!this.chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(text)}</p>
            </div>
            <div class="message-timestamp">${timestamp}</div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    // Update avatar state
    updateAvatarState(state) {
        const avatarDisplay = document.querySelector('.heygen-avatar-display');
        if (!avatarDisplay) return;
        
        // Update expression classes
        avatarDisplay.className = `heygen-avatar-display expression-${state.expression} emotion-${state.emotion}`;
        
        // Update status indicator
        const statusText = avatarDisplay.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = this.getStatusText(state.expression, state.emotion);
        }
    }

    // Get status text based on expression and emotion
    getStatusText(expression, emotion) {
        const statusMap = {
            'listening': 'Listening attentively',
            'concerned': 'Showing concern',
            'encouraging': 'Being encouraging',
            'speaking': 'Speaking',
            'thinking': 'Thinking',
            'neutral': 'Ready'
        };
        
        return statusMap[expression] || 'Ready';
    }

    // Update status indicator
    updateStatus(text, type) {
        if (this.statusIndicator) {
            this.statusIndicator.textContent = text;
            this.statusIndicator.className = `status-indicator status-${type}`;
        }
    }

    // Handle demo controls
    async handleDemoControl(action, value) {
        if (!this.currentSession) return;
        
        try {
            switch (action) {
                case 'test-expression':
                    await this.testExpression(value);
                    break;
                case 'test-voice':
                    await this.testVoice(value);
                    break;
                case 'test-emotion':
                    await this.testEmotion(value);
                    break;
            }
        } catch (error) {
            console.error('Demo control error:', error);
        }
    }

    // Test expression
    async testExpression(expression) {
        const testText = `This is a test of the ${expression} expression.`;
        await this.makeAvatarSpeak(testText, {
            emotion: expression,
            expression: expression
        });
    }

    // Test voice
    async testVoice(text) {
        await this.makeAvatarSpeak(text || 'Hello! This is a voice synthesis test.');
    }

    // Test emotion
    async testEmotion(text) {
        const emotionAnalysis = this.analyzeEmotion(text);
        await this.makeAvatarSpeak(text, {
            emotion: emotionAnalysis.dominant,
            expression: this.getContextualExpression(emotionAnalysis)
        });
    }

    // Simple emotion analysis
    analyzeEmotion(text) {
        const emotions = {
            joy: this.detectEmotion(text, ['happy', 'excited', 'great', 'wonderful', 'amazing']),
            sadness: this.detectEmotion(text, ['sad', 'depressed', 'lonely', 'hopeless', 'miserable']),
            concern: this.detectEmotion(text, ['worried', 'concerned', 'anxious', 'nervous', 'stress']),
            empathy: this.detectEmotion(text, ['understand', 'feel', 'hear', 'support', 'care'])
        };
        
        const dominant = Object.entries(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b)[0];
        
        return {
            emotions,
            dominant: dominant || 'neutral'
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

    getContextualExpression(emotionAnalysis) {
        const { dominant } = emotionAnalysis;
        
        const expressions = {
            joy: 'encouraging',
            sadness: 'concerned',
            concern: 'worried',
            empathy: 'caring'
        };
        
        return expressions[dominant] || 'neutral';
    }

    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${this.escapeHtml(message)}</span>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Clean up session
    async cleanup() {
        if (this.currentSession) {
            try {
                await fetch(`/api/heygen/session/${this.currentSession.id}`, {
                    method: 'DELETE'
                });
                
                this.currentSession = null;
                this.currentCounselor = null;
                this.isConnected = false;
                
                console.log('🎭 Session cleaned up');
            } catch (error) {
                console.error('Cleanup error:', error);
            }
        }
    }

    // Get current session info
    getSessionInfo() {
        return {
            sessionId: this.currentSession?.id,
            counselorId: this.currentCounselor?.id,
            counselorName: this.currentCounselor?.name,
            isConnected: this.isConnected,
            isSpeaking: this.isSpeaking
        };
    }
}

// Initialize HeyGen Avatar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.heygenAvatar = new HeyGenAvatar();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.heygenAvatar) {
        window.heygenAvatar.cleanup();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeyGenAvatar;
} 