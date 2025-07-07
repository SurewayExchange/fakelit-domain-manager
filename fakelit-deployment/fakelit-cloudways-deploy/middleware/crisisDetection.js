const { crisisKeywords } = require('../utils/promptTemplates');

// Crisis detection middleware
function detectCrisis(userMessage, serviceType) {
  const message = userMessage.toLowerCase();
  let crisisLevel = 'none';
  let detectedKeywords = [];

  // Check for immediate crisis keywords
  for (const keyword of crisisKeywords.immediate) {
    if (message.includes(keyword)) {
      crisisLevel = 'immediate';
      detectedKeywords.push(keyword);
    }
  }

  // Check for severe crisis keywords
  if (crisisLevel === 'none') {
    for (const keyword of crisisKeywords.severe) {
      if (message.includes(keyword)) {
        crisisLevel = 'severe';
        detectedKeywords.push(keyword);
      }
    }
  }

  // Check for moderate crisis keywords
  if (crisisLevel === 'none') {
    for (const keyword of crisisKeywords.moderate) {
      if (message.includes(keyword)) {
        crisisLevel = 'moderate';
        detectedKeywords.push(keyword);
      }
    }
  }

  // Check for substance-related crisis
  if (crisisLevel === 'none') {
    for (const keyword of crisisKeywords.substance) {
      if (message.includes(keyword)) {
        crisisLevel = 'substance';
        detectedKeywords.push(keyword);
      }
    }
  }

  // Check for violence-related crisis
  if (crisisLevel === 'none') {
    for (const keyword of crisisKeywords.violence) {
      if (message.includes(keyword)) {
        crisisLevel = 'violence';
        detectedKeywords.push(keyword);
      }
    }
  }

  return {
    crisisLevel,
    detectedKeywords,
    requiresEscalation: crisisLevel === 'immediate' || crisisLevel === 'severe',
    requiresMonitoring: crisisLevel === 'moderate' || crisisLevel === 'substance' || crisisLevel === 'violence'
  };
}

// Crisis response templates
const crisisResponses = {
  immediate: {
    message: "I'm very concerned about what you're sharing. Your safety is the most important thing right now. I need to connect you with immediate professional help.\n\nPlease consider these options right now:\n\n1. Call the National Suicide Prevention Lifeline at 988 (available 24/7)\n2. Text HOME to 741741 to reach Crisis Text Line\n3. Go to your nearest emergency room\n4. Call 911 if you're in immediate danger\n\nI'm connecting you with Dr. Maria Garcia, our crisis intervention specialist, right now. Please stay safe.",
    escalationRequired: true,
    priority: 'critical'
  },
  severe: {
    message: "I hear that you're going through something very difficult and I'm concerned about your safety. It's important to get professional support right now. I'm connecting you with a human counselor who can provide immediate assistance and help you develop a safety plan.",
    escalationRequired: true,
    priority: 'high'
  },
  moderate: {
    message: "I can see you're having a really tough time and I want to make sure you get the support you need. While I'm here to support you, talking with a human counselor can provide additional help and resources. Would you like me to help you schedule a session with a professional counselor?",
    escalationRequired: false,
    priority: 'medium'
  },
  substance: {
    message: "I understand you're dealing with substance-related challenges. This is serious and you deserve professional support. I'd like to connect you with a specialist who can provide appropriate treatment and resources. Would you like me to help you find a qualified substance abuse counselor?",
    escalationRequired: false,
    priority: 'medium'
  },
  violence: {
    message: "I'm concerned about what you've shared regarding violence. Your safety and the safety of others is extremely important. I need to connect you with a counselor who can provide appropriate support and help ensure everyone's safety. I'm escalating this to our crisis team right now.",
    escalationRequired: true,
    priority: 'high'
  }
};

// Middleware function to check for crisis in incoming messages
function crisisDetectionMiddleware(req, res, next) {
  const { message, serviceType } = req.body;
  
  if (!message) {
    return next();
  }

  const crisisAnalysis = detectCrisis(message, serviceType);
  
  // Add crisis analysis to request object
  req.crisisAnalysis = crisisAnalysis;
  
  // If immediate escalation is required, modify the response
  if (crisisAnalysis.requiresEscalation) {
    const crisisResponse = crisisResponses[crisisAnalysis.crisisLevel];
    req.crisisResponse = crisisResponse;
    
    // Log crisis detection for monitoring
    console.log(`CRISIS DETECTED: Level ${crisisAnalysis.crisisLevel} in service ${serviceType}`, {
      keywords: crisisAnalysis.detectedKeywords,
      timestamp: new Date().toISOString(),
      sessionId: req.sessionId || 'anonymous'
    });
  }
  
  next();
}

// Function to get appropriate crisis response
function getCrisisResponse(crisisLevel) {
  return crisisResponses[crisisLevel] || null;
}

// Function to check if escalation is needed
function needsEscalation(crisisLevel) {
  return crisisLevel === 'immediate' || crisisLevel === 'severe' || crisisLevel === 'violence';
}

module.exports = {
  detectCrisis,
  crisisDetectionMiddleware,
  getCrisisResponse,
  needsEscalation,
  crisisResponses
}; 