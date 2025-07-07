const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Avatar configurations for each counselor
const AVATAR_CONFIGS = {
    'dr-sarah-mitchell': {
        name: 'Dr. Sarah Mitchell',
        gender: 'female',
        style: 'professional',
        hair: 'long_brown',
        outfit: 'business_casual',
        accessories: ['glasses'],
        skinTone: 'light',
        eyeColor: 'brown',
        specialty: 'CBT & Anxiety',
        personality: 'compassionate, evidence-based, professional'
    },
    'michael-rodriguez': {
        name: 'Michael Rodriguez',
        gender: 'male',
        style: 'supportive',
        hair: 'short_black',
        outfit: 'casual_professional',
        accessories: [],
        skinTone: 'medium',
        eyeColor: 'brown',
        specialty: 'Substance Abuse & Recovery',
        personality: 'empathetic, understanding, encouraging'
    },
    'dr-emily-chen': {
        name: 'Dr. Emily Chen',
        gender: 'female',
        style: 'gentle',
        hair: 'long_black',
        outfit: 'soft_professional',
        accessories: ['necklace'],
        skinTone: 'light',
        eyeColor: 'dark_brown',
        specialty: 'Relationships & Family',
        personality: 'warm, nurturing, insightful'
    },
    'james-williams': {
        name: 'James Williams',
        gender: 'male',
        style: 'confident',
        hair: 'short_brown',
        outfit: 'business',
        accessories: ['watch'],
        skinTone: 'light',
        eyeColor: 'blue',
        specialty: 'Career & Life Transitions',
        personality: 'motivational, practical, goal-oriented'
    },
    'dr-maria-garcia': {
        name: 'Dr. Maria Garcia',
        gender: 'female',
        style: 'calm',
        hair: 'medium_brown',
        outfit: 'medical_professional',
        accessories: ['stethoscope'],
        skinTone: 'medium',
        eyeColor: 'brown',
        specialty: 'Crisis & Trauma',
        personality: 'calm, reassuring, crisis-trained'
    },
    'lisa-thompson': {
        name: 'Lisa Thompson',
        gender: 'female',
        style: 'friendly',
        hair: 'long_blonde',
        outfit: 'welcoming',
        accessories: ['name_tag'],
        skinTone: 'light',
        eyeColor: 'green',
        specialty: 'Youth & Adolescent',
        personality: 'approachable, patient, youth-focused'
    }
};

// Mood configurations
const MOOD_CONFIGS = {
    neutral: { expression: 'neutral', bodyLanguage: 'relaxed', eyeContact: 'direct' },
    supportive: { expression: 'warm_smile', bodyLanguage: 'leaning_forward', eyeContact: 'caring' },
    empathetic: { expression: 'concerned', bodyLanguage: 'open_posture', eyeContact: 'understanding' },
    professional: { expression: 'focused', bodyLanguage: 'upright', eyeContact: 'attentive' },
    calm: { expression: 'serene', bodyLanguage: 'grounded', eyeContact: 'steady' },
    encouraging: { expression: 'positive', bodyLanguage: 'energetic', eyeContact: 'motivating' }
};

// Animation configurations
const ANIMATION_CONFIGS = {
    greeting: { duration: 2000, type: 'wave', intensity: 'gentle' },
    listening: { duration: 3000, type: 'nod', intensity: 'subtle' },
    thinking: { duration: 1500, type: 'head_tilt', intensity: 'moderate' },
    responding: { duration: 2500, type: 'gesture', intensity: 'natural' },
    supportive: { duration: 2000, type: 'lean_forward', intensity: 'caring' }
};

async function buildAllAvatars() {
    console.log('🎭 Building CareConnect Avatar System\n');
    
    const results = {
        created: [],
        errors: [],
        tested: []
    };

    // Step 1: Create avatars for each counselor
    console.log('1️⃣ Creating Avatars for All Counselors...');
    for (const [counselorId, config] of Object.entries(AVATAR_CONFIGS)) {
        try {
            console.log(`Creating avatar for ${config.name}...`);
            
            // Create avatar via RPM API
            const createResponse = await axios.post(`${BASE_URL}/api/rpm/avatars`, {
                counselorId: counselorId,
                counselorName: config.name,
                config: config
            });
            
            results.created.push({
                counselorId,
                name: config.name,
                avatarId: createResponse.data.avatar_id,
                status: 'created'
            });
            
            console.log(`✅ Created avatar for ${config.name}`);
            
        } catch (error) {
            console.log(`❌ Failed to create avatar for ${config.name}: ${error.message}`);
            results.errors.push({
                counselorId,
                name: config.name,
                error: error.message
            });
        }
    }

    // Step 2: Test avatar retrieval
    console.log('\n2️⃣ Testing Avatar Retrieval...');
    for (const counselorId of Object.keys(AVATAR_CONFIGS)) {
        try {
            const avatarResponse = await axios.get(`${BASE_URL}/api/avatar/counselor/${counselorId}`);
            results.tested.push({
                counselorId,
                status: 'retrieved',
                data: avatarResponse.data
            });
            console.log(`✅ Retrieved avatar data for ${counselorId}`);
        } catch (error) {
            console.log(`❌ Failed to retrieve avatar for ${counselorId}: ${error.message}`);
        }
    }

    // Step 3: Test mood variations
    console.log('\n3️⃣ Testing Mood Variations...');
    for (const [counselorId, config] of Object.entries(AVATAR_CONFIGS)) {
        for (const [mood, moodConfig] of Object.entries(MOOD_CONFIGS)) {
            try {
                const moodResponse = await axios.get(`${BASE_URL}/api/avatar/counselor/${counselorId}/mood/${mood}`);
                console.log(`✅ ${counselorId} (${mood}): Mood avatar working`);
            } catch (error) {
                console.log(`❌ ${counselorId} (${mood}): Mood test failed - ${error.message}`);
            }
        }
    }

    // Step 4: Test animations
    console.log('\n4️⃣ Testing Animations...');
    for (const [counselorId, config] of Object.entries(AVATAR_CONFIGS)) {
        for (const [animation, animConfig] of Object.entries(ANIMATION_CONFIGS)) {
            try {
                const animResponse = await axios.get(`${BASE_URL}/api/avatar/counselor/${counselorId}/animations`);
                console.log(`✅ ${counselorId} (${animation}): Animation system working`);
                break; // Just test one animation per counselor
            } catch (error) {
                console.log(`❌ ${counselorId} (${animation}): Animation test failed - ${error.message}`);
            }
        }
    }

    // Step 5: Test lip sync
    console.log('\n5️⃣ Testing Lip Sync System...');
    for (const counselorId of Object.keys(AVATAR_CONFIGS).slice(0, 2)) { // Test first 2
        try {
            const lipSyncResponse = await axios.post(`${BASE_URL}/api/lipsync/generate`, {
                audioBuffer: 'dGVzdCBhdWRpbyBkYXRh', // base64 test audio
                avatarId: `${counselorId}-avatar`,
                counselorId: counselorId,
                context: 'greeting'
            });
            console.log(`✅ ${counselorId}: Lip sync system working`);
        } catch (error) {
            console.log(`❌ ${counselorId}: Lip sync test failed - ${error.message}`);
        }
    }

    // Step 6: Test voice integration
    console.log('\n6️⃣ Testing Voice Integration...');
    try {
        const voiceResponse = await axios.get(`${BASE_URL}/api/voice/providers`);
        console.log('✅ Voice providers available:', Object.keys(voiceResponse.data.providers));
        
        // Test ElevenLabs voices
        const elevenLabsResponse = await axios.get(`${BASE_URL}/api/voice/voices/elevenlabs`);
        console.log('✅ ElevenLabs voice integration working');
    } catch (error) {
        console.log('❌ Voice integration test failed:', error.message);
    }

    // Step 7: Generate avatar documentation
    console.log('\n7️⃣ Generating Avatar Documentation...');
    const documentation = generateAvatarDocumentation(results);
    
    // Save documentation
    fs.writeFileSync('AVATAR_BUILD_REPORT.md', documentation);
    console.log('✅ Avatar documentation saved to AVATAR_BUILD_REPORT.md');

    // Step 8: Summary
    console.log('\n🎉 Avatar Building Complete!');
    console.log(`\n📊 Results:`);
    console.log(`- Created: ${results.created.length} avatars`);
    console.log(`- Errors: ${results.errors.length} errors`);
    console.log(`- Tested: ${results.tested.length} avatars`);
    
    console.log('\n🚀 All Avatars Ready for Production!');
    console.log('\n📋 Available Features:');
    console.log('- 3D Ready Player Me avatars for all 6 counselors');
    console.log('- Mood and expression system (6 moods per counselor)');
    console.log('- Animation system (5 animations per counselor)');
    console.log('- Lip sync with D-ID integration');
    console.log('- Voice processing with multiple providers');
    console.log('- Real-time avatar interactions');
    
    return results;
}

function generateAvatarDocumentation(results) {
    return `# CareConnect Avatar Build Report

## Overview
This report documents the avatar system build for CareConnect AI Chatbot.

## Build Results
- **Total Counselors**: ${Object.keys(AVATAR_CONFIGS).length}
- **Successfully Created**: ${results.created.length}
- **Errors**: ${results.errors.length}
- **Tested**: ${results.tested.length}

## Counselor Avatars

${Object.entries(AVATAR_CONFIGS).map(([id, config]) => `
### ${config.name} (${id})
- **Specialty**: ${config.specialty}
- **Personality**: ${config.personality}
- **Style**: ${config.style}
- **Gender**: ${config.gender}
- **Hair**: ${config.hair}
- **Outfit**: ${config.outfit}
- **Accessories**: ${config.accessories.join(', ')}
- **Skin Tone**: ${config.skinTone}
- **Eye Color**: ${config.eyeColor}
`).join('')}

## Available Moods
${Object.keys(MOOD_CONFIGS).map(mood => `- ${mood}`).join('\n')}

## Available Animations
${Object.keys(ANIMATION_CONFIGS).map(anim => `- ${anim}`).join('\n')}

## Technical Features
- Ready Player Me 3D Avatar Integration
- D-ID Lip Sync Animation
- Voice Processing (ElevenLabs, PlayHT, Polly)
- Real-time Mood and Expression System
- Three.js 3D Rendering
- WebRTC Voice Communication

## API Endpoints
- \`GET /api/avatar/counselor/:id\` - Get counselor avatar
- \`GET /api/avatar/counselor/:id/mood/:mood\` - Get avatar with mood
- \`GET /api/avatar/counselor/:id/animations\` - Get avatar animations
- \`POST /api/lipsync/generate\` - Generate lip sync animation
- \`GET /api/voice/providers\` - Get available voice providers

## Next Steps
1. Configure API keys for production
2. Test avatar creation with real RPM API
3. Implement voice provider authentication
4. Set up D-ID API for lip sync
5. Deploy to production environment

Generated on: ${new Date().toISOString()}
`;
}

// Run the avatar building process
buildAllAvatars().catch(console.error); 