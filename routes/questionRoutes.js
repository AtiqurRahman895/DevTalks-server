const express = require('express');
const { client } = require("../config/db");
const { isUserOnDB } = require("../middlewares/roleMiddleware");
const { verifyToken } = require("../middlewares/tokenMiddleware");
const { ObjectId } = require('mongodb');

const router = express.Router();

const questions = client.db("DevTalks").collection("Questions");
questions.createIndex(
  { asker: "text", askerEmail: "text", title: "text", question: "text" },
  { name: "asker_text_askerEmail_text_title_text_question_text" }
);
// questions.createIndex({ tags: 1 });


router.post("/creatQuestion", verifyToken, isUserOnDB, async (req, res) => {
  const credentials = req.body;

  try {
    const result = await questions.insertOne(credentials)
    console.log(`A question was inserted with the _id: ${result.insertedId}`);
    res.status(201).send(`question added`);
  } catch (error) {
    console.error(`Failed to add question: ${error}`);
    res.status(500).send("Failed to add question.");
  }
});

router.get("/questions", async (req, res) => {
  let { query={},skip="0", limit="0", sort={} } = req.query;

  try {
    const result =await questions.find(query).skip(Number(skip)).limit(Number(limit)).sort(sort).toArray()
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to find questions: ${error}`);
    res.status(500).send("Failed to find questions.");
  }
});

router.get("/questionsCount", async (req, res) => {
  let { query={} } = req.query;

  try {
    const result =await questions.countDocuments(query)
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to count questions: ${error}`);
    res.status(500).send("Failed to count questions.");
  }
});

router.get("/question/:_id", async (req, res) => {
  let _id = new ObjectId(req.params._id);

  try {
    const result =await questions.findOne({_id})
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to find question with the _id of ${req.params._id} : ${error}`);
    res.status(500).send("Failed to find question.");
  }
});

module.exports = router;
