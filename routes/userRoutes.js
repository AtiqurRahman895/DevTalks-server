const express = require('express');
const { client } = require('../config/db');
const { isUserOnDB, isAdmin } = require('../middlewares/roleMiddleware');
const { verifyToken } = require('../middlewares/tokenMiddleware');
const { ObjectId } = require('mongodb');

const router = express.Router();
const users = client.db("DevTalks").collection("Users");

// Add a new user
router.post("/addUser", async (req, res) => {
  const { name, photoURL, email } = req.body;
  const role="user"
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
router.get("/user/:email", verifyToken, async (req,res)=>{
    const email=req.params.email;
    // console.log(email)
    try {
      const result= await users.findOne({email})
      res.status(200).json(result)
    } catch (error) {
      console.error(`Failed to find user: ${error}`);
      res.status(500).send("Failed to find user.");
    }
})



module.exports = router;