const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    //headers:hidden pieces of info sent with a request like the stamp on an envelope
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") //It is the global standard for sending JWTs
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; //"Bearer 12345abc"=> [0]Bearer [1]12345abc
      const decoded = jwt.verify(token, process.env.JWT_SECRET); //Verify the token using  secret key

      // 3. Get user from the DB (but don't get the password) and attach to the request
      req.user = await User.findById(decoded.id).select("-password"); // -password:Select everything, but execlude the password

      next(); // Move to Controller
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
