const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    }
});

// Initialize OpenAI for Whisper
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Speech-to-Text using OpenAI Whisper
router.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Create a temporary file for Whisper API
        const tempFilePath = path.join(__dirname, '../temp', `audio_${Date.now()}.wav`);
        fs.writeFileSync(tempFilePath, req.file.buffer);

        // Transcribe using OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: 'whisper-1',
            language: 'en',
            response_format: 'json'
        });

        // Clean up temporary file
        fs.unlinkSync(tempFilePath);

        res.json({
            success: true,
            text: transcription.text,
            language: transcription.language
        });

    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ 
            error: 'Transcription failed',
            details: error.message 
        });
    }
});

// Text-to-Speech using ElevenLabs
router.post('/synthesize', async (req, res) => {
    try {
        const { text, voice_id, counselor_id } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Get counselor voice mapping
        const voiceMapping = {
            'dr-sarah-mitchell': '21m00Tcm4TlvDq8ikWAM', // Rachel voice
            'michael-rodriguez': 'AZnzlk1XvdvUeBnXmlld', // Domi voice
            'dr-emily-chen': 'EXAVITQu4vr4xnSDxMaL', // Bella voice
            'james-williams': 'VR6AewLTigWG4xSOukaG', // Josh voice
            'dr-maria-garcia': 'pNInz6obpgDQGcFmaJgB', // Adam voice
            'lisa-thompson': 'yoZ06aMxZJJ28mfd3POQ' // Sam voice
        };

        const selectedVoiceId = voice_id || voiceMapping[counselor_id] || voiceMapping['dr-sarah-mitchell'];

        // ElevenLabs API call
        const response = await axios({
            method: 'POST',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            },
            data: {
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            },
            responseType: 'arraybuffer'
        });

        // Set response headers
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', response.data.length);
        res.send(Buffer.from(response.data));

    } catch (error) {
        console.error('Synthesis error:', error);
        res.status(500).json({ 
            error: 'Speech synthesis failed',
            details: error.message 
        });
    }
});

// Get available voices
router.get('/voices', async (req, res) => {
    try {
        const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            }
        });

        res.json({
            success: true,
            voices: response.data.voices
        });

    } catch (error) {
        console.error('Error fetching voices:', error);
        res.status(500).json({ 
            error: 'Failed to fetch voices',
            details: error.message 
        });
    }
});

// Real-time voice streaming endpoint
router.post('/stream', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        // Process real-time audio chunk
        const transcription = await openai.audio.transcriptions.create({
            file: req.file.buffer,
            model: 'whisper-1',
            language: 'en',
            response_format: 'json'
        });

        res.json({
            success: true,
            text: transcription.text,
            isFinal: true
        });

    } catch (error) {
        console.error('Streaming error:', error);
        res.status(500).json({ 
            error: 'Streaming failed',
            details: error.message 
        });
    }
});

// Lip sync data generation
router.post('/lipsync', async (req, res) => {
    try {
        const { audio_url, avatar_id } = req.body;

        // Generate lip sync data using D-ID or similar service
        const lipSyncData = await generateLipSyncData(audio_url, avatar_id);

        res.json({
            success: true,
            lip_sync_data: lipSyncData
        });

    } catch (error) {
        console.error('Lip sync error:', error);
        res.status(500).json({ 
            error: 'Lip sync generation failed',
            details: error.message 
        });
    }
});

async function generateLipSyncData(audioUrl, avatarId) {
    // This would integrate with D-ID API or similar service
    // For now, return mock data
    return {
        visemes: [
            { time: 0, viseme: 'rest' },
            { time: 0.1, viseme: 'ah' },
            { time: 0.2, viseme: 'oh' },
            { time: 0.3, viseme: 'ee' },
            { time: 0.4, viseme: 'rest' }
        ],
        duration: 1.0
    };
}

module.exports = router; 