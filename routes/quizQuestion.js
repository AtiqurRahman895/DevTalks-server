const express = require('express');
const router = express.Router();
const axios = require('axios');

const QUIZ_API_URL = 'https://quizapi.io/api/v1/questions';
const QUIZ_API_KEY = 'UefoHYobQStLmaI9I2TIJVvkh2ewgajxCEGwRwn4';

// Route to fetch quiz questions
router.get('/api/quiz', async (req, res) => {
  const { category = 'Code', difficulty = 'easy', limit = 10 } = req.query;

  try {
    const response = await axios.get(QUIZ_API_URL, {
      params: {
        apiKey: QUIZ_API_KEY,
        category,
        difficulty,
        limit,
      },
    });

    // Format the quiz data into the requested structure: { q, a, b, c, d, ans }
    const formattedQuestions = response.data.map((q) => {
      const options = Object.values(q.answers).filter((ans) => ans !== null);
      const correctAnswerKey = Object.keys(q.correct_answers).find(
        (key) => q.correct_answers[key] === 'true'
      )?.replace('_correct', '');
      const correctAnswer = q.answers[correctAnswerKey];

      // Ensure there are at least 4 options; if fewer, fill with dummy options
      const paddedOptions = [...options];
      while (paddedOptions.length < 4) {
        paddedOptions.push(`Option ${paddedOptions.length + 1}`);
      }

      return {
        q: q.question,
        a: paddedOptions[0],
        b: paddedOptions[1],
        c: paddedOptions[2],
        d: paddedOptions[3],
        ans: correctAnswer,
      };
    });

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching quiz questions:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch quiz questions' });
  }
});


module.exports = router;