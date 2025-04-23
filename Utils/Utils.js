const express = require('express');
const { callGemini } = require('../services/geminiService');
const isQuizAvailableForUser = (lastQuizDate) => {
    const today = new Date();
    const lastAttemptDate = lastQuizDate ? new Date(lastQuizDate) : null;

    if (lastAttemptDate) {
        const timeSinceLastAttempt = today - lastAttemptDate;
        const timeSinceLastAttemptDays = Math.floor(timeSinceLastAttempt / (24 * 60 * 60 * 1000));

        if (timeSinceLastAttemptDays < 7) {
            const daysRemaining = 7 - timeSinceLastAttemptDays;
            return {
                status: "success",
                daysRemaining
            };
        }
    }
};

const cleanGeminiResponse = (rawText) => {
    // Remove triple backticks and optional "json" tag
    return rawText
      .replace(/^```json\s*/, '') // remove ```json at the start
      .replace(/^```/, '')        // in case it's just ```
      .replace(/```$/, '')        // remove ``` at the end
      .trim();                    // remove any extra spaces
};


const generateQuizQuestions = async(quizData) => {
    try {
        const prompt = `Generate a quiz with 5 multiple-choice questions based on the programming language "${quizData.topic}" and difficulty level "${quizData.difficulty}".
                        Each question should include:
                        - An ID (string, numbered "1" to "5")
                        - A clear and concise question
                        - Four answer options labeled "A", "B", "C", and "D"
                        - The correct answer indicated by its label (e.g., "B")
                        - A brief explanation of why the correct answer is correct and why others are incorrect
                        - A weak point (a specific concept or common mistake learners might miss)

                        Make sure the questions match the specified difficulty level:
                        - "easy" should be beginner-friendly
                        - "medium" should be moderately challenging
                        - "hard" should require deeper understanding or application

                        Return the response in the following JSON format (do not use """json""", return direct JSON):
                        {
                            "topic": "${quizData.topic}",
                            "difficulty": "${quizData.difficulty}",
                            "Date": "${new Date().toISOString()}",
                            "questions": [
                                {
                                    "id": "1",
                                    "question": "What is the capital of France?",
                                    "options": {
                                        "A": "Paris",
                                        "B": "London",
                                        "C": "Berlin",
                                        "D": "Madrid"
                                    },
                                    "correctAnswer": "A",
                                    "explanation": "Paris is the capital of France. London, Berlin, and Madrid are capitals of other countries.",
                                    "weakPoint": "Confusing capitals of European countries"
                                }
                            ]
                        }`;

        const response = await callGemini(prompt);
        const result = cleanGeminiResponse(response)
        return JSON.parse(result);

    } catch (error) {
        console.log(error)
    }
}



module.exports = { isQuizAvailableForUser, generateQuizQuestions };
