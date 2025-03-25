const express = require('express');
const userRoutes = require('./userRoutes');
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


module.exports = router;