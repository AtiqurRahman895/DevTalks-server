const express = require('express');
const { client } = require("../config/db");
const { isUserOnDB } = require("../middlewares/roleMiddleware");
const { verifyToken } = require("../middlewares/tokenMiddleware");
const { ObjectId } = require('mongodb');

const router = express.Router();

const traffics = client.db("DevTalks").collection("Traffics");

router.put("/updateTraffic", async (req, res) => {
  try {
    const isUnique = req.body.isUnique;
    const today = new Date().toISOString().slice(0, 10);

    const update = { $inc: { pageViews: 1 } };
    if (isUnique) {
        update.$inc.uniqueVisitors = 1;
    }
    const options = { upsert: true };
    await traffics.updateOne({date:today},update,options)
    res.status(200).send(`Traffic updated successfully`);
  } catch (error) {
    console.error(`Unable to update traffic: ${error}`);
    res.status(500).send("Unable to update traffic.");
  }
});

module.exports = router;
