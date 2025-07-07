class FakelitHomepageBot {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.isOpen = false;
        this.isTyping = false;
        this.conversationHistory = [];
        this.currentContext = 'welcome';
        
        this.responses = {
            welcome: [
                "Hello! Welcome to Fakelit.com! 🚀 I'm here to help you with our hosting, domain management, payment processing, and web development services. How can I assist you today?",
                "Hi there! 👋 Welcome to Fakelit.com - your one-stop solution for hosting, domains, and payment processing. What would you like to know about our services?",
                "Greetings! 🌐 I'm your Fakelit.com assistant. We offer professional hosting, domain management, NMI payment terminals, and web development. How can I help you?"
            ],
            services: [
                "Our services include:\n\n🏠 **Hosting Solutions**\n- Shared hosting\n- VPS hosting\n- Dedicated servers\n- Cloud hosting\n\n🌐 **Domain Management**\n- Domain registration\n- DNS management\n- SSL certificates\n\n💳 **Payment Processing**\n- NMI payment terminals\n- Stripe integration\n- Crypto payments (ETH, USDT, USDC)\n\n💻 **Web Development**\n- Custom websites\n- E-commerce solutions\n- API development",
                "At Fakelit.com, we provide comprehensive digital solutions:\n\n📦 **Hosting Packages** starting at $9.99/month\n🌍 **Domain Services** with 24/7 support\n💳 **Payment Solutions** including crypto payments\n🛠️ **Development Services** for custom projects\n\nWhich service interests you most?"
            ],
            pricing: [
                "Here are our current pricing options:\n\n🏠 **Hosting Packages**\n- Basic: $9.99/month\n- Professional: $19.99/month\n- Enterprise: $49.99/month\n\n🌐 **Domain Services**\n- Registration: $12.99/year\n- SSL Certificate: $29.99/year\n\n💳 **Payment Processing**\n- NMI Terminal Setup: $250 + $25/month\n- Stripe Integration: $150 + $18.75/month\n- Transaction Fee: 4.9% + 25¢\n\n💻 **Development**\n- Custom Website: $1,500+\n- E-commerce: $2,500+\n\nAll prices include our 25% service markup.",
                "Our transparent pricing structure:\n\n💰 **Hosting**: $9.99 - $49.99/month\n🌐 **Domains**: $12.99/year\n💳 **Payment Processing**: Setup fees + monthly + transaction fees\n💻 **Development**: Project-based pricing\n\nWould you like a custom quote for your specific needs?"
            ],
            crypto: [
                "We accept cryptocurrency payments! 🚀\n\nSupported tokens:\n- **Ethereum (ETH)**\n- **Tether (USDT)**\n- **USD Coin (USDC)**\n\nOur wallet address: `0xB7f814EbE3B4f0e838470E60869d75B977a6E3c2`\n\nTo pay with crypto:\n1. Create a payment request\n2. Send the exact amount to our wallet\n3. Provide transaction hash\n4. We'll confirm and process your order\n\nWould you like to create a crypto payment request?",
                "Yes! We're crypto-friendly at Fakelit.com! 💎\n\n**Supported Cryptocurrencies:**\n• Ethereum (ETH)\n• Tether (USDT)\n• USD Coin (USDC)\n\n**How to pay:**\n1. Select crypto payment option\n2. Get our wallet address\n3. Send payment\n4. Confirm with transaction hash\n\nThis makes us one of the few hosting companies accepting crypto payments!"
            ],
            support: [
                "Need help? We're here for you! 🛠️\n\n**Support Options:**\n📞 Phone: (555) 123-4567\n📧 Email: support@fakelit.com\n💬 Live Chat: Available 24/7\n🎫 Ticket System: Create support tickets\n\n**Response Times:**\n- General inquiries: 2-4 hours\n- Technical issues: 1-2 hours\n- Urgent matters: 30 minutes\n\nWould you like to create a support ticket or speak with our team?",
                "Our support team is available 24/7! 🌟\n\n**Contact Methods:**\n• Live chat (right here!)\n• Support tickets\n• Phone support\n• Email support\n\n**Average Response Times:**\n• Chat: Instant\n• Tickets: 2-4 hours\n• Phone: Immediate\n• Email: 4-6 hours\n\nWhat type of support do you need?"
            ],
            contact: [
                "Here's how to reach us:\n\n📞 **Phone**: (555) 123-4567\n📧 **Email**: info@fakelit.com\n🌐 **Website**: fakelit.com\n📍 **Address**: 123 Tech Street, Digital City, DC 12345\n\n**Business Hours**:\nMonday - Friday: 9 AM - 6 PM EST\nSaturday: 10 AM - 4 PM EST\nSunday: Closed\n\n**24/7 Support**: Available for hosting and domain issues\n\nWould you like me to help you create a contact form submission?",
                "Get in touch with Fakelit.com:\n\n📱 **Phone**: (555) 123-4567\n✉️ **Email**: info@fakelit.com\n💬 **Live Chat**: Available now\n🎫 **Support Tickets**: Create online\n\n**Office Hours**:\nWeekdays: 9 AM - 6 PM EST\nWeekends: 10 AM - 4 PM EST\n\n**Emergency Support**: 24/7 for critical issues\n\nHow would you prefer to contact us?"
            ],
            portfolio: [
                "Check out our recent work! 🎨\n\n**Recent Projects:**\n• E-commerce platform for TechStore.com\n• Portfolio website for CreativeAgency.net\n• Blog platform for TravelBlog.org\n• Payment integration for RetailChain.com\n\n**Technologies We Use:**\n• React, Vue.js, Angular\n• Node.js, Python, PHP\n• AWS, Google Cloud, Azure\n• NMI, Stripe, Crypto payments\n\nWould you like to see specific examples or discuss your project?",
                "Our portfolio showcases diverse projects:\n\n🏪 **E-commerce Sites**\n🖼️ **Portfolio Websites**\n📝 **Blog Platforms**\n💳 **Payment Systems**\n🎨 **Custom Applications**\n\n**Success Metrics:**\n• 95% client satisfaction\n• 200+ projects completed\n• 24/7 uptime guarantee\n• 99.9% security rating\n\nInterested in seeing similar projects to yours?"
            ],
            default: [
                "I'm not sure I understood that. Could you please rephrase or ask about our services, pricing, support, or contact information?",
                "I didn't catch that. You can ask me about:\n• Our services\n• Pricing\n• Support\n• Contact info\n• Portfolio\n• Crypto payments",
                "Let me help you better! You can ask about:\n- Hosting and domains\n- Payment processing\n- Web development\n- Support options\n- Pricing information"
            ]
        };

        this.keywords = {
            services: ['service', 'hosting', 'domain', 'payment', 'development', 'what do you do', 'offer'],
            pricing: ['price', 'cost', 'fee', 'how much', 'pricing', 'quote', 'expensive', 'cheap'],
            crypto: ['crypto', 'bitcoin', 'ethereum', 'eth', 'usdt', 'usdc', 'blockchain', 'wallet'],
            support: ['help', 'support', 'issue', 'problem', 'trouble', 'assist', 'contact'],
            contact: ['contact', 'phone', 'email', 'address', 'reach', 'call', 'message'],
            portfolio: ['work', 'project', 'portfolio', 'example', 'sample', 'showcase', 'done']
        };

        this.init();
    }

    init() {
        this.createBotInterface();
        this.bindEvents();
        this.showWelcomeMessage();
    }

    createBotInterface() {
        const botHTML = `
            <div id="fakelit-bot" class="fakelit-bot">
                <div class="bot-header" id="bot-header">
                    <div class="bot-avatar">
                        <img src="/images/logo.svg" alt="Fakelit.com Bot" />
                    </div>
                    <div class="bot-info">
                        <h4>Fakelit.com Assistant</h4>
                        <span class="bot-status" id="bot-status">Online</span>
                    </div>
                    <button class="bot-toggle" id="bot-toggle">
                        <span class="toggle-icon">×</span>
                    </button>
                </div>
                
                <div class="bot-body" id="bot-body">
                    <div class="chat-messages" id="chat-messages"></div>
                    
                    <div class="chat-input-container">
                        <div class="typing-indicator" id="typing-indicator" style="display: none;">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div class="input-wrapper">
                            <input type="text" id="chat-input" placeholder="Ask me about our services..." />
                            <button id="send-message">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22,2 15,22 11,13 2,9"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="bot-trigger" id="bot-trigger">
                    <div class="trigger-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </div>
                    <span class="trigger-text">Need help?</span>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', botHTML);
    }

    bindEvents() {
        const toggle = document.getElementById('bot-toggle');
        const trigger = document.getElementById('bot-trigger');
        const input = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');

        toggle.addEventListener('click', () => this.toggleBot());
        trigger.addEventListener('click', () => this.openBot());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        sendButton.addEventListener('click', () => this.sendMessage());
    }

    toggleBot() {
        this.isOpen = !this.isOpen;
        const bot = document.getElementById('fakelit-bot');
        const body = document.getElementById('bot-body');
        const trigger = document.getElementById('bot-trigger');
        
        if (this.isOpen) {
            bot.classList.add('open');
            body.style.display = 'block';
            trigger.style.display = 'none';
            document.getElementById('chat-input').focus();
        } else {
            bot.classList.remove('open');
            body.style.display = 'none';
            trigger.style.display = 'flex';
        }
    }

    openBot() {
        if (!this.isOpen) {
            this.toggleBot();
        }
    }

    showWelcomeMessage() {
        const welcomeMessage = this.getRandomResponse('welcome');
        this.addMessage('bot', welcomeMessage);
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage('user', message);
        input.value = '';
        
        this.processMessage(message);
    }

    addMessage(sender, message) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.formatMessage(message)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.conversationHistory.push({
            sender,
            message,
            timestamp: new Date().toISOString()
        });
    }

    formatMessage(message) {
        // Convert markdown-style formatting
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    async processMessage(message) {
        this.showTyping();
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        this.hideTyping();
        
        const response = this.getResponse(message);
        this.addMessage('bot', response);
    }

    getResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for keywords
        for (const [category, keywords] of Object.entries(this.keywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return this.getRandomResponse(category);
            }
        }
        
        // Check for specific questions
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return this.getRandomResponse('welcome');
        }
        
        if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return "Thanks for chatting with Fakelit.com! Feel free to reach out anytime. Have a great day! 👋";
        }
        
        if (lowerMessage.includes('thank')) {
            return "You're welcome! I'm here to help with all your Fakelit.com needs. Is there anything else you'd like to know? 😊";
        }
        
        return this.getRandomResponse('default');
    }

    getRandomResponse(category) {
        const responses = this.responses[category] || this.responses.default;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    showTyping() {
        this.isTyping = true;
        const indicator = document.getElementById('typing-indicator');
        indicator.style.display = 'flex';
        
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        this.isTyping = false;
        const indicator = document.getElementById('typing-indicator');
        indicator.style.display = 'none';
    }

    // Public methods for external use
    openChat() {
        this.openBot();
    }

    sendQuickMessage(message) {
        this.openBot();
        setTimeout(() => {
            const input = document.getElementById('chat-input');
            input.value = message;
            this.sendMessage();
        }, 500);
    }
}

// Initialize bot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fakelitBot = new FakelitHomepageBot();
});

// Global functions for external use
window.openFakelitChat = () => {
    if (window.fakelitBot) {
        window.fakelitBot.openChat();
    }
};

window.askFakelitBot = (question) => {
    if (window.fakelitBot) {
        window.fakelitBot.sendQuickMessage(question);
    }
}; 