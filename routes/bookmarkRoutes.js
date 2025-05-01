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
    // console.log(`A item was added to bookmark with the _id: ${result.insertedId}`);
    res.status(201).send(`Item added to bookmark`);
  } catch (error) {
    console.error(`Failed to add item to bookmark: ${error}`);
    res.status(500).send("Failed to add item to bookmark.");
  }
});

router.get("/bookmarks", verifyToken, isUserOnDB, async (req, res) => {

    try {    
    const {email} = req.headers
    const bookmarksList = await bookmarks.find({email}).toArray();
  
      // Separate question & blog item ObjectIds
      const questionIds = bookmarksList
        .filter(b => b.type === "question")
        .map(b => new ObjectId(b.item) );
  
      const blogIds = bookmarksList
        .filter(b => b.type === "blog")
        .map(b => new ObjectId(b.item));
  
      // Fetch actual data
      const [questionsList,blogsList] = await Promise.all([
        questionIds.length
          ? questions.find({ _id: { $in: questionIds } }).toArray()
          : [],
        blogIds.length
          ? blogs.find({ _id: { $in: blogIds } }).toArray()
          : []
      ]);
  
        res.json({
            questions: questionsList || [],
            blogs: blogsList || []
        });
    
      } catch (error) {
        console.error(`Failed to find bookmark items: ${error}`);
        res.status(500).send("Failed to find bookmark items.");
      }
});

router.get("/bookmark/:item", verifyToken, isUserOnDB, async (req, res) => {
    const {email} = req.headers
    let item = req.params.item;

    try {
        const result = await bookmarks.findOne({email, item})
        res.status(200).json(result)
    } catch (error) {
        console.error(`Failed to find bookmark item: ${error}`);
        res.status(500).send("Failed to find bookmark item.");
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
