const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize OpenAI client with DeepSeek configuration
// DeepSeek API is compatible with OpenAI's SDK
const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// API endpoint for generating suggestions
app.post('/api/generate-suggestion', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log("Sending request to DeepSeek with model: deepseek-chat");
    
    const response = await client.chat.completions.create({
      model: 'deepseek-chat', // Using DeepSeek's chat model
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'You are a concise, action-oriented coach that provides highly specific, personalized suggestions based on deep reflection. Your goal is to suggest meaningful, immediately actionable activities that authentically connect to a person\'s values, strengths, and aspirations. Focus on creating distinctive suggestions that feel tailored to the individual\'s unique combination of passions, talents, challenges, and ideal future. Avoid generic advice at all costs. Always format your response with "**Activity:**" followed by a clear, direct activity and "**Why this aligns with your values:**" followed by a brief, insightful explanation of how this specific activity bridges their current reality with their deeper aspirations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    res.json({ suggestion: response.choices[0].message.content });
  } catch (error) {
    console.error('Error generating suggestion:', error);
    res.status(500).json({ 
      error: 'Failed to generate suggestion',
      details: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 