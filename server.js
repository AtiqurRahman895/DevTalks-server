const app = require('./app');
const { connectDB } = require('./config/db');

const port = process.env.PORT || 8080;

// Connect to the database and start the server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`SERVER IS RUNNING AT PORT: ${port}`);
  });
});