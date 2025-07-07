const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['reminder', 'achievement', 'message', 'announcement', 'crisis_alert', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: [{
    type: String,
    enum: ['in_app', 'push', 'email', 'sms'],
    default: ['in_app']
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  scheduledFor: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  actionUrl: {
    type: String
  },
  actionText: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ scheduledFor: 1, sent: 1 });

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as sent
notificationSchema.methods.markAsSent = function() {
  this.sent = true;
  this.sentAt = new Date();
  return this.save();
};

// Static method to create reminder notification
notificationSchema.statics.createReminder = async function(userId, title, message, scheduledFor) {
  return await this.create({
    userId,
    type: 'reminder',
    title,
    message,
    scheduledFor,
    channels: ['in_app', 'push']
  });
};

// Static method to create achievement notification
notificationSchema.statics.createAchievement = async function(userId, achievementName, description) {
  return await this.create({
    userId,
    type: 'achievement',
    title: `Achievement Unlocked: ${achievementName}`,
    message: description,
    priority: 'high',
    channels: ['in_app', 'push', 'email']
  });
};

// Static method to create announcement
notificationSchema.statics.createAnnouncement = async function(userIds, title, message) {
  const notifications = userIds.map(userId => ({
    userId,
    type: 'announcement',
    title,
    message,
    priority: 'medium',
    channels: ['in_app', 'push']
  }));

  return await this.insertMany(notifications);
};

// Static method to get unread notifications for user
notificationSchema.statics.getUnreadForUser = async function(userId, limit = 20) {
  return await this.find({ userId, read: false })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get scheduled notifications
notificationSchema.statics.getScheduledNotifications = async function() {
  return await this.find({
    scheduledFor: { $lte: new Date() },
    sent: false
  });
};

module.exports = mongoose.model('Notification', notificationSchema); 