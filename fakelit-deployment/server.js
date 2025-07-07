require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const clientRoutes = require('./routes/clientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const lifelikeAvatarRoutes = require('./routes/lifelikeAvatarRoutes');
const heygenAvatarRoutes = require('./routes/heygenAvatarRoutes');
const authRoutes = require('./routes/authRoutes');
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
const PORT = process.env.PORT || 80;

// Initialize services
const rpmService = new ReadyPlayerMeService();
const lipSyncService = new LipSyncService();
const voiceService = new VoiceService();
const heygenService = new HeyGenAvatarService();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://widget.readyplayer.me"],
      scriptSrcAttr: ["'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.readyplayer.me", "https://api.elevenlabs.io", "https://api.play.ht", "https://api.heygen.com"],
      frameSrc: ["'self'", "https://widget.readyplayer.me", "https://iframe.readyplayer.me"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? [
    'https://fakelit.com',
    'https://www.fakelit.com',
    'https://*.cloudwaysapps.com',
    'https://*.cloudways.com'
  ] : true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session ID middleware
app.use((req, res, next) => {
  if (!req.headers['x-session-id']) {
    req.headers['x-session-id'] = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Fakelit.com Domain Manager',
    version: '1.0.0',
    poweredBy: 'Fakelit.com',
    domain: process.env.DOMAIN || 'fakelit.com',
    cloudwaysDomain: process.env.CLOUDWAYS_DOMAIN || 'your-app.cloudwaysapps.com',
    features: {
      domainManagement: 'Cloudways + Enom Integration',
      paymentGateway: 'NMI + Magento',
      avatar: '3D Ready Player Me',
      voice: 'ElevenLabs/PlayHT/Polly',
      lipSync: 'D-ID Integration',
      chat: 'OpenAI GPT-4'
    }
  });
});

// Root endpoint - serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/avatar/lifelike', lifelikeAvatarRoutes);
app.use('/api/heygen', heygenAvatarRoutes);
app.use('/api/fakelit-chatbot', fakelitChatbotRoutes);
app.use('/api/payments', paymentRoutes);

// Ready Player Me routes
app.get('/api/rpm/avatars', async (req, res) => {
  try {
    // Return mock data instead of calling the service
    const mockAvatars = [
      {
        id: 'dr-sarah-mitchell',
        name: 'Dr. Sarah Mitchell',
        avatar: '/images/counselors/dr-sarah-mitchell.svg',
        status: 'online'
      },
      {
        id: 'michael-rodriguez',
        name: 'Michael Rodriguez',
        avatar: '/images/counselors/michael-rodriguez.svg',
        status: 'online'
      },
      {
        id: 'dr-emily-chen',
        name: 'Dr. Emily Chen',
        avatar: '/images/counselors/dr-emily-chen.svg',
        status: 'online'
      },
      {
        id: 'james-williams',
        name: 'James Williams',
        avatar: '/images/counselors/james-williams.svg',
        status: 'online'
      },
      {
        id: 'dr-maria-garcia',
        name: 'Dr. Maria Garcia',
        avatar: '/images/counselors/dr-maria-garcia.svg',
        status: 'online'
      },
      {
        id: 'lisa-thompson',
        name: 'Lisa Thompson',
        avatar: '/images/counselors/lisa-thompson.svg',
        status: 'online'
      }
    ];
    res.json(mockAvatars);
  } catch (error) {
    console.error('RPM get avatars error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rpm/avatars', async (req, res) => {
  try {
    const { counselorId, counselorName } = req.body;
    // Create a mock session ID
    const sessionId = `rpm_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🎭 RPM avatar session created: ${sessionId} for ${counselorId}`);
    
    res.json({
      sessionId: sessionId,
      counselorId: counselorId,
      status: 'created',
      avatarUrl: `/images/counselors/${counselorId}.svg`
    });
  } catch (error) {
    console.error('RPM create avatar error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rpm/avatars/:id', async (req, res) => {
  try {
    const avatar = await rpmService.getAvatar(req.params.id);
    res.json(avatar);
  } catch (error) {
    console.error('RPM get avatar error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/rpm/avatars/:id', async (req, res) => {
  try {
    const avatar = await rpmService.updateAvatar(req.params.id, req.body);
    res.json(avatar);
  } catch (error) {
    console.error('RPM update avatar error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/rpm/avatars/:id', async (req, res) => {
  try {
    const result = await rpmService.deleteAvatar(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('RPM delete avatar error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rpm/avatars/:id/model', async (req, res) => {
  try {
    const format = req.query.format || 'glb';
    const model = await rpmService.getAvatarModel(req.params.id, format);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="avatar.${format}"`);
    res.send(model.model_data);
  } catch (error) {
    console.error('RPM get avatar model error:', error);
    res.status(500).json({ error: error.message });
  }
});

// RPM avatar speak route
app.post('/api/rpm/avatars/:sessionId/speak', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { text, options = {} } = req.body;
    
    // Return mock response instead of calling the service
    res.json({
      success: true,
      sessionId: sessionId,
      text: text,
      audioUrl: null, // No audio for mock
      duration: text.length * 0.1, // Estimate duration
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RPM speak error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lip sync routes
app.post('/api/lipsync/generate', async (req, res) => {
  try {
    const { audioBuffer, avatarId, counselorId, context } = req.body;
    const animationData = await lipSyncService.generateLipSyncAnimation(
      Buffer.from(audioBuffer, 'base64'),
      avatarId,
      counselorId,
      context
    );
    res.json(animationData);
  } catch (error) {
    console.error('Lip sync generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lipsync/did', async (req, res) => {
  try {
    const { audioUrl, avatarUrl } = req.body;
    const result = await lipSyncService.generateDIDLipSync(audioUrl, avatarUrl);
    res.json(result);
  } catch (error) {
    console.error('D-ID lip sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lipsync/rpm', async (req, res) => {
  try {
    const { audioUrl, avatarId } = req.body;
    const result = await lipSyncService.generateRPMLipSync(audioUrl, avatarId);
    res.json(result);
  } catch (error) {
    console.error('RPM lip sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lipsync/realtime', async (req, res) => {
  try {
    const { audioChunk, previousVisemes } = req.body;
    const result = lipSyncService.generateRealTimeLipSync(
      Buffer.from(audioChunk, 'base64'),
      previousVisemes
    );
    res.json(result);
  } catch (error) {
    console.error('Real-time lip sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced voice routes
app.get('/api/voice/providers', (req, res) => {
  res.json({
    success: true,
    providers: {
      elevenlabs: 'ElevenLabs - High quality TTS',
      playht: 'PlayHT - Voice cloning',
      polly: 'Amazon Polly - AWS TTS',
      whisper: 'OpenAI Whisper - Speech to text'
    }
  });
});

app.get('/api/voice/voices/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    let voices;
    
    switch (provider) {
      case 'elevenlabs':
        voices = await voiceService.getElevenLabsVoices();
        break;
      case 'playht':
        voices = await voiceService.getPlayHTVoices();
        break;
      default:
        throw new Error('Unsupported provider');
    }
    
    res.json(voices);
  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handlers
app.post('/api/webhooks/rpm', (req, res) => {
  try {
    const result = rpmService.handleWebhookEvent(req.body);
    res.json(result);
  } catch (error) {
    console.error('RPM webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Hosting service pages
app.get('/hosting', (req, res) => {
  res.json({
    service: 'Fakelit.com Hosting Services',
    plans: {
      shared: {
        starter: '$9.99/month - 10GB SSD, 1 domain',
        business: '$19.99/month - 50GB SSD, 5 domains',
        premium: '$39.99/month - 100GB SSD, unlimited domains'
      },
      dedicated: {
        basic: '$199.99/month - 4 vCPU, 8GB RAM, 500GB SSD',
        professional: '$399.99/month - 8 vCPU, 16GB RAM, 1TB SSD',
        enterprise: '$799.99/month - 16 vCPU, 32GB RAM, 2TB SSD'
      }
    },
    features: [
      '99.9% uptime guarantee',
      'Free SSL certificates',
      'Daily backups',
      '24/7 support',
      'DDoS protection',
      'CDN included'
    ],
    poweredBy: 'Fakelit.com'
  });
});

// Service worker
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Manifest
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Sitemap pages
app.get('/safety-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'safety-policy.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

app.get('/faq', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});

app.get('/crisis-resources', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'crisis-resources.html'));
});

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(PORT, async () => {
  // Connect to database
  await connectDB();
  
  const domain = process.env.DOMAIN || 'fakelit.com';
  const cloudwaysDomain = process.env.CLOUDWAYS_DOMAIN || 'your-app.cloudwaysapps.com';
  
  console.log(`🚀 Fakelit.com Domain Manager server running on port ${PORT}`);
  console.log(`📊 Health check: https://${domain}/health`);
  console.log(`🔗 API base: https://${domain}/api`);
  console.log(`🌐 Website: https://${domain}`);
  console.log(`☁️ Cloudways: https://${cloudwaysDomain}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`💳 Payment Gateways: Stripe, NMI, Crypto`);
  console.log(`🏢 Powered by: Fakelit.com`);
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