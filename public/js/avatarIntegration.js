// Avatar Integration for CareConnect AI Chatbot
// Supports Ready Player Me 3D avatars and fallback 2D avatars

class AvatarIntegration {
    constructor() {
        this.currentSession = null;
        this.avatarElement = null;
        this.is3DSupported = this.check3DSupport();
        this.avatarModels = {
            'dr-sarah-mitchell': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Dr. Sarah Mitchell',
                specialty: 'Clinical Psychology',
                fallbackImage: '/images/counselors/dr-sarah-mitchell.jpg'
            },
            'michael-rodriguez': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Michael Rodriguez',
                specialty: 'Family Therapy',
                fallbackImage: '/images/counselors/michael-rodriguez.jpg'
            },
            'dr-emily-chen': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Dr. Emily Chen',
                specialty: 'Trauma Therapy',
                fallbackImage: '/images/counselors/dr-emily-chen.jpg'
            },
            'james-williams': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'James Williams',
                specialty: 'Addiction Counseling',
                fallbackImage: '/images/counselors/james-williams.jpg'
            },
            'dr-maria-garcia': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Dr. Maria Garcia',
                specialty: 'Child Psychology',
                fallbackImage: '/images/counselors/dr-maria-garcia.jpg'
            },
            'lisa-thompson': {
                modelUrl: 'https://models.readyplayer.me/686980953856a81c4814c5c6.glb',
                name: 'Lisa Thompson',
                specialty: 'Relationship Counseling',
                fallbackImage: '/images/counselors/lisa-thompson.jpg'
            }
        };
    }

    // Check if 3D rendering is supported
    check3DSupport() {
        return window.WebGLRenderingContext || window.WebGL2RenderingContext;
    }

    // Initialize avatar session
    async initializeSession(counselorId, containerId = 'avatar-container') {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error('Avatar container not found');
            }

            const avatarModel = this.avatarModels[counselorId];
            if (!avatarModel) {
                throw new Error(`Counselor ${counselorId} not found`);
            }

            // Clear container
            container.innerHTML = '';

            // Create session
            this.currentSession = {
                id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                counselorId: counselorId,
                avatarModel: avatarModel,
                status: 'active',
                createdAt: Date.now()
            };

            // Load avatar
            if (this.is3DSupported) {
                await this.load3DAvatar(avatarModel.modelUrl, container);
            } else {
                await this.load2DAvatar(avatarModel.fallbackImage, container);
            }

            console.log(`🎭 Avatar session initialized for ${avatarModel.name}`);
            return this.currentSession;

        } catch (error) {
            console.error('Initialize avatar session error:', error);
            throw error;
        }
    }

    // Load 3D avatar using Three.js
    async load3DAvatar(modelUrl, container) {
        try {
            // Create 3D avatar container
            const avatarDiv = document.createElement('div');
            avatarDiv.id = 'avatar-3d';
            avatarDiv.style.width = '100%';
            avatarDiv.style.height = '400px';
            avatarDiv.style.position = 'relative';
            container.appendChild(avatarDiv);

            // Add loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="spinner"></div>
                    <p>Loading 3D Avatar...</p>
                </div>
            `;
            avatarDiv.appendChild(loadingDiv);

            // For now, show a placeholder with the model URL
            // In a full implementation, you would load the glTF model with Three.js
            setTimeout(() => {
                loadingDiv.innerHTML = `
                    <div style="text-align: center; padding: 20px; background: #f5f5f5; border-radius: 10px;">
                        <h3>3D Avatar Ready</h3>
                        <p>Model: ${modelUrl.split('/').pop()}</p>
                        <p>Status: Connected</p>
                        <div style="margin-top: 20px;">
                            <button onclick="avatarIntegration.testExpression('happy')" class="btn btn-primary">Test Happy</button>
                            <button onclick="avatarIntegration.testExpression('sad')" class="btn btn-secondary">Test Sad</button>
                            <button onclick="avatarIntegration.testExpression('neutral')" class="btn btn-info">Test Neutral</button>
                        </div>
                    </div>
                `;
            }, 2000);

            this.avatarElement = avatarDiv;

        } catch (error) {
            console.error('Load 3D avatar error:', error);
            // Fallback to 2D
            await this.load2DAvatar(this.currentSession.avatarModel.fallbackImage, container);
        }
    }

    // Load 2D avatar as fallback
    async load2DAvatar(imageUrl, container) {
        try {
            const avatarDiv = document.createElement('div');
            avatarDiv.id = 'avatar-2d';
            avatarDiv.style.textAlign = 'center';
            avatarDiv.style.padding = '20px';

            avatarDiv.innerHTML = `
                <div style="background: #f5f5f5; border-radius: 10px; padding: 20px; display: inline-block;">
                    <img src="${imageUrl}" alt="Counselor Avatar" 
                         style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover; margin-bottom: 15px;"
                         onerror="this.src='/images/default-avatar.png'">
                    <h3>${this.currentSession.avatarModel.name}</h3>
                    <p>${this.currentSession.avatarModel.specialty}</p>
                    <div style="margin-top: 15px;">
                        <button onclick="avatarIntegration.testExpression('happy')" class="btn btn-primary">😊 Happy</button>
                        <button onclick="avatarIntegration.testExpression('sad')" class="btn btn-secondary">😢 Sad</button>
                        <button onclick="avatarIntegration.testExpression('neutral')" class="btn btn-info">😐 Neutral</button>
                    </div>
                </div>
            `;

            container.appendChild(avatarDiv);
            this.avatarElement = avatarDiv;

        } catch (error) {
            console.error('Load 2D avatar error:', error);
        }
    }

    // Make avatar speak
    async speak(text, options = {}) {
        try {
            if (!this.currentSession) {
                throw new Error('No active avatar session');
            }

            const {
                emotion = 'neutral',
                expression = 'speaking',
                gesture = 'none'
            } = options;

            // Update avatar expression
            await this.updateExpression(expression);

            // Simulate speaking animation
            this.startSpeakingAnimation();

            // Add text to chat
            this.addMessageToChat('assistant', text);

            // Stop speaking animation after delay
            setTimeout(() => {
                this.stopSpeakingAnimation();
            }, text.length * 100);

            console.log(`🎭 Avatar spoke: ${text.substring(0, 50)}...`);
            return { success: true, text: text };

        } catch (error) {
            console.error('Avatar speak error:', error);
            throw error;
        }
    }

    // Update avatar expression
    async updateExpression(expression) {
        try {
            if (!this.avatarElement) return;

            // Add expression class
            this.avatarElement.className = `avatar-expression-${expression}`;

            // Add visual feedback
            const feedback = document.createElement('div');
            feedback.className = 'expression-feedback';
            feedback.textContent = `Expression: ${expression}`;
            feedback.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 1000;
            `;

            this.avatarElement.appendChild(feedback);

            // Remove feedback after 2 seconds
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 2000);

        } catch (error) {
            console.error('Update expression error:', error);
        }
    }

    // Start speaking animation
    startSpeakingAnimation() {
        if (this.avatarElement) {
            this.avatarElement.style.animation = 'speaking 0.5s infinite alternate';
        }
    }

    // Stop speaking animation
    stopSpeakingAnimation() {
        if (this.avatarElement) {
            this.avatarElement.style.animation = '';
        }
    }

    // Add message to chat
    addMessageToChat(role, content) {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${role}-message`;
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${content}</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    // Test expression
    testExpression(expression) {
        this.updateExpression(expression);
        console.log(`Testing expression: ${expression}`);
    }

    // Clean up session
    cleanup() {
        if (this.avatarElement && this.avatarElement.parentNode) {
            this.avatarElement.parentNode.removeChild(this.avatarElement);
        }
        this.currentSession = null;
        this.avatarElement = null;
        console.log('🎭 Avatar session cleaned up');
    }
}

// Initialize global avatar integration
window.avatarIntegration = new AvatarIntegration();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes speaking {
        0% { transform: scale(1); }
        100% { transform: scale(1.02); }
    }
    
    .avatar-expression-happy {
        filter: brightness(1.1) saturate(1.2);
    }
    
    .avatar-expression-sad {
        filter: brightness(0.9) saturate(0.8);
    }
    
    .avatar-expression-neutral {
        filter: none;
    }
    
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style); 