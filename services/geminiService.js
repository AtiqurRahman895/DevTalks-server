const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

// Initialize Google Generative AI with API key
const genAi = new GoogleGenAI({ apiKey: process.env.Gemini_Api_Key });

// Constants
const MODEL_NAME = 'gemini-2.0-flash';

const callGemini = async (prompt) => {
  try {
    const response = await genAi.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    const content = response.text;
    return content;
  } catch (error) {
    throw new Error(`Failed to call Gemini API: ${error.message}`);
  }
};

module.exports = { callGemini };