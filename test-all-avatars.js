const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const COUNSELORS = ["dr-sarah-mitchell","michael-rodriguez","dr-emily-chen","james-williams","dr-maria-garcia","lisa-thompson"];

async function testAllAvatars() {
    console.log('🧪 Testing All CareConnect Avatars\n');
    
    for (const counselorId of COUNSELORS) {
        console.log(`Testing ${counselorId}...`);
        
        // Test avatar retrieval
        try {
            const avatarResponse = await axios.get(`${BASE_URL}/api/avatar/counselor/${counselorId}`);
            console.log(`✅ ${counselorId}: Avatar data retrieved`);
        } catch (error) {
            console.log(`❌ ${counselorId}: Avatar test failed`);
        }
        
        // Test mood variations
        const moods = ["neutral","supportive","empathetic","professional","calm","encouraging"];
        for (const mood of moods.slice(0, 2)) {
            try {
                const moodResponse = await axios.get(`${BASE_URL}/api/avatar/counselor/${counselorId}/mood/${mood}`);
                console.log(`✅ ${counselorId} (${mood}): Mood working`);
            } catch (error) {
                console.log(`❌ ${counselorId} (${mood}): Mood failed`);
            }
        }
        
        // Test animations
        try {
            const animResponse = await axios.get(`${BASE_URL}/api/avatar/counselor/${counselorId}/animations`);
            console.log(`✅ ${counselorId}: Animations working`);
        } catch (error) {
            console.log(`❌ ${counselorId}: Animations failed`);
        }
    }
    
    console.log('\n🎉 All avatar tests complete!');
}

testAllAvatars().catch(console.error);
