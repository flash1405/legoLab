const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

exports.authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.session.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    res.render("login");
  }
};
