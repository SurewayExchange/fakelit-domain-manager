const express = require('express');
const axios = require('axios');
const router = express.Router();

// Ready Player Me API configuration
const RPM_API_BASE = 'https://api.readyplayer.me/v1';
const RPM_API_KEY = process.env.RPM_API_KEY;

// Counselor avatar configurations
const counselorAvatars = {
    'dr-sarah-mitchell': {
        name: 'Dr. Sarah Mitchell',
        specialty: 'Mental Health & CBT',
        avatar_url: 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8b8.glb',
        voice_id: '21m00Tcm4TlvDq8ikWAM',
        personality: 'compassionate, professional, evidence-based',
        expressions: ['listening', 'concerned', 'encouraging', 'thoughtful']
    },
    'michael-rodriguez': {
        name: 'Michael Rodriguez',
        specialty: 'Substance Abuse & Recovery',
        avatar_url: 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8b9.glb',
        voice_id: 'AZnzlk1XvdvUeBnXmlld',
        personality: 'supportive, understanding, recovery-focused',
        expressions: ['supportive', 'empathetic', 'encouraging', 'focused']
    },
    'dr-emily-chen': {
        name: 'Dr. Emily Chen',
        specialty: 'Relationships & Family',
        avatar_url: 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8ba.glb',
        voice_id: 'EXAVITQu4vr4xnSDxMaL',
        personality: 'warm, insightful, relationship-oriented',
        expressions: ['warm', 'understanding', 'insightful', 'caring']
    },
    'james-williams': {
        name: 'James Williams',
        specialty: 'Career & Life Coaching',
        avatar_url: 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8bb.glb',
        voice_id: 'VR6AewLTigWG4xSOukaG',
        personality: 'motivational, practical, goal-oriented',
        expressions: ['motivated', 'focused', 'encouraging', 'practical']
    },
    'dr-maria-garcia': {
        name: 'Dr. Maria Garcia',
        specialty: 'Crisis Intervention',
        avatar_url: 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8bc.glb',
        voice_id: 'pNInz6obpgDQGcFmaJgB',
        personality: 'calm, professional, crisis-trained',
        expressions: ['calm', 'professional', 'focused', 'reassuring']
    },
    'lisa-thompson': {
        name: 'Lisa Thompson',
        specialty: 'Onboarding & Guidance',
        avatar_url: 'https://models.readyplayer.me/64f7b8b8b8b8b8b8b8b8bd.glb',
        voice_id: 'yoZ06aMxZJJ28mfd3POQ',
        personality: 'friendly, welcoming, helpful',
        expressions: ['friendly', 'welcoming', 'helpful', 'patient']
    }
};

// Get all counselor avatars
router.get('/counselors', (req, res) => {
    try {
        const avatars = Object.keys(counselorAvatars).map(id => ({
            id,
            ...counselorAvatars[id]
        }));

        res.json({
            success: true,
            avatars: avatars
        });
    } catch (error) {
        console.error('Error fetching counselor avatars:', error);
        res.status(500).json({ error: 'Failed to fetch avatars' });
    }
});

// Get specific counselor avatar
router.get('/counselor/:id', (req, res) => {
    try {
        const counselorId = req.params.id;
        const avatar = counselorAvatars[counselorId];

        if (!avatar) {
            return res.status(404).json({ error: 'Counselor not found' });
        }

        res.json({
            success: true,
            avatar: {
                id: counselorId,
                ...avatar
            }
        });
    } catch (error) {
        console.error('Error fetching counselor avatar:', error);
        res.status(500).json({ error: 'Failed to fetch avatar' });
    }
});

// Create custom avatar using Ready Player Me
router.post('/create', async (req, res) => {
    try {
        const { gender, style, features } = req.body;

        // Ready Player Me avatar creation
        const response = await axios.post(`${RPM_API_BASE}/avatar`, {
            gender: gender || 'neutral',
            style: style || 'realistic',
            features: features || {}
        }, {
            headers: {
                'Authorization': `Bearer ${RPM_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            avatar: response.data
        });
    } catch (error) {
        console.error('Error creating avatar:', error);
        res.status(500).json({ error: 'Failed to create avatar' });
    }
});

// Get avatar with mood/expression
router.get('/counselor/:id/mood/:mood', (req, res) => {
    try {
        const { id, mood } = req.params;
        const avatar = counselorAvatars[id];

        if (!avatar) {
            return res.status(404).json({ error: 'Counselor not found' });
        }

        // Generate mood-specific avatar configuration
        const moodConfig = generateMoodConfig(mood, avatar);

        res.json({
            success: true,
            avatar: {
                id,
                ...avatar,
                current_mood: mood,
                mood_config: moodConfig
            }
        });
    } catch (error) {
        console.error('Error fetching mood avatar:', error);
        res.status(500).json({ error: 'Failed to fetch mood avatar' });
    }
});

// Get avatar animations
router.get('/counselor/:id/animations', (req, res) => {
    try {
        const counselorId = req.params.id;
        const avatar = counselorAvatars[counselorId];

        if (!avatar) {
            return res.status(404).json({ error: 'Counselor not found' });
        }

        const animations = getCounselorAnimations(counselorId);

        res.json({
            success: true,
            animations: animations
        });
    } catch (error) {
        console.error('Error fetching animations:', error);
        res.status(500).json({ error: 'Failed to fetch animations' });
    }
});

// Update avatar expression in real-time
router.post('/counselor/:id/expression', (req, res) => {
    try {
        const { id } = req.params;
        const { expression, intensity } = req.body;

        const avatar = counselorAvatars[id];
        if (!avatar) {
            return res.status(404).json({ error: 'Counselor not found' });
        }

        // Generate expression data for 3D avatar
        const expressionData = generateExpressionData(expression, intensity);

        res.json({
            success: true,
            expression: expression,
            intensity: intensity,
            expression_data: expressionData
        });
    } catch (error) {
        console.error('Error updating expression:', error);
        res.status(500).json({ error: 'Failed to update expression' });
    }
});

// Get avatar lip sync data
router.get('/counselor/:id/lipsync/:audioId', async (req, res) => {
    try {
        const { id, audioId } = req.params;
        const avatar = counselorAvatars[id];

        if (!avatar) {
            return res.status(404).json({ error: 'Counselor not found' });
        }

        // Generate lip sync data for the audio
        const lipSyncData = await generateLipSyncData(audioId, avatar);

        res.json({
            success: true,
            lip_sync_data: lipSyncData
        });
    } catch (error) {
        console.error('Error generating lip sync:', error);
        res.status(500).json({ error: 'Failed to generate lip sync' });
    }
});

// Helper functions
function generateMoodConfig(mood, avatar) {
    const moodConfigs = {
        'listening': {
            eye_blink_rate: 0.8,
            mouth_tension: 0.3,
            head_tilt: 0.1,
            eyebrow_position: 0.5
        },
        'concerned': {
            eye_blink_rate: 0.6,
            mouth_tension: 0.7,
            head_tilt: 0.2,
            eyebrow_position: 0.3
        },
        'encouraging': {
            eye_blink_rate: 1.0,
            mouth_tension: 0.2,
            head_tilt: 0.0,
            eyebrow_position: 0.7
        },
        'thoughtful': {
            eye_blink_rate: 0.4,
            mouth_tension: 0.5,
            head_tilt: 0.3,
            eyebrow_position: 0.4
        }
    };

    return moodConfigs[mood] || moodConfigs['listening'];
}

function getCounselorAnimations(counselorId) {
    const baseAnimations = {
        'idle': { url: '/animations/idle.glb', loop: true },
        'listening': { url: '/animations/listening.glb', loop: true },
        'speaking': { url: '/animations/speaking.glb', loop: false },
        'nodding': { url: '/animations/nodding.glb', loop: false },
        'thinking': { url: '/animations/thinking.glb', loop: true }
    };

    // Add counselor-specific animations
    const counselorSpecific = {
        'dr-sarah-mitchell': {
            'cbt_explanation': { url: '/animations/cbt_explanation.glb', loop: false },
            'mindfulness_guide': { url: '/animations/mindfulness_guide.glb', loop: false }
        },
        'michael-rodriguez': {
            'recovery_support': { url: '/animations/recovery_support.glb', loop: false },
            'relapse_prevention': { url: '/animations/relapse_prevention.glb', loop: false }
        }
    };

    return {
        ...baseAnimations,
        ...(counselorSpecific[counselorId] || {})
    };
}

function generateExpressionData(expression, intensity = 0.5) {
    const expressions = {
        'happy': {
            mouth_corner_up: intensity,
            eye_squint: intensity * 0.7,
            cheek_raise: intensity * 0.8
        },
        'concerned': {
            eyebrow_lower: intensity,
            mouth_corner_down: intensity * 0.6,
            eye_widen: intensity * 0.4
        },
        'listening': {
            eyebrow_raise: intensity * 0.3,
            mouth_neutral: 1.0,
            eye_focus: intensity
        },
        'thoughtful': {
            eyebrow_raise: intensity * 0.5,
            mouth_pursed: intensity,
            eye_squint: intensity * 0.3
        }
    };

    return expressions[expression] || expressions['listening'];
}

async function generateLipSyncData(audioId, avatar) {
    // This would integrate with D-ID or similar lip sync service
    // For now, return mock data
    return {
        visemes: [
            { time: 0, viseme: 'rest', intensity: 0 },
            { time: 0.1, viseme: 'ah', intensity: 0.8 },
            { time: 0.2, viseme: 'oh', intensity: 0.6 },
            { time: 0.3, viseme: 'ee', intensity: 0.9 },
            { time: 0.4, viseme: 'rest', intensity: 0 }
        ],
        duration: 1.0,
        audio_id: audioId,
        avatar_id: avatar.name
    };
}

module.exports = router; 