const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://dev-talks-1.firebaseapp.com",
    "https://dev-talks-1.web.app",
  ],
}));
app.use(express.json());

// Routes
app.use('/', routes);

// Export the app for use in server.js
module.exports = app;