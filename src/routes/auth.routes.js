// const express = require('express');
// const authController = require('../controllers/auth.controller');

// const router = express.Router();

// router.post('/signup', authController.signup);
// router.post('/login', authController.login);

// module.exports = router;


// =====================================================================================================
const express = require("express")
const auth = require("../controllers/user.controller")
const router = express.Router()
const {verifyTokenMiddleware} = require("../middlewares/verifyToken")

router.post('/verify-token', verifyTokenMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

router.post("/signup", auth.signup);
router.post("/login", auth.login);


router.post("/profile",verifyTokenMiddleware,  auth.profile);
// router.post("/logout", auth.logout);


module.exports = router