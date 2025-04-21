const express = require('express');
const { client } = require('../config/db');
const { isQuizAvailableForUser, generateQuizQuestions } = require('../Utils/Utils');

const router = express.Router();
const quizzes = client.db("DevTalks").collection("Quizzes");
const users = client.db("DevTalks").collection("Users");

router.post("/create-quiz", async (req, res) => {
    const quizData = req.body;

    //!Validate input
    if (!quizData.email || !quizData.topic) {
        return res.status(400).json({ error: 'Email and topic are required' });
    }


    //!Check if user exists
    const user = await users.findOne({ email: quizData.email });
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }


    //!check if the quiz is available for user or not
    const result = isQuizAvailableForUser(user.lastQuizDate)
    if (result && result.status === "success") {
        return res.status(400).json({
            response: {
                error: `No quiz available today. Come back in ${result.daysRemaining} day(s).`,
            },
        });
    }


    //!cheek if that the quiz is available or not
    const cheekQuizOnDB = await quizzes.findOne({ topic: quizData.topic })
    //if the quiz is available in the db
    if (cheekQuizOnDB) {
        return res.send(cheekQuizOnDB)
    }


    //!generate quiz with the help of ai
    const createQuizResponse = await generateQuizQuestions(quizData);
    if(createQuizResponse){
        const insertDateInUserDB = users.updateOne(
            {email:quizData.email},
            { $set: { lastQuizDate: new Date().toISOString() } },
            { upsert: true}
        )
        const QuizSaveInDB = await quizzes.insertOne(createQuizResponse)
        console.log(QuizSaveInDB)
        res.send({
            quizSaved: QuizSaveInDB,
            userUpdated: insertDateInUserDB
        });
    }
})




module.exports = router;