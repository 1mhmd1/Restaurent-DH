const jwt = require("jsonwebtoken");
//notes for me : jwt.sign: is the function that actually "scrambles" the data into a long, unreadable string.
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
