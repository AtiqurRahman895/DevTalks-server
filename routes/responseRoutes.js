const express = require('express');
const { client } = require("../config/db");
const { isUserOnDB } = require("../middlewares/roleMiddleware");
const { verifyToken } = require("../middlewares/tokenMiddleware");
const { ObjectId } = require('mongodb');

const router = express.Router();

const responses = client.db("DevTalks").collection("Responses");


router.post("/creatResponse", verifyToken, isUserOnDB, async (req, res) => {
  const credentials = req.body;

  try {
    const result = await responses.insertOne(credentials)
    console.log(`A response was inserted with the _id: ${result.insertedId}`);
    res.status(201).send(`response added`);
  } catch (error) {
    console.error(`Failed to add response: ${error}`);
    res.status(500).send("Failed to add response.");
  }
});

router.get("/responses", async (req, res) => {
  let { query={},skip="0", limit="0", sort={}, email="" } = req.query;

  try {
    const result =await responses.find(query).skip(Number(skip)).limit(Number(limit)).sort(sort).toArray()
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to find responses: ${error}`);
    res.status(500).send("Failed to find responses.");
  }
});

router.get("/response", async(req, res)=>{
  const email = req.query.email;
  // console.log(email)
  let query={}
  if(email){
    query = { responderEmail: email, responseType:"answer"}
  }

  try {
    const result = await responses.find(query).toArray()
    res.status(200).json(result)
  } catch (error) {
    console.error(`Failed to find responses: ${error}`);
    res.status(500).send("Failed to find responses.");
  }
})

router.put("/updateResponse/:_id", verifyToken, isUserOnDB, async (req, res) => {
  let _id = new ObjectId(req.params._id);
  const {email} = req.headers

  let {responseType, response} = req.body;

  const query = { _id, responderEmail:email };
  const update={
    $set: {responseType, response}
  }
  const options = { upsert: false };

  try {
    const result =await responses.updateOne(query,update,options)
    res.status(200).send(`${result.modifiedCount} response updated`);
  } catch (error) {
    console.error(`Failed to update response with the _id of ${req.params._id} : ${error}`);
    res.status(500).send("Failed to update response.");
  }
});

router.delete("/deleteRresponse/:_id", verifyToken, isUserOnDB, async (req, res) => {
  let _id = new ObjectId(req.params._id);
  const {email} = req.headers

  const query = { _id, responderEmail:email };

  try {
    const result =await responses.deleteOne(query)
    res.status(200).send(`${result.deletedCount} response deleted`);
  } catch (error) {
    console.error(`Failed to delete response with the _id of ${req.params._id} : ${error}`);
    res.status(500).send("Failed to delete response.");
  }
});



module.exports = router;
