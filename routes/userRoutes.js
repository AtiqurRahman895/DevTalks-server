const express = require('express');
const { client } = require('../config/db');
const { isUserOnDB, isAdmin } = require('../middlewares/roleMiddleware');
const { verifyToken } = require('../middlewares/tokenMiddleware');
const { ObjectId } = require('mongodb');
const { getFeedBackAi } = require('../Utils/Utils');

const router = express.Router();
const users = client.db("DevTalks").collection("Users");
const quizzes = client.db("DevTalks").collection("Quizzes");

// Add a new user
router.post("/addUser", async (req, res) => {
  const { name, photoURL, email} = req.body;
  // console.log()
  const role = "user"
  try {
    const userFound = await users.findOne({ email });
    if (userFound) {
      return res.status(200).send("User found");
    }
    const result = await users.insertOne({ name, photoURL, email, role });
    res.status(201).json({ message: "User Insertion successful", insertedId: result.insertedId });
  } catch (error) {
    console.error(`Failed to insert user: ${error}`);
    res.status(500).send("Failed to insert user.");
  }
});

// get specific user
router.get("/user/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  try {
    const result = await users.findOne({ email })
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to find user: ${error}`);
    res.status(500).send("Failed to find user.");
  }
})

// get data for profile
router.get("/profile/:email", async (req, res) => {
  const userEmail = req.params.email;

  try {
    if (!userEmail || userEmail.trim() === "") {
      return res.status(400).json({ error: "User not found" });
    }
    const result = await users.findOne({ email: userEmail })
    // console.log(result)
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to find user: ${error}`);
    res.status(500).send("Failed to find user.");
  }
})


// add details for profile 
router.put("/user/:email", async (req, res) => {
  const email = req.params.email
  const userDetails = req.body
  const filter = { email: email }

  const allowedFields = [
    "name",
    "bio",
    "profession",
    "organization",
    "location",
    "twitterName",
    "twitterLink",
    "linkedinName",
    "linkedinLink",
    "facebookName",
    "facebookLink",
    "coverImage",
    "photoURL"
  ];
  const updateField = {};
  for (const key of allowedFields) {
    if (userDetails[key] !== undefined) {
      updateField[key] = userDetails[key]
    }
  }


  const updatedDoc = {
    $set: updateField,
  };


  const options = { upsert: true };
  try {
    const result = await users.updateOne(filter, updatedDoc, options)


    res.status(200).json(result)

  } catch (error) {
    console.error(`Failed to update user: ${error.message}`);
    return res.status(500).json({ message: "Internal server error" });
  }
})



router.post("/user-answer", async (req, res) => {
  const { email, quizId, userAnswers } = req.body;

  const user = await users.findOne({ email: email })

  //!ToDo: if user is undefined send error status
  if (!user) {
    throw new Error(`User Not found`);
  }

  const userQuiz = await quizzes.findOne({ _id: new ObjectId(quizId) });
  const answers = userAnswers.map((userAnswer) => {
    const question = userQuiz.questions.find((q) => q.id === userAnswer.questionId);

    if (!question) {
      throw new Error(`❌ Question with ID "${userAnswer.questionId}" not found in the quiz.`);
    }

    const userSelect = userAnswer.userSelect.toUpperCase();
    const isCorrect = userSelect === question.correctAnswer;

    return {
      questionId: userAnswer.questionId,
      question: question.question,
      userSelect,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: isCorrect ? null : question.explanation,
    };
  });


  //Calculate score
  const score = answers.filter((a) => a.isCorrect).length;
  const totalQuestions = userQuiz.questions.length;

  const quizDate = new Date(new Date().toISOString());

  //Save to userAnswers
  const userAnswerDoc = {
    quizId,
    topic: userQuiz.topic,
    difficulty: userQuiz.difficulty,
    quizDate,
    answers,
    score,
    totalQuestions
  };


  const now = new Date();
  const existingUser = await users.findOne({ email });
  let dailyStreak = 1;
  if (existingUser && existingUser.lastQuizDate) {
    const lastQuiz = new Date(existingUser.answers.quizDate);
    const daysSinceLastQuiz = (now - lastQuiz) / (1000 * 60 * 60 * 24);
    if (daysSinceLastQuiz <= 14) {
      dailyStreak = (existingUser.dailyStreak || 0) + 1; // Increment if within 14 days
    }
  }

  // Update users collection
  const result = await users.updateOne(
    { email },
    {
      $set: {
        answers: userAnswerDoc,
        dailyStreak,
      }
    },
    { upsert: true }
  );
  res.send(user)
})

router.post("/user-feedback/:email", async (req, res) => {
  try {
    const email = req.params.email;

    // Fetch user by email
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate user.answers and quizId
    if (!user.answers || !user.answers.quizId) {
      return res.status(400).json({ error: "User quiz data not found" });
    }

    // Fetch the quiz by ID
    const userQuiz = await quizzes.findOne({ _id: new ObjectId(user.answers.quizId) });
    if (!userQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Generate AI feedback
    const feedback = await getFeedBackAi(user.answers.answers, userQuiz, user.answers.score);
    if (!feedback) {
      return res.status(500).json({ error: "Failed to generate AI feedback" });
    }

    // Send feedback to client
    res.status(200).send(feedback);
  } catch (error) {
    console.error("Error in getQuizFeedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }

})


module.exports = router;


