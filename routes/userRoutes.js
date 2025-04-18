const express = require('express');
const { client } = require('../config/db');
const { isUserOnDB, isAdmin } = require('../middlewares/roleMiddleware');
const { verifyToken } = require('../middlewares/tokenMiddleware');
const { ObjectId } = require('mongodb');

const router = express.Router();
const users = client.db("DevTalks").collection("Users");

// Add a new user
router.post("/addUser", async (req, res) => {
  const { name, photoURL, email} = req.body;
  console.log()
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
  console.log(filter)

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


module.exports = router;


