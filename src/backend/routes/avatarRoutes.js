const express = require('express');
const router = express.Router();
const AvatarService = require('../services/AvatarService');
const { COUNSELORS } = require('../../shared/constants/counselors');

// Create avatar session
router.post('/session', async (req, res) => {
  try {
    const { counselorId, clientId } = req.body;

    if (!counselorId || !clientId) {
      return res.status(400).json({
        error: 'Missing required fields: counselorId and clientId'
      });
    }

    if (!COUNSELORS[counselorId]) {
      return res.status(404).json({
        error: 'Counselor not found'
      });
    }

    const session = await AvatarService.createAvatarSession(counselorId, clientId);
    
    res.json(session);
  } catch (error) {
    console.error('Create avatar session error:', error);
    res.status(500).json({
      error: 'Failed to create avatar session'
    });
  }
});

// Send message in avatar session
router.post('/session/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, sender } = req.body;

    if (!message || !sender) {
      return res.status(400).json({
        error: 'Missing required fields: message and sender'
      });
    }

    const response = await AvatarService.processMessage(sessionId, message, sender);
    
    res.json(response);
  } catch (error) {
    console.error('Process message error:', error);
    res.status(500).json({
      error: 'Failed to process message'
    });
  }
});

// Get avatar state
router.get('/session/:sessionId/state', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const avatarState = AvatarService.getAvatarState(sessionId);
    
    if (!avatarState) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    res.json(avatarState);
  } catch (error) {
    console.error('Get avatar state error:', error);
    res.status(500).json({
      error: 'Failed to get avatar state'
    });
  }
});

// Update avatar state
router.put('/session/:sessionId/state', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { expression, gesture, mood, speaking } = req.body;
    
    const newState = {};
    if (expression) newState.expression = expression;
    if (gesture) newState.gesture = gesture;
    if (mood) newState.mood = mood;
    if (speaking !== undefined) newState.speaking = speaking;
    
    const updatedState = AvatarService.updateAvatarState(sessionId, newState);
    
    if (!updatedState) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    res.json(updatedState);
  } catch (error) {
    console.error('Update avatar state error:', error);
    res.status(500).json({
      error: 'Failed to update avatar state'
    });
  }
});

// End avatar session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const success = AvatarService.endSession(sessionId);
    
    if (!success) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    res.json({
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      error: 'Failed to end session'
    });
  }
});

// Get all active sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = AvatarService.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Failed to get sessions'
    });
  }
});

// Get counselor avatars
router.get('/counselors', async (req, res) => {
  try {
    const counselors = Object.values(COUNSELORS).map(counselor => ({
      id: counselor.id,
      name: counselor.name,
      title: counselor.title,
      specialization: counselor.specialization,
      avatar: counselor.avatar,
      personality: counselor.personality,
      expertise: counselor.expertise
    }));
    
    res.json(counselors);
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({
      error: 'Failed to get counselors'
    });
  }
});

// Get specific counselor
router.get('/counselors/:counselorId', async (req, res) => {
  try {
    const { counselorId } = req.params;
    const counselor = COUNSELORS[counselorId];
    
    if (!counselor) {
      return res.status(404).json({
        error: 'Counselor not found'
      });
    }
    
    res.json(counselor);
  } catch (error) {
    console.error('Get counselor error:', error);
    res.status(500).json({
      error: 'Failed to get counselor'
    });
  }
});

// Test avatar voice
router.post('/test-voice', async (req, res) => {
  try {
    const { text, voiceId, emotion } = req.body;
    
    if (!text || !voiceId) {
      return res.status(400).json({
        error: 'Missing required fields: text and voiceId'
      });
    }
    
    const voiceResult = await AvatarService.voiceService.synthesizeVoice(text, voiceId, emotion);
    
    res.json(voiceResult);
  } catch (error) {
    console.error('Test voice error:', error);
    res.status(500).json({
      error: 'Failed to test voice'
    });
  }
});

// Health check for avatar service
router.get('/health', async (req, res) => {
  try {
    const activeSessions = AvatarService.getActiveSessions();
    
    res.json({
      status: 'healthy',
      activeSessions: activeSessions.length,
      service: 'AvatarService',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Avatar health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router; 