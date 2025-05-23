const express = require('express');
const { client } = require('../config/db');
const { isQuizAvailableForUser, generateQuizQuestions } = require('../Utils/Utils');
const { ObjectId } = require('mongodb');

const router = express.Router();
const quizzes = client.db("DevTalks").collection("Quizzes");
const users = client.db("DevTalks").collection("Users");

quizzes.createIndex(
    { "date": 1 },
    { expireAfterSeconds: 86400 } // 1 day
    // { expireAfterSeconds: 604800 } // 7 days
)

router.post("/create-quiz", async (req, res) => {
    let quizData = req.body;

    //!Valid input
    if (!quizData.email || !quizData.topic) {
        return res.status(400).json({ error: 'Email and topic are required' });
    }

    quizData.topic=quizData.topic.trim().toUpperCase()

    //!Check if user exists
    const user = await users.findOne({ email: quizData.email });
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    //!cheek if that the quiz is available or not
    const cheekQuizOnDB = await quizzes.findOne({ topic: quizData.topic.toUpperCase(), difficulty:quizData.difficulty.toUpperCase() })
    //if the quiz is available in the db
    if (cheekQuizOnDB) {
        // console.log("already question: ", cheekQuizOnDB)
        return res.send(cheekQuizOnDB)
    }


    //!generate quiz with the help of ai
    const createQuizResponse = await generateQuizQuestions(quizData);
    if (createQuizResponse) {
        const QuizSaveInDB = await quizzes.insertOne({...createQuizResponse, "date": new Date()})
        if(QuizSaveInDB.insertedId){
            const findQuiz = await quizzes.findOne({ _id: new ObjectId(QuizSaveInDB.insertedId) })
            if(findQuiz){
                return res.send(findQuiz)
            }
        }
    }
})

// router.get('/:id', async(req, res) => {
//     const { id } = req.params;
//    const result = await quizzes.findOne({_id: new ObjectId(id)})
//    res.send(result);
//   });

module.exports = router;