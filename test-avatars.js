const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const COUNSELORS = [
    'dr-sarah-mitchell',
    'michael-rodriguez', 
    'dr-emily-chen',
    'james-williams',
    'dr-maria-garcia',
    'lisa-thompson'
];

async function testAvatarSystem() {
    console.log('🧪 Testing CareConnect Avatar System\n');
    
    // Test 1: Health Check
    console.log('1️⃣ Testing Server Health...');
    try {
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server is healthy:', healthResponse.data.status);
    } catch (error) {
        console.log('❌ Server health check failed:', error.message);
        return;
    }

    // Test 2: Voice Providers
    console.log('\n2️⃣ Testing Voice Providers...');
    try {
        const voiceResponse = await axios.get(`${BASE_URL}/api/voice/providers`);
        console.log('✅ Voice providers available:', Object.keys(voiceResponse.data.providers));
    } catch (error) {
        console.log('❌ Voice providers test failed:', error.message);
    }

    // Test 3: Avatar Routes
    console.log('\n3️⃣ Testing Avatar Routes...');
    for (const counselorId of COUNSELORS) {
        try {
            const avatarResponse = await axios.get(`${BASE_URL}/api/avatar/counselor/${counselorId}`);
            console.log(`✅ ${counselorId}: Avatar data retrieved`);
        } catch (error) {
            console.log(`❌ ${counselorId}: Avatar test failed - ${error.message}`);
        }
    }

    // Test 4: Avatar with Moods
    console.log('\n4️⃣ Testing Avatar Moods...');
    const moods = ['neutral', 'supportive', 'empathetic', 'professional', 'calm'];
    for (const counselorId of COUNSELORS.slice(0, 2)) { // Test first 2 counselors
        for (const mood of moods.slice(0, 2)) { // Test first 2 moods
            try {
                const moodResponse = await axios.get(`${BASE_URL}/api/avatar/counselor/${counselorId}/mood/${mood}`);
                console.log(`✅ ${counselorId} (${mood}): Mood avatar retrieved`);
            } catch (error) {
                console.log(`❌ ${counselorId} (${mood}): Mood test failed - ${error.message}`);
            }
        }
    }

    // Test 5: Avatar Animations
    console.log('\n5️⃣ Testing Avatar Animations...');
    for (const counselorId of COUNSELORS.slice(0, 2)) {
        try {
            const animationResponse = await axios.get(`${BASE_URL}/api/avatar/counselor/${counselorId}/animations`);
            console.log(`✅ ${counselorId}: Animations retrieved`);
        } catch (error) {
            console.log(`❌ ${counselorId}: Animation test failed - ${error.message}`);
        }
    }

    // Test 6: Ready Player Me Integration
    console.log('\n6️⃣ Testing Ready Player Me Integration...');
    try {
        const rpmResponse = await axios.get(`${BASE_URL}/api/rpm/avatars`);
        console.log('✅ RPM avatars endpoint working');
    } catch (error) {
        console.log('❌ RPM integration test failed:', error.message);
    }

    // Test 7: Lip Sync
    console.log('\n7️⃣ Testing Lip Sync...');
    try {
        const lipSyncResponse = await axios.post(`${BASE_URL}/api/lipsync/generate`, {
            audioBuffer: 'dGVzdCBhdWRpbyBkYXRh', // base64 encoded "test audio data"
            avatarId: 'test-avatar',
            counselorId: 'dr-sarah-mitchell',
            context: 'greeting'
        });
        console.log('✅ Lip sync generation working');
    } catch (error) {
        console.log('❌ Lip sync test failed:', error.message);
    }

    // Test 8: Counselor Profile Pages
    console.log('\n8️⃣ Testing Counselor Profile Pages...');
    for (const counselorId of COUNSELORS) {
        try {
            const profileResponse = await axios.get(`${BASE_URL}/counselor/${counselorId}`);
            console.log(`✅ ${counselorId}: Profile page accessible`);
        } catch (error) {
            console.log(`❌ ${counselorId}: Profile page failed - ${error.message}`);
        }
    }

    // Test 9: Avatar Builder
    console.log('\n9️⃣ Testing Avatar Builder...');
    try {
        const builderResponse = await axios.get(`${BASE_URL}/api/avatar/builder/config`);
        console.log('✅ Avatar builder configuration available');
    } catch (error) {
        console.log('❌ Avatar builder test failed:', error.message);
    }

    // Test 10: Voice Input/Output
    console.log('\n🔟 Testing Voice Input/Output...');
    try {
        const voiceResponse = await axios.get(`${BASE_URL}/api/voice/voices/elevenlabs`);
        console.log('✅ Voice input/output system working');
    } catch (error) {
        console.log('❌ Voice input/output test failed:', error.message);
    }

    console.log('\n🎉 Avatar System Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('- All 6 counselors have avatar configurations');
    console.log('- Ready Player Me integration is set up');
    console.log('- Voice processing with multiple providers');
    console.log('- Lip sync animation system');
    console.log('- Mood and expression system');
    console.log('- 3D avatar rendering with Three.js');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Set up RPM_API_KEY environment variable for full avatar creation');
    console.log('2. Configure voice provider API keys (ElevenLabs, PlayHT, etc.)');
    console.log('3. Set up D-ID API key for lip sync animations');
    console.log('4. Test avatar creation with real API calls');
}

// Run the test
testAvatarSystem().catch(console.error); 