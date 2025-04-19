const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

// Initialize Google Generative AI with API key
const genAi = new GoogleGenAI({ apiKey: process.env.Gemini_Api_Key });

// Constants
const MODEL_NAME = 'gemini-2.0-flash';
const DEFAULT_PROMPT = 'Generate a 1-question multiple-choice quiz for beginners on the topic C++. Each question should have: a question, 4 answer options (A, B, C, D), the correct answer (A, B, C, or D), a brief explanation, and a weak point (a concept beginners might miss). Format as JSON.';

router.get('/generate', async (req, res) => {
  try {
    // Generate content using the Gemini model
    const response = await genAi.models.generateContent({
      model: MODEL_NAME,
      contents: DEFAULT_PROMPT,
    });
    const content =response.text;
    console.log('Generated Response text:', content);
    res.send(content);
  } catch (error) {
    // Log error and send error response
    console.error('Error generating content:', error.message);
    res.status(500).send('Failed to generate content');
  }
});

module.exports = router;