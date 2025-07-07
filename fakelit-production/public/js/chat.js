// CareConnect AI Chatbot - Realistic Human-like Interactions
class CareConnectChat {
    constructor() {
        this.conversationId = null;
        this.currentService = null;
        this.currentCounselor = null;
        this.isTyping = false;
        this.messageHistory = [];
        this.userName = null;
        this.sessionStartTime = new Date();
        this.counselorMood = '😊';
        this.conversationContext = {
            topics: [],
            emotions: [],
            concerns: [],
            progress: []
        };
        
        // Get selected counselor from localStorage
        this.selectedCounselorId = localStorage.getItem('selectedCounselor') || null;
        if (this.selectedCounselorId) {
            localStorage.removeItem('selectedCounselor');
        }

        // Detailed counselor profiles with unique personalities
        this.counselorProfiles = {
            'dr-sarah-mitchell': {
                name: 'Dr. Sarah Mitchell',
                title: 'Licensed Clinical Psychologist',
                avatar: '/images/counselors/dr-sarah-mitchell.svg',
                specialty: 'Mental Health & CBT',
                personality: 'warm, analytical, encouraging',
                speakingStyle: 'professional yet warm, uses CBT techniques',
                commonPhrases: ['I hear you', 'That sounds challenging', 'Let\'s explore that together'],
                mood: '😊',
                typingSpeed: 1200,
                responseStyle: 'therapeutic'
            },
            'michael-rodriguez': {
                name: 'Michael Rodriguez',
                title: 'Certified Recovery Specialist',
                avatar: '/images/counselors/michael-rodriguez.svg',
                specialty: 'Substance Abuse & Recovery',
                personality: 'empathetic, direct, supportive',
                speakingStyle: 'straightforward but caring, shares personal insights',
                commonPhrases: ['I understand', 'You\'re not alone', 'Recovery is possible'],
                mood: '🙂',
                typingSpeed: 1000,
                responseStyle: 'supportive'
            },
            'dr-emily-chen': {
                name: 'Dr. Emily Chen',
                title: 'Family & Relationship Therapist',
                avatar: '/images/counselors/dr-emily-chen.svg',
                specialty: 'Relationships & Family Dynamics',
                personality: 'nurturing, insightful, patient',
                speakingStyle: 'gentle and understanding, focuses on communication',
                commonPhrases: ['That\'s a valid feeling', 'Communication is key', 'Let\'s work on this together'],
                mood: '😌',
                typingSpeed: 1400,
                responseStyle: 'relational'
            },
            'james-williams': {
                name: 'James Williams',
                title: 'Career & Academic Counselor',
                avatar: '/images/counselors/james-williams.svg',
                specialty: 'Career Guidance & Academic Support',
                personality: 'motivational, practical, solution-focused',
                speakingStyle: 'energetic and goal-oriented, provides actionable advice',
                commonPhrases: ['You\'ve got this', 'Let\'s break this down', 'What\'s your next step?'],
                mood: '😃',
                typingSpeed: 900,
                responseStyle: 'motivational'
            },
            'dr-maria-garcia': {
                name: 'Dr. Maria Garcia',
                title: 'Crisis Intervention Specialist',
                avatar: '/images/counselors/dr-maria-garcia.svg',
                specialty: 'Crisis Support & Safety Planning',
                personality: 'calm, reassuring, protective',
                speakingStyle: 'steady and reassuring, prioritizes safety',
                commonPhrases: ['I\'m here with you', 'You\'re safe', 'Let\'s get through this'],
                mood: '😊',
                typingSpeed: 800,
                responseStyle: 'crisis-focused'
            },
            'lisa-thompson': {
                name: 'Lisa Thompson',
                title: 'Onboarding Specialist',
                avatar: '/images/counselors/lisa-thompson.svg',
                specialty: 'Welcome & Guidance',
                personality: 'friendly, approachable, encouraging',
                speakingStyle: 'conversational and welcoming, makes people feel comfortable',
                commonPhrases: ['Welcome!', 'How can I help?', 'That\'s a great question'],
                mood: '😇',
                typingSpeed: 1100,
                responseStyle: 'welcoming'
            }
        };

        this.initializeChat();
    }

    initializeChat() {
        this.updateCounselorHeader();
        this.startConversation();
        this.setupEventListeners();
    }

    updateCounselorHeader() {
        const header = document.querySelector('.modal-header h3');
        const avatar = document.querySelector('.modal-header .counselor-avatar');
        
        if (this.selectedCounselorId && this.counselorProfiles[this.selectedCounselorId]) {
            const counselor = this.counselorProfiles[this.selectedCounselorId];
            if (header) {
                header.innerHTML = `
                    <img class="counselor-avatar" src="${counselor.avatar}" alt="${counselor.name}" style="width:40px;height:40px;border-radius:50%;margin-right:12px;vertical-align:middle;">
                    <span>${counselor.name}</span>
                    <span class="counselor-title">${counselor.title}</span>
                    <span class="counselor-mood">${counselor.mood}</span>
                `;
            }
        }
    }

    startConversation() {
        const counselor = this.getCurrentCounselor();
        if (!counselor) return;

        // Personalized greeting based on time and counselor
        const hour = new Date().getHours();
        let greeting = '';
        
        if (hour < 12) {
            greeting = `Good morning! I'm ${counselor.name}, your ${counselor.specialty.toLowerCase()} specialist. How are you feeling today?`;
        } else if (hour < 17) {
            greeting = `Good afternoon! I'm ${counselor.name}, and I'm here to support you with ${counselor.specialty.toLowerCase()}. What's on your mind?`;
        } else {
            greeting = `Good evening! I'm ${counselor.name}, your ${counselor.specialty.toLowerCase()} counselor. How can I help you tonight?`;
        }

        // Add some personality to the greeting
        const personalityGreetings = {
            'dr-sarah-mitchell': "I'm here to listen and help you work through whatever you're facing.",
            'michael-rodriguez': "I want you to know that you're not alone in this journey.",
            'dr-emily-chen': "I believe in the power of healthy relationships and communication.",
            'james-williams': "I'm excited to help you achieve your goals and overcome challenges.",
            'dr-maria-garcia': "Your safety and well-being are my top priorities right now.",
            'lisa-thompson': "I'm here to make sure you feel comfortable and supported."
        };

        greeting += ` ${personalityGreetings[this.selectedCounselorId] || ''}`;

        setTimeout(() => {
            this.appendMessage('counselor', greeting, counselor.mood);
        }, 500);
    }

    setupEventListeners() {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message || this.isTyping) return;

        // Add user message to chat
        this.appendMessage('user', message);
        chatInput.value = '';
        
        // Store in conversation history
        this.messageHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // Update conversation context
        this.updateConversationContext(message);

        // Show typing indicator
        this.showTypingIndicator();

        // Get counselor response with realistic delay
        const counselor = this.getCurrentCounselor();
        const typingDelay = counselor ? counselor.typingSpeed + Math.random() * 500 : 1500;

        setTimeout(async () => {
            const response = await this.getCounselorResponse(message);
            this.hideTypingIndicator();
            this.appendMessage('counselor', response, counselor ? counselor.mood : '😊');
            
            // Update counselor mood based on conversation
            this.updateCounselorMood(message, response);
        }, typingDelay);
    }

    showTypingIndicator() {
        this.isTyping = true;
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message counselor typing';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="${this.getCurrentCounselor()?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face'}" alt="Counselor">
                </div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    appendMessage(role, content, mood = null) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const timestamp = new Date();
        const formattedTime = this.formatTimestamp(timestamp);

        if (role === 'counselor') {
            const counselor = this.getCurrentCounselor();
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="${counselor ? counselor.avatar : '/images/counselors/dr-sarah-mitchell.svg'}" alt="Counselor">
                </div>
                <div class="message-content">
                    <p>${this.formatMessage(content)}</p>
                    <div class="message-meta">
                        <span class="message-time">${formattedTime}</span>
                        ${mood ? `<span class="message-mood">${mood}</span>` : ''}
                    </div>
                </div>
            `;

            // Speak counselor response if voice system is available
            if (window.voiceIO && typeof window.voiceIO.speakText === 'function') {
                setTimeout(() => {
                    window.voiceIO.speakText(content, {
                        rate: 0.9,
                        pitch: 1.0,
                        volume: 0.8
                    });
                }, 500);
            }
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${this.formatMessage(content)}</p>
                    <div class="message-meta">
                        <span class="message-time">${formattedTime}</span>
                    </div>
                </div>
            `;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Store in conversation history
        this.messageHistory.push({
            role: role,
            content: content,
            timestamp: timestamp
        });
    }

    formatMessage(content) {
        return content.replace(/\n/g, '<br>');
    }

    formatTimestamp(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    getCurrentCounselor() {
        return this.selectedCounselorId ? this.counselorProfiles[this.selectedCounselorId] : null;
    }

    updateConversationContext(message) {
        // Simple context tracking
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
            this.conversationContext.emotions.push('anxiety');
        }
        if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
            this.conversationContext.emotions.push('sadness');
        }
        if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad')) {
            this.conversationContext.emotions.push('anger');
        }
    }

    async getCounselorResponse(message) {
        try {
            // Try to get AI response first
            const serviceType = this.detectServiceType(message);
            const response = await fetch(`/api/chat/${serviceType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    counselorId: this.selectedCounselorId
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.response;
            } else {
                // Fallback to contextual responses if API fails
                return this.generateContextualResponse(message, this.getCurrentCounselor());
            }
        } catch (error) {
            console.log('Using fallback response system');
            // Fallback to contextual responses
            return this.generateContextualResponse(message, this.getCurrentCounselor());
        }
    }

    detectServiceType(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('depression') || lowerMessage.includes('anxiety') || lowerMessage.includes('mental health')) {
            return 'mental-health';
        } else if (lowerMessage.includes('drug') || lowerMessage.includes('alcohol') || lowerMessage.includes('recovery')) {
            return 'drug-alcohol';
        } else if (lowerMessage.includes('family') || lowerMessage.includes('relationship') || lowerMessage.includes('social')) {
            return 'social-family';
        } else if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('school') || lowerMessage.includes('academic')) {
            return 'career-school';
        } else if (lowerMessage.includes('crisis') || lowerMessage.includes('emergency') || lowerMessage.includes('suicide') || lowerMessage.includes('self-harm')) {
            return 'crisis-escalation';
        } else {
            return 'mental-health'; // default
        }
    }

    generateContextualResponse(message, counselor) {
        if (!counselor) {
            return "I'm here to help you. Could you tell me more about what you're experiencing?";
        }

        const lowerMessage = message.toLowerCase();
        
        // Contextual responses based on counselor specialty
        const responses = {
            'dr-sarah-mitchell': {
                anxiety: [
                    "I hear that you're feeling anxious. That's a very common experience. Let's explore what might be contributing to these feelings.",
                    "Anxiety can be really challenging to deal with. I'd like to help you understand what's happening and develop some coping strategies.",
                    "It sounds like you're experiencing some anxiety. This is something we can work through together using evidence-based approaches."
                ],
                depression: [
                    "I can sense that you're going through a difficult time. Depression can make everything feel overwhelming, but you don't have to face this alone.",
                    "What you're describing sounds like depression, and I want you to know that this is treatable. Let's talk about what you're experiencing.",
                    "I hear the pain in your words. Depression can be incredibly isolating, but I'm here to support you through this."
                ],
                default: [
                    "I hear you, and I want you to know that your feelings are valid. Let's explore this together.",
                    "Thank you for sharing that with me. I'd like to understand more about your experience.",
                    "I'm here to listen and help you work through whatever you're facing. Could you tell me more?"
                ]
            },
            'michael-rodriguez': {
                recovery: [
                    "Recovery is a journey, and I want you to know that you're not alone in this. Every step forward, no matter how small, is progress.",
                    "I understand the challenges you're facing. Recovery takes courage, and you're showing that courage by reaching out.",
                    "You're taking an important step by talking about this. Recovery is possible, and I'm here to support you every step of the way."
                ],
                substance: [
                    "I hear you, and I want you to know that there's hope. Recovery is possible, and you don't have to face this alone.",
                    "What you're going through is incredibly difficult, but you're showing strength by seeking help. Let's work through this together.",
                    "I understand the struggle you're experiencing. Recovery is a process, and I'm here to support you through every part of it."
                ],
                default: [
                    "I want you to know that you're not alone in this journey. I'm here to support you.",
                    "Thank you for trusting me with this. Let's work through it together.",
                    "I hear you, and I understand. You don't have to face this alone."
                ]
            },
            'dr-emily-chen': {
                relationship: [
                    "Relationships can be complex, and it sounds like you're going through a challenging time. Let's explore what's happening.",
                    "I hear the pain in your voice when you talk about your relationships. This is something we can work through together.",
                    "Relationship issues can affect every part of our lives. I'm here to help you navigate this difficult situation."
                ],
                family: [
                    "Family dynamics can be incredibly complex. I'd like to help you understand what's happening and find ways to improve the situation.",
                    "Family relationships can be both rewarding and challenging. Let's explore what you're experiencing.",
                    "I hear how much this family situation is affecting you. We can work together to find solutions."
                ],
                default: [
                    "I hear you, and I want to help you work through this. Relationships are important, and they deserve our attention.",
                    "Thank you for sharing this with me. Let's explore what's happening and find ways to improve the situation.",
                    "I'm here to help you navigate this relationship challenge. We can work through it together."
                ]
            },
            'james-williams': {
                career: [
                    "Career challenges can be really stressful. Let's break this down and figure out what's happening and how we can move forward.",
                    "I hear that you're facing some career difficulties. This is something we can work through together.",
                    "Career issues can affect our whole lives. I'm here to help you navigate this and find solutions."
                ],
                work: [
                    "Work stress can be overwhelming. Let's explore what's happening and find ways to manage this situation.",
                    "I understand how challenging work situations can be. We can work together to find solutions.",
                    "Work issues can really impact our well-being. I'm here to help you work through this."
                ],
                default: [
                    "I hear you, and I want to help you work through this challenge. We can find solutions together.",
                    "Thank you for sharing this with me. Let's explore what's happening and find ways to move forward.",
                    "I'm here to help you navigate this situation. We can work through it together."
                ]
            },
            'dr-maria-garcia': {
                crisis: [
                    "I hear that you're in crisis, and I want you to know that I'm here with you. Your safety is my top priority right now.",
                    "I understand this is a crisis situation. I'm here to help you get through this moment safely.",
                    "I hear the urgency in your voice. Let's work together to keep you safe and get you the help you need."
                ],
                emergency: [
                    "I understand this is an emergency situation. I'm here to help you stay safe and get the support you need.",
                    "I hear that you need immediate help. Let's work together to ensure your safety and get you connected to the right resources.",
                    "I'm here with you in this emergency. Your safety is my priority, and I'll help you get through this."
                ],
                default: [
                    "I hear you, and I want you to know that I'm here to help. Your safety and well-being are my priority.",
                    "Thank you for reaching out. I'm here to support you and help you get through this difficult time.",
                    "I understand this is a challenging situation. I'm here to help you stay safe and find solutions."
                ]
            },
            'lisa-thompson': {
                welcome: [
                    "Welcome to CareConnect! I'm so glad you're here. Let me help you get started and find the perfect counselor for your needs.",
                    "I'm here to make sure you feel comfortable and supported as you begin your journey with CareConnect.",
                    "Welcome! I want to help you find the right support for your situation. Let's explore what you're looking for."
                ],
                help: [
                    "I'm here to help you navigate CareConnect and find the perfect counselor for your needs. What brings you here today?",
                    "I want to make sure you get the most out of CareConnect. Let me help you find the right counselor and services.",
                    "I'm here to guide you through CareConnect and help you find the support you need. What can I help you with?"
                ],
                default: [
                    "I'm here to help you get started with CareConnect and find the perfect counselor for your needs.",
                    "Welcome! I want to make sure you feel comfortable and find the right support for your situation.",
                    "I'm here to guide you through CareConnect and help you find the counselor who's right for you."
                ]
            }
        };

        const counselorResponses = responses[counselor.name.toLowerCase().replace(' ', '-')] || responses['lisa-thompson'];
        
        // Determine response category
        let category = 'default';
        if (lowerMessage.includes('anxiety') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
            category = 'anxiety';
        } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) {
            category = 'depression';
        } else if (lowerMessage.includes('relationship') || lowerMessage.includes('partner') || lowerMessage.includes('marriage')) {
            category = 'relationship';
        } else if (lowerMessage.includes('family') || lowerMessage.includes('parent') || lowerMessage.includes('child')) {
            category = 'family';
        } else if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work')) {
            category = 'career';
        } else if (lowerMessage.includes('crisis') || lowerMessage.includes('emergency') || lowerMessage.includes('suicide')) {
            category = 'crisis';
        } else if (lowerMessage.includes('welcome') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
            category = 'welcome';
        } else if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('guidance')) {
            category = 'help';
        }

        const responseArray = counselorResponses[category] || counselorResponses.default;
        return responseArray[Math.floor(Math.random() * responseArray.length)];
    }

    updateCounselorMood(userMessage, counselorResponse) {
        const counselor = this.getCurrentCounselor();
        if (!counselor) return;

        const lowerMessage = userMessage.toLowerCase();
        
        // Update mood based on conversation content
        if (lowerMessage.includes('thank') || lowerMessage.includes('appreciate') || lowerMessage.includes('helpful')) {
            counselor.mood = '😊';
        } else if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('hopeless')) {
            counselor.mood = '😔';
        } else if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('mad')) {
            counselor.mood = '😤';
        } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('scared')) {
            counselor.mood = '😰';
        } else {
            counselor.mood = '😊';
        }

        // Update mood in header
        const moodElement = document.querySelector('.counselor-mood');
        if (moodElement) {
            moodElement.textContent = counselor.mood;
        }
    }
}

// Global functions for backward compatibility
function sendMessage() {
    if (window.careConnectChat) {
        window.careConnectChat.sendMessage();
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
} 