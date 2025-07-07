const mongoose = require('mongoose');

const counselorSchema = new mongoose.Schema({
  // Basic Information
  counselorId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Professional Information
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  credentials: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  
  // Expertise & Skills
  expertise: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: String,
    issuingBody: String,
    dateObtained: Date,
    expiryDate: Date
  }],
  languages: [{
    type: String,
    default: ['English']
  }],
  
  // Personality & Approach
  personality: {
    traits: [{
      type: String,
      trim: true
    }],
    communicationStyle: {
      type: String,
      trim: true
    },
    approach: {
      type: String,
      trim: true
    },
    strengths: [{
      type: String,
      trim: true
    }]
  },
  
  // Avatar Configuration
  avatar: {
    model: {
      type: String,
      required: true
    },
    voice: {
      type: String,
      required: true
    },
    personality: {
      type: String,
      required: true
    },
    expressions: {
      default: 'neutral',
      happy: 'smile',
      concerned: 'worried',
      empathetic: 'caring',
      professional: 'focused'
    },
    gestures: {
      greeting: 'wave',
      listening: 'nod',
      thinking: 'thoughtful',
      explaining: 'gesture'
    }
  },
  
  // Safety & Professional Guidelines
  safetyGuidelines: {
    crisisResponse: {
      type: String,
      required: true
    },
    professionalBoundaries: {
      type: String,
      required: true
    },
    referralProtocol: {
      type: String,
      required: true
    }
  },
  
  // Availability & Scheduling
  availability: {
    hours: {
      type: String,
      required: true
    },
    responseTime: {
      type: String,
      required: true
    },
    emergencyProtocol: {
      type: String,
      required: true
    },
    timezone: {
      type: String,
      default: 'EST'
    }
  },
  
  // Session Management
  sessionSettings: {
    maxDuration: {
      type: Number,
      default: 60 // minutes
    },
    maxConcurrentSessions: {
      type: Number,
      default: 1
    },
    breakTime: {
      type: Number,
      default: 15 // minutes between sessions
    }
  },
  
  // Performance Metrics
  metrics: {
    totalSessions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number,
      default: 0 // average response time in seconds
    }
  },
  
  // Status & Configuration
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'training'],
    default: 'active'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // AI Configuration
  aiConfig: {
    model: {
      type: String,
      default: 'gpt-4'
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1
    },
    maxTokens: {
      type: Number,
      default: 1000
    },
    systemPrompt: {
      type: String,
      required: true
    },
    safetyFilters: {
      enabled: {
        type: Boolean,
        default: true
      },
      keywords: [String],
      responseTemplates: {
        crisis: String,
        inappropriate: String,
        referral: String
      }
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full title
counselorSchema.virtual('fullTitle').get(function() {
  return `${this.name}, ${this.title}`;
});

// Virtual for availability status
counselorSchema.virtual('isAvailable').get(function() {
  if (this.status !== 'active') return false;
  if (!this.isOnline) return false;
  
  // Check if within available hours (simplified check)
  const now = new Date();
  const currentHour = now.getHours();
  // Assume 9 AM to 6 PM availability for now
  return currentHour >= 9 && currentHour < 18;
});

// Indexes for better query performance
counselorSchema.index({ counselorId: 1 });
counselorSchema.index({ status: 1, isOnline: 1 });
counselorSchema.index({ specialization: 1 });
counselorSchema.index({ 'personality.traits': 1 });

// Pre-save middleware to update timestamp
counselorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to update metrics
counselorSchema.methods.updateMetrics = function(sessionData) {
  const { duration, rating, responseTime } = sessionData;
  
  this.metrics.totalSessions += 1;
  
  if (rating) {
    const totalRating = this.metrics.averageRating * this.metrics.totalRatings + rating;
    this.metrics.totalRatings += 1;
    this.metrics.averageRating = totalRating / this.metrics.totalRatings;
  }
  
  if (responseTime) {
    const currentAvg = this.metrics.responseTime;
    const totalSessions = this.metrics.totalSessions;
    this.metrics.responseTime = (currentAvg * (totalSessions - 1) + responseTime) / totalSessions;
  }
  
  return this.save();
};

// Instance method to generate system prompt
counselorSchema.methods.generateSystemPrompt = function() {
  return `You are ${this.name}, a ${this.title} specializing in ${this.specialization}. 

Your expertise includes: ${this.expertise.join(', ')}.

Your communication style is ${this.personality.communicationStyle} and your approach is ${this.personality.approach}.

Your key strengths are: ${this.personality.strengths.join(', ')}.

IMPORTANT SAFETY GUIDELINES:
- Never provide advice that could harm the client or others
- If client mentions self-harm, suicide, or harm to others, immediately provide crisis resources
- Maintain professional boundaries at all times
- Refer to appropriate professionals when needed
- Focus on supportive, therapeutic responses

Crisis Response: ${this.safetyGuidelines.crisisResponse}

Professional Boundaries: ${this.safetyGuidelines.professionalBoundaries}

Referral Protocol: ${this.safetyGuidelines.referralProtocol}

Always respond as ${this.name} with your specialized expertise in ${this.specialization}.`;
};

// Static method to find available counselors
counselorSchema.statics.findAvailable = function() {
  return this.find({
    status: 'active',
    isOnline: true
  });
};

// Static method to find by specialization
counselorSchema.statics.findBySpecialization = function(specialization) {
  return this.find({
    specialization: new RegExp(specialization, 'i'),
    status: 'active'
  });
};

// Static method to find by personality trait
counselorSchema.statics.findByTrait = function(trait) {
  return this.find({
    'personality.traits': new RegExp(trait, 'i'),
    status: 'active'
  });
};

module.exports = mongoose.model('Counselor', counselorSchema); 