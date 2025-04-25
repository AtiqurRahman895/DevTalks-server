const express = require('express');
const { client } = require("../config/db");
const { isUserOnDB } = require("../middlewares/roleMiddleware");
const { verifyToken } = require("../middlewares/tokenMiddleware");
const { ObjectId } = require('mongodb');
const { default: axios } = require('axios');

const router = express.Router();

const questions = client.db("DevTalks").collection("Questions");
questions.createIndex(
  { asker: "text", askerEmail: "text", title: "text", question: "text" },
  { name: "asker_text_askerEmail_text_title_text_question_text" }
);
// questions.createIndex({ tags: 1 });


router.post("/creatQuestion", verifyToken, isUserOnDB, async (req, res) => {
  let credentials = req.body;
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: `Give of response of this question so that this response can be Rendered dangerouslySetInnerHTML in the frontend. Don't need use "Here is the response:" or dangerouslySetInnerHTML stuff, class, h1, h2, h3, a tags name in your response itself. You can add p, span, li, ul, ol, b, h4, h5, h6, em, s, blockquote, hr etc tags. Use <code> for inline code, and wrap all code blocks in: <pre class='code-block'><code>...</code></pre>.
Do not include any UI elements, JSX, or extra buttons. Question: ${credentials.question}`}],
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    credentials={...credentials,aiResponse}

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

router.delete("/deleteQuestion/:_id", verifyToken, isUserOnDB, async (req, res) => {
  let _id = new ObjectId(req.params._id);
  const {email} = req.headers

  const query = { _id, askerEmail:email };

  try {
    const result =await questions.deleteOne(query)
    res.status(200).send(`${result.deletedCount} question deleted`);
  } catch (error) {
    console.error(`Failed to delete question with the _id of ${req.params._id} : ${error}`);
    res.status(500).send("Failed to delete question.");
  }
});

router.put("/updateQuestion/:_id", verifyToken, isUserOnDB, async (req, res) => {
  let _id = new ObjectId(req.params._id);
  const {email} = req.headers

  let {title, question, tags} = req.body;

  const query = { _id, askerEmail:email };
  const update={
    $set: {title, question, tags}
  }
  const options = { upsert: false };

  try {
    const result =await questions.updateOne(query,update,options)
    res.status(200).send(`${result.modifiedCount} question updated`);
  } catch (error) {
    console.error(`Failed to update question with the _id of ${req.params._id} : ${error}`);
    res.status(500).send("Failed to update question.");
  }
});

router.put("/updateVotes/:_id", async (req, res) => {
  let _id = new ObjectId(req.params._id);

  let {votes} = req.body;

  const query = { _id };
  const update={
    $set: {votes}
  }
  const options = { upsert: false };

  try {
    const result =await questions.updateOne(query,update,options)
    res.status(200).send(`${result.modifiedCount} question's votes updated`);
  } catch (error) {
    console.error(`Failed to update votes of question with the _id of ${req.params._id} : ${error}`);
    res.status(500).send("Failed to update question's votes.");
  }
});

module.exports = router;
