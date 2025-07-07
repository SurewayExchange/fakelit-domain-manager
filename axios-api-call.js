const axios = require('axios');

// OpenAI API call using axios
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

// Example usage
async function example() {
  try {
    const result = await getOpenAIChatCompletion('Hello!');
    console.log('AI Response:', result.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

module.exports = { getOpenAIChatCompletion };

// Run example if this file is executed directly
if (require.main === module) {
  example();
} 