// backend/src/routes/auth.routes.js
const express = require("express");
const auth = require("../controllers/auth.controller");
const router = express.Router();
const { verifyTokenMiddleware } = require("../middleware/verifyToken");

router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.post("/profile", verifyTokenMiddleware, auth.profile);
router.post("/verify-token", verifyTokenMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
