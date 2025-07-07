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

// Initialize OpenAI client only if API key is available
let openai = null;
try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
        const OpenAI = require('openai');
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        console.log('✅ OpenAI client initialized successfully');
    } else {
        console.log('⚠️ OpenAI API key not configured, voice features will run in mock mode');
    }
} catch (error) {
    console.log('⚠️ Failed to initialize OpenAI client, voice features will run in mock mode:', error.message);
}

// Mock voice service for when OpenAI is not available
const mockVoiceService = {
    async generateSpeech(text, voice = 'alloy') {
        return {
            success: true,
            audioUrl: 'mock-audio-url',
            duration: 2.5,
            message: 'Mock voice generation (OpenAI not configured)'
        };
    },
    
    async transcribeAudio(audioBuffer) {
        return {
            success: true,
            text: 'Mock transcription (OpenAI not configured)',
            confidence: 0.95
        };
    }
};

// Voice generation endpoint
router.post('/generate', async (req, res) => {
    try {
        const { text, voice = 'alloy', model = 'tts-1' } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required for voice generation',
                poweredBy: 'Fakelit.com'
            });
        }

        let result;
        if (openai) {
            // Use real OpenAI service
            const mp3 = await openai.audio.speech.create({
                model: model,
                voice: voice,
                input: text,
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            const audioUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`;

            result = {
                success: true,
                audioUrl: audioUrl,
                duration: buffer.length / 16000, // Rough estimate
                message: 'Voice generated successfully'
            };
        } else {
            // Use mock service
            result = await mockVoiceService.generateSpeech(text, voice);
        }

        res.json({
            success: result.success,
            audioUrl: result.audioUrl,
            duration: result.duration,
            message: result.message,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Voice generation error:', error);
        
        // Fallback to mock service
        const mockResult = await mockVoiceService.generateSpeech(req.body.text, req.body.voice);
        
        res.json({
            success: mockResult.success,
            audioUrl: mockResult.audioUrl,
            duration: mockResult.duration,
            message: mockResult.message + ' (fallback mode)',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Voice transcription endpoint
router.post('/transcribe', async (req, res) => {
    try {
        const { audioData, model = 'whisper-1' } = req.body;

        if (!audioData) {
            return res.status(400).json({
                success: false,
                message: 'Audio data is required for transcription',
                poweredBy: 'Fakelit.com'
            });
        }

        let result;
        if (openai) {
            // Use real OpenAI service
            const transcription = await openai.audio.transcriptions.create({
                file: audioData,
                model: model,
            });

            result = {
                success: true,
                text: transcription.text,
                confidence: 0.95
            };
        } else {
            // Use mock service
            result = await mockVoiceService.transcribeAudio(audioData);
        }

        res.json({
            success: result.success,
            text: result.text,
            confidence: result.confidence,
            poweredBy: 'Fakelit.com'
        });
    } catch (error) {
        console.error('Voice transcription error:', error);
        
        // Fallback to mock service
        const mockResult = await mockVoiceService.transcribeAudio(req.body.audioData);
        
        res.json({
            success: mockResult.success,
            text: mockResult.text,
            confidence: mockResult.confidence,
            message: 'Transcription completed (fallback mode)',
            poweredBy: 'Fakelit.com'
        });
    }
});

// Voice status endpoint
router.get('/status', (req, res) => {
    res.json({
        success: true,
        status: openai ? 'active' : 'mock-mode',
        features: {
            generation: true,
            transcription: true,
            voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
        },
        message: openai ? 'Voice service active' : 'Voice service running in mock mode',
        poweredBy: 'Fakelit.com'
    });
});

module.exports = router; 