// Enhanced Chat System with 3D Avatars and Voice Interaction
class EnhancedChatSystem {
    constructor() {
        this.avatarSystem = null;
        this.voiceSystem = null;
        this.currentCounselor = null;
        this.isVoiceEnabled = false;
        this.isRecording = false;
        this.socket = null;
        
        this.init();
    }

    async init() {
        this.setupSocketConnection();
        this.setupVoiceControls();
        this.setupAvatarContainer();
        this.bindEvents();
    }

    setupSocketConnection() {
        // WebSocket connection for real-time communication
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
        
        this.socket.on('avatar_update', (data) => {
            this.updateAvatarExpression(data);
        });
        
        this.socket.on('voice_response', (data) => {
            this.handleVoiceResponse(data);
        });
    }

    setupVoiceControls() {
        // Create voice control buttons
        const voiceControls = document.createElement('div');
        voiceControls.className = 'voice-controls';
        voiceControls.innerHTML = `
            <button id="voice-toggle" class="voice-btn">
                <i class="fas fa-microphone"></i>
                <span>Enable Voice</span>
            </button>
            <button id="record-btn" class="voice-btn" disabled>
                <i class="fas fa-microphone-slash"></i>
                <span>Start Recording</span>
            </button>
            <div class="voice-status">
                <div class="recording-indicator"></div>
                <span class="status-text">Voice disabled</span>
            </div>
        `;
        
        document.querySelector('.chat-container').appendChild(voiceControls);
    }

    setupAvatarContainer() {
        // Create 3D avatar container
        const avatarContainer = document.createElement('div');
        avatarContainer.id = 'avatar-3d-container';
        avatarContainer.className = 'avatar-3d-container';
        
        document.querySelector('.chat-container').insertBefore(
            avatarContainer, 
            document.querySelector('.chat-messages')
        );
        
        // Initialize 3D avatar system
        this.avatarSystem = new Avatar3DSystem('avatar-3d-container');
        this.voiceSystem = new VoiceInteractionSystem(this.avatarSystem);
    }

    bindEvents() {
        // Voice toggle
        document.getElementById('voice-toggle').addEventListener('click', () => {
            this.toggleVoice();
        });
        
        // Record button
        document.getElementById('record-btn').addEventListener('click', () => {
            this.toggleRecording();
        });
        
        // Send message button
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key in message input
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async toggleVoice() {
        try {
            if (!this.isVoiceEnabled) {
                await this.enableVoice();
            } else {
                this.disableVoice();
            }
        } catch (error) {
            console.error('Error toggling voice:', error);
            this.showNotification('Voice setup failed. Please check microphone permissions.', 'error');
        }
    }

    async enableVoice() {
        try {
            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.isVoiceEnabled = true;
            document.getElementById('voice-toggle').innerHTML = `
                <i class="fas fa-microphone-slash"></i>
                <span>Disable Voice</span>
            `;
            document.getElementById('record-btn').disabled = false;
            document.querySelector('.status-text').textContent = 'Voice enabled';
            
            this.showNotification('Voice enabled successfully!', 'success');
            
        } catch (error) {
            throw new Error('Microphone access denied');
        }
    }

    disableVoice() {
        this.isVoiceEnabled = false;
        this.isRecording = false;
        
        document.getElementById('voice-toggle').innerHTML = `
            <i class="fas fa-microphone"></i>
            <span>Enable Voice</span>
        `;
        document.getElementById('record-btn').disabled = true;
        document.getElementById('record-btn').innerHTML = `
            <i class="fas fa-microphone-slash"></i>
            <span>Start Recording</span>
        `;
        document.querySelector('.status-text').textContent = 'Voice disabled';
        document.querySelector('.recording-indicator').classList.remove('recording');
        
        this.showNotification('Voice disabled', 'info');
    }

    toggleRecording() {
        if (!this.isVoiceEnabled) return;
        
        if (!this.isRecording) {
            this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    startRecording() {
        this.isRecording = true;
        document.getElementById('record-btn').innerHTML = `
            <i class="fas fa-stop"></i>
            <span>Stop Recording</span>
        `;
        document.querySelector('.recording-indicator').classList.add('recording');
        document.querySelector('.status-text').textContent = 'Recording...';
        
        // Start voice recording
        this.voiceSystem.startRecording();
        
        // Update avatar to listening state
        this.updateAvatarExpression('listening');
    }

    stopRecording() {
        this.isRecording = false;
        document.getElementById('record-btn').innerHTML = `
            <i class="fas fa-microphone"></i>
            <span>Start Recording</span>
        `;
        document.querySelector('.recording-indicator').classList.remove('recording');
        document.querySelector('.status-text').textContent = 'Processing...';
        
        // Stop voice recording
        this.voiceSystem.stopRecording();
    }

    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessageToChat('user', message);
        messageInput.value = '';
        
        // Update avatar to listening state
        this.updateAvatarExpression('listening');
        
        try {
            // Send message to server
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    counselor_id: this.currentCounselor,
                    session_id: this.getSessionId()
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Add counselor response to chat
                this.addMessageToChat('counselor', data.response);
                
                // Update avatar expression based on response
                this.updateAvatarExpression(data.mood || 'speaking');
                
                // Generate and play voice response
                if (this.isVoiceEnabled) {
                    await this.generateVoiceResponse(data.response);
                }
                
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Failed to send message. Please try again.', 'error');
        }
    }

    addMessageToChat(sender, message) {
        const chatMessages = document.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(message)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    updateAvatarExpression(expression) {
        if (this.avatarSystem) {
            this.avatarSystem.updateAvatarMood(expression);
            
            // Send expression update to server
            this.socket.emit('avatar_expression', {
                counselor_id: this.currentCounselor,
                expression: expression
            });
        }
    }

    async generateVoiceResponse(text) {
        try {
            const response = await fetch('/api/voice/synthesize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    counselor_id: this.currentCounselor
                })
            });
            
            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // Play audio through avatar system
                await this.avatarSystem.playVoiceAudio(audioUrl);
                
            } else {
                throw new Error('Voice synthesis failed');
            }
            
        } catch (error) {
            console.error('Error generating voice response:', error);
        }
    }

    handleVoiceResponse(data) {
        // Handle real-time voice response from server
        if (data.text) {
            this.addMessageToChat('counselor', data.text);
        }
        
        if (data.audio_url) {
            this.avatarSystem.playVoiceAudio(data.audio_url);
        }
    }

    setCounselor(counselorId) {
        this.currentCounselor = counselorId;
        
        // Load counselor avatar
        if (this.avatarSystem) {
            this.avatarSystem.loadAvatar(counselorId);
        }
        
        // Update UI
        this.updateCounselorInfo(counselorId);
    }

    async updateCounselorInfo(counselorId) {
        try {
            const response = await fetch(`/api/avatar/counselor/${counselorId}`);
            const data = await response.json();
            
            if (data.success) {
                const counselor = data.avatar;
                
                // Update counselor info in UI
                const counselorInfo = document.querySelector('.counselor-info');
                if (counselorInfo) {
                    counselorInfo.innerHTML = `
                        <h3>${counselor.name}</h3>
                        <p>${counselor.specialty}</p>
                        <p class="personality">${counselor.personality}</p>
                    `;
                }
            }
        } catch (error) {
            console.error('Error updating counselor info:', error);
        }
    }

    getSessionId() {
        return localStorage.getItem('session_id') || `session_${Date.now()}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize enhanced chat system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedChatSystem = new EnhancedChatSystem();
});

// Export for use in other modules
window.EnhancedChatSystem = EnhancedChatSystem; 