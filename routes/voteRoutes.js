const express = require('express');
const { client } = require("../config/db");
const { isUserOnDB } = require("../middlewares/roleMiddleware");
const { verifyToken } = require("../middlewares/tokenMiddleware");
const { ObjectId } = require('mongodb');

const router = express.Router();

const votes = client.db("DevTalks").collection("Votes");


router.post("/creatVotes", verifyToken, isUserOnDB, async (req, res) => {
  const credentials = req.body;

  try {
    const result = await votes.insertOne(credentials)
    // console.log(`A vote was inserted with the _id: ${result.insertedId}`);
    res.status(201).send(`vote added`);
  } catch (error) {
    console.error(`Failed to add vote: ${error}`);
    res.status(500).send("Failed to add vote.");
  }
});

router.delete("/deleteVotes", verifyToken, isUserOnDB, async (req, res) => {
    let { query={} } = req.query;
    try {
      const result = await votes.deleteOne(query)
      // console.log(`${result.deletedCount} vote was deleted.`);
      res.status(201).send(`vote deleted`);
    } catch (error) {
      console.error(`Failed to delete vote: ${error}`);
      res.status(500).send("Failed to delete vote.");
    }
  });

router.get("/vote", async (req, res) => {
  let { query={} } = req.query;
  try {
    const result =await votes.findOne(query)
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to find vote: ${error}`);
    res.status(500).send("Failed to find vote.");
  }
});

module.exports = router;
