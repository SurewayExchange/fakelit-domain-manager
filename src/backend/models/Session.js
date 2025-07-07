const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // Session Identification
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Participants
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselorId: {
    type: String,
    ref: 'Counselor',
    required: true
  },
  
  // Session Details
  status: {
    type: String,
    enum: ['active', 'paused', 'ended', 'cancelled'],
    default: 'active'
  },
  type: {
    type: String,
    enum: ['chat', 'voice', 'video', 'avatar'],
    default: 'chat'
  },
  
  // Timing
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0 // in minutes
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Session Content
  messages: [{
    id: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['client', 'counselor'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ['text', 'voice', 'image', 'system', 'crisis'],
      default: 'text'
    },
    metadata: {
      avatarExpression: String,
      avatarGesture: String,
      voiceUrl: String,
      emotion: String,
      confidence: Number
    }
  }],
  
  // Session Context
  context: {
    primaryConcern: {
      type: String,
      trim: true
    },
    mood: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'crisis'],
      default: 'neutral'
    },
    topics: [{
      type: String,
      trim: true
    }],
    goals: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      trim: true
    }
  },
  
  // Safety & Crisis Management
  safety: {
    crisisDetected: {
      type: Boolean,
      default: false
    },
    crisisLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    crisisKeywords: [{
      keyword: String,
      timestamp: Date,
      response: String
    }],
    interventions: [{
      type: String,
      timestamp: Date,
      description: String,
      outcome: String
    }],
    referrals: [{
      service: String,
      contact: String,
      reason: String,
      timestamp: Date
    }]
  },
  
  // Technical Details
  technical: {
    platform: {
      type: String,
      default: 'web'
    },
    browser: String,
    device: String,
    connectionQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'good'
    },
    avatarEnabled: {
      type: Boolean,
      default: true
    },
    voiceEnabled: {
      type: Boolean,
      default: false
    }
  },
  
  // Analytics & Metrics
  analytics: {
    messageCount: {
      client: { type: Number, default: 0 },
      counselor: { type: Number, default: 0 }
    },
    responseTime: {
      average: { type: Number, default: 0 }, // in seconds
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    engagement: {
      type: Number,
      default: 0 // percentage
    },
    satisfaction: {
      rating: { type: Number, min: 1, max: 5, default: null },
      feedback: String,
      timestamp: Date
    }
  },
  
  // Session Outcomes
  outcomes: {
    goalsMet: [{
      goal: String,
      achieved: Boolean,
      notes: String
    }],
    nextSteps: [{
      action: String,
      assignedTo: String,
      dueDate: Date,
      completed: Boolean
    }],
    recommendations: [{
      type: String,
      description: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }]
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

// Virtual for session duration
sessionSchema.virtual('durationMinutes').get(function() {
  if (!this.endTime) {
    const now = new Date();
    return Math.round((now - this.startTime) / (1000 * 60));
  }
  return Math.round((this.endTime - this.startTime) / (1000 * 60));
});

// Virtual for message count
sessionSchema.virtual('totalMessages').get(function() {
  return this.messages.length;
});

// Virtual for is active
sessionSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Indexes for better query performance
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ clientId: 1, createdAt: -1 });
sessionSchema.index({ counselorId: 1, createdAt: -1 });
sessionSchema.index({ status: 1, lastActivity: -1 });
sessionSchema.index({ 'safety.crisisDetected': 1 });

// Pre-save middleware to update timestamp
sessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to update duration
sessionSchema.pre('save', function(next) {
  if (this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  next();
});

// Instance method to add message
sessionSchema.methods.addMessage = function(messageData) {
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sender: messageData.sender,
    content: messageData.content,
    timestamp: new Date(),
    messageType: messageData.messageType || 'text',
    metadata: messageData.metadata || {}
  };
  
  this.messages.push(message);
  this.lastActivity = new Date();
  
  // Update analytics
  if (messageData.sender === 'client') {
    this.analytics.messageCount.client += 1;
  } else {
    this.analytics.messageCount.counselor += 1;
  }
  
  // Update response time if it's a counselor response
  if (messageData.sender === 'counselor' && this.messages.length > 1) {
    const lastClientMessage = this.messages
      .filter(m => m.sender === 'client')
      .pop();
    
    if (lastClientMessage) {
      const responseTime = (message.timestamp - lastClientMessage.timestamp) / 1000;
      this.updateResponseTime(responseTime);
    }
  }
  
  return this.save();
};

// Instance method to update response time
sessionSchema.methods.updateResponseTime = function(responseTime) {
  const currentAvg = this.analytics.responseTime.average;
  const currentCount = this.analytics.messageCount.counselor;
  
  if (currentCount === 1) {
    this.analytics.responseTime.average = responseTime;
    this.analytics.responseTime.min = responseTime;
    this.analytics.responseTime.max = responseTime;
  } else {
    this.analytics.responseTime.average = (currentAvg * (currentCount - 1) + responseTime) / currentCount;
    this.analytics.responseTime.min = Math.min(this.analytics.responseTime.min, responseTime);
    this.analytics.responseTime.max = Math.max(this.analytics.responseTime.max, responseTime);
  }
};

// Instance method to detect crisis
sessionSchema.methods.detectCrisis = function(content) {
  const crisisKeywords = [
    'suicide', 'kill myself', 'want to die', 'end it all',
    'self-harm', 'hurt myself', 'no reason to live',
    'better off dead', 'can\'t take it anymore'
  ];
  
  const lowerContent = content.toLowerCase();
  const detectedKeywords = crisisKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  );
  
  if (detectedKeywords.length > 0) {
    this.safety.crisisDetected = true;
    this.safety.crisisLevel = detectedKeywords.length > 2 ? 'high' : 'medium';
    
    this.safety.crisisKeywords.push({
      keyword: detectedKeywords[0],
      timestamp: new Date(),
      response: 'Crisis detected - providing appropriate support and resources'
    });
    
    this.context.mood = 'crisis';
  }
  
  return detectedKeywords.length > 0;
};

// Instance method to end session
sessionSchema.methods.endSession = function() {
  this.status = 'ended';
  this.endTime = new Date();
  this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  return this.save();
};

// Static method to find active sessions
sessionSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method to find sessions by client
sessionSchema.statics.findByClient = function(clientId) {
  return this.find({ clientId }).sort({ createdAt: -1 });
};

// Static method to find sessions by counselor
sessionSchema.statics.findByCounselor = function(counselorId) {
  return this.find({ counselorId }).sort({ createdAt: -1 });
};

// Static method to find crisis sessions
sessionSchema.statics.findCrisisSessions = function() {
  return this.find({ 'safety.crisisDetected': true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Session', sessionSchema); 