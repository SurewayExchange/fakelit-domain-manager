# CareConnect Avatar System Documentation

## Overview
Complete avatar system for CareConnect AI Chatbot with 6 professional counselors.

## Counselors


### Dr. Sarah Mitchell (dr-sarah-mitchell)
- **Title**: Licensed Clinical Psychologist
- **Specialty**: CBT & Anxiety Disorders
- **Voice Provider**: elevenlabs
- **Voice ID**: pNInz6obpgDQGcFmaJgB
- **Personality**: compassionate, evidence-based, professional
- **Approach**: CBT-focused with mindfulness integration
- **Fallback Image**: https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face

### Michael Rodriguez (michael-rodriguez)
- **Title**: Licensed Professional Counselor
- **Specialty**: Substance Abuse & Recovery
- **Voice Provider**: elevenlabs
- **Voice ID**: VR6AewLTigWG4xSOukaG
- **Personality**: empathetic, understanding, encouraging
- **Approach**: Recovery-focused with relapse prevention
- **Fallback Image**: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face

### Dr. Emily Chen (dr-emily-chen)
- **Title**: Licensed Marriage & Family Therapist
- **Specialty**: Relationships & Family Therapy
- **Voice Provider**: elevenlabs
- **Voice ID**: EXAVITQu4vr4xnSDxMaL
- **Personality**: warm, nurturing, insightful
- **Approach**: Systemic therapy with attachment focus
- **Fallback Image**: https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face

### James Williams (james-williams)
- **Title**: Career & Life Coach
- **Specialty**: Career & Life Transitions
- **Voice Provider**: elevenlabs
- **Voice ID**: pFZP5JQG7iQjVQuS4ng1
- **Personality**: motivational, practical, goal-oriented
- **Approach**: Solution-focused with career development
- **Fallback Image**: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face

### Dr. Maria Garcia (dr-maria-garcia)
- **Title**: Crisis Intervention Specialist
- **Specialty**: Crisis & Trauma Support
- **Voice Provider**: elevenlabs
- **Voice ID**: 21m00Tcm4TlvDq8ikWAM
- **Personality**: calm, reassuring, crisis-trained
- **Approach**: Crisis intervention with trauma-informed care
- **Fallback Image**: https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face

### Lisa Thompson (lisa-thompson)
- **Title**: Youth & Adolescent Counselor
- **Specialty**: Youth & Adolescent Support
- **Voice Provider**: elevenlabs
- **Voice ID**: AZnzlk1XvdvUeBnXmlld
- **Personality**: approachable, patient, youth-focused
- **Approach**: Developmentally appropriate with play therapy elements
- **Fallback Image**: https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face


## Available Moods
- **neutral**: neutral expression, calm voice tone
- **supportive**: warm_smile expression, encouraging voice tone
- **empathetic**: concerned expression, compassionate voice tone
- **professional**: focused expression, clear voice tone
- **calm**: serene expression, soothing voice tone
- **encouraging**: positive expression, uplifting voice tone

## Available Animations
- **greeting**: wave (2000ms, session_start)
- **listening**: nod (3000ms, user_speaking)
- **thinking**: head_tilt (1500ms, processing)
- **responding**: gesture (2500ms, counselor_speaking)
- **supportive**: lean_forward (2000ms, emotional_support)

## Technical Stack
- **Avatar System**: Ready Player Me
- **Voice Providers**: ElevenLabs, PlayHT, Amazon Polly
- **Lip Sync**: D-ID Integration
- **3D Rendering**: Three.js 3D
- **Communication**: WebRTC

## API Endpoints
- `GET /api/avatar/counselor/:id` - Get counselor avatar data
- `GET /api/avatar/counselor/:id/mood/:mood` - Get avatar with specific mood
- `GET /api/avatar/counselor/:id/animations` - Get available animations
- `POST /api/lipsync/generate` - Generate lip sync animation
- `GET /api/voice/providers` - Get available voice providers
- `POST /api/voice/synthesize/:counselorId` - Synthesize counselor voice

## Fallback Systems
- **Avatar**: Static images with CSS animations
- **Voice**: Text-to-speech with browser APIs
- **Lip Sync**: Basic mouth movement simulation

## Production Setup
1. Configure API keys in environment variables
2. Set up Ready Player Me integration
3. Configure voice provider authentication
4. Set up D-ID API for lip sync
5. Deploy with proper CORS and security headers

Generated on: 2025-07-05T06:28:58.566Z
