const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const Analytics = require('../models/Analytics');
const Achievement = require('../models/Achievement');
const Notification = require('../models/Notification');
const UserProfile = require('../models/UserProfile');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// ===== DASHBOARD OVERVIEW =====

// Get dashboard overview statistics
router.get('/dashboard/overview', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // User statistics
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const activeUsersThisMonth = await User.countDocuments({
      lastActive: { $gte: thirtyDaysAgo }
    });

    // Session statistics
    const totalSessions = await Session.countDocuments();
    const sessionsThisMonth = await Session.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const avgSessionDuration = await Session.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);

    // Crisis detection statistics
    const crisisDetections = await Analytics.countDocuments({
      type: 'crisis_detected',
      timestamp: { $gte: thirtyDaysAgo }
    });

    // Achievement statistics
    const totalAchievements = await Achievement.countDocuments({ achieved: true });
    const achievementsThisMonth = await Achievement.countDocuments({
      achieved: true,
      achievedAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        activeThisMonth: activeUsersThisMonth
      },
      sessions: {
        total: totalSessions,
        thisMonth: sessionsThisMonth,
        avgDuration: avgSessionDuration[0]?.avgDuration || 0
      },
      safety: {
        crisisDetections: crisisDetections
      },
      engagement: {
        totalAchievements: totalAchievements,
        achievementsThisMonth: achievementsThisMonth
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to load dashboard overview' });
  }
});

// ===== USER MANAGEMENT =====

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const role = req.query.role || '';

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .populate('profile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('profile');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user analytics
    const analytics = await Analytics.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(50);

    // Get user achievements
    const achievements = await Achievement.find({ userId: user._id });

    // Get user sessions
    const sessions = await Session.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      analytics,
      achievements,
      sessions
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update user status
router.patch('/users/:userId/status', [
  body('status').isIn(['active', 'suspended', 'banned']),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        status: req.body.status,
        statusReason: req.body.reason,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.user._id
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create notification for user
    await Notification.create({
      userId: user._id,
      type: 'system',
      title: 'Account Status Updated',
      message: `Your account status has been updated to: ${req.body.status}`,
      priority: 'high',
      channels: ['in_app', 'email']
    });

    res.json({ user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// ===== ANALYTICS =====

// Get system analytics
router.get('/analytics/system', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.getSystemAnalytics(days);

    // Get top performing counselors
    const counselorPerformance = await Analytics.aggregate([
      {
        $match: {
          counselorId: { $exists: true },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$counselorId',
          sessionCount: {
            $sum: { $cond: [{ $eq: ['$type', 'session_start'] }, 1, 0] }
          },
          avgSatisfaction: { $avg: '$metrics.satisfactionRating' },
          avgResponseTime: { $avg: '$metrics.responseTime' }
        }
      },
      {
        $sort: { sessionCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get user engagement trends
    const engagementTrends = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
          },
          uniqueUsers: { $addToSet: '$userId' },
          totalSessions: {
            $sum: { $cond: [{ $eq: ['$type', 'session_start'] }, 1, 0] }
          },
          totalMessages: {
            $sum: {
              $cond: [
                { $in: ['$type', ['message_sent', 'message_received']] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $addFields: {
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      systemAnalytics: analytics,
      counselorPerformance,
      engagementTrends
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch system analytics' });
  }
});

// Get counselor analytics
router.get('/analytics/counselors/:counselorId', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const performance = await Analytics.getCounselorPerformance(req.params.counselorId, days);

    // Get counselor-specific metrics
    const metrics = await Analytics.aggregate([
      {
        $match: {
          counselorId: req.params.counselorId,
          timestamp: { $gte: new Date(Date.now() - (days * 24 * 60 * 60 * 1000)) }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: {
            $sum: { $cond: [{ $eq: ['$type', 'session_start'] }, 1, 0] }
          },
          avgSessionDuration: { $avg: '$duration' },
          avgSatisfactionRating: { $avg: '$metrics.satisfactionRating' },
          avgResponseTime: { $avg: '$metrics.responseTime' },
          crisisDetections: {
            $sum: { $cond: [{ $eq: ['$type', 'crisis_detected'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      performance,
      metrics: metrics[0] || {}
    });
  } catch (error) {
    console.error('Get counselor analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch counselor analytics' });
  }
});

// ===== CONTENT MODERATION =====

// Get flagged conversations
router.get('/moderation/flagged', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const flaggedSessions = await Session.find({
      'flags.flagged': true
    })
    .populate('userId', 'name email')
    .populate('counselorId', 'name specialization')
    .sort({ 'flags.flaggedAt': -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    const total = await Session.countDocuments({ 'flags.flagged': true });

    res.json({
      flaggedSessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get flagged conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch flagged conversations' });
  }
});

// Review flagged session
router.post('/moderation/sessions/:sessionId/review', [
  body('action').isIn(['approve', 'flag', 'delete']),
  body('reason').optional().isString(),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.moderation = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      action: req.body.action,
      reason: req.body.reason,
      notes: req.body.notes
    };

    if (req.body.action === 'approve') {
      session.flags.flagged = false;
    }

    await session.save();

    res.json({ session });
  } catch (error) {
    console.error('Review session error:', error);
    res.status(500).json({ error: 'Failed to review session' });
  }
});

// ===== NOTIFICATIONS =====

// Send announcement to all users
router.post('/notifications/announcement', [
  body('title').isString().isLength({ min: 1, max: 100 }),
  body('message').isString().isLength({ min: 1, max: 1000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('channels').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get all active users
    const users = await User.find({ status: 'active' }).select('_id');
    const userIds = users.map(user => user._id);

    // Create notifications
    const notifications = await Notification.createAnnouncement(
      userIds,
      req.body.title,
      req.body.message
    );

    res.json({
      message: `Announcement sent to ${userIds.length} users`,
      notificationsCount: notifications.length
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({ error: 'Failed to send announcement' });
  }
});

// Get notification statistics
router.get('/notifications/stats', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));

    const stats = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          count: { $sum: 1 },
          readCount: {
            $sum: { $cond: ['$read', 1, 0] }
          }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          totalSent: { $sum: '$count' },
          totalRead: { $sum: '$readCount' },
          dailyStats: {
            $push: {
              date: '$_id.date',
              sent: '$count',
              read: '$readCount'
            }
          }
        }
      }
    ]);

    res.json({ stats });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

// ===== SYSTEM SETTINGS =====

// Get system settings
router.get('/settings', async (req, res) => {
  try {
    // This would typically come from a database or config file
    const settings = {
      maintenance: {
        enabled: false,
        message: 'System maintenance scheduled for Sunday 2-4 AM EST'
      },
      features: {
        avatarRendering: true,
        voiceSynthesis: true,
        realTimeExpressions: true,
        notifications: true,
        analytics: true
      },
      limits: {
        maxSessionDuration: 60, // minutes
        maxMessagesPerSession: 1000,
        maxUsersPerCounselor: 50
      },
      safety: {
        crisisDetectionEnabled: true,
        autoEscalationEnabled: true,
        contentModerationEnabled: true
      }
    };

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

// Update system settings
router.patch('/settings', [
  body('maintenance.enabled').optional().isBoolean(),
  body('maintenance.message').optional().isString(),
  body('features.*').optional().isBoolean(),
  body('limits.*').optional().isNumeric(),
  body('safety.*').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Update settings (in a real app, this would save to database)
    console.log('System settings updated:', req.body);

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
});

module.exports = router; 