const express = require('express');
const { client } = require("../config/db");
const { isUserOnDB } = require("../middlewares/roleMiddleware");
const { verifyToken } = require("../middlewares/tokenMiddleware");
const { ObjectId } = require('mongodb');

const router = express.Router();

const bookmarks = client.db("DevTalks").collection("Bookmarks");
const questions = client.db("DevTalks").collection("Questions");
const blogs = client.db("DevTalks").collection("Blogs");

router.post("/addToBookmark", verifyToken, isUserOnDB, async (req, res) => {
  const credentials = req.body;

  try {
    const result = await bookmarks.insertOne(credentials)
    console.log(`A item was added to bookmark with the _id: ${result.insertedId}`);
    res.status(201).send(`Item added to bookmark`);
  } catch (error) {
    console.error(`Failed to add item to bookmark: ${error}`);
    res.status(500).send("Failed to add item to bookmark.");
  }
});



router.delete("/deleteFromBookmark/:_id", verifyToken, isUserOnDB, async (req, res) => {
    const {email} = req.headers
    let _id = new ObjectId(req.params._id);

    try {
        const result = await bookmarks.deleteOne({_id, email})
        console.log(`${result.deletedCount} item was deleted.`);
        res.status(201).send(`item deleted from bookmark.`);
    } catch (error) {
        console.error(`Failed to delete bookmark item with the _id of ${req.params._id} : ${error}`);
        res.status(500).send("Failed to delete bookmark item.");
    }
});

module.exports = router;
