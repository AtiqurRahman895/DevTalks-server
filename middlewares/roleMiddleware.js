const { client } = require("../config/db");

const users = client.db("DevTalks").collection("Users");

const isAdmin = (req, res, next) => {
    const { role } = req.headers;
    if (role !== "admin") {
      return res.status(403).send({ message: "Forbidden Access!" });
    }
    next();
};

const isUserOnDB = async (req, res, next) => {
    const {email,role} = req.headers
    // console.log(email,role)

      try {
        const USER = await users.findOne({ email, role });
        // console.log(!USER)
        if (!USER) {
          return res.status(403).send({ message: "Forbidden Access!" });
        }
        next()
      } catch (error) {
        console.error('Error checking user role:', error);
        return res.status(500).send({ message: 'Server error' });
      }

};

module.exports = { isAdmin,isUserOnDB };