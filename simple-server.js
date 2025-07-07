const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
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
            connectSrc: ["'self'"]
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Fakelit.com - Professional Hosting Platform',
        poweredBy: 'Fakelit.com',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        domain: DOMAIN,
        features: {
            dedicatedServers: true,
            domainManagement: true,
            emailServices: true,
            smsNotifications: true,
            wordpressServices: true,
            cryptoPayments: true,
            ticketingSystem: true,
            autoScaling: true
        },
        company: {
            name: 'Fakelit.com',
            address: '2300 W Sahara Ave Suite 800, Las Vegas, NV 89102',
            phone: '702-664-0009',
            email: 'support@fakelit.com',
            website: 'https://fakelit.com'
        }
    });
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

// Simple API endpoints
app.get('/api/company', (req, res) => {
    res.json({
        name: 'Fakelit.com',
        address: '2300 W Sahara Ave Suite 800, Las Vegas, NV 89102',
        phone: '702-664-0009',
        emails: {
            support: 'support@fakelit.com',
            sales: 'sales@fakelit.com',
            billing: 'billing@fakelit.com',
            accounts: 'accounts@fakelit.com',
            info: 'info@fakelit.com',
            mbrooks: 'm.brooks@fakelit.com',
            vhelems: 'v.helems@fakelit.com'
        },
        services: [
            'Dedicated Server Sales',
            'Domain Management ($21.99/year)',
            'Email Services (7 professional addresses)',
            'SMS Notifications (513-441-9772)',
            'WordPress Services',
            'Crypto Payment Processing',
            'Support Ticketing System',
            'Auto-Scaling Infrastructure'
        ],
        poweredBy: 'Fakelit.com'
    });
});

// Serve main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base: http://localhost:${PORT}/api`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log('');
    console.log('🎯 Features:');
    console.log('   ✅ Dedicated Server Sales');
    console.log('   ✅ Domain Management ($21.99/year)');
    console.log('   ✅ Email Services (7 professional addresses)');
    console.log('   ✅ SMS Notifications (513-441-9772)');
    console.log('   ✅ WordPress Services');
    console.log('   ✅ Crypto Payment Processing');
    console.log('   ✅ Support Ticketing System');
    console.log('   ✅ Auto-Scaling Infrastructure');
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