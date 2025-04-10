const express = require('express');
const userRoutes = require('./userRoutes');
const questionRoutes = require('./questionRoutes');
const responseRoutes = require('./responseRoutes');
const badgesRoutes = require('./badgesRoutes');
const voteRoutes = require('./voteRoutes');
const quizQuestion = require('./quizQuestion');
const blogRoutes = require('./blogRoutes');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Generate JWT
router.post("/jwt", (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_SECRET, {
      expiresIn: "3d",
    });
    res.json(token);
  });

// Use individual route files
router.use("/users", userRoutes);
router.use("/questions", questionRoutes);
router.use("/responses", responseRoutes);
router.use("/badges", badgesRoutes);
router.use("/votes", voteRoutes);
router.use("/quizzes",quizQuestion);
router.use("/blogs", blogRoutes);


module.exports = router;