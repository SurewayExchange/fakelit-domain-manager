const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counselor'
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  type: {
    type: String,
    enum: ['session_start', 'session_end', 'message_sent', 'message_received', 'mood_check', 'crisis_detected', 'achievement_unlocked', 'user_action'],
    required: true
  },
  category: {
    type: String,
    enum: ['engagement', 'performance', 'safety', 'user_behavior', 'system'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  metrics: {
    messageCount: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // in milliseconds
    moodScore: { type: Number, min: 1, max: 10 },
    crisisLevel: { type: Number, min: 0, max: 10 },
    engagementScore: { type: Number, min: 0, max: 100 },
    satisfactionRating: { type: Number, min: 1, max: 5 }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Indexes for efficient analytics queries
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ counselorId: 1, timestamp: -1 });
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ category: 1, timestamp: -1 });

// Static method to track session start
analyticsSchema.statics.trackSessionStart = async function(sessionId, userId, counselorId) {
  return await this.create({
    sessionId,
    userId,
    counselorId,
    type: 'session_start',
    category: 'engagement',
    timestamp: new Date()
  });
};

// Static method to track session end
analyticsSchema.statics.trackSessionEnd = async function(sessionId, duration, metrics = {}) {
  return await this.create({
    sessionId,
    type: 'session_end',
    category: 'engagement',
    duration,
    metrics,
    timestamp: new Date()
  });
};

// Static method to track message
analyticsSchema.statics.trackMessage = async function(sessionId, userId, counselorId, isFromUser, responseTime = 0) {
  return await this.create({
    sessionId,
    userId,
    counselorId,
    type: isFromUser ? 'message_sent' : 'message_received',
    category: 'engagement',
    metrics: { responseTime },
    timestamp: new Date()
  });
};

// Static method to track mood check
analyticsSchema.statics.trackMoodCheck = async function(userId, moodScore, sessionId = null) {
  return await this.create({
    userId,
    sessionId,
    type: 'mood_check',
    category: 'user_behavior',
    metrics: { moodScore },
    timestamp: new Date()
  });
};

// Static method to track crisis detection
analyticsSchema.statics.trackCrisisDetection = async function(userId, crisisLevel, sessionId = null, metadata = {}) {
  return await this.create({
    userId,
    sessionId,
    type: 'crisis_detected',
    category: 'safety',
    metrics: { crisisLevel },
    metadata,
    timestamp: new Date()
  });
};

// Static method to get user engagement metrics
analyticsSchema.statics.getUserEngagement = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          type: "$type"
        },
        count: { $sum: 1 },
        totalDuration: { $sum: "$duration" },
        avgMoodScore: { $avg: "$metrics.moodScore" },
        avgEngagementScore: { $avg: "$metrics.engagementScore" }
      }
    },
    {
      $sort: { "_id.date": 1 }
    }
  ]);
};

// Static method to get counselor performance metrics
analyticsSchema.statics.getCounselorPerformance = async function(counselorId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        counselorId: mongoose.Types.ObjectId(counselorId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
        },
        sessionCount: {
          $sum: {
            $cond: [{ $eq: ["$type", "session_start"] }, 1, 0]
          }
        },
        avgResponseTime: { $avg: "$metrics.responseTime" },
        avgSatisfactionRating: { $avg: "$metrics.satisfactionRating" },
        crisisDetections: {
          $sum: {
            $cond: [{ $eq: ["$type", "crisis_detected"] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { "_id.date": 1 }
    }
  ]);
};

// Static method to get system-wide analytics
analyticsSchema.statics.getSystemAnalytics = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
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
        totalSessions: {
          $sum: {
            $cond: [{ $eq: ["$type", "session_start"] }, 1, 0]
          }
        },
        totalMessages: {
          $sum: {
            $cond: [
              { $in: ["$type", ["message_sent", "message_received"]] },
              1,
              0
            ]
          }
        },
        totalCrisisDetections: {
          $sum: {
            $cond: [{ $eq: ["$type", "crisis_detected"] }, 1, 0]
          }
        },
        avgMoodScore: { $avg: "$metrics.moodScore" },
        avgEngagementScore: { $avg: "$metrics.engagementScore" },
        uniqueUsers: { $addToSet: "$userId" }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: "$uniqueUsers" }
      }
    },
    {
      $sort: { "_id.date": 1 }
    }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema); 