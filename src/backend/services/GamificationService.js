const Achievement = require('../models/Achievement');
const UserProfile = require('../models/UserProfile');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');

class GamificationService {
  constructor() {
    this.achievementTypes = {
      streak: this.checkStreakAchievements.bind(this),
      session_count: this.checkSessionCountAchievements.bind(this),
      mood_improvement: this.checkMoodImprovementAchievements.bind(this),
      crisis_avoidance: this.checkCrisisAvoidanceAchievements.bind(this),
      engagement: this.checkEngagementAchievements.bind(this)
    };
    
    console.log('🎮 Gamification Service initialized');
  }

  // Process user activity and check for achievements
  async processUserActivity(userId, activityType, data = {}) {
    try {
      const userProfile = await UserProfile.findOne({ userId });
      if (!userProfile) {
        console.log(`No user profile found for user: ${userId}`);
        return;
      }

      // Update user stats based on activity
      await this.updateUserStats(userProfile, activityType, data);

      // Check for achievements
      const newAchievements = await this.checkAchievements(userId, activityType, data);

      // Generate motivational messages
      const motivationalMessage = await this.generateMotivationalMessage(userProfile, activityType);

      // Track analytics
      await this.trackGamificationAnalytics(userId, activityType, newAchievements.length);

      return {
        newAchievements,
        motivationalMessage,
        updatedStats: userProfile.stats
      };
    } catch (error) {
      console.error('Process user activity error:', error);
      throw error;
    }
  }

  // Update user statistics based on activity
  async updateUserStats(userProfile, activityType, data) {
    switch (activityType) {
      case 'daily_checkin':
        await userProfile.updateStreak();
        break;
      
      case 'session_completed':
        userProfile.stats.totalSessions += 1;
        if (data.duration) {
          userProfile.stats.totalDuration += data.duration;
        }
        break;
      
      case 'mood_check':
        if (data.moodScore) {
          const currentTotal = userProfile.stats.averageMoodScore * (userProfile.stats.totalSessions || 1);
          userProfile.stats.averageMoodScore = (currentTotal + data.moodScore) / (userProfile.stats.totalSessions + 1);
        }
        break;
      
      case 'crisis_avoided':
        userProfile.stats.crisisCount += 1;
        break;
      
      case 'goal_completed':
        // Handle goal completion
        break;
    }

    await userProfile.save();
  }

  // Check for new achievements
  async checkAchievements(userId, activityType, data) {
    const newAchievements = [];
    
    // Get user's current achievements
    const currentAchievements = await Achievement.find({ userId });
    
    // Check each achievement type
    for (const [type, checkFunction] of Object.entries(this.achievementTypes)) {
      const achievements = currentAchievements.filter(a => a.type === type);
      const newOnes = await checkFunction(userId, achievements, data);
      newAchievements.push(...newOnes);
    }

    // Create notifications for new achievements
    for (const achievement of newAchievements) {
      await Notification.createAchievement(
        userId,
        achievement.name,
        achievement.description
      );
    }

    return newAchievements;
  }

  // Check streak achievements
  async checkStreakAchievements(userId, currentAchievements, data) {
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) return [];

    const newAchievements = [];
    const streakAchievements = currentAchievements.filter(a => a.type === 'streak');

    // Check for first check-in
    const firstCheckIn = streakAchievements.find(a => a.name === 'First Steps');
    if (!firstCheckIn?.achieved && userProfile.stats.currentStreak >= 1) {
      firstCheckIn.achieved = true;
      firstCheckIn.achievedAt = new Date();
      await firstCheckIn.save();
      newAchievements.push(firstCheckIn);
    }

    // Check for week warrior
    const weekWarrior = streakAchievements.find(a => a.name === 'Week Warrior');
    if (!weekWarrior?.achieved && userProfile.stats.currentStreak >= 7) {
      weekWarrior.achieved = true;
      weekWarrior.achievedAt = new Date();
      await weekWarrior.save();
      newAchievements.push(weekWarrior);
    }

    // Check for monthly master
    const monthlyMaster = streakAchievements.find(a => a.name === 'Monthly Master');
    if (!monthlyMaster?.achieved && userProfile.stats.currentStreak >= 30) {
      monthlyMaster.achieved = true;
      monthlyMaster.achievedAt = new Date();
      await monthlyMaster.save();
      newAchievements.push(monthlyMaster);
    }

    return newAchievements;
  }

  // Check session count achievements
  async checkSessionCountAchievements(userId, currentAchievements, data) {
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) return [];

    const newAchievements = [];
    const sessionAchievements = currentAchievements.filter(a => a.type === 'session_count');

    // Check for first session
    const firstSession = sessionAchievements.find(a => a.name === 'Conversation Starter');
    if (!firstSession?.achieved && userProfile.stats.totalSessions >= 1) {
      firstSession.achieved = true;
      firstSession.achievedAt = new Date();
      await firstSession.save();
      newAchievements.push(firstSession);
    }

    // Check for regular visitor
    const regularVisitor = sessionAchievements.find(a => a.name === 'Regular Visitor');
    if (!regularVisitor?.achieved && userProfile.stats.totalSessions >= 10) {
      regularVisitor.achieved = true;
      regularVisitor.achievedAt = new Date();
      await regularVisitor.save();
      newAchievements.push(regularVisitor);
    }

    return newAchievements;
  }

  // Check mood improvement achievements
  async checkMoodImprovementAchievements(userId, currentAchievements, data) {
    const newAchievements = [];
    const moodAchievements = currentAchievements.filter(a => a.type === 'mood_improvement');

    // This would require more complex mood tracking over time
    // For now, we'll check if user has shown consistent improvement
    if (data.moodScore && data.previousMoodScore) {
      const moodImprovement = moodAchievements.find(a => a.name === 'Mood Lifter');
      if (!moodImprovement?.achieved && data.moodScore > data.previousMoodScore) {
        moodImprovement.progress += 1;
        if (moodImprovement.progress >= moodImprovement.threshold) {
          moodImprovement.achieved = true;
          moodImprovement.achievedAt = new Date();
          await moodImprovement.save();
          newAchievements.push(moodImprovement);
        } else {
          await moodImprovement.save();
        }
      }
    }

    return newAchievements;
  }

  // Check crisis avoidance achievements
  async checkCrisisAvoidanceAchievements(userId, currentAchievements, data) {
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) return [];

    const newAchievements = [];
    const crisisAchievements = currentAchievements.filter(a => a.type === 'crisis_avoidance');

    // Check for crisis management
    const crisisManager = crisisAchievements.find(a => a.name === 'Crisis Manager');
    if (!crisisManager?.achieved && userProfile.stats.crisisCount >= 5) {
      crisisManager.achieved = true;
      crisisManager.achievedAt = new Date();
      await crisisManager.save();
      newAchievements.push(crisisManager);
    }

    return newAchievements;
  }

  // Check engagement achievements
  async checkEngagementAchievements(userId, currentAchievements, data) {
    const newAchievements = [];
    const engagementAchievements = currentAchievements.filter(a => a.type === 'engagement');

    // Check for active listener (long session)
    if (data.sessionDuration && data.sessionDuration >= 60) {
      const activeListener = engagementAchievements.find(a => a.name === 'Active Listener');
      if (!activeListener?.achieved) {
        activeListener.achieved = true;
        activeListener.achievedAt = new Date();
        await activeListener.save();
        newAchievements.push(activeListener);
      }
    }

    return newAchievements;
  }

  // Generate motivational messages
  async generateMotivationalMessage(userProfile, activityType) {
    const messages = {
      daily_checkin: [
        "Great job checking in today! Consistency is key to your mental health journey.",
        "You're building a healthy habit! Every check-in brings you closer to your goals.",
        "Your commitment to self-care is inspiring. Keep up the amazing work!"
      ],
      session_completed: [
        "Excellent work completing your session! You're making real progress.",
        "Another step forward in your journey. You should be proud of yourself!",
        "Your dedication to your mental health is truly commendable."
      ],
      achievement_unlocked: [
        "Congratulations on your achievement! You're doing fantastic!",
        "You've earned this! Your hard work and dedication are paying off.",
        "What an accomplishment! You're proving that growth is possible."
      ],
      streak_milestone: [
        "Incredible streak! You're showing real commitment to your well-being.",
        "Look at that streak! You're building momentum and positive habits.",
        "Your consistency is inspiring. You're creating lasting positive change!"
      ]
    };

    const activityMessages = messages[activityType] || messages.daily_checkin;
    const randomMessage = activityMessages[Math.floor(Math.random() * activityMessages.length)];

    return {
      message: randomMessage,
      type: activityType,
      timestamp: new Date()
    };
  }

  // Track gamification analytics
  async trackGamificationAnalytics(userId, activityType, achievementsUnlocked) {
    await Analytics.create({
      userId,
      type: 'user_action',
      category: 'gamification',
      metadata: {
        activityType,
        achievementsUnlocked
      }
    });
  }

  // Get user progress summary
  async getUserProgress(userId) {
    const userProfile = await UserProfile.findOne({ userId });
    const achievements = await Achievement.find({ userId });
    const recentAchievements = achievements
      .filter(a => a.achieved)
      .sort((a, b) => b.achievedAt - a.achievedAt)
      .slice(0, 5);

    const progressSummary = {
      stats: userProfile?.stats || {},
      achievements: {
        total: achievements.length,
        unlocked: achievements.filter(a => a.achieved).length,
        recent: recentAchievements
      },
      streaks: {
        current: userProfile?.stats.currentStreak || 0,
        longest: userProfile?.stats.longestStreak || 0
      },
      completionPercentage: userProfile?.completionPercentage || 0
    };

    return progressSummary;
  }

  // Create custom achievement
  async createCustomAchievement(userId, achievementData) {
    const achievement = new Achievement({
      userId,
      type: 'custom',
      name: achievementData.name,
      description: achievementData.description,
      icon: achievementData.icon || '🏆',
      threshold: achievementData.threshold || 1,
      metadata: achievementData.metadata || {}
    });

    await achievement.save();
    return achievement;
  }

  // Get leaderboard data
  async getLeaderboard(limit = 10) {
    const leaderboard = await UserProfile.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.status': 'active'
        }
      },
      {
        $project: {
          userId: 1,
          userName: '$user.name',
          currentStreak: '$stats.currentStreak',
          totalSessions: '$stats.totalSessions',
          achievementsUnlocked: '$stats.achievementsUnlocked',
          averageMoodScore: '$stats.averageMoodScore'
        }
      },
      {
        $sort: { currentStreak: -1, totalSessions: -1 }
      },
      {
        $limit: limit
      }
    ]);

    return leaderboard;
  }

  // Reset user progress (for testing or admin purposes)
  async resetUserProgress(userId) {
    await Achievement.deleteMany({ userId });
    await UserProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          'stats.totalSessions': 0,
          'stats.totalDuration': 0,
          'stats.currentStreak': 0,
          'stats.longestStreak': 0,
          'stats.achievementsUnlocked': 0,
          'stats.averageMoodScore': 0,
          'stats.crisisCount': 0,
          'stats.lastCheckIn': null
        }
      }
    );

    // Recreate default achievements
    await Achievement.createDefaultAchievements(userId);
  }

  // Get achievement statistics
  async getAchievementStats() {
    const stats = await Achievement.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          achieved: { $sum: { $cond: ['$achieved', 1, 0] } },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    return stats;
  }
}

module.exports = GamificationService; 