const express = require('express');
const { client } = require("../config/db");
const { isUserOnDB, isAdmin } = require("../middlewares/roleMiddleware");
const { verifyToken } = require("../middlewares/tokenMiddleware");
const { ObjectId } = require('mongodb');

const router = express.Router();

const blogs = client.db("DevTalks").collection("Blogs");
blogs.createIndex(
  { author: "text", authorEmail: "text", title: "text" },
  { name: "author_text_authorEmail_text_title_text" }
);

router.post("/creatBlog", verifyToken, isUserOnDB, isAdmin, async (req, res) => {
  const credentials = req.body;

  try {
    const result = await blogs.insertOne(credentials)
    console.log(`A blog was inserted with the _id: ${result.insertedId}`);
    res.status(201).send(`blog added`);
  } catch (error) {
    console.error(`Failed to add blog: ${error}`);
    res.status(500).send("Failed to add blog.");
  }
});

router.get("/blogs", async (req, res) => {
  let { query={},skip="0", limit="0", sort={} } = req.query;

  try {
    const result =await blogs.find(query).skip(Number(skip)).limit(Number(limit)).sort(sort).toArray()
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to find blogs: ${error}`);
    res.status(500).send("Failed to find blogs.");
  }
});

router.get("/blogsCount", async (req, res) => {
  let { query={} } = req.query;

  try {
    const result =await blogs.countDocuments(query)
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to count blogs: ${error}`);
    res.status(500).send("Failed to count blogs.");
  }
});

router.get("/blog/:_id", async (req, res) => {
  let _id = new ObjectId(req.params._id);

  try {
    const result =await blogs.findOne({_id})
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to find blog with the _id of ${req.params._id} : ${error}`);
    res.status(500).send("Failed to find blog.");
  }
});

router.put("/updateBlog/:_id", verifyToken, isUserOnDB, isAdmin, async (req, res) => {
  let _id = new ObjectId(req.params._id);
  const {email} = req.headers

  let {title, shortDescription, tags, image, longDescription} = req.body;

  const query = { _id, authorEmail:email };
  const update={
    $set: {title, shortDescription, tags, image, longDescription}
  }
  const options = { upsert: false };

  try {
    const result =await blogs.updateOne(query,update,options)
    res.status(200).send(`${result.modifiedCount} blog updated`);
  } catch (error) {
    console.error(`Failed to update blog with the _id of ${req.params._id} : ${error}`);
    res.status(500).send("Failed to update blog.");
  }
});

module.exports = router;
