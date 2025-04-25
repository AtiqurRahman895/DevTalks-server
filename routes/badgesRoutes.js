const express = require('express');
const { client } = require("../config/db");


const router = express.Router();

const questions = client.db("DevTalks").collection("Questions");
const answers = client.db("DevTalks").collection("Responses");

router.get("/badge", async (req, res) => {
    try {
      const email = req.query.email;
  
      // Count documents by email
      const questionCount = await questions.countDocuments({askerEmail: email});
      const answerCount = await answers.countDocuments({responderEmail: email, responseType:"answer"});

      const earnedBadges = [];
  
      if (questionCount >= 1) {
        earnedBadges.push({
            name: "Question Master",
            description: "Given to users who initiate valuable discussions.",
            criteria: "Ask 50+ thoughtful and engaging questions.",
            level: "Silver",
          },);
      }
  
      if (answerCount >= 1) {
        earnedBadges.push({
            name: "Answer Hero",
            description: "Awarded for actively helping others with answers.",
            criteria: "Provide 50+ helpful answers to community questions.",
            level: "Silver",
        });
      }
  
      if (questionCount >= 1 && answerCount >= 1) {
        earnedBadges.push(    {
            name: "Top Contributor",
            description: "Awarded for high engagement and contributions.",
            criteria: "Earned by posting high-quality content and helping others.",
            level: "Gold",
          },);
      }

      const levelPriority = {
        Gold: 1,
        Silver: 2,
        Bronze: 3,
      };
  
      earnedBadges.sort((a, b) => {
        return (levelPriority[a.level] || 99) - (levelPriority[b.level] || 99);
      });
      
      res.json({
        email,
        badges: earnedBadges,
      });
  
    } catch (error) {
      console.error("Error fetching badge data:", error);
      res.status(500).json({ error: "Server error while fetching badges" });
    }
  });
  
  module.exports = router;
  