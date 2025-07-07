const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['streak', 'session_count', 'mood_improvement', 'crisis_avoidance', 'engagement', 'custom'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  value: {
    type: Number,
    default: 0
  },
  threshold: {
    type: Number,
    required: true
  },
  achieved: {
    type: Boolean,
    default: false
  },
  achievedAt: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
achievementSchema.index({ userId: 1, type: 1 });
achievementSchema.index({ userId: 1, achieved: 1 });

// Virtual for progress percentage
achievementSchema.virtual('progressPercentage').get(function() {
  return Math.min(100, (this.progress / this.threshold) * 100);
});

// Method to check if achievement is completed
achievementSchema.methods.checkCompletion = function() {
  if (this.progress >= this.threshold && !this.achieved) {
    this.achieved = true;
    this.achievedAt = new Date();
    return true;
  }
  return false;
};

// Static method to create default achievements for a user
achievementSchema.statics.createDefaultAchievements = async function(userId) {
  const defaultAchievements = [
    {
      type: 'streak',
      name: 'First Steps',
      description: 'Complete your first daily check-in',
      icon: '🌱',
      threshold: 1
    },
    {
      type: 'streak',
      name: 'Week Warrior',
      description: 'Maintain a 7-day check-in streak',
      icon: '🔥',
      threshold: 7
    },
    {
      type: 'streak',
      name: 'Monthly Master',
      description: 'Maintain a 30-day check-in streak',
      icon: '👑',
      threshold: 30
    },
    {
      type: 'session_count',
      name: 'Conversation Starter',
      description: 'Complete your first counseling session',
      icon: '💬',
      threshold: 1
    },
    {
      type: 'session_count',
      name: 'Regular Visitor',
      description: 'Complete 10 counseling sessions',
      icon: '🌟',
      threshold: 10
    },
    {
      type: 'mood_improvement',
      name: 'Mood Lifter',
      description: 'Show consistent mood improvement over 5 sessions',
      icon: '☀️',
      threshold: 5
    },
    {
      type: 'engagement',
      name: 'Active Listener',
      description: 'Spend 60 minutes in a single session',
      icon: '👂',
      threshold: 60
    }
  ];

  const achievements = defaultAchievements.map(achievement => ({
    ...achievement,
    userId
  }));

  return await this.insertMany(achievements);
};

module.exports = mongoose.model('Achievement', achievementSchema); 