# HeyGen Avatar Implementation Guide

## Overview

This document outlines the implementation of ultra-realistic HeyGen avatars for the CareConnect AI counseling platform. The system provides lifelike, talking head avatars with real-time streaming, emotional expressions, and natural voice synthesis.

## 🎭 Features

### Core Capabilities
- **Real-time Streaming**: Live avatar interactions with minimal latency
- **Voice Synthesis**: Natural text-to-speech with emotional tone control
- **Emotional Expressions**: Context-aware facial expressions and gestures
- **Professional Personas**: Unique counselor personalities and expertise
- **Safety & Ethics**: Built-in crisis detection and professional boundaries

### Technical Features
- **HeyGen API Integration**: Direct integration with HeyGen's streaming API
- **OpenAI GPT-4**: Advanced conversation AI with context awareness
- **ElevenLabs Voice**: High-quality voice synthesis with custom profiles
- **Emotion Analysis**: Real-time sentiment analysis and response generation
- **Session Management**: Persistent conversation memory and state tracking

## 🚀 Quick Start

### 1. Environment Setup

Add the following environment variables to your `.env` file:

```bash
# HeyGen API Configuration
HEYGEN_API_KEY=your_heygen_api_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Voice Synthesis (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm run dev
```

### 4. Access the Demo

Visit `http://localhost:3000/heygen-demo.html` to experience the HeyGen avatar system.

## 🏗️ Architecture

### Service Layer

#### HeyGenAvatarService (`services/heygenAvatarService.js`)
The core service handling all HeyGen avatar interactions:

```javascript
const heygenService = new HeyGenAvatarService();

// Create a new avatar session
const session = await heygenService.createAvatarSession('dr-sarah-mitchell');

// Make avatar speak
await heygenService.speak(session.id, "Hello! How can I help you today?", {
    emotion: 'friendly',
    expression: 'welcoming'
});

// Generate AI response and speak
const result = await heygenService.generateAndSpeak(session.id, userMessage);
```

#### Key Methods:
- `createAvatarSession(counselorId, sessionId)`: Initialize new avatar session
- `speak(sessionId, text, options)`: Make avatar speak with expressions
- `generateAndSpeak(sessionId, userMessage, context)`: AI-powered conversation
- `cleanupSession(sessionId)`: Clean up resources

### API Routes

#### HeyGen Avatar Routes (`routes/heygenAvatarRoutes.js`)

**Session Management:**
- `POST /api/heygen/session` - Create new avatar session
- `GET /api/heygen/session/:sessionId` - Get session information
- `DELETE /api/heygen/session/:sessionId` - Clean up session

**Avatar Interaction:**
- `POST /api/heygen/session/:sessionId/speak` - Make avatar speak
- `POST /api/heygen/session/:sessionId/chat` - AI conversation
- `GET /api/heygen/session/:sessionId/messages` - Get conversation history

**Counselor Management:**
- `GET /api/heygen/counselors` - List all counselors
- `GET /api/heygen/counselors/:counselorId` - Get counselor details

### Frontend Integration

#### HeyGen Avatar JavaScript (`public/js/heygenAvatar.js`)

```javascript
// Initialize HeyGen avatar system
const heygenAvatar = new HeyGenAvatar();

// Select a counselor
await heygenAvatar.selectCounselor('dr-sarah-mitchell');

// Send a message
await heygenAvatar.sendMessage("I'm feeling anxious today");

// Get session info
const sessionInfo = heygenAvatar.getSessionInfo();
```

## 👥 Counselor Configurations

### Available Counselors

| Counselor ID | Name | Specialty | Personality | Voice Profile |
|--------------|------|-----------|-------------|---------------|
| `dr-sarah-mitchell` | Dr. Sarah Mitchell | Mental Health & CBT | Professional, empathetic, warm | Rachel (ElevenLabs) |
| `michael-rodriguez` | Michael Rodriguez | Substance Abuse & Recovery | Supportive, understanding, motivational | Domi (ElevenLabs) |
| `dr-emily-chen` | Dr. Emily Chen | Relationships & Family | Gentle, caring, insightful | Bella (ElevenLabs) |
| `james-williams` | James Williams | Career & Life Coaching | Confident, motivational, practical | Arnold (ElevenLabs) |
| `dr-maria-garcia` | Dr. Maria Garcia | Medical & Health Psychology | Professional, medical, compassionate | Adam (ElevenLabs) |
| `lisa-thompson` | Lisa Thompson | General Counseling & Support | Friendly, approachable, supportive | Josh (ElevenLabs) |

### Counselor Configuration Structure

```javascript
{
    avatarId: 'dr-sarah-mitchell-001',
    name: 'Dr. Sarah Mitchell',
    specialty: 'Mental Health & CBT',
    voiceId: 'en-US-Neural2-F',
    personality: 'professional, empathetic, warm',
    greeting: "Hello, I'm Dr. Sarah Mitchell...",
    avatarUrl: '/images/counselors/dr-sarah-mitchell.jpg',
    description: 'Licensed clinical psychologist...'
}
```

## 🎨 UI Components

### Avatar Display
- Real-time video streaming container
- Status indicators and controls
- Expression and emotion overlays
- Responsive design for all devices

### Chat Interface
- Real-time message display
- Typing indicators
- Message timestamps
- Smooth animations and transitions

### Demo Controls
- Expression testing buttons
- Voice synthesis tests
- Emotion analysis demonstrations
- Interactive feature showcase

## 🔧 Configuration

### HeyGen API Configuration

```javascript
// In services/heygenAvatarService.js
this.apiKey = process.env.HEYGEN_API_KEY;
this.baseUrl = 'https://api.heygen.com/v2';
this.streamingUrl = 'wss://api.heygen.com/v2/streaming';
```

### Voice Synthesis Options

```javascript
// Voice service configuration
this.voiceService = {
    apiKey: process.env.ELEVENLABS_API_KEY || process.env.OPENAI_API_KEY,
    baseUrl: process.env.ELEVENLABS_API_KEY ? 
        'https://api.elevenlabs.io/v1' : 
        'https://api.openai.com/v1/audio/speech',
    provider: process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'openai'
};
```

### Expression and Emotion Mapping

```javascript
// Expression configurations
const expressions = {
    listening: { eyes: 'focused', mouth: 'slightly_open', eyebrows: 'attentive' },
    concerned: { eyes: 'worried', mouth: 'slightly_frown', eyebrows: 'furrowed' },
    encouraging: { eyes: 'warm', mouth: 'gentle_smile', eyebrows: 'raised' },
    thoughtful: { eyes: 'distant', mouth: 'neutral', eyebrows: 'slightly_furrowed' }
};
```

## 🛡️ Safety & Ethics

### Crisis Detection
- Automatic detection of crisis keywords
- Immediate referral to crisis resources
- Professional boundary maintenance
- No discussion of self-harm or suicide methods

### Privacy Protection
- Session data encryption
- Temporary session storage
- No persistent personal data
- GDPR compliance measures

### Professional Guidelines
- Licensed counselor personas
- Evidence-based therapeutic approaches
- Clear disclaimers and limitations
- Emergency contact information

## 📊 Performance Optimization

### Streaming Optimization
- Adaptive quality settings
- Connection pooling
- Automatic reconnection
- Bandwidth optimization

### Memory Management
- Session cleanup
- Resource monitoring
- Garbage collection
- Memory leak prevention

### Caching Strategy
- Avatar configuration caching
- Voice synthesis caching
- Expression mapping caching
- API response caching

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
# Test HeyGen API integration
node test-heygen-integration.js

# Test avatar session management
node test-avatar-sessions.js

# Test voice synthesis
node test-voice-synthesis.js
```

### Manual Testing
1. Counselor selection
2. Session creation
3. Voice synthesis
4. Expression testing
5. Chat functionality
6. Error handling

## 🚨 Troubleshooting

### Common Issues

**Avatar Not Loading:**
- Check HeyGen API key
- Verify network connectivity
- Check browser console for errors

**Voice Not Working:**
- Verify ElevenLabs API key
- Check audio permissions
- Test with different browsers

**Session Creation Failed:**
- Check server logs
- Verify counselor configuration
- Test API endpoints

### Debug Mode

Enable debug logging:

```javascript
// In services/heygenAvatarService.js
this.debug = process.env.NODE_ENV === 'development';
```

### Error Handling

```javascript
try {
    const session = await heygenService.createAvatarSession(counselorId);
} catch (error) {
    console.error('Avatar session error:', error);
    // Handle error appropriately
}
```

## 📈 Monitoring & Analytics

### Health Checks
- `GET /api/heygen/health` - Service health status
- Session count monitoring
- API response time tracking
- Error rate monitoring

### Metrics
- Active sessions
- Messages per session
- Voice synthesis usage
- Expression usage patterns

## 🔮 Future Enhancements

### Planned Features
- Multi-language support
- Custom avatar creation
- Advanced gesture control
- Real-time emotion detection
- Group therapy sessions
- Mobile app integration

### Technical Improvements
- WebRTC integration
- Advanced caching
- Machine learning optimization
- Performance monitoring
- Scalability improvements

## 📚 API Reference

### HeyGen API Endpoints

#### Create Streaming Session
```javascript
POST /api/heygen/session
{
    "counselorId": "dr-sarah-mitchell",
    "sessionId": "optional-custom-session-id"
}
```

#### Make Avatar Speak
```javascript
POST /api/heygen/session/:sessionId/speak
{
    "text": "Hello! How can I help you today?",
    "emotion": "friendly",
    "expression": "welcoming",
    "gesture": "wave",
    "speed": 1.0,
    "pitch": 1.0
}
```

#### AI Conversation
```javascript
POST /api/heygen/session/:sessionId/chat
{
    "message": "I'm feeling anxious about my job interview",
    "context": {
        "timestamp": 1640995200000,
        "sessionId": "session_123"
    }
}
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

### Code Standards
- ESLint configuration
- Prettier formatting
- JSDoc documentation
- Unit test coverage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Email: support@careconnect.ai
- Documentation: https://docs.careconnect.ai
- GitHub Issues: https://github.com/careconnect/avatars/issues

---

**Note**: This implementation requires valid API keys for HeyGen, OpenAI, and optionally ElevenLabs. Please ensure you have the necessary subscriptions and API access before deployment. 