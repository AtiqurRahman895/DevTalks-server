const express = require('express');
const { client } = require("../config/db");
const { isUserOnDB } = require("../middlewares/roleMiddleware");
const { verifyToken } = require("../middlewares/tokenMiddleware");
const { ObjectId } = require('mongodb');

const router = express.Router();

const traffics = client.db("DevTalks").collection("Traffics");

// Helper: format date to "DD MMM" like "26 Apr"
const formatDateToDayMonth = (dateString) => {
  const [year, month, day] = dateString.split('-');
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${day} ${months[parseInt(month) - 1]}`;
};

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

router.get('/traffics', async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); 

    // Format dates to "YYYY-MM-DD"
    const formattedToday = today.toISOString().slice(0, 10);
    const formattedSevenDaysAgo = sevenDaysAgo.toISOString().slice(0, 10);

    const weeklyTrafficData = await traffics.find({
      date: { $gte: formattedSevenDaysAgo, $lte: formattedToday },
    }).toArray()

    const formattedData = weeklyTrafficData.map(item => ({
      date: formatDateToDayMonth(item.date),
      pageViews: item.pageViews,
      uniqueVisitors: item.uniqueVisitors,
    }));
    // console.log(formattedData)

    res.json( formattedData );
  } catch (error) {
    console.error('Error fetching weekly traffic data:', error);
    res.status(500).json(`Error fetching weekly traffic data`);
  }
});

module.exports = router;
