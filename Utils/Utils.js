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


const generateQuizQuestions = async (quizData) => {
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

const getFeedBackAi = async (answers, quiz, score) => {
    const incorrect = answers.filter((a) => !a.isCorrect);
    const weakPoints = incorrect.map((a) => quiz.questions.find((q) => q.id === a.questionId).weakPoint);
    const prompt = `Generate feedback for a ${quiz?.topic} quiz in strict JSON format. The user scored ${score}/5. The quiz has the following incorrect answers and weak points if there is no weekPoint then give great suggestion:

${weakPoints}

Instructions:
- Return a JSON object with:
  - "summary": A string (120-200 words, 6-7 lines, up to 10 lines if needed) summarizing performance, highlighting gaps in understanding, and encouraging improvement.
  - "weakPoints": An array of 3-5 general weak points (strings, 15-30 words each, derived from provided weak points, avoiding question-specific details).
  - "mainWeakPoint": A string (50-80 words, 3-4 lines) summarizing the primary issue across incorrect answers.
  - "suggestions": An array of 8-10 specific, actionable improvement steps (15-30 words each).
  - "tips": An array of 4-5 general coding tips (15-25 words each).
- Ensure the response is valid JSON, enclosed in curly braces, with no additional text or backticks.
- Use the weak points to tailor feedback, focusing on Java syntax, keywords, data types, and program structure.
- Maintain a supportive, educational tone to encourage the user to keep learning.`;


    const response = await callGemini(prompt)
    const result = cleanGeminiResponse(response);
    return JSON.parse(result);
}



module.exports = { isQuizAvailableForUser, generateQuizQuestions, getFeedBackAi };
