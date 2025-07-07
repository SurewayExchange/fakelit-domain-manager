const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import enhanced services
const EnhancedAvatarService = require('./services/EnhancedAvatarService');
const GamificationService = require('./services/GamificationService');
const NotificationService = require('./services/NotificationService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import models
const User = require('./models/User');
const Counselor = require('./models/Counselor');
const Session = require('./models/Session');
const UserProfile = require('./models/UserProfile');
const Achievement = require('./models/Achievement');
const Analytics = require('./models/Analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize enhanced services
const enhancedAvatarService = new EnhancedAvatarService();
const gamificationService = new GamificationService();
const notificationService = new NotificationService();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  seedDatabase();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Seed database with initial data
async function seedDatabase() {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    const counselorCount = await Counselor.countDocuments();

    if (userCount === 0) {
      console.log('🌱 Seeding users...');
      await seedUsers();
    }

    if (counselorCount === 0) {
      console.log('🌱 Seeding counselors...');
      await seedCounselors();
    }

    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Database seeding error:', error);
  }
}

// Seed users
async function seedUsers() {
  const users = [
    {
      name: 'Admin User',
      email: 'admin@careconnect.com',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    },
    {
      name: 'Test User',
      email: 'user@careconnect.com',
      password: 'user123',
      role: 'user',
      status: 'active'
    }
  ];

  for (const userData of users) {
    const user = new User(userData);
    await user.save();
    
    // Create user profile
    await UserProfile.createDefaultProfile(user._id);
    
    // Create default achievements
    await Achievement.createDefaultAchievements(user._id);
  }
}

// Seed counselors
async function seedCounselors() {
  const counselors = [
    {
      name: 'Dr. Sarah Mitchell',
      specialization: 'Anxiety & Depression',
      avatar: 'https://api.readyplayer.me/v1/avatars/dr-sarah-mitchell-001.glb',
      bio: 'Licensed clinical psychologist with 15+ years of experience in treating anxiety and depression.',
      rating: 4.9,
      sessionCount: 1250,
      languages: ['English', 'Spanish'],
      availability: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' }
      }
    },
    {
      name: 'Michael Rodriguez',
      specialization: 'Trauma & PTSD',
      avatar: 'https://api.readyplayer.me/v1/avatars/michael-rodriguez-001.glb',
      bio: 'Specialized in trauma-informed care and PTSD treatment with a focus on veterans and first responders.',
      rating: 4.8,
      sessionCount: 980,
      languages: ['English', 'Portuguese'],
      availability: {
        monday: { start: '10:00', end: '18:00' },
        tuesday: { start: '10:00', end: '18:00' },
        wednesday: { start: '10:00', end: '18:00' },
        thursday: { start: '10:00', end: '18:00' },
        friday: { start: '10:00', end: '18:00' }
      }
    },
    {
      name: 'Dr. Emily Chen',
      specialization: 'Relationships & Family',
      avatar: 'https://api.readyplayer.me/v1/avatars/dr-emily-chen-001.glb',
      bio: 'Family therapist specializing in relationship counseling, communication, and family dynamics.',
      rating: 4.9,
      sessionCount: 1100,
      languages: ['English', 'Mandarin'],
      availability: {
        monday: { start: '08:00', end: '16:00' },
        tuesday: { start: '08:00', end: '16:00' },
        wednesday: { start: '08:00', end: '16:00' },
        thursday: { start: '08:00', end: '16:00' },
        friday: { start: '08:00', end: '16:00' }
      }
    },
    {
      name: 'James Williams',
      specialization: 'Addiction & Recovery',
      avatar: 'https://api.readyplayer.me/v1/avatars/james-williams-001.glb',
      bio: 'Certified addiction counselor with expertise in substance abuse treatment and recovery support.',
      rating: 4.7,
      sessionCount: 850,
      languages: ['English'],
      availability: {
        monday: { start: '12:00', end: '20:00' },
        tuesday: { start: '12:00', end: '20:00' },
        wednesday: { start: '12:00', end: '20:00' },
        thursday: { start: '12:00', end: '20:00' },
        friday: { start: '12:00', end: '20:00' }
      }
    },
    {
      name: 'Dr. Maria Garcia',
      specialization: 'Child & Adolescent',
      avatar: 'https://api.readyplayer.me/v1/avatars/dr-maria-garcia-001.glb',
      bio: 'Child psychologist specializing in developmental disorders, anxiety, and behavioral issues.',
      rating: 4.8,
      sessionCount: 920,
      languages: ['English', 'Spanish'],
      availability: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' }
      }
    },
    {
      name: 'Lisa Thompson',
      specialization: 'Stress & Burnout',
      avatar: 'https://api.readyplayer.me/v1/avatars/lisa-thompson-001.glb',
      bio: 'Wellness coach and stress management specialist helping professionals overcome burnout.',
      rating: 4.6,
      sessionCount: 750,
      languages: ['English'],
      availability: {
        monday: { start: '11:00', end: '19:00' },
        tuesday: { start: '11:00', end: '19:00' },
        wednesday: { start: '11:00', end: '19:00' },
        thursday: { start: '11:00', end: '19:00' },
        friday: { start: '11:00', end: '19:00' }
      }
    }
  ];

  for (const counselorData of counselors) {
    const counselor = new Counselor(counselorData);
    await counselor.save();
  }
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/admin', adminRoutes);

// Enhanced Chat API
app.post('/api/chat/enhanced', async (req, res) => {
  try {
    const { message, counselorId, emotion, sessionStats } = req.body;
    const userId = req.user?.id || 'anonymous';

    // Create or get avatar session
    let sessionId = req.body.sessionId;
    if (!sessionId) {
      const session = await enhancedAvatarService.createAvatarSession(counselorId, userId);
      sessionId = session.id;
    }

    // Process message through enhanced avatar service
    const avatarResponse = await enhancedAvatarService.processMessage(sessionId, message, true);

    // Process gamification
    const gamificationResult = await gamificationService.processUserActivity(
      userId,
      'session_completed',
      {
        sessionDuration: sessionStats?.duration || 0,
        messageCount: sessionStats?.messageCount || 0
      }
    );

    // Generate AI response (simplified for demo)
    const aiResponse = {
      text: `Thank you for sharing that with me. I understand how you're feeling about "${message}". Let's explore this together.`,
      emotion: 'empathy',
      expression: avatarResponse.expression,
      gesture: avatarResponse.gesture,
      audioUrl: null // Would be generated by voice service
    };

    // Track analytics
    await Analytics.create({
      userId,
      counselorId,
      type: 'message_sent',
      category: 'engagement',
      metrics: {
        messageCount: 1,
        responseTime: 1000,
        engagementScore: 85
      }
    });

    res.json({
      ...aiResponse,
      sessionId,
      achievements: gamificationResult?.newAchievements || [],
      motivationalMessage: gamificationResult?.motivationalMessage
    });

  } catch (error) {
    console.error('Enhanced chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Gamification API
app.post('/api/gamification/activity', async (req, res) => {
  try {
    const { userId, activityType, data } = req.body;
    
    const result = await gamificationService.processUserActivity(userId, activityType, data);
    
    res.json(result);
  } catch (error) {
    console.error('Gamification error:', error);
    res.status(500).json({ error: 'Failed to process activity' });
  }
});

// Notifications API
app.post('/api/notifications', async (req, res) => {
  try {
    const { userId, type, title, message, options } = req.body;
    
    const notification = await notificationService.createNotification(
      userId,
      type,
      title,
      message,
      options
    );
    
    res.json(notification);
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Get user notifications
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, unreadOnly } = req.query;
    
    const notifications = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;
    
    const notification = await notificationService.markAsRead(notificationId, userId);
    
    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// User Profile API
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await UserProfile.findOne({ userId }).populate('userId');
    const achievements = await Achievement.find({ userId });
    const progress = await gamificationService.getUserProgress(userId);
    
    res.json({
      profile,
      achievements,
      progress
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.patch('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      updates,
      { new: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Leaderboard API
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { limit } = req.query;
    
    const leaderboard = await gamificationService.getLeaderboard(parseInt(limit) || 10);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      avatar: 'running',
      gamification: 'running',
      notifications: 'running'
    }
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Close all avatar sessions
  for (const [sessionId, session] of enhancedAvatarService.activeSessions) {
    await enhancedAvatarService.endAvatarSession(sessionId);
  }
  
  // Close database connection
  await mongoose.connection.close();
  
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CareConnect Enhanced Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎭 Enhanced Avatar System: Real-time expressions, gestures, and voice`);
  console.log(`🎮 Gamification System: Achievements, streaks, and progress tracking`);
  console.log(`🔔 Notification System: Multi-channel notifications with scheduling`);
  console.log(`📈 Admin Dashboard: Analytics, user management, and content moderation`);
}); 
module.exports = app; 