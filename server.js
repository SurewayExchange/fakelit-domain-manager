require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const heygenAvatarRoutes = require('./routes/heygenAvatarRoutes');
const lifelikeAvatarRoutes = require('./routes/lifelikeAvatarRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const emailRoutes = require('./routes/emailRoutes');
const ticketingRoutes = require('./routes/ticketingRoutes');
const cryptoPaymentRoutes = require('./routes/cryptoPaymentRoutes');
const wordpressRoutes = require('./routes/wordpressRoutes');
const dedicatedServerRoutes = require('./routes/dedicatedServerRoutes');
const fakelitEmailRoutes = require('./routes/fakelitEmailRoutes');
const emailAccessRoutes = require('./routes/emailAccessRoutes');
const smsNotificationRoutes = require('./routes/smsNotificationRoutes');
const fakelitChatbotRoutes = require('./routes/fakelitChatbotRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import new services
const ReadyPlayerMeService = require('./services/readyPlayerMeService');
const LipSyncService = require('./services/lipSyncService');
const VoiceService = require('./services/voiceService');
const HeyGenAvatarService = require('./services/heygenAvatarService');

// Initialize Supabase database connection
const { initializeDatabase } = require('./config/supabase');

async function connectDB() {
  try {
    await initializeDatabase();
    console.log('✅ Supabase database connected successfully');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.log('⚠️ Running without database - some features may be limited');
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DOMAIN = process.env.DOMAIN || 'fakelit.com';

// Security and performance middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.openai.com", "https://api.twilio.com"]
        }
    }
}));

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving with caching
app.use(express.static('public', {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/heygen-avatar', heygenAvatarRoutes);
app.use('/api/lifelike-avatar', lifelikeAvatarRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/ticketing', ticketingRoutes);
app.use('/api/crypto-payment', cryptoPaymentRoutes);
app.use('/api/wordpress', wordpressRoutes);
app.use('/api/dedicated-server', dedicatedServerRoutes);
app.use('/api/fakelit-email', fakelitEmailRoutes);
app.use('/api/email-access', emailAccessRoutes);
app.use('/api/sms-notifications', smsNotificationRoutes);
app.use('/api/fakelit-chatbot', fakelitChatbotRoutes);
app.use('/api/payments', paymentRoutes);

// Main page - Fakelit.com Hosting Platform
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for platform information
app.get('/api/platform', (req, res) => {
    res.json({
        status: 'operational',
        service: 'Fakelit.com - Professional Hosting & Domain Services',
        poweredBy: 'Fakelit.com',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        domain: DOMAIN,
        company: {
            name: 'Fakelit.com',
            address: '2300 W Sahara Ave Suite 800, Las Vegas, NV 89102',
            phone: '702-664-0009',
            email: 'support@fakelit.com',
            website: 'https://fakelit.com'
        },
        services: {
            hosting: {
                dedicatedServers: {
                    basic: '$199.99/month - 4 vCPU, 8GB RAM, 500GB SSD',
                    professional: '$399.99/month - 8 vCPU, 16GB RAM, 1TB SSD',
                    enterprise: '$799.99/month - 16 vCPU, 32GB RAM, 2TB SSD'
                },
                sharedHosting: {
                    starter: '$9.99/month - 10GB SSD, 1 domain',
                    business: '$19.99/month - 50GB SSD, 5 domains',
                    premium: '$39.99/month - 100GB SSD, unlimited domains'
                }
            },
            domains: {
                registration: '$21.99/year - includes 5 free email addresses',
                management: 'DNS management, domain privacy, webmail access',
                transfer: '$19.99/year - domain transfer service'
            },
            email: {
                professional: '7 Fakelit.com email addresses included',
                hosting: 'Webmail access, spam protection, 10GB storage',
                forwarding: 'Email forwarding to client addresses'
            },
            webDevelopment: {
                wordpress: 'WordPress themes, sites, and support tiers',
                customDevelopment: 'Custom web applications and APIs',
                maintenance: '24/7 monitoring and support'
            },
            paymentGateways: {
                stripe: 'Credit cards, Apple Pay, Google Pay',
                nmi: 'Network Merchants Inc. - traditional payment processing',
                crypto: 'Bitcoin, Ethereum, MetaMask integration'
            },
            support: {
                phone: '702-664-0009 - 24/7 technical support',
                email: 'support@fakelit.com - ticket system',
                aiChatbot: 'AI-powered customer assistance',
                documentation: 'Comprehensive guides and tutorials'
            }
        },
        features: {
            autoScaling: 'Automatic server scaling based on traffic',
            sslCertificates: 'Free SSL certificates for all domains',
            cdn: 'Global content delivery network',
            backups: 'Daily automated backups',
            monitoring: '24/7 server monitoring and alerts',
            security: 'DDoS protection, firewall, malware scanning'
        },
        aiChatbot: {
            status: 'online',
            purpose: 'Customer assistance for hosting and domain services',
            capabilities: [
                'Help with domain registration and management',
                'Assist with hosting plan selection',
                'Provide technical support guidance',
                'Explain payment options and billing',
                'Guide through WordPress setup and maintenance'
            ],
            restrictions: [
                'Professional hosting and domain services only',
                'No counseling or mental health services',
                'Focused on technical and business support'
            ]
        }
    });
});

// Health check endpoint (redirects to main page)
app.get('/health', (req, res) => {
    res.redirect('/');
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'operational',
        services: {
            email: 'operational',
            sms: 'operational',
            ticketing: 'operational',
            payments: 'operational',
            hosting: 'operational'
        },
        poweredBy: 'Fakelit.com'
    });
});

// Main page serves the hosting platform information
// The '/' route is now handled by the JSON response above

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/dedicated-servers', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dedicated-servers.html'));
});

app.get('/wordpress-services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'wordpress-services.html'));
});

app.get('/email-access', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'email-access.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/portfolio', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'portfolio.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        poweredBy: 'Fakelit.com'
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Fakelit.com - Professional Hosting Platform');
    console.log('==============================================');
    console.log(`🏢 Company: Fakelit.com`);
    console.log(`🌐 Domain: ${DOMAIN}`);
    console.log(`📞 Phone: 702-664-0009`);
    console.log(`📧 Email: support@fakelit.com`);
    console.log(`🏢 Address: 2300 W Sahara Ave Suite 800, Las Vegas, NV 89102`);
    console.log('');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📊 Health check: https://${DOMAIN}/health`);
    console.log(`🔗 API base: https://${DOMAIN}/api`);
    console.log(`🌐 Website: https://${DOMAIN}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log('');
    console.log('🎯 Hosting Services:');
    console.log('   ✅ Dedicated Servers ($199.99-$799.99/month)');
    console.log('   ✅ Shared Hosting ($9.99-$39.99/month)');
    console.log('   ✅ Domain Registration ($21.99/year)');
    console.log('   ✅ Professional Email Services');
    console.log('   ✅ WordPress Development & Support');
    console.log('   ✅ Payment Gateways (Stripe, NMI, Crypto)');
    console.log('   ✅ AI Chatbot Customer Support');
    console.log('   ✅ 24/7 Technical Support');
    console.log('');
    console.log('📞 Support: 702-664-0009 | support@fakelit.com');
    console.log('🏢 Powered by Fakelit.com');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

module.exports = app; 