const Notification = require('../models/Notification');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    this.emailTransporter = this.initializeEmailTransporter();
    this.twilioClient = this.initializeTwilioClient();
    this.scheduler = this.initializeScheduler();
    
    console.log('🔔 Notification Service initialized');
  }

  // Initialize email transporter
  initializeEmailTransporter() {
    if (!process.env.SMTP_HOST) {
      console.log('📧 Email service not configured');
      return null;
    }

    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Initialize Twilio client for SMS
  initializeTwilioClient() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('📱 SMS service not configured');
      return null;
    }

    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  // Initialize notification scheduler
  initializeScheduler() {
    // Check for scheduled notifications every minute
    setInterval(async () => {
      await this.processScheduledNotifications();
    }, 60000);

    console.log('⏰ Notification scheduler initialized');
  }

  // Create and send notification
  async createNotification(userId, type, title, message, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userProfile = await UserProfile.findOne({ userId });
      const notificationPreferences = userProfile?.preferences?.notifications || {};

      // Determine which channels to use
      const channels = options.channels || this.determineChannels(type, notificationPreferences);

      // Create notification record
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        priority: options.priority || 'medium',
        channels,
        scheduledFor: options.scheduledFor,
        actionUrl: options.actionUrl,
        actionText: options.actionText,
        metadata: options.metadata || {}
      });

      await notification.save();

      // Send immediately if not scheduled
      if (!options.scheduledFor) {
        await this.sendNotification(notification, user);
      }

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // Determine which channels to use based on notification type and user preferences
  determineChannels(type, preferences) {
    const channels = ['in_app']; // Always include in-app

    // Add channels based on user preferences
    if (preferences.email) channels.push('email');
    if (preferences.push) channels.push('push');
    if (preferences.sms) channels.push('sms');

    // Override for urgent notifications
    if (type === 'crisis_alert') {
      channels.push('email', 'sms');
    }

    return channels;
  }

  // Send notification through all specified channels
  async sendNotification(notification, user) {
    const results = {};

    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case 'in_app':
            results.in_app = await this.sendInAppNotification(notification);
            break;
          case 'email':
            results.email = await this.sendEmailNotification(notification, user);
            break;
          case 'push':
            results.push = await this.sendPushNotification(notification, user);
            break;
          case 'sms':
            results.sms = await this.sendSMSNotification(notification, user);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
        results[channel] = { error: error.message };
      }
    }

    // Mark notification as sent
    notification.sent = true;
    notification.sentAt = new Date();
    await notification.save();

    return results;
  }

  // Send in-app notification
  async sendInAppNotification(notification) {
    // In a real implementation, this would use WebSockets or Server-Sent Events
    // to push the notification to the user's active session
    console.log(`📱 In-app notification sent: ${notification.title}`);
    return { success: true, method: 'websocket' };
  }

  // Send email notification
  async sendEmailNotification(notification, user) {
    if (!this.emailTransporter) {
      throw new Error('Email service not configured');
    }

    const emailContent = this.generateEmailContent(notification, user);

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@careconnect.com',
      to: user.email,
      subject: notification.title,
      html: emailContent.html,
      text: emailContent.text
    };

    const result = await this.emailTransporter.sendMail(mailOptions);
    console.log(`📧 Email notification sent to ${user.email}`);
    return { success: true, messageId: result.messageId };
  }

  // Send push notification
  async sendPushNotification(notification, user) {
    // This would integrate with Firebase Cloud Messaging or similar
    // For now, we'll simulate the push notification
    console.log(`📲 Push notification sent: ${notification.title}`);
    return { success: true, method: 'fcm' };
  }

  // Send SMS notification
  async sendSMSNotification(notification, user) {
    if (!this.twilioClient || !user.phone) {
      throw new Error('SMS service not configured or user has no phone number');
    }

    const message = await this.twilioClient.messages.create({
      body: `${notification.title}: ${notification.message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone
    });

    console.log(`📱 SMS notification sent to ${user.phone}`);
    return { success: true, messageId: message.sid };
  }

  // Generate email content
  generateEmailContent(notification, user) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${notification.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CareConnect</h1>
              <p>${notification.title}</p>
            </div>
            <div class="content">
              <p>Hello ${user.name},</p>
              <p>${notification.message}</p>
              ${notification.actionUrl ? `<a href="${baseUrl}${notification.actionUrl}" class="button">${notification.actionText || 'View Details'}</a>` : ''}
              <p>Best regards,<br>The CareConnect Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${user.email}</p>
              <p>You can manage your notification preferences in your account settings.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      CareConnect Notification
      
      ${notification.title}
      
      Hello ${user.name},
      
      ${notification.message}
      
      ${notification.actionUrl ? `View details: ${baseUrl}${notification.actionUrl}` : ''}
      
      Best regards,
      The CareConnect Team
      
      You can manage your notification preferences in your account settings.
    `;

    return { html, text };
  }

  // Process scheduled notifications
  async processScheduledNotifications() {
    try {
      const scheduledNotifications = await Notification.getScheduledNotifications();
      
      for (const notification of scheduledNotifications) {
        const user = await User.findById(notification.userId);
        if (user) {
          await this.sendNotification(notification, user);
        }
      }
    } catch (error) {
      console.error('Process scheduled notifications error:', error);
    }
  }

  // Create reminder notification
  async createReminder(userId, title, message, scheduledFor) {
    return await this.createNotification(
      userId,
      'reminder',
      title,
      message,
      {
        scheduledFor,
        channels: ['in_app', 'push'],
        priority: 'medium'
      }
    );
  }

  // Create achievement notification
  async createAchievementNotification(userId, achievementName, description) {
    return await this.createNotification(
      userId,
      'achievement',
      `Achievement Unlocked: ${achievementName}`,
      description,
      {
        channels: ['in_app', 'push', 'email'],
        priority: 'high',
        actionUrl: '/achievements',
        actionText: 'View Achievement'
      }
    );
  }

  // Create crisis alert notification
  async createCrisisAlert(userId, message, emergencyContacts = []) {
    const notification = await this.createNotification(
      userId,
      'crisis_alert',
      'Crisis Alert',
      message,
      {
        channels: ['in_app', 'email', 'sms'],
        priority: 'urgent',
        actionUrl: '/crisis-support',
        actionText: 'Get Help Now'
      }
    );

    // Also notify emergency contacts if provided
    for (const contact of emergencyContacts) {
      if (contact.email) {
        await this.createNotification(
          null, // No specific user ID for emergency contacts
          'crisis_alert',
          'Emergency Contact Alert',
          `Your contact ${contact.name} may need immediate support. Please check on them.`,
          {
            channels: ['email'],
            priority: 'urgent',
            metadata: { emergencyContact: true, originalUserId: userId }
          }
        );
      }
    }

    return notification;
  }

  // Create system announcement
  async createAnnouncement(userIds, title, message, options = {}) {
    const notifications = [];

    for (const userId of userIds) {
      const notification = await this.createNotification(
        userId,
        'announcement',
        title,
        message,
        {
          channels: options.channels || ['in_app', 'push'],
          priority: options.priority || 'medium',
          ...options
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return await notification.markAsRead();
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const unreadOnly = options.unreadOnly || false;

    const filter = { userId };
    if (unreadOnly) {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(filter);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get notification statistics
  async getNotificationStats(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Notification.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          count: { $sum: 1 },
          readCount: { $sum: { $cond: ['$read', 1, 0] } }
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

    return stats;
  }

  // Delete old notifications
  async cleanupOldNotifications(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
    return result.deletedCount;
  }
}

module.exports = NotificationService; 