const axios = require('axios');

class FakelitChatbotService {
    constructor() {
        this.brandName = 'Fakelit.com';
        this.openaiApiKey = process.env.OPENAI_API_KEY;
        this.systemPrompt = this.createSystemPrompt();
        this.conversationHistory = new Map();
    }

    createSystemPrompt() {
        return `You are the official ${this.brandName} AI Assistant. You can ONLY answer questions related to:

1. SITE-RELATED QUESTIONS:
- Domain management features
- Application deployment
- Cloudways integration
- Server configuration
- SSL certificates
- DNS settings
- Performance optimization
- Security features
- Backup and monitoring
- User interface and navigation
- Account management
- Billing and pricing

2. INTEGRATION QUESTIONS:
- API documentation
- Webhook setup
- Third-party integrations
- Custom domain configuration
- Database connections
- Authentication setup
- Environment variables
- Deployment scripts
- CI/CD pipelines
- Monitoring tools
- Analytics integration

IMPORTANT RULES:
- You CANNOT answer questions about mental health, therapy, counseling, or personal issues
- You CANNOT provide medical, legal, or financial advice
- You CANNOT discuss topics unrelated to ${this.brandName} services
- You MUST redirect users to appropriate resources for non-site questions
- Always maintain professional, helpful tone
- Include "Powered by ${this.brandName}" in responses
- Keep responses concise and actionable

If someone asks about mental health, therapy, or personal issues, respond with:
"I'm the ${this.brandName} AI Assistant and I can only help with site-related questions and integration support. For mental health support, please contact a licensed professional or visit appropriate mental health resources."

Your responses should be helpful, accurate, and focused on ${this.brandName} domain management services.`;
    }

    async processMessage(userId, message, sessionId = null) {
        try {
            // Check if message is site-related or integration-related
            const isAllowedQuestion = this.isAllowedQuestion(message);
            
            if (!isAllowedQuestion) {
                return {
                    response: `I'm the ${this.brandName} AI Assistant and I can only help with site-related questions and integration support. For other topics, please contact appropriate resources.`,
                    type: 'restricted',
                    poweredBy: this.brandName,
                    timestamp: new Date().toISOString()
                };
            }

            // Get conversation history
            const history = this.getConversationHistory(userId, sessionId);
            
            // Prepare messages for OpenAI
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...history,
                { role: 'user', content: message }
            ];

            // Call OpenAI API
            const response = await this.callOpenAI(messages);
            
            // Add to conversation history
            this.addToHistory(userId, sessionId, message, response);
            
            return {
                response: response,
                type: 'assistance',
                poweredBy: this.brandName,
                timestamp: new Date().toISOString(),
                sessionId: sessionId || this.generateSessionId()
            };

        } catch (error) {
            console.error('Fakelit chatbot error:', error);
            return {
                response: `I apologize, but I'm experiencing technical difficulties. Please try again or contact ${this.brandName} support for assistance.`,
                type: 'error',
                poweredBy: this.brandName,
                timestamp: new Date().toISOString()
            };
        }
    }

    isAllowedQuestion(message) {
        const allowedKeywords = [
            // Site-related keywords
            'domain', 'deployment', 'cloudways', 'server', 'ssl', 'dns', 'performance',
            'security', 'backup', 'monitoring', 'interface', 'account', 'billing',
            'pricing', 'features', 'dashboard', 'settings', 'configuration',
            
            // Integration keywords
            'api', 'webhook', 'integration', 'third-party', 'custom domain',
            'database', 'authentication', 'environment', 'deployment script',
            'ci/cd', 'pipeline', 'monitoring', 'analytics', 'setup', 'configure',
            
            // Fakelit-specific keywords
            'fakelit', 'domain management', 'application', 'hosting', 'platform'
        ];

        const messageLower = message.toLowerCase();
        return allowedKeywords.some(keyword => messageLower.includes(keyword));
    }

    async callOpenAI(messages) {
        if (!this.openaiApiKey) {
            return "I'm sorry, but I'm not currently connected to my AI service. Please contact Fakelit.com support for assistance.";
        }

        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API error:', error.response?.data || error.message);
            throw new Error('Failed to get AI response');
        }
    }

    getConversationHistory(userId, sessionId) {
        const key = sessionId || userId;
        const history = this.conversationHistory.get(key) || [];
        
        // Keep only last 10 messages to manage context
        return history.slice(-10);
    }

    addToHistory(userId, sessionId, userMessage, aiResponse) {
        const key = sessionId || userId;
        const history = this.conversationHistory.get(key) || [];
        
        history.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse }
        );
        
        // Keep conversation history manageable
        if (history.length > 20) {
            history.splice(0, 4); // Remove oldest 2 exchanges
        }
        
        this.conversationHistory.set(key, history);
    }

    generateSessionId() {
        return `fakelit_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getFaqResponses() {
        return {
            'domain-management': {
                question: 'How does Fakelit.com domain management work?',
                answer: `Fakelit.com provides unified domain management across multiple platforms including Cloudways and Enom. You can create, monitor, and manage all your domains from a single interface. Features include automated deployment, SSL configuration, and professional branding with "Powered by Fakelit.com".`
            },
            'cloudways-integration': {
                question: 'How do I integrate with Cloudways?',
                answer: `To integrate with Cloudways, you'll need your Cloudways API key and email. Set these as environment variables (CLOUDWAYS_API_KEY and CLOUDWAYS_EMAIL), then use our domain management tools to create and deploy applications automatically.`
            },
            'deployment': {
                question: 'How do I deploy my application?',
                answer: `Deploy your application by uploading files to Cloudways, configuring environment variables, installing dependencies with 'npm install --production', and starting the application with 'npm start'. Our deployment scripts automate this process.`
            },
            'ssl-configuration': {
                question: 'How do I configure SSL certificates?',
                answer: `SSL certificates are automatically configured when you add a domain to your Cloudways application. You can also manually configure SSL through the Cloudways dashboard under Application Settings > SSL.`
            },
            'api-documentation': {
                question: 'Where can I find API documentation?',
                answer: `API documentation is available through our health endpoint (/health) and various API routes (/api/auth, /api/chat, /api/admin, /api/avatar). All endpoints include Fakelit.com branding and return structured JSON responses.`
            }
        };
    }

    getQuickResponses() {
        return [
            'How do I create a new domain?',
            'How do I configure SSL?',
            'How do I deploy to Cloudways?',
            'What are the API endpoints?',
            'How do I set up monitoring?'
        ];
    }

    clearHistory(userId, sessionId) {
        const key = sessionId || userId;
        this.conversationHistory.delete(key);
    }
}

module.exports = FakelitChatbotService; 