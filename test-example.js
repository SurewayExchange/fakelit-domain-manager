// Test example for CareConnect AI Chatbot
// This file demonstrates how to use the API endpoints

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const SESSION_ID = 'test-session-' + Date.now();

// Helper function to make API calls
async function makeRequest(endpoint, data = {}) {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
}

// Test scenarios
async function runTests() {
  console.log('🧪 Testing CareConnect AI Chatbot API with AI Counselors\n');

  const clientId = 'test-client-' + Date.now();
  let conversationId = null;

  try {
    // Test 1: 24/7 Instant Support with AI Counselor
    console.log('1️⃣ Testing 24/7 Instant Support with AI Counselor...');
    const instantResponse = await makeRequest('/chat/talk-now', {
      message: "I'm feeling anxious and overwhelmed today",
      language: 'en'
    });
    console.log('✅ Instant Support Response:', instantResponse.response.substring(0, 100) + '...');
    console.log('📊 Crisis Level:', instantResponse.crisisLevel);
    console.log('🔗 Suggested Service:', instantResponse.suggestedServiceType);
    console.log('👨‍⚕️ AI Counselor:', instantResponse.counselor?.name);
    console.log('');

    // Test 2: Mental Health Chat with Persistent Conversation
    console.log('2️⃣ Testing Mental Health Chat with Persistent Conversation...');
    const mentalHealthResponse = await makeRequest('/chat/mental-health', {
      message: "I've been having trouble sleeping and my anxiety is getting worse",
      language: 'en',
      conversationId: conversationId,
      clientId: clientId
    });
    conversationId = mentalHealthResponse.conversationId;
    console.log('✅ Mental Health Response:', mentalHealthResponse.response.substring(0, 100) + '...');
    console.log('📚 Resources:', mentalHealthResponse.resources);
    console.log('👨‍⚕️ AI Counselor:', mentalHealthResponse.counselor?.name);
    console.log('💬 Conversation ID:', conversationId);
    console.log('📊 Session Count:', mentalHealthResponse.sessionCount);
    console.log('');

    // Test 3: Drug & Alcohol Support with Different Counselor
    console.log('3️⃣ Testing Drug & Alcohol Support with Different Counselor...');
    const substanceResponse = await makeRequest('/chat/drug-alcohol', {
      message: "I'm trying to stay sober but the cravings are really strong today",
      language: 'en',
      clientId: clientId
    });
    console.log('✅ Substance Support Response:', substanceResponse.response.substring(0, 100) + '...');
    console.log('📚 Resources:', substanceResponse.resources);
    console.log('👨‍⚕️ AI Counselor:', substanceResponse.counselor?.name);
    console.log('💬 New Conversation ID:', substanceResponse.conversationId);
    console.log('');

    // Test 4: Continue Previous Conversation
    console.log('4️⃣ Testing Continued Conversation with Memory...');
    const continuedResponse = await makeRequest('/chat/mental-health', {
      message: "I'm still having trouble with sleep. What else can I try?",
      language: 'en',
      conversationId: conversationId,
      clientId: clientId
    });
    console.log('✅ Continued Response:', continuedResponse.response.substring(0, 100) + '...');
    console.log('👨‍⚕️ Same AI Counselor:', continuedResponse.counselor?.name);
    console.log('💬 Same Conversation ID:', continuedResponse.conversationId);
    console.log('📊 Total Messages:', continuedResponse.totalMessages);
    console.log('');

    // Test 5: Pre-Session Check-in
    console.log('5️⃣ Testing Pre-Session Check-in...');
    const preSessionResponse = await makeRequest('/pre-session', {
      concerns: "I'm struggling with anxiety, depression, and relationship issues",
      goals: "Learn coping strategies, improve communication, and manage my mood"
    });
    console.log('✅ Pre-Session Summary:', preSessionResponse.summary.substring(0, 100) + '...');
    console.log('');

    // Test 6: Post-Session Follow-up
    console.log('6️⃣ Testing Post-Session Follow-up...');
    const postSessionResponse = await makeRequest('/post-session', {
      sessionNotes: "Discussed CBT techniques for anxiety, practiced breathing exercises, and talked about relationship boundaries",
      mood: "Better than before, but still some anxiety",
      nextSteps: "Practice breathing exercises daily, journal my thoughts, and schedule follow-up session"
    });
    console.log('✅ Post-Session Follow-up:', postSessionResponse.followUp.substring(0, 100) + '...');
    console.log('📚 Suggested Resources:', postSessionResponse.suggestedResources);
    console.log('');

    // Test 7: Client Routes - Get Conversation History
    console.log('7️⃣ Testing Client Routes - Get Conversation History...');
    const historyResponse = await axios.get(`${BASE_URL}/client/conversations`, {
      headers: {
        'X-Client-ID': clientId
      }
    });
    console.log('✅ Client Conversations:', historyResponse.data.conversations.length, 'conversations');
    console.log('📊 Recent Topics:', historyResponse.data.conversations[0]?.recentTopics);
    console.log('');

    // Test 8: Get Available Counselors
    console.log('8️⃣ Testing Get Available Counselors...');
    const counselorsResponse = await axios.get(`${BASE_URL}/client/counselors`);
    console.log('✅ Available Counselors:', counselorsResponse.data.counselors.length, 'counselors');
    counselorsResponse.data.counselors.forEach(counselor => {
      console.log(`   👨‍⚕️ ${counselor.name} - ${counselor.specialization}`);
      console.log(`   🖼️  Avatar: ${counselor.avatar.image}`);
    });
    console.log('');

    // Test 8.5: Test Avatar Functionality
    console.log('8️⃣.5️⃣ Testing Avatar Functionality...');
    const avatarCounselorId = mentalHealthResponse.counselor.id;
    
    // Test greeting avatar
    const greetingAvatarResponse = await axios.get(`${BASE_URL}/avatar/counselor/${avatarCounselorId}?context=greeting`);
    console.log('✅ Greeting Avatar:', greetingAvatarResponse.data.avatar.image);
    
    // Test listening avatar
    const listeningAvatarResponse = await axios.get(`${BASE_URL}/avatar/counselor/${avatarCounselorId}?context=listening`);
    console.log('✅ Listening Avatar:', listeningAvatarResponse.data.avatar.image);
    
    // Test animated avatar
    const animatedAvatarResponse = await axios.get(`${BASE_URL}/avatar/counselor/${avatarCounselorId}/animated`);
    console.log('✅ Animated Avatar Frames:', animatedAvatarResponse.data.animatedAvatar.frames.length);
    
    // Test mood-based avatar
    const moodAvatarResponse = await axios.get(`${BASE_URL}/avatar/counselor/${avatarCounselorId}/mood/supportive`);
    console.log('✅ Supportive Mood Avatar:', moodAvatarResponse.data.avatar.image);
    console.log('');

    // Test 9: Admin Routes - Get Analytics
    console.log('9️⃣ Testing Admin Routes - Get Analytics...');
    const adminToken = process.env.ADMIN_TOKEN || 'test-admin-token';
    const analyticsResponse = await axios.get(`${BASE_URL}/admin/analytics`, {
      headers: {
        'X-Admin-Token': adminToken
      }
    });
    console.log('✅ System Analytics:', analyticsResponse.data.system.totalConversations, 'conversations');
    console.log('📊 Active Conversations:', analyticsResponse.data.system.activeConversations);
    console.log('🚨 Crisis Flags:', analyticsResponse.data.system.crisisFlags);
    console.log('');

    // Test 10: Get Counselor Performance
    console.log('🔟 Testing Get Counselor Performance...');
    const counselorId = mentalHealthResponse.counselor.id;
    const performanceResponse = await axios.get(`${BASE_URL}/admin/counselors/${counselorId}/performance`, {
      headers: {
        'X-Admin-Token': adminToken
      }
    });
    console.log('✅ Counselor Performance:', performanceResponse.data.stats.totalConversations, 'conversations');
    console.log('📊 Total Messages:', performanceResponse.data.stats.totalMessages);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('📊 Client ID:', clientId);
    console.log('💬 Conversation ID:', conversationId);
    console.log('👨‍⚕️ AI Counselors working with persistent memory!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Example of the original axios API call from your request
async function testOriginalAxiosCall() {
  console.log('\n🔧 Testing Original Axios API Call...');
  
  const axios = require('axios');
  
  // OpenAI API call using axios (from your original request)
  async function getOpenAIChatCompletion(userMessage, systemPrompt = "You are a helpful assistant.") {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4.1',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  try {
    const result = await getOpenAIChatCompletion('Hello! I need some mental health support.');
    console.log('✅ Original API Call Response:', result.choices[0].message.content.substring(0, 100) + '...');
  } catch (error) {
    console.error('❌ Original API Call Failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('🚀 Starting CareConnect AI Chatbot Tests\n');
  
  // Check if server is running
  axios.get('http://localhost:3000/health')
    .then(() => {
      console.log('✅ Server is running on http://localhost:3000\n');
      runTests();
    })
    .catch(() => {
      console.log('❌ Server is not running. Please start the server first:');
      console.log('   npm run dev\n');
      console.log('Then run this test file again.');
    });
}

module.exports = { runTests, testOriginalAxiosCall }; 