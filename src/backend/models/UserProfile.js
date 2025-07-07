const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  avatar: {
    type: {
      type: String,
      enum: ['rpm', 'd-id', 'heygen', 'custom'],
      default: 'rpm'
    },
    url: String,
    customization: {
      hair: String,
      outfit: String,
      accessories: [String],
      background: String,
      skinTone: String,
      eyeColor: String
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true }
    },
    privacy: {
      shareAnalytics: { type: Boolean, default: true },
      shareMoodData: { type: Boolean, default: true },
      allowResearch: { type: Boolean, default: false }
    },
    accessibility: {
      highContrast: { type: Boolean, default: false },
      screenReader: { type: Boolean, default: false },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
    }
  },
  favorites: {
    counselors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counselor'
    }],
    topics: [String],
    resources: [String]
  },
  stats: {
    totalSessions: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // in minutes
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    achievementsUnlocked: { type: Number, default: 0 },
    lastCheckIn: Date,
    averageMoodScore: { type: Number, default: 0 },
    crisisCount: { type: Number, default: 0 }
  },
  goals: [{
    title: String,
    description: String,
    targetDate: Date,
    completed: { type: Boolean, default: false },
    progress: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['mood', 'anxiety', 'depression', 'stress', 'relationships', 'work', 'health', 'custom']
    }
  }],
  notes: [{
    title: String,
    content: String,
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    isPrimary: { type: Boolean, default: false }
  }],
  crisisPlan: {
    triggers: [String],
    copingStrategies: [String],
    emergencySteps: [String],
    supportPeople: [String],
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Indexes
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ 'stats.currentStreak': -1 });
userProfileSchema.index({ 'stats.totalSessions': -1 });

// Virtual for profile completion percentage
userProfileSchema.virtual('completionPercentage').get(function() {
  let completed = 0;
  let total = 0;

  // Avatar setup
  if (this.avatar.url) completed++;
  total++;

  // Emergency contacts
  if (this.emergencyContacts.length > 0) completed++;
  total++;

  // Crisis plan
  if (this.crisisPlan.triggers.length > 0) completed++;
  total++;

  // Goals
  if (this.goals.length > 0) completed++;
  total++;

  return Math.round((completed / total) * 100);
});

// Method to update session stats
userProfileSchema.methods.updateSessionStats = async function(sessionDuration, moodScore = null) {
  this.stats.totalSessions += 1;
  this.stats.totalDuration += sessionDuration;
  
  if (moodScore) {
    const currentTotal = this.stats.averageMoodScore * (this.stats.totalSessions - 1);
    this.stats.averageMoodScore = (currentTotal + moodScore) / this.stats.totalSessions;
  }

  return await this.save();
};

// Method to update streak
userProfileSchema.methods.updateStreak = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.stats.lastCheckIn) {
    this.stats.currentStreak = 1;
  } else {
    const lastCheckIn = new Date(this.stats.lastCheckIn);
    lastCheckIn.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.stats.currentStreak += 1;
    } else if (diffDays > 1) {
      this.stats.currentStreak = 1;
    }
  }

  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }

  this.stats.lastCheckIn = today;
  return await this.save();
};

// Method to add favorite counselor
userProfileSchema.methods.addFavoriteCounselor = async function(counselorId) {
  if (!this.favorites.counselors.includes(counselorId)) {
    this.favorites.counselors.push(counselorId);
    return await this.save();
  }
  return this;
};

// Method to remove favorite counselor
userProfileSchema.methods.removeFavoriteCounselor = async function(counselorId) {
  this.favorites.counselors = this.favorites.counselors.filter(
    id => id.toString() !== counselorId.toString()
  );
  return await this.save();
};

// Method to add note
userProfileSchema.methods.addNote = async function(noteData) {
  this.notes.push(noteData);
  return await this.save();
};

// Method to update note
userProfileSchema.methods.updateNote = async function(noteId, updates) {
  const note = this.notes.id(noteId);
  if (note) {
    Object.assign(note, updates, { updatedAt: new Date() });
    return await this.save();
  }
  return null;
};

// Method to delete note
userProfileSchema.methods.deleteNote = async function(noteId) {
  this.notes = this.notes.filter(note => note._id.toString() !== noteId);
  return await this.save();
};

// Static method to create default profile
userProfileSchema.statics.createDefaultProfile = async function(userId) {
  return await this.create({
    userId,
    preferences: {
      theme: 'auto',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      },
      privacy: {
        shareAnalytics: true,
        shareMoodData: true,
        allowResearch: false
      },
      accessibility: {
        highContrast: false,
        screenReader: false,
        fontSize: 'medium'
      }
    },
    stats: {
      totalSessions: 0,
      totalDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievementsUnlocked: 0,
      averageMoodScore: 0,
      crisisCount: 0
    }
  });
};

module.exports = mongoose.model('UserProfile', userProfileSchema); 