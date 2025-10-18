// backend/src/middlewares/verifyToken.js
const jwt = require("jsonwebtoken");

function verifyTokenMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing Authorization header" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload._id || payload.id; // used in profile controller
    req.user = payload; // optional, contains role/email
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { verifyTokenMiddleware };
