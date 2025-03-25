const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.headers.token?.split(" ")[1];
    const { email } = req.headers;
  // console.log(req.headers)
  
    if (!token) {
      return res
        .status(401)
        .send({ message: "Unauthorize Access, Login First!" });
    }
    jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .send({ message: "Unauthorize Access, Login Again!" });
      }
  
      if (decoded.email !== email) {
        return res.status(403).send({ message: "Forbidden Access!" });
      }
  
      req.user = decoded;
      next();
    });
  };

module.exports = {verifyToken};